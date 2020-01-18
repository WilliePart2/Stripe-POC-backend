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

router.get('/transfers', commonWrapper(async (req, res) => {
    return transferContext.getAll();
}));

module.exports = router;