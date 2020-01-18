const { STRIPE_API_SECRET, STRIPE_CLIENT_ID } = process.env;

const express = require('express');
const moment = require('moment');
const {UnauthorizedException} = require("../exceptions");
const {paymentUserContext} = require("../db");
const {stripeAccount, resources, stripeApi} = require("../constants");
const {StripeUser} = require("../models");
const {userContext} = require("../db");
const stripe = require('stripe')(STRIPE_API_SECRET);
const {commonWrapper} = require("../requestWrappers");
const route = express.Router();
/**
 * Types
 */

/**
 * @typedef UserObj
 * @property {number} id
 * @property {string} email
 * @property {string} socialUrl
 * @property {string} country
 * @property {string} phoneNumber
 * @property {string} businessAlias
 * @property {string} firstName
 * @property {string} lastName
 * @property {string | Date} dateOfBorn
 * @property {string} productDescription
 * @property {string} streetAddress
 * @property {string} city
 * @property {string} zip
 * @property {string} state
 * @property {string} accessToken
 * @property {string} refreshToken
 * @property {boolean} livemode
 * @property {string} stripeUserId
 * @property {string} stripePublishableKey
 */

/**
 * @typedef UserAuthData
 * @property {string} access_token
 * @property {boolean} livemode
 * @property {string} refresh_token - could be used multiple times to receive new [access_token]
 * @property {string} token_type - always 'bearer'
 * @property {string} stripe_publishable_key
 * @property {string} stripe_user_id
 * @property {string} scope
 * @property {string} capabilities
 */

/**
 * @typedef AuthErrorData
 * @property {string} error
 * @property {string} error_description
 */

/**
 * @typedef LoginLinkObj
 * @property {string} object - will be 'login_link'
 * @property {number} created
 * @property {string} url
 */

route.get('/users/:id/onboarding', commonWrapper(async (req, res) => {
    const userId = Number(req.params.id);
    const userEntity = await userContext.findById(userId);

    const dateOfBorn = moment(userEntity.dateOfBorn);
    const dayOfBorn = dateOfBorn.date();
    const monthOfBorn = dateOfBorn.month() + 1; // month is zero-based but stripe expects one-based
    const yearOfBorn = dateOfBorn.year();

    res.redirect(
        stripeApi.expressAccountAuth({
            stripeUser: new StripeUser({
                ...userEntity,
                businessType: stripeAccount.individualAccountType,
                email: `${String(Math.random())}@test.com`,
                businessUrl: userEntity.socialUrl,
                businessName: userEntity.businessAlias,
                dobDay: dayOfBorn,
                dobMonth: monthOfBorn,
                dobYear: yearOfBorn,
            }),
            // suggestedCapabilities: stripeAccount.transferCapability,
            clientId: STRIPE_CLIENT_ID,
            redirectUri: `${resources.serverAddrr()}/users/callback`,
            state: String(Math.random() * 1000),
        })
    );
}));

/**
 * @internal
 *
 * If fail here we should retry the whole process
 */
route.get('/users/callback', commonWrapper(async (req, res) => {
    const code = req.query.code;
    const userId = 1;

    /**
     * @type {UserAuthData | AuthErrorData}
     */
    const userAuthData = await stripe.oauth.token({
        code,
        grant_type: 'authorization_code',
        assert_capabilities: [stripeAccount.cardPaymentCapability]
    });

    if (userAuthData.error) {
        throw new UnauthorizedException('Onboarding failed');
    }

    userContext.updateById(userId, {
        accessToken: userAuthData.access_token,
        refreshToken: userAuthData.refresh_token,
        livemode: userAuthData.livemode,
        stripeUserId: userAuthData.stripe_user_id,
        stripePublishableKey: userAuthData.stripe_publishable_key,
    });

    res.redirect(resources.clientAppUrl());
}));

route.get('/users/:id/initialized', commonWrapper(async (req, res) => {
    const userId = Number(req.params.id);

    const userObj = await userContext.findById(userId);

    return {
        login: Boolean(userObj.accessToken),
    };
}));

route.get('/users/:id/dashboard', commonWrapper(async (req, res) => {
    const userId = Number(req.params.id);

    /**
     * @type {UserObj}
     */
    const userObj = await userContext.findById(userId);

    /**
     * @type {LoginLinkObj}
     */
    const linkObj = await stripe.accounts.createLoginLink(
        userObj.stripeUserId,
    );

    return linkObj;
}));

route.get('/users/:id', commonWrapper(async (req, res) => {
    const userId = Number(req.params.id);

    /**
     * @type {UserObj}
     */
    const userObj = await userContext.findById(userId);

    return userObj;
}));

route.get('/users', commonWrapper(async (req, res) => {
    /**
     * @type {UserObj[]}
     */
    const usersList = await userContext.getAll();

    return usersList;
}));

/**
 * Only for custom accounts!
 */
route.post('/users/:id/account', commonWrapper(async (req, res) => {
    const userId = Number(req.params.id);

    /**
     * @type {UserObj}
     */
    const userObj = await userContext.findById(userId);

    const link = await stripe.accountLinks.create({
        account: userObj.stripeUserId,
        failure_url: 'http://localhost:3000',
        success_url: 'http://localhost:3000',
        type: stripeAccount.customAccountUpdateLink,
    });

    return link;
}));

/**
 * refresh_token could be used many times to receive an access_token
 */
route.patch('/users/token', commonWrapper(async (req, res) => {
    const userId = Number(req.query.userId);

    /**
     * @type {UserObj}
     */
    const usedObj = await userContext.findById(userId);

    /**
     * @type {UserAuthData | AuthErrorData}
     */
    const newAccessToke = await stripe.oauth.token({
        refresh_token: usedObj.refreshToken,
        grant_type: 'refresh_token',
    });

    if (newAccessToke.error) {
        throw new UnauthorizedException('Token exchange failed');
    }

    await userContext.updateById(userId, { refreshToken: newAccessToke.refresh_token });

    res.status(200).json({ token: newAccessToke.access_token });
}));

route.get('/users/:id/payments', commonWrapper((req, res) => {
    const userId = Number(req.params.id);

    return paymentUserContext.findByUserId(userId);
}));

module.exports = route;
