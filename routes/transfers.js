const { STRIPE_API_SECRET } = process.env;

const express = require('express');
const {BadRequestException} = require("../exceptions");
const {userContext} = require("../db");
const {transferContext} = require("../db");
const {commonWrapper} = require("../requestWrappers");
const stripe = require('stripe')(STRIPE_API_SECRET);
const router = express.Router();

/**
 * @typedef Transfer
 */

/**
 * Create a new transfer from the platform to a talent
 */
router.post('/transfers', commonWrapper(async ({ body, params }, res) => {
    const amount = body.amount;
    const paymentId = body.paymentId;
    const description = body.description;
    const stripeAccountId = body.connectedAccountId;

    /**
     * @type {PaymentIntent}
     */
    const payment = await stripe.paymentIntents.retrieve(paymentId);

    /**
     * @type {Charge}
     */
    const [ charge ] = payment.charges.data;
    if (!charge.balance_transaction) {
        throw new BadRequestException('Payment if not finished yet!');
    }

    const balanceTransaction = await stripe.balanceTransactions.retrieve(
      charge.balance_transaction,
    );

    const transfer = await stripe.transfers.create({
        amount,
        currency: balanceTransaction.currency,
        description,
        destination: stripeAccountId,
        source_transaction: charge.id,
        metadata: {
            description,
            accountHolderId: stripeAccountId,
        },
    });

    await transferContext.push(transfer);

    return transfer;
}));

/**
 * Create a new transfer from a connected account to a platform
 */
router.post('/transfers/adjustments', commonWrapper(async ({ body, params }) => {
    const { connectedAccountId, amount, description } = body;

    const platformAccount = await stripe.accounts.retrieve();

    const { default_currency } = await stripe.accounts.retrieve(connectedAccountId);

    const adjustmentTransfer = await stripe.transfers.create(
      {
          amount,
          description,
          currency: default_currency,
          destination: platformAccount.id,
          metadata: {
              description,
          },
      },
      {
          stripe_account: connectedAccountId,
      }
    );

    await transferContext.push(adjustmentTransfer);

    return adjustmentTransfer;
}));

/**
 * Get all transfers from the internal store
 */
router.get('/transfers/internal', commonWrapper(async (req, res) => {
    return transferContext.getAll();
}));

/**
 * Get the transfers by id from Stripe
 */
router.get('/transfers/:id', commonWrapper(async (req, res) => {
    const transferId = req.params.id;

    return await stripe.transfers.retrieve(transferId);
}));

/**
 * Get all transfers from Stripe
 *
 * @param {string} startingAfter
 * @param {string} finishedBefore
 * @param {number} limit
 * @param {string} transferGroup
 */
router.get('/transfers', commonWrapper(({query}) => {
    const startingAfter = query.startingAfter;
    const finishedBefore = query.finishedBefore;
    const limit = query.limit || 100;
    const transferGroup = query.transferGroup;

    return stripe.transfers.list({
        limit,
        starting_after: startingAfter,
        ending_before: finishedBefore,
        transfer_group: transferGroup,
    });
}));

/**
 * Create a reversal for the specified transfer
 */
router.post('/transfers/:id/reversals', commonWrapper(({ params, body }) => {
    const transferId = params.id;
    const amount = body.amount;
    const description = body.description;

    return stripe.transfers.createReversal(transferId, {
        amount,
        description,
        metadata: {
            description,
        },
        refund_application_fee: false,
    });
}));

/**
 * Get all reversals for the particular transfer
 */
router.get('/transfers/:id/reversals', commonWrapper((req) => {
    const transferId = req.params.id;

    return stripe.transfers.listReversals(transferId, {
        limit: 100,
    });
}));

module.exports = router;
