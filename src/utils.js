const _ = require('lodash');
const Debug = require('debug');
const seedrandom = require('seedrandom');


const rand = seedrandom('morning-routine');
const prefix = 'craft-ai:morning-routine';

const debug = title => Debug(title ? `${prefix}:${title}` : prefix);

const randMax = max => Math.floor(rand() * max);

const randMap = (array, apply, size) => {
  size = size ? Math.min(size, array.length) : array.length;

  return _.times(size, () => apply(array.splice(randMax(array.length), 1)[0]));
};

module.exports = { debug, rand, randMax, randMap };
