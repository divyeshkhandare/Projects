const mongoose = require("mongoose");

const workExperienceSchema = new mongoose.Schema({
  companyName: { 
    type: String, 
    required: [true, "Company name is required"], 
    trim: true,
    minlength: [2, "Company name must be at least 2 characters long"]
  },
  jobTitle: { 
    type: String, 
    required: [true, "Job title is required"], 
    trim: true,
    minlength: [2, "Job title must be at least 2 characters long"]
  },
  startDate: { 
    type: Date, 
    required: [true, "Start date is required"],
    validate: {
      validator: function(value) {
        return value <= new Date();
      },
      message: "Start date cannot be in the future"
    }
  },
  endDate: { 
    type: Date,
    validate: {
      validator: function(value) {
        if (!value) return true; // Optional field
        return value >= this.startDate;
      },
      message: "End date must be after start date"
    }
  },
  jobDescription: { 
    type: String, 
    trim: true,
    maxlength: [1000, "Job description cannot exceed 1000 characters"]
  },
  jobStatus: { 
    type: String, 
    enum: ["completed", "running"],
    required: [true, "Job status is required"]
  },
  location: {
    type: String,
    trim: true
  },
  employmentType: {
    type: String,
    enum: ["full-time", "part-time", "contract", "internship", "freelance"],
    required: [true, "Employment type is required"]
  }
});

const educationSchema = new mongoose.Schema({
  institutionName: { 
    type: String, 
    required: [true, "Institution name is required"], 
    trim: true,
    minlength: [2, "Institution name must be at least 2 characters long"]
  },
  degree: { 
    type: String, 
    required: [true, "Degree is required"],
    trim: true,
    minlength: [2, "Degree must be at least 2 characters long"]
  },
  fieldOfStudy: {
    type: String,
    required: [true, "Field of study is required"],
    trim: true
  },
  startDate: { 
    type: Date, 
    required: [true, "Start date is required"],
    validate: {
      validator: function(value) {
        return value <= new Date();
      },
      message: "Start date cannot be in the future"
    }
  },
  endDate: { 
    type: Date,
    validate: {
      validator: function(value) {
        if (!value) return true; // Optional field
        return value >= this.startDate;
      },
      message: "End date must be after start date"
    }
  },
  educationStatus: { 
    type: String, 
    enum: ["completed", "running"],
    required: [true, "Education status is required"]
  },
  grade: {
    type: String,
    trim: true
  }
});

const userProfileSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: [true, "User reference is required"],
      unique: true
    },
    skills: [{ 
      type: String, 
      trim: true,
      minlength: [2, "Skill must be at least 2 characters long"]
    }],
    workExperiences: [workExperienceSchema],
    education: [educationSchema],
    resumeUrl: { 
      type: String, 
      trim: true,
      match: [/^https?:\/\/.+/, "Please provide a valid URL"]
    },
    experienceLevel: {
      type: String,
      enum: ["experienced", "fresher"],
      required: [true, "Experience level is required"]
    },
    currentLocation: {
      type: String,
      trim: true
    },
    preferredLocations: [{
      type: String,
      trim: true
    }],
    currentSalary: {
      type: Number,
      min: [0, "Salary cannot be negative"]
    },
    expectedSalary: {
      type: Number,
      min: [0, "Salary cannot be negative"]
    },
    noticePeriod: {
      type: Number,
      min: [0, "Notice period cannot be negative"]
    },
    languages: [{
      type: String,
      trim: true
    }],
    certifications: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      issuer: {
        type: String,
        required: true,
        trim: true
      },
      issueDate: Date,
      expiryDate: Date
    }]
  },
  { 
    timestamps: true 
  }
);

const UserDetails = mongoose.model("UserDetails", userProfileSchema);
module.exports = UserDetails;
