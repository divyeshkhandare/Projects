const companyRepo = require("../repositories/company.repo");

exports.createCompany = async (payload) => {
  try {
    const company = await companyRepo.createCompany(payload);
    return company;
  } catch (error) {
    throw new Error(`Failed to create company: ${error.message}`);
  }
};

exports.getCompanies = async () => {
  try {
    const companies = await companyRepo.getCompanies();
    return companies;
  } catch (error) {
    throw new Error(`Failed to get companies: ${error.message}`);
  }
};

exports.deleteCompany = async (id) => {
  try {
    const company = await companyRepo.deleteCompany(id);
    if (!company) {
      throw new Error("Company not found");
    }
    return company;
  } catch (error) {
    throw new Error(`Failed to delete company: ${error.message}`);
  }
};

exports.updateCompany = async (id, payload) => {
  try {
    const company = await companyRepo.updateCompany(id, payload);
    if (!company) {
      throw new Error("Company not found");
    }
    return company;
  } catch (error) {
    throw new Error(`Failed to update company: ${error.message}`);
  }
};

exports.getCompaniesById = async (id) => {
  try {
    const company = await companyRepo.getCompanyById(id);
    if (!company) {
      throw new Error("Company not found");
    }
    return company;
  } catch (error) {
    throw new Error(`Failed to get company: ${error.message}`);
  }
};

exports.getUnverifiedCompanies = async () => {
  try {
    const companies = await companyRepo.getAllCompany({ isVerified: false });
    return companies;
  } catch (error) {
    throw new Error(`Failed to get unverified companies: ${error.message}`);
  }
};
