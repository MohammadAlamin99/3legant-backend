const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
        },
        content: {
            type: String,
            required: [true, "Content is required"],
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        category: {
            type: String,
            default: "General",
        },
        tags: [
            {
                type: String,
            },
        ],
        image: [
            { type: String, }
        ],
        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft",
        },
        views: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const blogModel = mongoose.model("blogs", blogSchema);
module.exports = blogModel;