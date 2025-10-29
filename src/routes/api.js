const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const userController = require("../controllers/userController");
const collectionController = require("../controllers/collectionController");
const authorize = require("../middlewares/authorize");
const wishlistController = require("../controllers/wishlistController");
const reviewController = require("../controllers/reviewController");
const orderController = require("../controllers/orderController");
const blogController = require("../controllers/blogController");
const cotactController = require("../controllers/cotactController");
const paymentController = require("../controllers/paymentController");
const bodyParser = require("body-parser");
const upload = require("../middlewares/upload");

// product routes
router.post("/products", authorize(["admin"]), upload.fields([
    { name: "images", maxCount: 10 },
    { name: "featureImage", maxCount: 1 },
    { name: "variantImages", maxCount: 10 },
]), productController.createProduct);

router.get("/products", productController.getProducts);
router.put("/products/:id", authorize(["admin"]), upload.array("images"), productController.updateProduct);
router.delete("/products/:id", authorize(["admin"]), productController.deleteProduct);
router.get("/product/:id", productController.getProductById);
router.get("/products/collection", productController.getProductByCollectionId);
router.get("/products/price", productController.getProductByPrice);
router.post("/products/ids", productController.getProductsbyIds);
router.get("/products/search", productController.productSearchByKeywords);

// user routes
router.post("/auth/register", userController.userRegistration);
router.post("/auth/login", userController.userLogin);
router.get("/auth/user/profile", authorize(["admin", "customer"]), userController.userProfile);
router.put("/auth/user/profile", authorize(["admin", "customer"]), upload.single("photo"), userController.updateUserProfile);

// collection routes
router.post("/collection", authorize(["admin"]), upload.single("image"), collectionController.createCollection);
router.get("/collection", collectionController.getCollections);
router.patch("/collection/:id", authorize(["admin"]), upload.single("image"), collectionController.updateCollection);
router.delete("/collection/:id", authorize(["admin"]), collectionController.deleteCollection);

// wishlist routes
router.post("/wishlist", authorize(["customer"]), wishlistController.createWishlist);
router.get("/wishlist", authorize(["customer"]), wishlistController.getWishlist);

// review routes
router.post("/review", authorize(["customer"]), reviewController.createReview);
router.get("/review", reviewController.getReview);

// order routes
router.post("/order", authorize(["admin", "customer"]), orderController.createOrder);
router.get("/order/:id", authorize(["admin", "customer"]), orderController.getOrder);
router.patch("/order", orderController.updateOrder);
router.delete("/order/:id", authorize(["admin"]), orderController.deleteOrder);

// blog routes
router.post("/blog", authorize(["admin"]), blogController.createBlog);
router.get("/blog", blogController.getBlogs);
router.delete("/blog/:id", authorize(["admin"]), blogController.deleteBlog);
router.patch("/blog/:id", authorize(["customer"]), blogController.updateBlog);

// contact routes
router.post("/contact", cotactController.createContact);
router.get("/contact", authorize(["admin"]), cotactController.getContacts);

// payment routes
router.post("/payment", paymentController.PaymentHandler);
// Webhook endpoint (Stripe requires raw body)
router.post(
    "/payment/webhook",
    bodyParser.raw({ type: "application/json" }),
    paymentController.WebhookHandler
);
module.exports = router;    
