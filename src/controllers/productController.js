const productModel = require("../models/productModel");

// Create Product
exports.createProduct = async (req, res) => {
    try {
        const product = req.body;
        await productModel.create(product);
        return res.status(201).json({
            status: "sucess",
            message: "Product created successfully"
        });
    } catch (e) {
        return res.status(500).json({
            status: "fail",
            message: e,
        });
    }
};

// get all products
exports.getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        if (page && limit) {
            const skip = (page - 1) * limit;
            const total = await productModel.countDocuments();
            const totalpage = Math.ceil(total / limit);
            const products = await productModel.find().skip(skip).limit(limit);
            return res.status(200).json({
                status: "success",
                products: products,
                totalPages: totalpage,
                totalProducts: total,
            })
        }
    }
    catch (e) {
        console.log(e)
        return res.status(500).json({
            status: "fail",
            message: e
        });
    }
}


// update product by id
exports.updateProduct = async (req, res) => {
    try {
        let id = req.params.id;
        const updateData = req.body;
        await productModel.findByIdAndUpdate(id, updateData);
        return res.status(200).json({
            staus: "success",
            message: "product updated successfully"
        })

    } catch (e) {
        return res.status(500).json({
            status: "fail",
            message: e,
        })
    }
}

exports.deleteProduct = async (req, res) => {
    try {
        let id = req.params.id;
        await productModel.findByIdAndDelete(id);
        return res.status(200).json({
            status: "success",
            message: "Product deleted successfully"
        })

    } catch (e) {
        return res.status(500).json({
            status: "fail",
            message: e,
        })
    }
}