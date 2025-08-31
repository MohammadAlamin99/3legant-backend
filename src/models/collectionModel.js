const mongoose = require("mongoose");
const { Schema } = mongoose;

const collectionSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },
        description: {
            type: String,
            default: "",
            maxlength: 1000,
        },
        image: { type: String },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = mongoose.model("collections", collectionSchema);
