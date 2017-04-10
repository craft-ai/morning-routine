const _ = require('lodash');
const { INITIAL_CONTEXT, CONTEXT_DIFF_FROM_EVENT } = require('./constants');
const csv = require('fast-csv');
const moment = require('moment-timezone');
const path = require('path');
const Rx = require('rxjs/Rx');
const log = require('../utils').debug();
const { isPublicHoliday } = require('./calendar');

function createCsvObservable(filename) {
  return Rx.Observable.create(o => csv
    .fromPath(filename, {
      delimiter: ';',
      headers: true,
      ignoreEmpty: true,
      trim: true,
      objectMode: true
    })
    .on('data', data => o.next(data))
    .on('end', () => o.complete())
  );
}

function parseDatetime({ event, day, time }) {
  const datetime = new moment.tz(`${day} ${time}`, 'YYYY-MM-DD H:m', 'Europe/Paris');
  if (!datetime.isValid()) {
    throw new Error(`Invalid date (day is "${day}", time is "${time}")!`);
  }
  return {
    event,
    datetime
  };
}

function computeContext(previousContext, { event, datetime }) {
  const diff = CONTEXT_DIFF_FROM_EVENT[event];
  const timestamp = datetime.unix();
  if (!diff) {
    throw new Error(`Unknown event "${event}"!`);
  }
  return _.extend({}, previousContext, diff, {
    timestamp,
    timezone: datetime.format('Z'),
    holiday: isPublicHoliday(datetime) ? 'YES' : 'NO'
  });
}

function createPersonaData(persona) {
  return createCsvObservable(path.join(__dirname, `../../data/${persona}.csv`))
  .map(parseDatetime)
  .toArray()
  .mergeMap(data => data.sort((a, b) => a.datetime.diff(b.datetime)))
  .scan(computeContext, INITIAL_CONTEXT);
}

module.exports = createPersonaData;
