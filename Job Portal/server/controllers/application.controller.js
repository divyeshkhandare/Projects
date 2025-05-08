const applicationService = require("../service/application.service");

exports.applyApplication = async (req, res) => {
  try {
    req.body.userId = req.user.id;
    const payload = req.body;
    const application = await applicationService.applyApplication(payload);
    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: application
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getApplicationsByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const applications = await applicationService.getApplicationsByUserId(userId);
    return res.status(200).json({
      success: true,
      data: applications
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const application = await applicationService.updateApplication(id, payload);
    return res.status(200).json({
      success: true,
      message: "Application updated successfully",
      data: application
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getByJobId = async (req, res) => {
  const { jobId } = req.params;
  try {
    const applications = await applicationService.getApplicationByJobId(jobId);
    return res.status(200).json({
      success: true,
      data: applications
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
    const query = req.query || {};
    const applications = await applicationService.getAllApplication(query);
    return res.status(200).json({
      success: true,
      data: applications
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
