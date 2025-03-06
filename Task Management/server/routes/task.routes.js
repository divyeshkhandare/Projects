const { Router } = require('express');
const { CreateTasks, getAllTasks, GetAllTasksByUserId, GetTaskById } = require('../controllers/task.controller');

const router = Router();

router.post("/", CreateTasks)
router.get("/", getAllTasks)
router.get("/:userId", GetAllTasksByUserId)
router.get("/tasks/:taskId", GetTaskById)

module.exports = router;