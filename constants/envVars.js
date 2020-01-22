const { STRIPE_CLIENT_ID, STRIPE_API_SECRET } = process.env;

const getStripeClientId = () => STRIPE_CLIENT_ID;

const getStripeApiSecret = () => STRIPE_API_SECRET;

module.exports = { getStripeClientId, getStripeApiSecret };
