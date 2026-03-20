const express = require('express');
const cors = require('cors');

/* first install razorpay through npm and then import it here */
const Razorpay = require('razorpay');
/* for generating signature crypto through npm and then import it here  */
const crypto = require('crypto');

require('dotenv').config();

const OrderModel = require('./model/order.model.js');

const app = express();

app.use(cors());
app.use(express.json());

/* initialize razorpay instance here using key_id and key_secret from .env file */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});


app.post('/placerazorpayorder', async (req, res) => {
  try {
    /* first create an new order */
    const newOrder = await OrderModel.create({
      userId: 1234,
      totalAmount: 543,
      payment: false
    });

    /* then create an order in razorpay using razorpay.orders.create method and pass amount, currency and receipt (receipt can be anything but it should be unique for every order) */
    const order = await razorpay.orders.create({
      amount: 543 * 100,
      currency: 'INR',
      receipt: newOrder._id.toString()
    });

    /* then save the razorpay order id in the order document which we have created in our database */
    newOrder.razorpayOrderId = order.id;
    await newOrder.save();

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


app.post('/verifyRazorpay', async (req, res) => {

  try {
    /* first get the required details from the request body which are sent by razorpay after payment */
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    /* then generate the signature on the server side using the same details and the key secret which is used to initialize razorpay instance */
    const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(razorpay_order_id + '|' + razorpay_payment_id).digest('hex');

    /* then compare the generated signature with the signature which is sent by razorpay, if both are same then the payment is successful and verified */
    if (generatedSignature === razorpay_signature) {await OrderModel.findOneAndUpdate({ razorpayOrderId: razorpay_order_id },{ payment: true });

      return res.json({ success: true });
    }

    return res.json({ success: false });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = app;