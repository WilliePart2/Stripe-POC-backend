const { STRIPE_API_SECRET } = process.env;

const express = require('express');
const {userContext} = require("../db");
const {transferContext} = require("../db");
const {commonWrapper} = require("../requestWrappers");
const stripe = require('stripe')(STRIPE_API_SECRET);
const router = express.Router();

/**
 * Need support of consistency to properly handle it
 */
router.post('/transfers', commonWrapper(async ({ body }, res) => {
    const userId = Number(body.userId);
    const amount = body.amount;
    const paymentId = body.paymentId;
    const description = body.description;

    /**
     * @type {PaymentIntent}
     */
    const payment = await stripe.paymentIntents.retrieve(paymentId);
    /**
     * @type {Charge}
     */
    const [ charge = {} ] = payment.charges ? payment.charges.data : [];

    /**
     * @type {UserObj}
     */
    const userObj = await userContext.findById(userId);
    const userStripeId = userObj.stripeUserId;

    const transfer = await stripe.transfers.create({
        amount,
        currency: charge.currency,
        description,
        destination: userStripeId,
        source_transaction: charge.id,
        metadata: {
            description,
            accountHolderId: userStripeId,
        },
    });

    await transferContext.push(transfer);

    return transfer;
}));

router.get('/transfers/:id', commonWrapper(async (req, res) => {
    const transferId = req.params.id;

    return await stripe.transfers.retrieve(transferId);
}));

router.get('/transfers', commonWrapper(({body}) => {
    const startingAfter = body.startingAfter;
    const finishedBefore = body.finishedBefore;
    const limit = body.limit || 100;

    return stripe.transfers.list({
        limit,
        starting_after: startingAfter,
        ending_before: finishedBefore,
    });
}));

router.get('/transfers/internal', commonWrapper(async (req, res) => {
    return transferContext.getAll();
}));

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

router.get('/transfers/:id/reversals', commonWrapper((req) => {
    const transferId = req.params.id;

    return stripe.transfers.listReversals(transferId, {
        limit: 100,
    });
}));

module.exports = router;