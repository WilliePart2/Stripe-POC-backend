const { STRIPE_API_SECRET } = process.env;

const express = require('express');
const {chargeContext} = require("../db");
const stripe = require('stripe')(STRIPE_API_SECRET);
const {commonWrapper} = require("../requestWrappers");
const router = express.Router();

router.post('/charges', commonWrapper(async (req, res) => {
    const charge = await stripe.charges.create({
        amount: 1000,
        currency: "usd",
        source: "tok_visa",
        // application_fee_amount: 123,
        // transfer_data: {
        //     destination: "{{CONNECTED_STRIPE_ACCOUNT_ID}}",
        // }
    });

    chargeContext.push(charge);

    return charge;
}));

router.get('/charges/:id', commonWrapper(async (req, res) => {
    const chargeId = req.params.id;

    return await stripe.charges.retrieve(ch_1G2PCiK5xVH1dUGD9vi5C876);
}));

router.get('/charges', commonWrapper(() => chargeContext.getAll()));

module.exports = router;