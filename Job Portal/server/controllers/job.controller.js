const jobService = require("../service/job.service");

exports.createJob = async (req, res) => {
  try {
    req.body.userId = req.user.id;
    const job = await jobService.create(req.body);
    return res.send(job);
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

exports.getJobById = async (req, res) => {
  const { id } = req.params;
  try {
    const job = await jobService.getJobById(id);
    return res.send(job);
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

exports.updateJob = async (req, res) => {
  const { id } = req.params;
  try {
    const job = await jobService.updateJob(id, req.body);
    return res.send(job);
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

exports.deleteJob = async (req, res) => {
  const { id } = req.params;
  try {
    const job = await jobService.deleteJob(id);
    return res.send(job);
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await jobService.getAllJobs(req.query);
    return res.send(jobs);
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};

exports.getJobsByCompanyId = async (req, res) => {
  const { companyId } = req.params;
  try {
    const jobs = await jobService.getByCompanyId(companyId);
    return res.send(jobs);
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
};
