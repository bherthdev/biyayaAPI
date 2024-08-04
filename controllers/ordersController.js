const Order = require('../models/Order')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')

// @desc Get all orders 
// @route GET /orders
// @access Private
const getAllOrders = asyncHandler(async (req, res) => {
    // Get all orders from MongoDB
    const orders = await Order.find().lean()

    // If no orders 
    if (!orders?.length) {
        return res.status(400).json({ message: 'No orders found' })
    }

    // Add username to each note before sending the response 
    // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE 
    // You could also do this with a for...of loop
    const ordersWithUser = await Promise.all(orders.map(async (order) => {
        const user = await User.findById(order.user).lean().exec()
        return { ...order, username: user.username }
    }))

    res.json(ordersWithUser)
})

// @desc Create new order
// @route POST /orders
// @access Private
const createNewOrder = asyncHandler(async (req, res) => {
    const { user, orderNo, barista, orderType, dateTime, items, total, cash, change  } = req.body

    // Confirm data
    if (!user || !barista || !total) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicate orderNo
    const duplicate = await Order.findOne({ orderNo }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate order number.' })
    }

    // Create and store the new order 
    const order = await Order.create({ user, orderNo, barista, orderType, dateTime, items, total, cash, change  })

    if (order) { // Created 
        return res.status(201).json({ message: "New order " + orderNo + " saved." })
    } else {
        return res.status(400).json({ message: 'Invalid order data received' })
    }

})

// @desc Update a roder
// @route PATCH /orders
// @access Private
const updateOrder = asyncHandler(async (req, res) => {
    const { id, user, orderNo, barista, orderType, dateTime, items, total, cash, change  } = req.body

    // Confirm data
    if (!id || !user || !orderNo || !total ) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Confirm order exists to update
    const order = await Order.findById(id).exec()

    if (!order) {
        return res.status(400).json({ message: 'Order not found' })
    }

    // Check for duplicate orderNo
    const duplicate = await Order.findOne({ orderNo }).lean().exec()

    // Allow renaming of the original order 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate order number.' })
    }

    order.user = user
    order.orderNo = orderNo
    order.barista = barista
    order.orderType = orderType
    order.dateTime = dateTime
    order.items = items
    order.total = total
    order.cash = cash
    order.change = change

    const updatedOrder = await order.save()

    res.json(`'${updatedOrder.orderNo}' updated`)
})

// @desc Delete a order
// @route DELETE /orders
// @access Private
const deleteOrder = asyncHandler(async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Order ID required' })
    }

    // Confirm order exists to delete 
    const order = await Order.findById(id).exec()

    if (!order) {
        return res.status(400).json({ message: 'Order not found' })
    }

    const result = await order.deleteOne()

    const reply = `Order '${result.orderNo}' with ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllOrders,
    createNewOrder,
    updateOrder,
    deleteOrder
}