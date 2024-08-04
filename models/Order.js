const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        orderNo: {
            type: String,
            required: true
        },
        barista: {
            type: String,
            required: true
        },
        orderType: {
            type: String,
            required: true
        },
        dateTime: {
            type: String,
            required: true
        },
        items: [{
            id: String,
            name: String,
            price: String,
            qty: String,
            total: String,
        }],
        total: {
            type: String,
            required: true
        },
        cash: {
            type: String,
            required: true
        },
        change: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

orderSchema.plugin(AutoIncrement, {
    inc_field: 'order',
    id: 'orderNums',
    start_seq: 1
})

module.exports = mongoose.model('Order', orderSchema)