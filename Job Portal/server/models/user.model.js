const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    mobile: String,
    profile_picture: String,
    password: String,
    role: {
      type: String,
      enum: ["Admin", "HR", "Candidate"],
      default: "Candidate",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
