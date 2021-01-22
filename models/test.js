const mongoose = require('mongoose')

const testSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    test_length: {
        type: Number,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    max_examinee: {
        type: Number,
        required: true
    },
    examinees: [{
        _id:false,
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        result: Number
    }],
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    }
})

module.exports = mongoose.model('Test', testSchema)