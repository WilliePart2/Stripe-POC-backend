const path = require('path');
const lowdb = require('lowdb');
const FileAsyncAdapter = require('lowdb/adapters/FileAsync');
const {countries} = require("../constants");
const {createNamespacedContext} = require('./core');
const moment = require('moment');
const createPaymentToUserContext = require('./paymentToUser');

let dbInst = lowdb(
  new FileAsyncAdapter(path.resolve(__dirname, '../storage/db.json'))
);

const initDB = async () => {
  dbInst = await dbInst;
  await dbInst.defaults({
    users: [{
      id: 1,
      email: 'test@test.com',
      socialUrl: 'https://facebook.com',
      country: countries.GB,
      phoneNumber: '0000000000',
      businessAlias: 'test business name',
      firstName: 'test first name',
      lastName: 'test last name',
      dateOfBorn: moment('2000-01-16T23:01:16.888Z'),
      productDescription: 'test product description',
      streetAddress: 'test street address',
      city: 'test city',
      zip: 'test zip',
      state: 'test state',
    }],
    payments: [],
    charges: [],
    transfers: [],
    payment_user: [],
  }).write();
};

const dbInstGetter = () => dbInst;

module.exports = {
  initDB,
  userContext: createNamespacedContext({
    dbInstGetter,
    namespaceGetter: db => db.get('users'),
  }),
  paymentContext: createNamespacedContext({
    dbInstGetter,
    namespaceGetter: db => db.get('payments'),
  }),
  paymentUserContext: createPaymentToUserContext(dbInstGetter),
  transferContext: createNamespacedContext({
    dbInstGetter,
    namespaceGetter: db => db.get('transfers'),
  }),
  chargeContext: createNamespacedContext({
    dbInstGetter,
    namespaceGetter: db => db.get('charges'),
  })
};
