
require("dotenv").config();
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/orderModel");

// Create payment intent
exports.PaymentHandler = async (req, res) => {
    try {
        const { orderId } = req.body;
        if (!orderId) return res.status(400).json({ message: "Order ID is required" });

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        const amount = Math.round(order.totals.grandTotal * 100);
        const currency = "bdt";

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            payment_method_types: ["card"],
            metadata: { orderId: order._id.toString() },
        });

        res.status(200).json({
            message: "Payment intent created successfully",
            clientSecret: paymentIntent.client_secret,
            paymentId: paymentIntent.id,
        });

    } catch (err) {
        res.status(500).json({ message: "Payment failed", error: err.message });
    }
};

//  Stripe webhook to confirm payment
exports.WebhookHandler = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.log("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;

        try {
            await Order.findByIdAndUpdate(orderId, { status: "paid" });
            console.log(`Order ${orderId} marked as paid`);
        } catch (err) {
            console.error("Failed to update order status:", err.message);
        }
    }

    res.json({ received: true });
};
