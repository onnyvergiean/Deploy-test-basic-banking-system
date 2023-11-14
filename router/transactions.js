const express = require('express');
const router = express.Router();
const controller = require('../app/controllers');

router.post('/v1/transactions/', controller.transactions.createTransaction);
router.get('/v1/transactions/', controller.transactions.getTransactions);
router.get(
  '/v1/transactions/:id',
  controller.transactions.getDetailTransaction
);

module.exports = router;
