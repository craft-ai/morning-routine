const _ = require('lodash');
const moment = require('moment');
const getEaster = require('./easter');


const getHolidays = _.memoize(year => {
  const easter = getEaster(year);

  return [
    moment({ year, month: 0, day: 1 }),   // Nouvel an
    moment({ year, month: 4, day: 1 }),   // Fête du travail
    moment({ year, month: 4, day: 8 }),   // Victoire 1945
    moment({ year, month: 6, day: 14 }),  // Fête nationale
    moment({ year, month: 10, day: 11 }), // Armistice
    easter,                               // Pâques
    easter.clone().add(1, 'days'),        // Lundi de Pâques
    easter.clone().add(39, 'days'),       // Ascension
    easter.clone().add(49, 'days'),       // Pentecôte
    easter.clone().add(50, 'days'),       // Lundi de Pentecôte
    moment({ year, month: 7, day: 15 }),  // Assomption
    moment({ year, month: 10, day: 1 }),  // Toussaint
    moment({ year, month: 11, day: 25 })  // Noël
  ];
});

exports.isPublicHoliday = datetime => {
  const current = moment(datetime);
  const currentYear = current.year();
  const currentDayOfYear = current.dayOfYear();

  return getHolidays(currentYear)
    .some(holiday => currentDayOfYear === holiday.dayOfYear());
};
