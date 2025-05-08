const jobService = require("../service/job.service");

exports.createJob = async (req, res) => {
  try {
    req.body.userId = req.user.id;
    const job = await jobService.create(req.body);
    return res.status(201).json({ 
      success: true,
      message: "Job created successfully",
      data: job 
    });
  } catch (error) {
    return res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getJobById = async (req, res) => {
  const { id } = req.params;
  try {
    const job = await jobService.getJobById(id);
    return res.status(200).json({ 
      success: true,
      data: job 
    });
  } catch (error) {
    return res.status(404).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.updateJob = async (req, res) => {
  const { id } = req.params;
  try {
    const job = await jobService.updateJob(id, req.body);
    return res.status(200).json({ 
      success: true,
      message: "Job updated successfully",
      data: job 
    });
  } catch (error) {
    return res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.deleteJob = async (req, res) => {
  const { id } = req.params;
  try {
    const job = await jobService.deleteJob(id);
    return res.status(200).json({ 
      success: true,
      message: "Job deleted successfully",
      data: job 
    });
  } catch (error) {
    return res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await jobService.getAllJobs(req.query);
    return res.status(200).json({ 
      success: true,
      data: jobs 
    });
  } catch (error) {
    return res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getJobsByCompanyId = async (req, res) => {
  const { companyId } = req.params;
  try {
    const jobs = await jobService.getByCompanyId(companyId);
    return res.status(200).json({ 
      success: true,
      data: jobs 
    });
  } catch (error) {
    return res.status(404).json({ 
      success: false,
      message: error.message 
    });
  }
};
