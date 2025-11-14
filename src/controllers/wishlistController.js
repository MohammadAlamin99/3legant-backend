const wishlistModel = require("../models/wishlistModel");
const mongoose = require("mongoose");

// wishlist create
// exports.createWishlist = async (req, res) => {
//     try {
//         const { userId, productId } = req.body;
//         await wishlistModel.findOneAndUpdate(
//             { userId },
//             { $addToSet: { productId } },
//             { upsert: true }
//         );
//         return res.status(201).json({
//             status: "success",
//             message: "Wishlist created successfully",
//         });
//     } catch (e) {
//         return res.status(500).json({
//             status: "fail",
//             message: "Something went wrong"
//         });
//     }
// };

exports.createWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.body;

        // validate product id
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                status: "fail",
                message: "Invalid productId"
            });
        }

        let wishlist = await wishlistModel.findOne({ userId });

        if (!wishlist) {
            await wishlistModel.create({
                userId,
                productId: [productId]
            });

            return res.status(201).json({
                status: "success",
                message: "Wishlist created and product added"
            });
        }

        const exists = wishlist.productId.includes(productId);

        if (exists) {
            wishlist = await wishlistModel.findOneAndUpdate(
                { userId },
                { $pull: { productId } },
                { new: true }
            );

            if (wishlist.productId.length === 0) {
                await wishlistModel.deleteOne({ userId });

                return res.status(200).json({
                    status: "success",
                    message: "Product removed & wishlist deleted"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Product removed"
            });
        }

        await wishlistModel.findOneAndUpdate(
            { userId },
            { $addToSet: { productId } }
        );

        return res.status(200).json({
            status: "success",
            message: "Product added"
        });

    } catch (error) {
        return res.status(500).json({
            status: "fail",
            message: error.message
        });
    }
};



// wishlist get 
exports.getWishlist = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.query.userId);
        const wishlist = await wishlistModel.aggregate([
            {
                $match: { userId },
            },
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "products",
                },

            },
            {
                $project: {
                    userId: 1,
                    products: {
                        $map: {
                            input: "$products",
                            as: "p",
                            in: {
                                _id: "$$p._id",
                                title: "$$p.title",
                                featureImage: "$$p.featureImage",
                            }
                        }
                    }
                }
            }
        ])
        return res.status(200).json({
            status: "success",
            data: wishlist,
        })
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            status: "fail",
            message: "something went wrong"
        })
    }
}