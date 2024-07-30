const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

const itemSchema = new mongoose.Schema(
    {
        
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        qty: {
            type: String,
            required: true
        },
        price: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true
        },
    },
    {
        timestamps: true
    }
)

itemSchema.plugin(AutoIncrement, {
    inc_field: 'item',
    id: 'itemNums',
    start_seq: 0
})

module.exports = mongoose.model('Item', itemSchema)