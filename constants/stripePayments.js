const nextAction = {
    redirectToUrl: 'redirect_to_url',
    userStripeSdk: 'use_stripe_sdk',
};

const captureMethods = {
    MANUAL: 'manual',
    AUTOMATIC: 'automatic',
};

const paymentStatus = {
    REQUIRES_PAYMENT_METHOD: 'requires_payment_method', // 1
    REQUIRES_CONFIRMATION: 'requires_confirmation', // 2
    REQUIRES_ACTION: 'requires_action', // 3 (optional)
    PROCESSING: 'processing', // 4
    REQUIRES_CAPTURE: 'requires_capture', // 5 (optional???)
    SUCCEEDED: 'succeeded',
    CANCELED: 'canceled',
};

module.exports = {
    nextAction,
    captureMethods,
    paymentStatus,
};
