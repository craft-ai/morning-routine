const PERSONA = ['cadre', 'prof', 'student', 'veto', 'cv', 'jp', 'bnl', 'pc', 'vc'];
const EVENTS = ['door', 'clock', 'heater', 'coffee', 'toothbrush', 'meeting', 'garage'];
const STATES = ['light', 'tv', 'shower'];
const VALUES = {
  HAPPENING: 'HAPPENING',
  NOT_HAPPENING: 'NOT_HAPPENING',
  ON: 'ON',
  OFF: 'OFF',
  true: 'YES',
  false: 'NO'
};

const PROPERTIES = [
  'door', 'garage',
  'clock',
  'heater', 'light', 'coffee', 'toothbrush',
  'tv', 'shower'
];

module.exports = {
  PERSONA,
  EVENTS,
  STATES,
  VALUES,
  PROPERTIES
};
