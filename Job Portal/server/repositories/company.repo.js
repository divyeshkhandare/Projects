const Company = require("../models/company.model");

exports.createCompany = async (payload) => {
  try {
    const company = await Company.create(payload);
    return company;
  } catch (error) {
    throw new Error(`Failed to create company: ${error.message}`);
  }
};

exports.getAllCompany = async (query = {}) => {
  try {
    const companies = await Company.find(query);
    return companies;
  } catch (error) {
    throw new Error(`Failed to get companies: ${error.message}`);
  }
};

exports.deleteCompany = async (id) => {
  try {
    const company = await Company.findByIdAndDelete(id);
    return company;
  } catch (error) {
    throw new Error(`Failed to delete company: ${error.message}`);
  }
};

exports.updateCompany = async (id, payload) => {
  try {
    const company = await Company.findByIdAndUpdate(id, payload, { 
      new: true,
      runValidators: true 
    });
    return company;
  } catch (error) {
    throw new Error(`Failed to update company: ${error.message}`);
  }
};

exports.getCompanyById = async (id) => {
  try {
    const company = await Company.findById(id);
    return company;
  } catch (error) {
    throw new Error(`Failed to get company: ${error.message}`);
  }
};