const companyService = require("../service/company.service");

exports.createCompany = async (req, res) => {
  try {
    const company = await companyService.createCompany(req.body);
    return res.send(company);
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const companies = await companyService.getAllCompanies();
    return res.send(companies);
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const updatedCompany = await companyService.updateCompany(id, payload);
    if (!updatedCompany) {
      return res.status(404).send({ message: "Company not found" });
    }
    return res.send(updatedCompany);
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCompany = await companyService.deleteCompany(id);
    if (!deletedCompany) {
      return res.status(404).send({ message: "Company not found" });
    }
    return res.send(deletedCompany);
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

exports.getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await companyService.getCompaniesById(id);
    if (!company) {
      return res.status(404).send({ message: "Company not found" });
    }
    return res.send(company);
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

exports.getUnverifiedCompanies = async (req, res) => {
  try {
    const companies = await companyService.getUnverifiedCompanies();
    return res.send(companies);
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};
