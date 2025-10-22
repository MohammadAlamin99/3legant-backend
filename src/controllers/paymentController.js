require("dotenv").config();
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.PymentHandler = async (req, res) => {
    try {
        const { amount, currency, orderId } = req.body;
        if (!amount || !currency) {
            return res.status(400).json({ message: "Amount and currency are required" });
        }
        // 1. Create Stripe Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,          // amount in cents
            currency: currency,      // e.g., 'usd'
            payment_method_types: ["card"],
            metadata: {
                orderId: orderId || "Not provided"
            }
        });

        // 2. Return client secret to frontend
        res.status(200).json({
            message: "Payment intent created successfully",
            clientSecret: paymentIntent.client_secret,
            paymentId: paymentIntent.id,
            paymentIntent: paymentIntent
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Payment failed", error: err.message });
    }
};