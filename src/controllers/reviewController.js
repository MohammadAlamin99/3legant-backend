const reviewModel = require("../models/reviewModel");
const productModel = require("../models/productModel");

// create review
exports.createReview = async (req, res) => {
    try {
        const reqBody = req.body;
        const reqbody = req.body;
        const userid = reqbody.userId;
        const productid = reqbody.productId;
        // check review
        const review = await reviewModel.findOne({
            userId: userid,
            productId: productid,
        });
        if (review) {
            return res.status(400).json({
                status: "fail",
                message: "Review already exists"
            })
        }
        // create review
        await reviewModel.create(reqBody);

        // update product rating
        const reviews = await reviewModel.find({ productId: productid });
        const totalCount = reviews.length;
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount;
        await productModel.findByIdAndUpdate(
            productid,
            {
                rating: {
                    average: avgRating,
                    count: totalCount,
                }
            },
            { new: true }
        )
        return res.status(201).json({
            status: "success",
            message: "Review created successfully",
        });
    } catch (e) {
        return res.status(500).json({
            status: "fail",
            message: "Something went wrong",
        })
    }
}


// get review
exports.getReview = async (req, res) => {
    try {
        const productId = req.query.productId;
        const reviews = await reviewModel.find({ productId: productId });
        const reviewCount = reviews.length;
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount;
        return res.status(200).json({
            status: "success",
            data: reviews,
            totalReview: reviewCount,
            avgRating: avgRating.toFixed(2)
        });
    } catch (e) {
        return res.status(500).json({
            status: "fail",
            message: "Something went wrong",
        })
    }
}