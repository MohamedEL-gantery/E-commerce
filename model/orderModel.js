const mongoose = require('mongoose');
const validator = require('validator');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Order must be belong to user'],
    },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: 'Product',
        },
        quantity: Number,
        price: Number,
        color: String,
      },
    ],
    taxPrice: {
      type: Number,
      default: 0,
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    shippingAddress: {
      details: String,
      phone: {
        type: String,
        validate: [validator.isMobilePhone, 'Please Provide A Vaild Phone'],
      },
      city: String,
      postalCode: String,
    },
    totalOrderPrice: {
      type: Number,
    },
    PaymentMethod: {
      type: String,
      enum: ['card', 'cash'],
      default: 'cash',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
  },
  { timestamps: true }
);

orderSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name email photo phone' }).populate({
    path: 'cartItems.product',
    select: 'name  imageCover ratingsAverage ratingsQuantity ',
  });
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
