const accountLinks = {
    customAccountVerificationLink: 'custom_account_verification',
    customAccountUpdateLink: 'custom_account_update',
};

module.exports = {
    businessAccountType: 'business',
    individualAccountType: 'individual',
    transferCapability: 'transfers',
    cardPaymentCapability: 'card_payments',
    ...accountLinks,
};
