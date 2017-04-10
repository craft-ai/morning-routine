const _ = require('lodash');
const constants = require('./constants');
const craftClient = require('../client');
const fs = require('fs');
const path = require('path');
const Rx = require('rxjs/Rx');
const { randMap, debug } = require('../utils');

const { AGENTS_CONFIGURATION, EVENTS, NEGATIVE_EVENTS_RATIO } = constants;
const { HAPPENING } = constants.VALUES;


function createCsvObserver(filepath) {
  const ws = fs.createWriteStream(filepath);

  let properties;

  return {
    next(co) {
      if (_.isUndefined(properties)) {
        properties = _.keys(co.context);
        ws.write(`timestamp;${properties.join(';')}\n`);
      }
      ws.write(`${co.timestamp};${_.map(properties, p => co.context[p]).join(';')}\n`);
    },
    complete() {
      ws.end();
    }
  };
}

function createEventContextObservable(eventProperty, contextObservable) {
  const s = new Rx.Subject();

  let firstEvent = true;
  let buffer = [];

  contextObservable.subscribe({
    error: s.error,
    next(latestCo) {
      if (firstEvent) {
        firstEvent = false;
        s.next(latestCo);
      }
      else if (latestCo.context[eventProperty] === HAPPENING) {
        randMap(buffer, co => s.next(co), NEGATIVE_EVENTS_RATIO);
        buffer = [];
        s.next(latestCo);
      }
      else {
        buffer.push(latestCo);
      }
    },
    complete() {
      randMap(buffer, co => s.next(co), NEGATIVE_EVENTS_RATIO);
      s.complete();
    }
  });

  return s;
}

function createStateContextObservable(contextObservable) {
  return contextObservable;
}

function createPersonaAgents(persona, fullContextObservable) {
  // Creating a subject to broadcast the contexts observable
  const fullContextSubject = new Rx.Subject();

  const agentsObservable = Rx.Observable.from(_.toPairs(AGENTS_CONFIGURATION))
    .mergeMap(([agentLbl, configuration]) => {
      const log = debug(`${persona}:${agentLbl}`);
      const [output] = configuration.output;
      const agentId = `${persona}_${agentLbl}`;

      const o = EVENTS.includes(output) ?
        createEventContextObservable(output, fullContextObservable) :
        createStateContextObservable(fullContextObservable);

      return Rx.Observable.fromPromise(o
        .map(({ timestamp, context }) => ({
          timestamp,
          context: _.pick(context, _.keys(configuration.context))
        }))
        .do(createCsvObserver(path.join(__dirname, `../../data/intermediate/${persona}_${agentLbl}.csv`)))
        .toArray()
        .toPromise()
        .then(contextOperations => craftClient.deleteAgent(agentId)
          .then(() => craftClient.createAgent(configuration, agentId))
          .then(() => log(`Agent ${agentId} created`))
          .then(() => craftClient.addAgentContextOperations(agentId, contextOperations, true))
          .then(() => log(`${contextOperations.length} context operations sent.`))
        )
        .then(() => agentId)
      );
    });

  // Now that everything is ready we pipe the context observable in the subject
  fullContextObservable.subscribe(fullContextSubject);

  return agentsObservable;
}

module.exports = createPersonaAgents;
