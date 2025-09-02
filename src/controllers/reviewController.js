const reviewModel = require("../models/reviewModel");
const productModel = require("../models/productModel");

// create review
exports.createReview = async (req, res) => {
    try {
        const reqBody = req.body;
        await reviewModel.create(reqBody);
        return res.status(201).json({
            status: "success",
            message: "Review created successfully",
        })
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            status: "fail",
            message: "Something went wrong",
        })
    }
}
