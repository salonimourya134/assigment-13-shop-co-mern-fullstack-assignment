const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authMiddleware = require("./middleware/authMiddleware");
const adminMiddleware = require("./middleware/adminMiddleware");
const categoryRoutes = require("./routes/categoryRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require('./routes/orderRoutes')
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const reviewRoutes = require("./routes/reviewsRoutes");
const locationRoutes = require("./routes/locationRoutes");

const app = express();

const allowedOrigins = [process.env.CLIENT_URL].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
      const isAllowed = allowedOrigins.includes(origin) || isLocalhost;

      return callback(null, isAllowed);
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(require("path").join(__dirname, "upload")));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ecommerce api is running",
  });
});
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.get("/api/test", authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: "You are logged in",
    user: req.user,
  });
});

app.get("/api/admin-test", authMiddleware, adminMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin access granted",
  });
});

module.exports = app;
