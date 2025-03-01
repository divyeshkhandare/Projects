const Company = require("../models/company.model");

exports.createCompany = async (payload) => {
  const company = await Company.create(payload);
  return company;
};

exports.getAllCompany = async () => {
  const company = await Company.find();
  return company;
};

exports.deleteCompany = async (id) => {
  const company = await Company.findByIdAndDelete(id);
  return company;
};

exports.updateCompany = async (id, payload) => {
  const company = await Company.findByIdAndUpdate(id, payload, { new: true });
  return company;
}

exports.getCompanyById = async (id) => {
  const company = await Company.findById(id);
  return company;
}