const User = require('../models/User');
const config = require('../config/index');

const stripe = require('stripe')(config.stripeSecret);

async function createCustomer(paymentMethodId, email, name) {
  try {
    const existingCustomers = await stripe.customers.list({ email });

    if (existingCustomers.data.length > 0) {
      const customer = existingCustomers.data[0];

      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.id,
      });

      return customer.id;
    } else {
      const customer = await stripe.customers.create({
        email,
        name,
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      await User.findOneAndUpdate(
        { email },
        { $set: { stripeCustomerId: customer.id } }
      );

      return customer.id;
    }
  } catch (error) {
    return error.raw;
  }
}

module.exports = createCustomer;
