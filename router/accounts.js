const express = require('express');
const router = express.Router();
const controller = require('../app/controllers');

router.post('/v1/accounts/:id', controller.accounts.createAccount);
router.get('/v1/accounts/:id', controller.accounts.getAccounts);
router.get('/v1/accounts/:id/:accountId', controller.accounts.getDetailAccount);

module.exports = router;
