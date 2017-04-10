const { debug } = require('../utils');
const { PROPERTIES } = require('./constants');
const craftClient = require('../client');
const moment = require('moment-timezone');

function retrievePersonaDecisionTrees(personaName, timestamp) {
  const log = debug(`persona:${personaName}`);
  log('Retrieving decision trees');
  return Promise.all(PROPERTIES
    .map(property => {
      const agentId = `${personaName}_${property}`;

      log(`Retrieving the decision tree for '${property}' (agent is '${agentId}')`);

      return craftClient.getAgentDecisionTree(agentId, timestamp);
    })
  )
  .then(trees => PROPERTIES.reduce((personaTrees, property, propertyIndex) => {
    personaTrees[property] = trees[propertyIndex];
    return personaTrees;
  }, {}));
}

function createContext(year, month, day_week, time) {
  // Taking the 21th so that 'isoWeekday' always belong to the right month
  const monthMoment = moment([year, month, 21]);
  const dayMoment = monthMoment.isoWeekday(day_week).tz('Europe/Paris');
  const result = {
    timezone: dayMoment.format('Z'),
    day_week: day_week,
    month: month
  };

  if (time) {
    const timeMoment = dayMoment.seconds(time * 3600);
    result.time = timeMoment.hour() + timeMoment.minute() / 60;
  }

  return result;
}


module.exports = {
  retrievePersonaDecisionTrees,
  createContext
};
