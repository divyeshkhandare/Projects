const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      minlength: [3, "Job title must be at least 3 characters long"]
    },
    jobType: {
      type: String,
      enum: ["partTime", "fullTime"],
      required: [true, "Job type is required"]
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true
    },
    salary: {
      type: String,
      required: [true, "Salary is required"],
      trim: true
    },
    requiredSkills: {
      type: [String],
      required: [true, "At least one skill is required"],
      validate: {
        validator: function(v) {
          return v.length > 0;
        },
        message: "At least one skill is required"
      }
    },
    desc: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
      minlength: [50, "Description must be at least 50 characters long"]
    },
    requiredExp: {
      type: String,
      required: [true, "Required experience is required"],
      trim: true
    },
    endDate: { 
      type: Date, 
      required: [true, "Application end date is required"],
      validate: {
        validator: function(value) {
          return value > new Date();
        },
        message: "End date must be in the future"
      }
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"]
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company reference is required"]
    }
  },
  {
    timestamps: true
  }
);

const Job = mongoose.model("Job", jobSchema);
module.exports = Job;
