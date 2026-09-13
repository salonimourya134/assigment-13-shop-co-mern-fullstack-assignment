const express = require("express");

const {getProducts,getProductById,createProduct,updateProduct,deleteProduct,getProductBySlug} = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getProducts);
router.get("/slug/:slug", getProductBySlug);
router.get("/:id", getProductById);
router.post("/",authMiddleware,adminMiddleware,upload.array("images",5),createProduct,);
router.put("/:id", authMiddleware, adminMiddleware, upload.array("images", 5), updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);
module.exports = router;
