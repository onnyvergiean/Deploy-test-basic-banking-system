const users = require('./api/v1/users');
const accounts = require('./api/v1/accounts');
const transactions = require('./api/v1/transactions');
const auth = require('./api/v1/auth');
const media = require('./api/v1/media');

module.exports = {
  users,
  accounts,
  transactions,
  auth,
  media,
};
