const applicationService = require("../service/application.service");

exports.applyApplication = async (req, res) => {
  try {
    req.body.userId = req.user.id;
    const payload = req.body;
    const application = await applicationService.applyApplication(payload);
    res.status(201).send(application);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.getApplicationsByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const application = await applicationService.getApplicationsByUserId(
      userId
    );
    res.status(200).send(application);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const application = await applicationService.updateApplication(id, payload);
    res.status(200).send(application);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.getByJobId = async (req, res) => {
  const { jobId } = req.params;
  try {
    const application = await applicationService.getApplicationByJobId(jobId);
    res.status(200).send(application);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.getAll = async (req, res) => {
  try {
    const query = req.query || {};
    const application = await applicationService.getAllApplication(query);
    res.status(200).send(application);
  } catch (error) {
    res.status(400).send(error.message);
  }
};
