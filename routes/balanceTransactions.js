const express = require('express');
const {env} = require("../constants");
const stripe = require('stripe')(env.getStripeApiSecret());
const {commonWrapper} = require("../requestWrappers");
const router = express.Router();

router.get('/balance-transactions/:id', commonWrapper(async ({ params }) => {
  const balanceTransactionId = params.id;
  return stripe.balanceTransactions.retrieve(balanceTransactionId);
}));

module.exports = router;
