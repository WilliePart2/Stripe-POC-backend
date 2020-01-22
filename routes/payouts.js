const {env} = require('../constants');
const express = require('express');
const {commonWrapper} = require("../requestWrappers");
const stripe = require('stripe')(env.getStripeApiSecret());
const router = express.Router();

router.post('/payouts', commonWrapper(({ body }) => {
  const { amount, description, currency } = body;

  return stripe.payouts.create({
    amount,
    description,
    currency,
    metadata: {
      description,
    },
  });
}));

module.exports = router;
