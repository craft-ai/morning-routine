const _ = require('lodash');
const Rx = require('rxjs/Rx');
const constants = require('./constants');
const log = require('../utils').debug();


const { DEFAULT_CONTEXT, EVENTS } = constants;
const { HAPPENING } = constants.VALUES;
const LONG_TIME = 24 * 60 * 60;
const STEP = 10 * 60;
const DEFAULT_TTE_CONTEXT = _.extend(..._.map(EVENTS, e => ({
  [`time_to_${e}`]: LONG_TIME
})));

function createSampledContextOperations(contextOperationsObservable) {
  const s = new Rx.Subject();

  let lastContextOperation;

  contextOperationsObservable
  .subscribe({
    error: s.error,
    next(contextOperation) {
      if (!lastContextOperation) {
        lastContextOperation = contextOperation;
      }
      else {
        while (lastContextOperation.timestamp < contextOperation.timestamp) {
          s.next(_.clone(lastContextOperation));
          lastContextOperation.timestamp += STEP;
          lastContextOperation.context = _.extend({}, lastContextOperation.context, DEFAULT_CONTEXT);
        }
        lastContextOperation.context = contextOperation.context;
      }
    },
    complete() {
      s.next(lastContextOperation);
      s.complete();
    }
  });

  return s;
}

function createTteContextOperationsObservable(contextOperationsObservable) {
  const s = new Rx.Subject();
  let buffer = [];

  contextOperationsObservable
    .subscribe({
      error: s.error,
      next(latestCo) {
        const happeningEvents = EVENTS.filter(event => latestCo.context[event] === HAPPENING);

        buffer.push(latestCo);
        buffer = buffer.map(co => happeningEvents.reduce((acc, event) => {
          const tteProperty = `time_to_${event}`;

          if (!co.context[tteProperty]) {
            co.context[tteProperty] = Math.min(LONG_TIME, latestCo.timestamp - co.timestamp);
          }

          return co;
        }, co));

        const coToEmit = _.takeWhile(buffer, co => {
          return latestCo.timestamp - co.timestamp > LONG_TIME
            || EVENTS.reduce((bool, event) => bool && co.context[`time_to_${event}`], true);
        });

        coToEmit.forEach(co => {
          co.context = _.defaults(co.context, DEFAULT_TTE_CONTEXT);
          s.next(co);
        });
        
        buffer = _.takeRight(buffer, buffer.length - coToEmit.length);
      },
      complete() {
        buffer.forEach(co => {
          co.context = _.defaults(co.context, DEFAULT_TTE_CONTEXT);
          s.next(co);
        });
        s.complete();
      }
    });

  return s;
}

function createTseContextOperationsObservable(contextOperationsObservable) {
  return contextOperationsObservable
  .scan((previousOp, op) => {
    const tsco = previousOp ? op.timestamp - previousOp.timestamp : LONG_TIME;
    const tseDiffs = _.map(EVENTS, evtProperty => {
      const tseProperty = `time_since_${evtProperty}`;
      const tseValue = previousOp
        ? previousOp.context[evtProperty] === HAPPENING
          ? tsco
          : Math.min(LONG_TIME, previousOp.context[tseProperty] + tsco)
        : LONG_TIME;

      return { [tseProperty]: tseValue };
    });

    return {
      timestamp: op.timestamp,
      context: _.extend(op.context, ...tseDiffs)
    };
  }, undefined);
}

function createPersonaContextOperations(dataObservable) {
  const contextOperationsObservable = dataObservable
  .map(data => ({
    timestamp: data.timestamp,
    context: _.omit(data, 'timestamp')
  }));

  const sampledContextOperationsObservable = createSampledContextOperations(contextOperationsObservable);
  const tteContextOperationsObservable = createTteContextOperationsObservable(sampledContextOperationsObservable);

  return createTseContextOperationsObservable(tteContextOperationsObservable);
}

module.exports = createPersonaContextOperations;
