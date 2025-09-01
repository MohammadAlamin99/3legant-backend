
const mongoose = require("mongoose");
const { Schema } = mongoose;

const wishlistSchema = new Schema({
    userId: { type: mongoose.Types.ObjectId, ref: "users", required: true, unique: true },
    productId: [{ type: mongoose.Types.ObjectId, ref: "products" }],
}, { timestamps: true, versionKey: false, });

const wishlistModel = mongoose.model("wishlists", wishlistSchema);
module.exports = wishlistModel;