const {STRIPE_API_SECRET} = process.env;

const express = require('express');
const {paymentUserContext} = require("../db");
const stripe = require('stripe')(STRIPE_API_SECRET);
const {paymentContext} = require("../db");
const {commonWrapper} = require("../requestWrappers");
const router = express.Router();

/**
 * @typedef PaymentIntent
 * @property {string} id
 * @property {string} client_secret
 * @property {string} status
 * @property {manual | automatic} capture_method
 */

router.post('/payments', commonWrapper(async ({body}, res) => {
  const userId = Number(body.userId);
  const amount = body.amount;
  const description = 'API test payment description';

  /**
   * @type {PaymentIntent}
   */
  const payment = await stripe.paymentIntents.create({
    amount,
    description,
    currency: 'usd',
    payment_method_types: ['card'],
    metadata: {
      description,
      accountHolderId: userId,
    },
  });

  await paymentUserContext.add(userId, payment);
  await paymentContext.push(payment);

  return {
    clientSecret: payment.client_secret,
  };
}));

router.get('/payments', commonWrapper(async (req, res) => {
  return paymentContext.getAll();
}));

router.get('/payments/:id', commonWrapper(async (req, res) => {
  const paymentId = req.params.id;

  return await stripe.paymentIntents.retrieve(paymentId);
}));

module.exports = router;