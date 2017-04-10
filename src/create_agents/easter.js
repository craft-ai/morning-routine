const moment = require('moment-timezone');
const getEaster = require('date-easter').easter;


module.exports = year => {
  const easter = getEaster(year);

  easter.month--;

  return moment(easter);
};
