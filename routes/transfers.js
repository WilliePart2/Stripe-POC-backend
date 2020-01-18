const { STRIPE_API_SECRET } = process.env;

const express = require('express');
const {userContext} = require("../db");
const {transferContext} = require("../db");
const {commonWrapper} = require("../requestWrappers");
const stripe = require('stripe')(STRIPE_API_SECRET);
const router = express.Router();

router.post('/transfers', commonWrapper(async ({ body }, res) => {
    const userId = Number(body.userId);
    const amount = body.amount;
    const sourceTransaction = body.sourceTransaction;
    const description = body.description;

    /**
     * @type {UserObj}
     */
    const userObj = await userContext.findById(userId);
    const userStripeId = userObj.stripeUserId;

    const transfer = await stripe.transfers.create({
        amount,
        currency: 'gbp',
        description,
        destination: userStripeId,
        source_transaction: sourceTransaction,
        metadata: {
            description,
            accountHolderId: userStripeId,
        },
    });

    await transferContext.push(transfer);

    return transfer;
}));

router.get('/transfers', commonWrapper(async (req, res) => {
    return transferContext.getAll();
}));

module.exports = router;