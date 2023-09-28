require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const config = require('./config');
const routes = require('./routers/routes');

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use(routes);
process.env.NODE_ENV === 'test'
  ? mongoose.connect(
      config.dbConnectionStringTest,
      console.log('Connected to db-test')
    )
  : mongoose.connect(config.dbConnectionString, console.log('Connected to db'));

mongoose.connection.on('error', (e) => {
  console.error(e);
});

// routes that will be used
app.use(routes);

// manage errors
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

module.exports = app;
