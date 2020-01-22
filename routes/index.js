const payment = require('./payment');
const transfers = require('./transfers');
const charges = require('./charges');
const users = require('./users');
const balanceTransactions = require('./balanceTransactions');
const payouts = require('./payouts');
const balances = require('./balances');

/**
 * @typedef IdempotentRequestOptions
 * @property {string} idempotency_key - the idemponent key of the operation to prevent performing the same operation twice
 */

/**
 * @typedef List
 * @property {Array} data
 * @property {boolean} has_more
 * @property {number} total_count
 */

/**
 * @typedef ListRequest
 * @property {Date} created
 * @property {string} ending_before - id of the entity when we are paginating backward
 * @property {string} starting_after - id of the entity when we are paginating forward
 * @property {number} limit - from 1 to 100
 */


module.exports = {
    payment,
    transfers,
    charges,
    users,
    balanceTransactions,
    payouts,
    balances,
};
