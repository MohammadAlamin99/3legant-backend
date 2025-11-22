const reviewModel = require("../models/reviewModel");
const productModel = require("../models/productModel");
const mongoose = require("mongoose");

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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                status: "fail",
                message: "Invalid productId"
            });
        }
        const reviewsAggregation = await reviewModel.aggregate([
            { $match: { productId: new mongoose.Types.ObjectId(productId) } },
            {
                $lookup: {
                    from: "users", 
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    _id: 1,
                    rating: 1,
                    comment: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    user: {
                        _id: "$user._id",
                        name: "$user.name",
                        email: "$user.email",
                        phone: "$user.phone",
                        photo: "$user.photo"
                    }
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
        ]);
        const stats = await reviewModel.aggregate([
            { $match: { productId: new mongoose.Types.ObjectId(productId) } },
            {
                $group: {
                    _id: "$productId",
                    totalReview: { $sum: 1 },
                    avgRating: { $avg: "$rating" }
                }
            }
        ]);

        const totalReview = stats[0]?.totalReview || 0;
        const avgRating = stats[0]?.avgRating ? stats[0].avgRating.toFixed(2) : "0.00";

        return res.status(200).json({
            status: "success",
            data: reviewsAggregation,
            totalReview,
            avgRating,
            page,
            limit
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            status: "fail",
            message: "Something went wrong",
        });
    }
};