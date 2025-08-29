const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const userController = require("../controllers/userController");
const authorize = require("../middlewares/authorize");

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


module.exports = router;
