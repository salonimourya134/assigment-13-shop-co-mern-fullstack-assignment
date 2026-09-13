const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { successResponse, errorResponse } = require("../utils/response");
const signup = async (req, res) => {
  try {
    const { name, email, password, phone = "", address = "" } = req.body;
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashPassword,
      phone: phone.trim(),
      address: address.trim(),
      role: "customer",
    });
    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Signup failed",
    });
  }
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.status === "inactive") {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
         name: user.name,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        name: user.name,
        email: user.email,
        id: user._id,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "logging out failed",
    });
  }
};
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return errorResponse(res, 404, "user not found");
    }
    return successResponse(res, 200, "profile fetched successfully", {
      user,
    });
  } catch (error) {
    console.log(error);
    return errorResponse(res, 500, "failed to get profile");
  }
};
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, password } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 404, "user not found");
    }
    if (name) {
      user.name = name;
    }

    if (phone) {
      user.phone = phone;
    }
    if (address !== undefined) {
      user.address = address;
    }
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    await user.save();
    const safeUser = await User.findById(user._id).select("-password");
    return successResponse(res, 200, "profile updated successfully", {
      user: safeUser,
    });
  } catch (error) {
    console.log(error);
    return errorResponse(res, 400, error.message);
  }
};
module.exports = {
  signup,
  login,
  logout,
  getProfile,
  updateProfile,
};
