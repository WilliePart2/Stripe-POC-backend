const {STRIPE_API_SECRET} = process.env;

const express = require('express');
const {paymentUserContext} = require("../db");
const stripe = require('stripe')(STRIPE_API_SECRET);
const {paymentContext} = require("../db");
const {commonWrapper} = require("../requestWrappers");
const router = express.Router();

/**
 * @typedef Charge
 * @property {number} amount
 * @property {number} amount_refunded
 * @property {object} billing_details - object contained data about the recipient
 * @property {boolean} captured
 * @property {string} currency - lowercased currency sign
 * @property {string} description
 * @property {boolean} disputed - was charge disputed or not
 * @property {boolean} livemode
 * @property {object} metadata
 * @property {boolean} paid
 * @property {string} payment_intent - identifier of the payment intent that owned it
 * @property {string} payment_method - identifier of the payment method that used for it
 * @property {string} receipt_email
 * @property {List} refunds
 * @property {status} status
 * @property {string} transfer_group
 */

/**
 * @typedef List
 * @property {Array} data
 * @property {boolean} has_more
 * @property {number} total_count
 */

/**
 * @typedef PaymentIntent
 * @property {string} id
 * @property {string} client_secret
 * @property {string} status
 * @property {manual | automatic} capture_method
 * @property {List} charges
 * @property {boolean} livemode
 * @property {string} currency - currency sign in lower case
 * @property {string} on_behalf_of - identifier of setlment merchant is we use it
 * @property {string} receipt_email - email of recipient that receives an email
 * @property {string} statement_descriptor
 * @property {string} transfer_group
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

  return stripe.paymentIntents.retrieve(paymentId);
}));

router.get('/payments/:id/charges', commonWrapper((req, res) => {
  const paymentId = req.params.id;

  return stripe.charges.list({
    limit: 100,
    payment_intent: paymentId,
  });
}));

router.get('/payments/:id/transfers', commonWrapper(async (req) => {
  const paymentId = req.params.id;

  /**
   * @type {PaymentIntent}
   */
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);

  return stripe.transfers.list({
    transfer_group: paymentIntent.transfer_group,
  });
}));

module.exports = router;