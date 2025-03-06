const TaskComment = require("../models/taskCommentSchema");

exports.taskComment = async (req, res) => {
  req.body.user = req.user.id;
  const comment = new TaskComment(req.body);
  res.send(comment);
};
