const auth = require('./auth');
const errorHandler = require('./errorHandler');
const validator = require('./validator');

module.exports = {
  ...auth,
  ...errorHandler,
  ...validator
};
