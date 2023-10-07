const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
  stripe_id: {
    type: String,
    required: true,
  },
  customer: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  payment_method: {
    type: String,
    required: true,
  },
  payment_method_types: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  line1: {
    type: String,
    required: true,
  },
  line2: {
    type: String,
  },
});

const PaymentSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    foundationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: 'Foundation',
    },
    bill: BillSchema,
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model('Payment', PaymentSchema);

module.exports = Payment;
