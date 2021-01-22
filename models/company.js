const mongoose = require('mongoose')

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    desc: {
        type: String,
        required: true
    },
    logo: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

companySchema.index(
    {
        name: 'text'
    }
)

module.exports = mongoose.model('Company', companySchema)