const { Router } = require("express")
const { taskComment } = require("../controllers/status.controller")

const router = Router()

router.post("/", taskComment)

module.exports = router