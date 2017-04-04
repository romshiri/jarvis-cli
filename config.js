var nconf = require('nconf');

nconf.env().file('config.json');

module.exports = nconf;