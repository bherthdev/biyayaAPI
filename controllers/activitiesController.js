const Activity = require('../models/Activity')
const asyncHandler = require('express-async-handler')
const cloudinary = require("../utils/cloudinary");


// @desc Get all activities 
// @route GET /activities
// @access Private
const getAllActivities = asyncHandler(async (req, res) => {
    // Get all activities from MongoDB
    const activities = await Activity.find().lean()

    res.json(activities)
})

// @desc Create new activities
// @route POST /activities
// @access Private
const createNewActivity = asyncHandler(async (req, res) => {
    const { name, date, avatar, actionType, description, orderID, seen } = req.body

    // Confirm data
    if (!name || !date || !actionType || !description) {
        return res.status(400).json({ message: 'All fields are required' })
    }


    const activityObject = {
        name,
        date,
        avatar,
        actionType,
        description,
        orderID,
        seen,
    }

    // Create and store the new Activity 
    const activity = await Activity.create(activityObject)


    if (activity) { // Created 
        return res.status(201).json({ message: 'New activity created'})
    } else {
        return res.status(400).json({ message: 'Invalid activity data received' })
    }

})

// @desc Update a item
// @route PATCH /items
// @access Private
const updateActivity = asyncHandler(async (req, res) => {
    const { id, seen } = req.body

    // Confirm data
    if (seen) {
        return res.status(400).json({ message: 'Seen field is required' })
    }

    // Confirm note exists to update
    const activity = await Activity.findById(id).exec()

    if (!activity) {
        return res.status(400).json({ message: 'Activity not found' })
    }


    activity.name =  activity.name
    activity.date =  activity.date
    activity.avatar =  activity.avatar
    activity.actionType =  activity.actionType
    activity.description =  activity.description
    activity.seen =  true


    const updatedActivity = await activity.save()

    res.json(`Activity '${updatedActivity.name}' updated`)
})

// @desc Delete a note
// @route DELETE /notes
// @access Private
const deleteActivity = asyncHandler(async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Log ID required' })
    }

    // Confirm note exists to delete 
    const log = await Activity.findById(id).exec()

    if (!log) {
        return res.status(400).json({ message: 'log not found' })
    }

    const result = await Log.deleteOne()


    const reply = `Log '${log.name}' with ID ${log._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllActivities,
    createNewActivity,
    updateActivity,
    deleteActivity
}