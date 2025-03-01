const companyRepo = require("../repositories/company.repo");

exports.createCompany = async (payload) => {
  try {
    const company = await companyRepo.createCompany(payload);
    return company;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getCompanies = async () => {
  try {
    const companies = await companyRepo.getCompanies();
    return companies;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.deleteCompany = async (id) => {
  try {
    const company = await companyRepo.deleteCompany(id);
    return company;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.updateCompany = async (id, payload) => {
  try {
    const company = await companyRepo.updateCompany(id, payload);
    return company;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getCompaniesById = async (id) => {
  try {
    const company = await companyRepo.getCompanyById(id);
    return company;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getUnverifiedCompanies = async () => {
  const companies = await companyRepo.getAllCompany({ isVerified: false });
  return companies;
};
