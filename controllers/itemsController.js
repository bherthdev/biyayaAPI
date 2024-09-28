const Item = require('../models/Item')
const asyncHandler = require('express-async-handler')
const cloudinary = require("../utils/cloudinary");


// @desc Get all notes 
// @route GET /notes
// @access Private
const getAllItems = asyncHandler(async (req, res) => {
    // Get all notes from MongoDB
    const items = await Item.find().lean()

    // If no notes 
    if (!items?.length) {
        // return res.status(400).json({ message: 'No items found.' })
        return res.json(items)
    }


    res.json(items)
})

// @desc Create new items
// @route POST /items
// @access Private
const createNewItem = asyncHandler(async (req, res) => {
    const { name, description, stockMGT, qty, price, category, status, image } = req.body

    // Confirm data
    if (!name || !description || !price || !category || !status) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicate title
    const duplicate = await Item.findOne({ name }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate item title' })
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
    const item = await Item.create(userObject)

    if (item) { // Created 
        return res.status(201).json({ message: 'New item created' })
    } else {
        return res.status(400).json({ message: 'Invalid item data received' })
    }

})

// @desc Update a item
// @route PATCH /items
// @access Private
const updateItem = asyncHandler(async (req, res) => {
    const { id, name, description, stockMGT, qty, price, category, status, image } = req.body

    // Confirm data
    if (!name || !description || !price || !category || !status) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Confirm note exists to update
    const item = await Item.findById(id).exec()

    if (!item) {
        return res.status(400).json({ message: 'Item not found' })
    }

    // Check for duplicate title
    const duplicate = await Item.findOne({ name }).lean().exec()

    // Allow renaming of the original note 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate item name' })
    }

    let result;
    if (image) {
        // Delete image from cloudinary
        await cloudinary.uploader.destroy(item.cloudinary_id);
        // Upload image to cloudinary
        result = await cloudinary.uploader.upload(image);
    }

    item.name = name
    item.description = description
    item.stock_mgt = stockMGT
    item.qty = qty
    item.price = price
    item.category = category
    item.status = status
    item.avatar = result?.secure_url || item.avatar;
    item.cloudinary_id = result?.public_id || item.cloudinary_id;


    const updatedItem = await item.save()

    res.json(`'${updatedItem.name}' updated`)
})

// @desc Delete a note
// @route DELETE /notes
// @access Private
const deleteItem = asyncHandler(async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Item ID required' })
    }

    // Confirm note exists to delete 
    const item = await Item.findById(id).exec()

    if (!item) {
        return res.status(400).json({ message: 'Item not found' })
    }

     // Delete item image from cloudinary
  await cloudinary.uploader.destroy(item.cloudinary_id);
 

    const result = await item.deleteOne()


    const reply = `Item '${item.name}' with ID ${item._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllItems,
    createNewItem,
    updateItem,
    deleteItem
}