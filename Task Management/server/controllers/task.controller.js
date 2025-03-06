const TaskComment = require("../models/taskCommentSchema");
const Task = require("../models/taskSchema");

exports.CreateTasks = async (req, res) => {
  req.body.assignedBy = req.user.id;
  let task = await Task.create(req.body);
  return res.send(task);
};

exports.GetAllTasksByUserId = async (req, res) => {
  let { userId } = req.params;
  let tasks = await Task.find({ assignedTo: userId });
  return res.send(tasks);
};

exports.getAllTasks = async (req, res) => {
  let query = req.query || {};
  let tasks = await Task.find(query)
    .populate("assignedBy", "name")
    .populate("assignTo", "name");
  return res.send(tasks);
};

exports.GetTaskById = async (req, res) => {
  const { taskId } = req.params;
  let tasks = await Task.findById(taskId)
    .populate("assignedBy", "name")
    .populate("assignTo", "name");
  let status = await TaskComment.find({ task: taskId });
  return res.json({ tasks, status });
};
