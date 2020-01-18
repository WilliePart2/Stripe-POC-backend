const { createNamespacedContext } = require('./core');

/**
 * @typedef PaymentUserRelation
 * @property {string} userId
 * @property {string} paymentId
 */

module.exports = dbInstGetter => {
  const namespaceGetter = dbInst => dbInst.get('payment_user');
  const coreContext = createNamespacedContext({
    dbInstGetter,
    namespaceGetter,
  });

  /**
   * @param {number} userId
   * @param {PaymentIntent} paymentObj
   * @returns {boolean | * | number}
   */
  coreContext.add = (userId, paymentObj) =>
    namespaceGetter(dbInstGetter())
      .push({
        userId,
        paymentId: paymentObj.id,
        clientSecret: paymentObj.client_secret,
      })
      .write();

  /**
   * @param {number} userId
   * @returns {PaymentUserRelation}
   */
  coreContext.findByUserId = userId =>
    namespaceGetter(dbInstGetter())
      .filter({ userId })
      .value();

  return coreContext;
};
