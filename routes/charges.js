const { STRIPE_API_SECRET } = process.env;

const express = require('express');
const {chargeContext} = require("../db");
const stripe = require('stripe')(STRIPE_API_SECRET);
const {commonWrapper} = require("../requestWrappers");
const router = express.Router();

const resourceName = '/charges';

router.post(resourceName, commonWrapper(async (req, res) => {
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

router.get(resourceName, commonWrapper(() => chargeContext.getAll()));

module.exports = router;