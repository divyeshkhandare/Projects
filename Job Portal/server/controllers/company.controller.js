const companyService = require("../service/company.service");

exports.createCompany = async (req, res) => {
  try {
    const company = await companyService.createCompany(req.body);
    return res.status(201).json({ 
      success: true,
      message: "Company created successfully",
      data: company 
    });
  } catch (error) {
    return res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const companies = await companyService.getAllCompanies();
    return res.status(200).json({ 
      success: true,
      data: companies 
    });
  } catch (error) {
    return res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const updatedCompany = await companyService.updateCompany(id, payload);
    if (!updatedCompany) {
      return res.status(404).json({ 
        success: false,
        message: "Company not found" 
      });
    }
    return res.status(200).json({ 
      success: true,
      message: "Company updated successfully",
      data: updatedCompany 
    });
  } catch (error) {
    return res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCompany = await companyService.deleteCompany(id);
    if (!deletedCompany) {
      return res.status(404).json({ 
        success: false,
        message: "Company not found" 
      });
    }
    return res.status(200).json({ 
      success: true,
      message: "Company deleted successfully",
      data: deletedCompany 
    });
  } catch (error) {
    return res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await companyService.getCompaniesById(id);
    if (!company) {
      return res.status(404).json({ 
        success: false,
        message: "Company not found" 
      });
    }
    return res.status(200).json({ 
      success: true,
      data: company 
    });
  } catch (error) {
    return res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getUnverifiedCompanies = async (req, res) => {
  try {
    const companies = await companyService.getUnverifiedCompanies();
    return res.status(200).json({ 
      success: true,
      data: companies 
    });
  } catch (error) {
    return res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};
