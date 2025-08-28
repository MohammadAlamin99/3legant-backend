const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
    {
        name: { type: String, default: "User" },
        email: { type: String, required: true, unique: true, trim: true },
        phone: { type: String },
        password: { type: String, required: true },
        address: { type: String },
        role: {
            type: String,
            enum: ["admin", "customer"],
            default: "customer",
        },
    },
    { timestamps: true }
);

const userModel = mongoose.model("users", userSchema)
module.exports = userModel;