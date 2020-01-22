const {STRIPE_API_SECRET} = process.env;

const express = require('express');
const {stripePayments} = require("../constants");
const stripe = require('stripe')(STRIPE_API_SECRET);
const {paymentContext, paymentUserContext, userContext} = require("../db");
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

router.post('/payments/authorize', commonWrapper(async ({body}, res) => {
  const stripeUserId = body.stripeUserId;
  const amount = body.amount;
  const currency = body.currency;
  const description = 'API test payment description';

  /**
   * @type {PaymentIntent}
   */
  const payment = await stripe.paymentIntents.create({
    amount,
    description,
    currency,
    payment_method_types: ['card'],
    capture_method: stripePayments.captureMethods.MANUAL,
    metadata: {
      description,
      stripeUserId,
      accountHolderId: stripeUserId,
    },
  });

  await paymentUserContext.add(stripeUserId, payment);
  // await paymentContext.push(payment);

  return {
    clientSecret: payment.client_secret,
    paymentIntentId: payment.id,
  };
}));

router.post('/payments/capture', commonWrapper(({ body }) => {
  const paymentIntentId = body.paymentIntentId;

  return stripe.paymentIntents.capture(paymentIntentId);
}));

router.get('/payments', commonWrapper(async (req, res) => {
  return stripe.paymentIntents.list({
    limit: 100,
  });
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
    limit: 100,
  });
}));

module.exports = router;
