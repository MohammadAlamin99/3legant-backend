const mongoose = require('mongoose');
const { Schema } = mongoose;
const orderSchema = new Schema({
    orderNo: { type: String, unique: true, required: true },
    userId: { type: mongoose.Types.ObjectId, ref: 'users', required: true },
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
            variantId: { type: mongoose.Schema.Types.ObjectId },
            title: { type: String, required: true },
            variantTitle: { type: String },
            price: { type: Number, required: true },
            qty: { type: Number, required: true, min: 1 },
            image: { type: String },
        }
    ],
    totals: {
        subtotal: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        shipping: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        grandTotal: { type: Number, required: true },
    },
    shippingAddress: {
        name: { type: String, required: true },
        address: { type: String, required: true }
    },
    contact: {
        email: { type: String, required: true },
        phone: { type: String, required: true },
    },
    payment: {
        method: {
            type: String,
            enum: ["BKASH", "NAGAD"],
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "authorized", "paid", "failed", "refunded"],
            default: "pending",
        },
        paymentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment",
        },
    },
    status: {
        type: String,
        enum: [
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
            "refunded",
        ],
        default: "pending",
    },
    notes: { type: String },
}, { timestamps: true, versionKey: false })

const orderModel = mongoose.model('orders', orderSchema);
module.exports = orderModel;