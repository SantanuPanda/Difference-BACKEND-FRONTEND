const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: Number,
  totalAmount: Number,
  payment: {type: Boolean,default: false},
  razorpayOrderId: String
});

module.exports = mongoose.model('Order', orderSchema);