const wishlistModel = require("../models/wishlistModel");
const mongoose = require("mongoose");

// wishlist create
exports.createWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid Product",
      });
    }
    let wishlist = await wishlistModel.findOne({ userId });
    if (!wishlist) {
      await wishlistModel.create({
        userId,
        productId: [productId],
      });
      return res.status(200).json({
        status: "success",
        message: "Wishlist Added",
      });
    }
    const exist = wishlist.productId.includes(productId);
    if (exist) {
      wishlist = await wishlistModel.findOneAndUpdate(
        { userId },
        { $pull: { productId: productId } },
        { new: true }
      );
      if (wishlist.productId.length === 0) {
        await wishlistModel.findOneAndDelete({ userId });
        return res.status(200).json({
          status: "success",
          message: "Wishlist Removed",
        });
      }
      return res.status(200).json({
        status: "success",
        message: "Wishlist Removed",
      });
    }
    await wishlistModel.findOneAndUpdate(
      { userId },
      { $addToSet: { productId } }
    );
    return res.status(200).json({
      status: "success",
      message: "Wishlist Added",
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message,
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
              },
            },
          },
        },
      },
    ]);
    return res.status(200).json({
      status: "success",
      data: wishlist,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      status: "fail",
      message: "something went wrong",
    });
  }
};
