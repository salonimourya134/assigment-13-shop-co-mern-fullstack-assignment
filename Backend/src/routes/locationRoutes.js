const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { reverseLocation } = require("../controllers/locationController");

const router = express.Router();
router.get("/reverse", authMiddleware, reverseLocation);

module.exports = router;
