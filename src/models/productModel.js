const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    comparePrice: { type: Number },
    variants: [{
        title: { type: String, required: true },
        price: { type: Number, required: true },
        stock: { type: Number, required: true },
        sku: { type: String },
        barcode: { type: String },
        image: { type: String }
    }],

    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    collectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Collection" },

    image: [{ type: String }],
    stock: { type: Number, default: 0 },
    star: { type: Number, min: 1, max: 5 },
    ratings: { type: Number, default: 0 }
}, { timestamps: true });

const productModel = mongoose.model('Product', productSchema);
module.exports = productModel;
