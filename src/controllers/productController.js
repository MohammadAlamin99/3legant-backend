const productModel = require("../models/productModel");
const mongoose = require("mongoose");
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const tagProduct = req.query.tags;
        const filter = { status: "active" }

        if (tagProduct) {
            const tagList = tagProduct.split(",").map(t => t.trim());
            filter.tags = { $in: tagList }
        }

        const skip = (page - 1) * limit;
        const total = await productModel.countDocuments(filter);
        const totalpage = Math.ceil(total / limit);
        const products = await productModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });
        return res.status(200).json({
            status: "success",
            products: products,
            totalPages: totalpage,
            totalProducts: total,
        })
    }
    catch (e) {
        return res.status(500).json({
            status: "fail",
            message: e.message || "Internal server error"
        });
    }
}

// get products by variantIds

exports.getProductsbyIds = async (req, res) => {
    try {
        const { variantIds } = req.body;
        if (!variantIds || !Array.isArray(variantIds) || variantIds.length === 0) {
            return res.status(400).json({
                status: "fail",
                message: "Variant IDs are required and must be an array.",
            });
        }
        const objectIds = variantIds.map(id => new mongoose.Types.ObjectId(id));
        const products = await productModel.aggregate([
            { $unwind: "$variants" },
            { $match: { "variants._id": { $in: objectIds } } },
            {
                $group: {
                    _id: "$_id",
                    title: { $first: "$title" },
                    description: { $first: "$description" },
                    featureImage: { $first: "$featureImage" },
                    basePrice: { $first: "$basePrice" },
                    badge: { $first: "$badge" },
                    variants: { $push: "$variants" },
                },
            },
        ]);

        res.status(200).json({
            status: "success",
            count: products.length,
            data: products,
        });
    } catch (error) {
        console.error("Error fetching products by variant IDs:", error);
        res.status(500).json({
            status: "fail",
            message: "Something went wrong while fetching products by variant IDs.",
        });
    }
};



// get product by collection id
exports.getProductByCollectionId = async (req, res) => {
    try {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const skip = (page - 1) * limit;

        const { id } = req.query;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: "fail",
                message: "Invalid collection ID",
            });
        }

        const collectionID = new mongoose.Types.ObjectId(req.query.id);
        const filter = {
            collections: { $in: [collectionID] },
            status: "active",
        }

        const result = await productModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });
        const total = await productModel.countDocuments(filter);
        return res.status(200).json({
            status: "success",
            products: result,
            totalProducts: total,
        });
    } catch (e) {
        return res.status(500).json({
            status: "fail",
            message: "Internal Server error"
        })
    }
}

// get products by price range

exports.getProductByPrice = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { minPrice, maxPrice } = req.query;
        const filter = {
            status: "active",
        };
        if (minPrice || maxPrice) {
            filter.basePrice = {};
            if (minPrice) filter.basePrice.$gte = parseFloat(minPrice);
            if (maxPrice) filter.basePrice.$lte = parseFloat(maxPrice);
        }
        const result = await productModel
            .find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await productModel.countDocuments(filter);
        return res.status(200).json({
            status: "success",
            products: result,
            totalProducts: total,
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            status: "fail",
            message: "Internal Server error",
        });
    }
};

// get product by id
exports.getProductById = async (req, res) => {
    try {
        let id = req.params.id;
        const product = await productModel.findById(id);
        return res.status(200).json({
            status: "success",
            message: product,
        })
    } catch (e) {
        return res.status(500).json({
            status: "fail",
            message: e.message || "Internal server error",
        })
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

// delete product
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


// // product search by keyword
exports.productSearchByKeywords = async (req, res) => {
    try {
        const keyword = req.query.keyword?.trim();
        if (!keyword) {
            return res.status(400).json({
                status: "fail",
                message: "Search keyword is required !"
            })
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(escaped, "i");

        const query = {
            $or: [
                { title: regex },
                { description: regex },
                { tags: regex },
                { "variants.title": regex },
                { "variants.sku": regex },
            ],
            status: "active",
        }

        const products = await productModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await productModel.countDocuments(query);

        return res.status(200).json({
            status: "success",
            message: "Products retrieved successfully",
            data: products,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (e) {
        return res.status(500).json({
            "status": "fail",
            message: "Internal server error",
            error: e.message,
        });
    }
}

