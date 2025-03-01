const Job = require("../models/jobs.model");
const companyRepo = require("../repositories/company.repo");

exports.create = async (data) => {
  try {
    const company = await companyRepo.getCompanyById(data.companyId);
    if (!company) {
      throw new Error("Company not found");
    }
    if (company.isVerified) {
      let job = await Job.create(data);
      return job;
    } else {
      throw new Error("Company not verified");
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getJobById = async (id) => {
  try {
    const job = await Job.findById(id);
    return job;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getAllJobs = async (query) => {
  try {
    const jobs = await Job.find(query);
    return jobs;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.updateJob = async (id, data) => {
  try {
    const job = await Job.findByIdAndUpdate(id, data, { new: true });
    return job;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.deleteJob = async (id) => {
  try {
    const job = await Job.findByIdAndDelete(id);
    return job;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getByCompanyId = async (companyId) => {
  try {
    const jobs = await Job.find({ companyId: companyId });
    return jobs;
  } catch (error) {
    throw new Error(error.message);
  }
};
