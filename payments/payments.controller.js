const Payment = require('../models/payments');
const config = require('../config/index');
const stripe = require('stripe')(config.stripeSecret);
const createCustomer = require('../utils/createCustomer');
const sendMail = require('../utils/sendMail');

async function PaymentHandler(req, res) {
  try {
    const { paymentMethod, amount, email, foundationId, userId } = req.body;

    const {
      id,
      billing_details: { name, address, phone },
    } = paymentMethod;

    const { city, country, line1, line2 } = address;

    const customerId = await createCustomer(id, email, name);

    if (!customerId) {
      throw new Error('Something went wrong.');
    }

    if (typeof customerId !== 'string') {
      console.log('CUSTOMER', customerId);
      throw new Error(customerId.message);
    }

    const stripePayment = await stripe.paymentIntents.create({
      customer: customerId,
      payment_method: id,
      amount,
      currency: 'USD',
      confirm: true,
      description: 'Donation recieved successfully',
      return_url: 'http://localhost:3000',
    });

    if (!stripePayment) {
      throw new Error('Something went wrong.');
    }

    const payment = {
      userId,
      foundationId,
      bill: {
        stripe_id: stripePayment.id,
        customer: stripePayment.customer,
        amount: stripePayment.amount / 100,
        payment_method: stripePayment.payment_method,
        payment_method_types: stripePayment.payment_method_types.join(','),
        status: stripePayment.status,
        description: stripePayment.description,
        name,
        email,
        phone,
        city,
        country,
        line1,
        line2,
      },
    };

    const paymentResponse = await Payment.create(payment);

    const emailData = {
      from: 'AdminAdogta <adogta4@gmail.com>',
      to: email,
      template_id: config.senGridDonation,
      dynamic_template_data: {
        name: name,
      },
    };

    sendMail(emailData);

    res.status(201).json(paymentResponse);
  } catch (error) {
    res.status(200).json({ message: error.message });
  }
}

module.exports = {
  PaymentHandler,
};
