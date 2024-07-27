const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log("Token received:", token);

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    // Check if the token has expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      return res.status(401).json({ message: "Token has expired" });
    }

    req.user = decoded.user;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    console.log("User found:", user);
    next();
  } catch (err) {
    console.log("Error in auth middleware:", err);
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = auth;

