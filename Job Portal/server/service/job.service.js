const Job = require("../models/jobs.model");
const companyRepo = require("../repositories/company.repo");

exports.create = async (data) => {
  try {
    const company = await companyRepo.getCompanyById(data.companyId);
    if (!company) {
      throw new Error("Company not found");
    }
    if (!company.isVerified) {
      throw new Error("Company not verified");
    }

    const job = await Job.create(data);
    return job;
  } catch (error) {
    throw new Error(`Failed to create job: ${error.message}`);
  }
};

exports.getJobById = async (id) => {
  try {
    const job = await Job.findById(id);
    if (!job) {
      throw new Error("Job not found");
    }
    return job;
  } catch (error) {
    throw new Error(`Failed to get job: ${error.message}`);
  }
};

exports.getAllJobs = async (query) => {
  try {
    const jobs = await Job.find(query);
    return jobs;
  } catch (error) {
    throw new Error(`Failed to get jobs: ${error.message}`);
  }
};

exports.updateJob = async (id, data) => {
  try {
    const job = await Job.findByIdAndUpdate(id, data, { new: true });
    if (!job) {
      throw new Error("Job not found");
    }
    return job;
  } catch (error) {
    throw new Error(`Failed to update job: ${error.message}`);
  }
};

exports.deleteJob = async (id) => {
  try {
    const job = await Job.findByIdAndDelete(id);
    if (!job) {
      throw new Error("Job not found");
    }
    return job;
  } catch (error) {
    throw new Error(`Failed to delete job: ${error.message}`);
  }
};

exports.getByCompanyId = async (companyId) => {
  try {
    const jobs = await Job.find({ companyId });
    return jobs;
  } catch (error) {
    throw new Error(`Failed to get company jobs: ${error.message}`);
  }
};
