const Log = require('../models/Log')
const asyncHandler = require('express-async-handler')
const cloudinary = require("../utils/cloudinary");


// @desc Get all notes 
// @route GET /notes
// @access Private
const getAllLogs = asyncHandler(async (req, res) => {
    // Get all notes from MongoDB
    const logs = await Log.find().lean()

    // If no notes 
    if (!logs?.length) {
        return res.status(400).json({ message: 'No logs found.' })
    }


    res.json(logs)
})

// @desc Create new items
// @route POST /items
// @access Private
const createNewLog = asyncHandler(async (req, res) => {
    const { name, description, stockMGT, qty, price, category, status, image } = req.body

    // Confirm data
    if (!name || !description || !price || !category || !status) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicate title
    const duplicate = await Log.findOne({ name }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate log title' })
    }

    const result = await cloudinary.uploader.upload(image);


    const userObject = {
        name,
        description,
        stock_mgt: stockMGT,
        qty,
        price,
        category,
        status,
        avatar: result.secure_url,
        cloudinary_id: result.public_id
    }

    // Create and store the new user 
    const log = await Log.create(userObject)

    if (log) { // Created 
        return res.status(201).json({ message: 'New log created' })
    } else {
        return res.status(400).json({ message: 'Invalid log data received' })
    }

})

// @desc Update a item
// @route PATCH /items
// @access Private
const updateLog = asyncHandler(async (req, res) => {
    const { id, name, description, stockMGT, qty, price, category, status, image } = req.body

    // Confirm data
    if (!name || !description || !price || !category || !status) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Confirm note exists to update
    const log = await Log.findById(id).exec()

    if (!log) {
        return res.status(400).json({ message: 'Log not found' })
    }

    // Check for duplicate title
    const duplicate = await Log.findOne({ name }).lean().exec()

    // Allow renaming of the original note 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate log name' })
    }

    let result;
    if (image) {
        // Delete image from cloudinary
        await cloudinary.uploader.destroy(log.cloudinary_id);
        // Upload image to cloudinary
        result = await cloudinary.uploader.upload(image);
    }

    log.name = name
    log.description = description
    log.stock_mgt = stockMGT
    log.qty = qty
    log.price = price
    log.category = category
    log.status = status
    log.avatar = result?.secure_url || log.avatar;
    log.cloudinary_id = result?.public_id || log.cloudinary_id;


    const updatedLog = await log.save()

    res.json(`'${updatedLog.name}' updated`)
})

// @desc Delete a note
// @route DELETE /notes
// @access Private
const deleteLog = asyncHandler(async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Log ID required' })
    }

    // Confirm note exists to delete 
    const log = await Log.findById(id).exec()

    if (!log) {
        return res.status(400).json({ message: 'log not found' })
    }

    const result = await Log.deleteOne()


    const reply = `Log '${log.name}' with ID ${log._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllLogs,
    createNewLog,
    updateLog,
    deleteLog
}