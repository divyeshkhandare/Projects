const Application = require("../models/application.model");

exports.applyApplication = async (payload) => {
  try {
    const application = await Application.create(payload);
    return application;
  } catch (error) {
    throw new Error(`Failed to create application: ${error.message}`);
  }
};

exports.getApplicationsByUserId = async (userId) => {
  try {
    const applications = await Application.find({ userId });
    return applications;
  } catch (error) {
    throw new Error(`Failed to get user applications: ${error.message}`);
  }
};

exports.updateApplication = async (id, payload) => {
  try {
    const application = await Application.findByIdAndUpdate(id, payload, {
      new: true,
    });
    if (!application) {
      throw new Error("Application not found");
    }
    return application;
  } catch (error) {
    throw new Error(`Failed to update application: ${error.message}`);
  }
};

exports.getAllApplication = async (query) => {
  try {
    const applications = await Application.find(query);
    return applications;
  } catch (error) {
    throw new Error(`Failed to get applications: ${error.message}`);
  }
};

exports.getApplicationByJobId = async (jobId) => {
  try {
    const applications = await Application.find({ jobId });
    return applications;
  } catch (error) {
    throw new Error(`Failed to get job applications: ${error.message}`);
  }
};
