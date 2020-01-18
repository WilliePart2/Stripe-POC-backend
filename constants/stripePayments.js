const nextAction = {
    redirectToUrl: 'redirect_to_url',
    userStripeSdk: 'use_stripe_sdk',
};

const captureMethods = {
    manual: 'manual',
    automatic: 'automatic',
};

const paymentStatus = {
    requiresPaymentMethod: 'requires_payment_method', // 1
    requiresConfirmation: 'requires_confirmation', // 2
    requiresAction: 'requires_action', // 3 (optional)
    processing: 'processing', // 4
    requiresCapture: 'requires_capture', // 5 (optional???)
    succeeded: 'succeeded',
    canceled: 'canceled',
};

module.exports = {
    nextAction,
    captureMethods,
    paymentStatus,
};
