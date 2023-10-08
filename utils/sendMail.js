const sgMail = require('@sendgrid/mail');
require('dotenv').config();
const config = require('../config/index');

sgMail.setApiKey(config.sendGrid);

function sendMail(data) {
  return sgMail.send(data);
}

module.exports = sendMail;
