const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewSchema = new Schema(
    {
        userId: { type: mongoose.Types.ObjectId, required: true },
        productId: { type: mongoose.Types.ObjectId, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String }
    },
    { timestamps: true, versionKey: false }
)

const reviewModel = mongoose.model("reviews", reviewSchema);
module.exports = reviewModel;