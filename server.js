require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes');
const db = require('./db');

const {SERVER_PORT} = process.env;

db.initDB().then(() => {
  const app = express();
  app.use(cors());
  app.use(morgan('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(routes.payment);
  app.use(routes.transfers);
  app.use(routes.charges);
  app.use(routes.users);

  /**
   * Common error handler
   */
  app.use((err, req, res, next) => {
    res.status(err.status || err.statusCode).send('Internal server error');
  });

  app.listen(SERVER_PORT, () => {
    console.log(`server listen on port ${SERVER_PORT}`);
  });
});
