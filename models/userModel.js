const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  //password length 6
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "user",
  }, // Specify your role as Admin othewise by default it will be user.
  status: {
    type: String,
    default: "active",
  },
  profile_image: {
    type: String,
    default: ""
  },
  phone: {
    type: String,
    default: ""
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  isDeleted: { type: Boolean, default: false },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
