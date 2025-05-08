const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job reference is required"]
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"]
    },
    status: {
      type: String,
      enum: ["Applied", "Shortlisted", "Rejected", "Hired"],
      default: "Applied"
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure one user can apply only once to a job
applicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });

const Application = mongoose.model("Application", applicationSchema);
module.exports = Application;
