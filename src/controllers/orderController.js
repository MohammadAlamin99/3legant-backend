const { Types } = require("mongoose");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");

// CREATE ORDER

// exports.createOrder = async (req, res) => {
//     try {
//         const { userId, items, shippingAddress, contact, payment, notes } = req.body;
//         userId = new Types.ObjectId(userId);
//         if (!items || !items.length) {
//             return res.status(400).json({ message: "No items in order" });
//         }
//         let subtotal = 0;
//         const finalItems = [];
//         // Validate items & fetch product/variant details
//         for (const item of items) {
//             const product = await Product.findById(item.productId);

//             if (!product) {
//                 return res.status(404).json({ message: "Product not found" });
//             }
//             let variant;
//             if (item.variantId) {
//                 variant = product.variants.id(item.variantId);
//                 if (!variant) {
//                     return res.status(404).json({ message: "Variant not found" });
//                 }
//                 if (variant.stock < item.qty) {
//                     return res.status(400).json({ message: "Insufficient stock for variant" });
//                 }

//                 subtotal += variant.price * item.qty;

//                 finalItems.push({
//                     productId: product._id,
//                     variantId: variant._id,
//                     title: product.title,
//                     variantTitle: variant.title,
//                     price: variant.price,
//                     qty: item.qty,
//                     image: variant.image || product.featureImage,
//                 });

//                 // Deduct stock
//                 variant.stock -= item.qty;
//                 await product.save();
//             } else {
//                 // Product without variants
//                 if (product.basePrice < 0) {
//                     return res.status(400).json({ message: "Invalid product price" });
//                 }
//                 subtotal += product.basePrice * item.qty;

//                 finalItems.push({
//                     productId: product._id,
//                     title: product.title,
//                     price: product.basePrice,
//                     qty: item.qty,
//                     image: product.featureImage,
//                 });
//             }
//         }

//         // Totals
//         const discount = 0;
//         const shipping = 0;
//         const tax = 0;
//         const grandTotal = subtotal - discount + shipping + tax;

//         //  Generate order number
//         const timestamp = Date.now().toString(36); 
//         const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString(36);
//         const orderNo = `SHP-${timestamp}-${randomSuffix}`;

//         // Create order
//         const order = await Order.create({
//             orderNo,
//             userId,
//             items: finalItems,
//             totals: { subtotal, discount, shipping, tax, grandTotal },
//             shippingAddress,
//             contact,
//             payment,
//             notes,
//         });

//         res.status(201).json({ message: "Order placed successfully", order });
//     } catch (err) {
//         res.status(500).json({ message: "Something went wrong", error: err.message });
//     }
// };


// CREATE ORDER

exports.createOrder = async (req, res) => {
    try {
        let { userId, items, shippingAddress, contact, payment, notes } = req.body;
        userId = new Types.ObjectId(userId); // ✅ now legal

        if (!items || !items.length) {
            return res.status(400).json({ message: "No items in order" });
        }

        let subtotal = 0;
        const finalItems = [];

        // Validate items & fetch product/variant details
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: "Product not found" });
            }

            if (item.variantId) {
                const variant = product.variants.id(item.variantId);
                if (!variant) {
                    return res.status(404).json({ message: "Variant not found" });
                }
                if (variant.stock < item.qty) {
                    return res.status(400).json({ message: "Insufficient stock for variant" });
                }

                subtotal += variant.price * item.qty;

                finalItems.push({
                    productId: product._id,
                    variantId: variant._id,
                    title: product.title,
                    variantTitle: variant.title,
                    price: variant.price,
                    qty: item.qty,
                    image: variant.image || product.featureImage,
                });

                variant.stock -= item.qty;
                await product.save();
            } else {
                if (product.basePrice < 0) {
                    return res.status(400).json({ message: "Invalid product price" });
                }

                subtotal += product.basePrice * item.qty;

                finalItems.push({
                    productId: product._id,
                    title: product.title,
                    price: product.basePrice,
                    qty: item.qty,
                    image: product.featureImage,
                });
            }
        }

        // Totals
        const discount = 0;
        const shipping = 0;
        const tax = 0;
        const grandTotal = subtotal - discount + shipping + tax;

        // Generate order number
        const timestamp = Date.now().toString(36);
        const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString(36);
        const orderNo = `SHP-${timestamp}-${randomSuffix}`;

        // Create order
        const order = await Order.create({
            orderNo,
            userId,
            items: finalItems,
            totals: { subtotal, discount, shipping, tax, grandTotal },
            shippingAddress,
            contact,
            payment,
            notes,
        });

        res.status(201).json({ message: "Order placed successfully", order });
    } catch (err) {
        res.status(500).json({ message: "Something went wrong", error: err.message });
    }
};


// order get 

exports.getOrder = async (req, res) => {
    try {
        const userId = new Types.ObjectId(req.query.id);
        const orderCount = await Order.countDocuments();
        const order = await Order.find({ userId });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(200).json({ message: "Order retrieved successfully", order, totalOrder: orderCount });
    } catch (err) {
        res.status(500).json({ message: "Something went wrong", error: err.message });
    }
}

// update order 
exports.updateOrder = async (req, res) => {
    try {
        const reqBody = req.body;
        const orderId = reqBody.orderId;

        const order = await Order.findByIdAndUpdate(
            orderId,
            reqBody,
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.status(200).json({
            success: true,
            message: "Order updated successfully",
            data: order,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: err.message,
        });
    }
};

// order delete
exports.deleteOrder = async (req, res) => {
    try {
        const orderId = new Types.ObjectId(req.params.id);
        const order = await Order.findByIdAndDelete(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Order deleted successfully",
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: err.message,
        });
    }
};