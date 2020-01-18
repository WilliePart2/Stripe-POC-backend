const { StripeUser } = require('../models');

module.exports = {
    expressAccountAuth: ({
         responseType = 'code',
         scope = 'read_write',
         clientId,
         redirectUri,
         state,
         stripeUser,
         suggestedCapabilities,
     }) => {
        let queryString = '';
        queryString += `client_id=${clientId}`;
        queryString += `&response_type=${responseType}`;
        queryString += `&scope=${scope}`;
        queryString += `&redirect_uri=${redirectUri}`;
        queryString += `&state=${state}`;
        suggestedCapabilities && (
          queryString += `&suggested_capabilities[]=${suggestedCapabilities}`
        );
        queryString += StripeUser.toQueryString(stripeUser);

        return `https://connect.stripe.com/express/oauth/authorize?${queryString}`;
    },
};
