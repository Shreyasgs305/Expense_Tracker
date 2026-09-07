const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Account = require("../models/Account");
const Category = require("../models/Category");
const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");

const registerUser = async (req, res) => {
  try {
    // 1. Get data from request
    const { name, email, password, phone, currency, timezone } = req.body;

    // 2. Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // 3. Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please provide a valid email",
      });
    }

    // 4. Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // 5. Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // 6. Check if email already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // 7. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 8. Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      phone,
      currency,
      timezone,
    });

    // 9. Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // 10. Send response
    return res.status(201).json({
      message: "User registered successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        currency: user.currency,
        timezone: user.timezone,
      },

      token,
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    // 1. Get email and password
    const { email, password } = req.body;

    // 2. Validate
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    // 3. Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    // 4. Find user
    const user = await User.findOne({ email: normalizedEmail });
    // 5. Generic error
    // if user doesn't exist
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    // 6. Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ message: "Account is inactive" });
    }
    // 7. Compare entered password with stored passwordHash
    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    // 8. Generic error if password is wrong
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    // 9. Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    // 10. Return user information + token
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        currency: user.currency,
        timezone: user.timezone,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const me = async (req, res) => {
  try {
    // User ID was added by authMiddleware
    const user = await User.findById(req.user.id).select("-passwordHash");

    // User not found
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Return user
    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    // Get logged-in user's ID from authMiddleware
    const userId = req.user.id;

    // Get allowed fields from request body
    const { name, phone, profileImage, currency, timezone } = req.body;

    // Create update object
    const updates = {};

    // Only update fields that were provided
    if (name !== undefined) {
      updates.name = name.trim();
    }

    if (phone !== undefined) {
      updates.phone = phone;
    }

    if (profileImage !== undefined) {
      updates.profileImage = profileImage;
    }

    if (currency !== undefined) {
      updates.currency = currency;
    }

    if (timezone !== undefined) {
      updates.timezone = timezone;
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      },
    ).select("-passwordHash");

    // User not found
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Return updated user
    return res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const deleteAccount = async (req, res) => {
  try {
    // Get logged-in user's ID
    const userId = req.user.id;

    // Check if user exists
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Delete user's transactions
    await Transaction.deleteMany({
      user: userId,
    });

    // Delete user's budgets
    await Budget.deleteMany({
      user: userId,
    });

    // Delete user's categories
    await Category.deleteMany({
      user: userId,
    });

    // Delete user's accounts
    await Account.deleteMany({
      user: userId,
    });

    // Finally delete the user
    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      message: "Account and all related data deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = { registerUser, loginUser, me, updateProfile, deleteAccount };
