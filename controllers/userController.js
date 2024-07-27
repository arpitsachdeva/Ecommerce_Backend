const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const validator = require("validator");

// Create a new user
async function createUser(req, res) {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        data: {},
        message: "Please provide all required fields: username, email, and password",
        status: 400,
      });
    }

    // Validate email
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        data: {},
        message: "Please provide a valid email address",
        status: 400,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        data: {},
        message: "Email already exists",
        status: 400,
      });
    }

    // Validate password strength
    if (
      !validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
    ) {
      return res.status(400).json({
        success: false,
        data: {},
        message: "Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one number, and one symbol",
        status: 400,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userRole = role && role === "admin" ? "admin" : "user";
    const newUser = new User({ username, email, password: hashedPassword, role: userRole });
    await newUser.save();
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: newUser,
      status: 201,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      data: {},
      message: "Server error",
      status: 500,
    });
  }
}

// Get all users with pagination
async function getUsers(req, res) {
  try {
    const { page = 1, limit = 5 } = req.query;

    const users = await User.find({ isDeleted: false })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments({ isDeleted: false });

    res.status(200).json({
      success: true,
      data: {
        users,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        totalUsers: total,
      },
      message: "Getting users",
      status: 200,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      data: {},
      message: "Error fetching users",
      status: 400,
    });
  }
}

// Get user by ID
async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const data = await User.findById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        data: {},
        message: "User not found",
        status: 404,
      });
    }

    res.status(200).json({
      success: true,
      data,
      message: "User retrieved successfully",
      status: 200,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      data: {},
      message: "Error fetching user",
      status: 400,
    });
  }
}

// Update a user
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { username, email, password, phone, role, status, isDeleted } =
      req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        data: {},
        message: "User not found",
        status: 404,
      });
    }

    // Check if the logged-in user is an admin
    if (req.user.role === "admin") {
      if (username) user.username = username;
      if (email) user.email = email;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      }
      if (role) user.role = role;
      if (status) user.status = status;
      if (phone) user.phone = phone;
      if (isDeleted !== undefined) user.isDeleted = isDeleted;
    } else {
      // If the logged-in user is not an admin, only allow updating username and email
      if (username) user.username = username;
      if (email) user.email = email;
    }

    await user.save();
    res.status(200).json({
      success: true,
      data: { user },
      message: "User updated successfully",
      status: 200,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      data: {},
      message: "Unable to update user",
      status: 400,
    });
  }
}

// Delete a user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        data: {},
        message: "User not found",
        status: 404,
      });
    }

    res.status(200).json({
      success: true,
      data: {},
      message: "User deleted successfully",
      status: 200,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      data: {},
      message: "Unsuccessful",
      status: 400,
    });
  }
};

// User login
async function loginUser(req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        data: {},
        message: "Invalid credentials",
        status: 400,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        data: {},
        message: "Invalid credentials",
        status: 400,
      });
    }

    const payload = {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.cookie("token", token, { httpOnly: true });
        res.json({ message: "Login successful" });
      }
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      data: {},
      message: "Server error",
      status: 500,
    });
  }
}

// Soft delete a user
const softDeleteById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { deletedAt: new Date() }, 
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        data: {},
        message: "User not found",
        status: 404,
      });
    }

    res.status(200).json({
      success: true,
      data: {},
      message: "User soft deleted successfully",
      status: 200,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      data: {},
      message: "Error soft deleting user",
      status: 400,
    });
  }
};

async function logoutUser(req, res) {
  try {
    res.clearCookie("token"); // Clear the token cookie
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging out",
      status: 500,
    });
  }
}

module.exports = {
  createUser,
  getUsers,
  getUserById,
  loginUser,
  updateUser,
  deleteUser,
  softDeleteById,
  logoutUser,
};
