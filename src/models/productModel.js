const mongoose = require("mongoose");

const { Schema } = mongoose;

// Variant Schema
const variantSchema = new Schema(
    {
        sku: { type: String, required: true, unique: true, trim: true },
        title: { type: String, required: true },
        options: {
            type: Map,
            of: String, // e.g., { color: "Red", size: "XL" }
            default: {},
        },
        price: { type: Number, required: true },
        compareAtPrice: { type: Number },
        barcode: { type: String },
        image: { type: String },
        stock: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { _id: true }
);

// Product Schema
const productSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String },

        brandId: { type: Schema.Types.ObjectId, ref: "Brand" },
        categoryIds: [{ type: Schema.Types.ObjectId, ref: "Category" }],
        collectionIds: [{ type: Schema.Types.ObjectId, ref: "Collection" }],

        images: [
            {
                url: { type: String, required: true },
                alt: { type: String },
            },
        ],
        thumbnail: { type: String },

        tags: [{ type: String, trim: true }],

        basePrice: { type: Number, required: true },
        compareAtPrice: { type: Number },

        attributes: {
            type: Map,
            of: String, // flexible key-value for attributes
            default: {},
        },

        variants: [variantSchema],

        status: {
            type: String,
            enum: ["draft", "active", "archived"],
            default: "draft",
        },

        isTaxable: { type: Boolean, default: true },
        shippingRequired: { type: Boolean, default: true },

        weight: { type: Number },
        dimensions: {
            l: { type: Number },
            w: { type: Number },
            h: { type: Number },
        },

        rating: {
            average: { type: Number, default: 0 },
            count: { type: Number, default: 0 },
        },
    },
    { timestamps: true }
);

// Indexes
productSchema.index({ brandId: 1 });
productSchema.index({ categoryIds: 1 });
productSchema.index({ "variants.sku": 1 }, { unique: true });
productSchema.index({ title: "text", description: "text", tags: "text" });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
