const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  amountPaid: Number,
  paymentDate: { type: Date, default: Date.now },
  method: String
});

module.exports = mongoose.model('Payment', paymentSchema);
