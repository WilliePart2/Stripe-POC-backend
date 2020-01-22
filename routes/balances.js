const {env} = require('../constants');
const express = require('express');
const {commonWrapper} = require("../requestWrappers");
const stripe = require('stripe')(env.getStripeApiSecret());
const router = express.Router();

router.get('/balances', commonWrapper(() => {
  return stripe.balance.retrieve();
}));

module.exports = router;