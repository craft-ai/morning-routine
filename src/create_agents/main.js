require('dotenv').load();

const _ = require('lodash');
const { debug } = require('../utils');
const { PERSONA, PREFETCH_MAX_ATTEMPTS, PERSONA_MAX_CONCURRENT, PREFETCH_MAX_CONCURRENT } = require('./constants');
const craftClient = require('../client');
const createPersonaAgents = require('./createPersonaAgents');
const createPersonaContextOperations = require('./createPersonaContextOperations');
const createPersonaData = require('./createPersonaData');
const Rx = require('rxjs/Rx');

const log = debug();

function prefetchDecisionTree(agentId, attempts = 1) {
  if (attempts > PREFETCH_MAX_ATTEMPTS) {
    throw new Error(`Unable to prefetch the decision tree after ${PREFETCH_MAX_ATTEMPTS} attempts`);
  }

  const log = debug(agentId.replace('_', ':'));

  log(`Prefetching the decision tree (${attempts})`);

  return craftClient.getAgentDecisionTree(agentId)
    .then(() => log(`Done prefetching the decision tree after ${attempts} attempts`))
    .catch(error => prefetchDecisionTree(agentId, attempts + 1));
}

let personas = [];

if (!process.env.PERSONAS) {
  log('Please select one or several personas');
}
else if (process.env.PERSONAS === 'all') {
  personas = PERSONA;
  log('Re-creating the agents for all the personas!');
}
else {
  personas = _.intersection(process.env.PERSONAS.split(','), PERSONA);
  log(`Re-creating the agents for the personas '${personas.join('\', \'')}'.`);
}

Rx.Observable.from(personas)
  .mergeMap(persona => {
    debug(persona)('Creating craft ai agents');

    const personaData = createPersonaData(persona);
    const personaContextOperations = createPersonaContextOperations(personaData);
    const personaAgents = createPersonaAgents(persona, personaContextOperations);

    return personaAgents
      .catch(e => {
        debug(persona)('Error while creating craft ai agents', e);
        throw e;
      });
  }, null, PERSONA_MAX_CONCURRENT)
  .mergeMap(agentId => prefetchDecisionTree(agentId), null, PREFETCH_MAX_CONCURRENT)
  .subscribe({
    error: error => log('Error!', error),
    complete: () => log('Success!')
  });
