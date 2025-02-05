const express = require('express')
const router = express.Router()
const activitiesController = require('../controllers/activitiesController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/')
    .get(activitiesController.getAllActivities)
    .post(activitiesController.createNewActivity)
    .patch(activitiesController.updateActivity)
    .delete(activitiesController.deleteActivity)

module.exports = router