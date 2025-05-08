const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      minlength: [2, "Company name must be at least 2 characters long"],
      maxlength: [100, "Company name cannot exceed 100 characters"]
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      minlength: [2, "Location must be at least 2 characters long"]
    },
    number: {
      type: Number,
      required: [true, "Contact number is required"],
      validate: {
        validator: function(v) {
          return /^\d{10}$/.test(v.toString());
        },
        message: "Please enter a valid 10-digit phone number"
      }
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Company = mongoose.model("Company", companySchema);
module.exports = Company;
