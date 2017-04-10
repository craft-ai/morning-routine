const constants = require('../constants');

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MORNING_MEETING = {
  None: -1,
  '08:30': 8+30/60,
  '08:45': 8+45/60,
  '09:00': 9,
  '09:15': 9+15/60,
  '09:30': 9+30/60,
  '09:45': 9+45/60,
  '10:00': 10
};

const TIMES = new Array(12 * 24).fill(0).map((_, index) => index / 12);

const TIMESTAMPS = {
  DECEMBER: Math.floor(new Date(2016, 12, 12).getTime() / 1000)
};

const ITEMS_CONTENT = {
  clock: '<i class="fa fa-bell-o" aria-hidden="true"></i>',
  heater: '<i class="fa fa-fire" aria-hidden="true"></i>',
  light: '<i class="fa fa-lightbulb-o" aria-hidden="true"></i>',
  tv: '<i class="fa fa-television" aria-hidden="true"></i>',
  shower: '<i class="fa fa-shower" aria-hidden="true"></i>',
  coffee: '<i class="fa fa-coffee" aria-hidden="true"></i>',
  garage: '<i class="fa fa-car" aria-hidden="true"></i>',
  toothbrush: '<i class="fa fa-diamond" aria-hidden="true"></i>',
  door: '<i class="fa fa-sign-out" aria-hidden="true"></i>',
  meeting: '<i class="fa fa-calendar-o" aria-hidden="true"></i>'
};

const ITEMS_TOOLTIP = {
  clock: 'Alarm Clock',
  heater: 'Water Heater',
  light: 'Light',
  tv: 'Television',
  shower: 'Shower',
  coffee: 'Coffee Machine',
  garage: 'Garage Door',
  toothbrush: 'Toothbrush',
  door: 'Main Door',
  meeting: 'Meeting'
};

const PERSONA_LABEL = {
  'cadre': 'Exec',
  'prof': 'Teacher',
  'student': 'Student',
  'veto': 'Veto',
  'cv': 'Biker Exec',
  'jp': 'Young Dad',
  'bnl': 'Retired',
  'pc': 'Worker',
  'vc': 'Country Veto'
};

module.exports = Object.assign({
  ITEMS_CONTENT,
  ITEMS_TOOLTIP,
  DAYS_OF_WEEK,
  MONTHS,
  MORNING_MEETING,
  TIMES,
  TIMESTAMPS,
  PERSONA_LABEL
}, constants);
