const productModel = require("../models/productModel");

// Create Product
exports.createProduct = async (req, res) => {
    try {
        const product = req.body;
        const result = await productModel.create(product);
        return res.status(201).json({
            status: "sucess",
            product: result
        });
    } catch (error) {
        return res.status(500).json({
            status: "fail",
            error: error.message
        });
    }
};
