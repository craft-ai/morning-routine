const craftai = require('craft-ai').createClient;

module.exports = craftai(process.env.CRAFT_TOKEN || process.env.REACT_APP_CRAFT_TOKEN);
