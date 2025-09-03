const Order = require("../models/orderModel");
const Product = require("../models/productModel");

// CREATE ORDER
exports.createOrder = async (req, res) => {
    try {
        const { userId, items, shippingAddress, contact, payment, notes } = req.body;

        if (!items || !items.length) {
            return res.status(400).json({ message: "No items in order" });
        }

        let subtotal = 0;
        const finalItems = [];

        // ✅ Validate items & fetch product/variant details
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: "Product not found" });
            }

            let variant;
            if (item.variantId) {
                variant = product.variants.id(item.variantId);
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

                // ✅ Deduct stock
                variant.stock -= item.qty;
                await product.save();
            } else {
                // Product without variants
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

                // (Optional: if you manage stock at product level, deduct here)
            }
        }

        // ✅ Totals
        const discount = 0; // apply coupon logic here if needed
        const shipping = 0; // calculate dynamically if needed
        const tax = 0; // calculate if needed
        const grandTotal = subtotal - discount + shipping + tax;

        // ✅ Generate order number if not provided
        let orderNo = req.body.orderNo;
        if (!orderNo) {
            const year = new Date().getFullYear();
            const count = await Order.countDocuments();
            orderNo = `SHP-${year}-${String(count + 1).padStart(6, "0")}`;
        }

        // ✅ Create order
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
        console.error("Create Order Error:", err);
        res.status(500).json({ message: "Something went wrong", error: err.message });
    }
};
