const User = require('../models/User');
const Payment = require('../models/payments');
const createCustomer = require('../utils/createCustomer');

const config = require('../config/index');
const sendMail = require('../utils/sendMail');

const stripe = require('stripe')(config.stripeSecret);

async function PaymentHandler(req, res) {
  const { paymentMethod, amount, email } = req.body;

  try {
    const { id, billing_details } = paymentMethod;

    const customerId = await createCustomer(id, email);

    if (typeof customerId !== 'string') {
      throw new Error(customerId.message);
    }

    const payment = await stripe.paymentIntents.create({
      customer: customerId,
      payment_method: id,
      amount,
      currency: 'USD',
      confirm: true,
      description: 'Donation recieved successfully',
      return_url: 'http://localhost:3000',
    });

    console.log('PAYMENT', payment);

    const emailData = {
      from: 'AdminAdogta <adogta4@gmail.com>',
      to: email,
      template_id: config.senGridDonation,
      dynamic_template_data: {
        name: billing_details.name,
      },
    };

    sendMail(emailData);

    res.status(201).json(payment);
  } catch (error) {
    res.status(200).json({ message: error.message });
  }
  // const cardInfo = req.body;
  // const user = res.locals.user;
  // let card_token;
  // let userId;

  // // crea el token de la tarjeta
  // try {
  //   const token = await epayco.token.create(cardInfo);
  //   const filter = { _id: user._id };
  //   const update = { token_card: token.id };

  //   await User.findOneAndUpdate(filter, update);
  //   card_token = token.id;
  // } catch (error) {
  //   res.status(500).send(error.errors);
  // }
  // // Crea el usuario y hace udpate del user id en el modelo de usuario
  // try {
  //   const customerInfo = { ...cardInfo, token_card: card_token };
  //   const customer = await epayco.customers.create(customerInfo);

  //   const {
  //     data: { customerId },
  //   } = customer;
  //   const filter = { _id: user._id };
  //   const update = { epaycoCustomerId: customerId };
  //   await User.findOneAndUpdate(filter, update);
  //   userId = customerId;
  // } catch (error) {
  //   res.status(500).send(error.errors);
  // }
  // // Hacer el pago
  // try {
  //   const paymentInfo2 = {
  //     customer_id: userId,
  //     token_card: card_token,
  //     ...cardInfo,
  //   };

  //   const { data: data } = await epayco.charge.create(paymentInfo2);
  //   const newPayment = new Payment({
  //     ...data,
  //     userId: user._id,
  //     epaycoCustomerId: userId,
  //     foundationId: req.body.foundationId,
  //   });
  //   await newPayment.save();

  //   const emailData = {
  //     from: 'AdminAdogta <adogta4@gmail.com>',
  //     to: user.email,
  //     template_id: config.senGridDonation,
  //     dynamic_template_data: {
  //       name: user.name,
  //     },
  //   };

  //   sendMail(emailData);

  //   res.status(201).json({ data });
  // } catch (error) {
  //   res.status(500).send(error.errors);
  // }
}

module.exports = {
  PaymentHandler,
};
