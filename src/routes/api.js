const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const userController = require("../controllers/userController");
const collectionController = require("../controllers/collectionController");
const authorize = require("../middlewares/authorize");
const wishlistController = require("../controllers/wishlistController");
const reviewController = require("../controllers/reviewController");
const orderController = require("../controllers/orderController");

// product routes
router.post("/products", authorize(["admin"]), productController.createProduct);
router.get("/products", productController.getProducts);
router.patch("/products/:id", authorize(["admin"]), productController.updateProduct);
router.delete("/products/:id", authorize(["admin"]), productController.deleteProduct);

// user routes
router.post("/auth/register", userController.userRegistration);
router.post("/auth/login", userController.userLogin);
router.get("/auth/user/profile", authorize(["admin", "customer"]), userController.userProfile);
router.post("/auth/user/profile", authorize(["admin", "customer"]), userController.updateUserProfile);

// collection routes
router.post("/collection", authorize(["admin"]), collectionController.createCollection);
router.get("/collection", collectionController.getCollections);
router.patch("/collection/:id", authorize(["admin"]), collectionController.updateCollection);
router.delete("/collection/:id", authorize(["admin"]), collectionController.deleteCollection);

// wishlist routes
router.post("/wishlist", authorize(["customer"]), wishlistController.createWishlist);
router.get("/wishlist", authorize(["customer"]), wishlistController.getWishlist);

// review routes
router.post("/review", authorize(["customer"]), reviewController.createReview);
router.get("/review", reviewController.getReview);

// order routes
router.post("/order", authorize(["admin", "customer"]), orderController.createOrder);
router.get("/order", authorize(["admin", "customer"]), orderController.getOrder);
router.patch("/order", authorize(["admin"]), orderController.updateOrder);
router.delete("/order/:id", authorize(["admin"]), orderController.deleteOrder);

module.exports = router;
