const express = require('express')
const router = express.Router()
const logsController = require('../controllers/logsController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/')
    .get(logsController.getAllLogs)
    .post(logsController.createNewLog)
    .patch(logsController.updateLog)
    .delete(logsController.deleteLog)

module.exports = router