const _ = require('lodash');
const constants = require('../constants');


const { EVENTS, STATES } = constants;
const { HAPPENING, NOT_HAPPENING, ON, OFF } = constants.VALUES;

const AGENTS_CONFIGURATION = require('./agentsConfiguration');

const DEFAULT_CONTEXT = _.extend(..._.map(EVENTS, e => ({ [e]: NOT_HAPPENING })));

const CONTEXT_DIFF_FROM_EVENT = {
  light_on: _.defaults({ light: ON }, DEFAULT_CONTEXT),
  light_off: _.defaults({ light: OFF }, DEFAULT_CONTEXT),
  tv_on: _.defaults({ tv: ON }, DEFAULT_CONTEXT),
  tv_off: _.defaults({ tv: OFF }, DEFAULT_CONTEXT),
  shower_on: _.defaults({ shower: ON }, DEFAULT_CONTEXT),
  shower_off: _.defaults({ shower: OFF }, DEFAULT_CONTEXT),
  door: _.defaults({ door: HAPPENING }, DEFAULT_CONTEXT),
  clock: _.defaults({ clock: HAPPENING }, DEFAULT_CONTEXT),
  heater: _.defaults({ heater: HAPPENING }, DEFAULT_CONTEXT),
  coffee: _.defaults({ coffee: HAPPENING }, DEFAULT_CONTEXT),
  toothbrush: _.defaults({ toothbrush: HAPPENING }, DEFAULT_CONTEXT),
  meeting_happens: _.defaults({ meeting: HAPPENING }, DEFAULT_CONTEXT),
  garage: _.defaults({ garage: HAPPENING }, DEFAULT_CONTEXT)
};

const INITIAL_CONTEXT = _.extend(
  ..._.map(EVENTS, e => ({ [e]: NOT_HAPPENING })),
  ..._.map(STATES, s => ({ [s]: OFF }))
);

module.exports = Object.assign({
  // How many negative events do we want to include between 2 positive events
  NEGATIVE_EVENTS_RATIO: 4,
  PERSONA_MAX_CONCURRENT: 1,
  PREFETCH_MAX_ATTEMPTS: 5,
  PREFETCH_MAX_CONCURRENT: 2,
  AGENTS_CONFIGURATION: _.pick(AGENTS_CONFIGURATION, constants.PROPERTIES),
  CONTEXT_DIFF_FROM_EVENT,
  INITIAL_CONTEXT,
  DEFAULT_CONTEXT
}, constants);
