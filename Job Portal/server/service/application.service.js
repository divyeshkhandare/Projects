const Application = require("../models/applicaion.model");

exports.applyApplication = async (payload) => {
  try {
    const application = await Application.create(payload);
    return application;
  } catch (error) {
    throw new Error(error);
  }
};

exports.getApplicationsByUserId = async (userId) => {
  try {
    const application = await Application.find({ userId: userId });
    return application;
  } catch (error) {
    throw new Error(error);
  }
};

exports.updateApplication = async (id, payload) => {
  try {
    const application = await Application.findByIdAndUpdate(id, payload, {
      new: true,
    });
    return application;
  } catch (error) {
    throw new Error(error);
  }
};

exports.getAllApplication = async (query) => {
  try {
    const application = await Application.find(query);
    return application;
  } catch (error) {
    throw new Error(error);
  }
};

exports.getApplicationByJobId = async (jobId) => {
  try {
    const application = await Application.find({ jobId: jobId });
    return application;
  } catch (error) {
    throw new Error(error);
  }
};
