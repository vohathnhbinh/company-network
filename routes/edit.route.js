const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Company = require('../models/company')
const authenticate = require('../middlewares/authentication')
const bcrypt = require('bcrypt')

router.get('/', authenticate.checkAuthenticated, authenticate.checkCompany, async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.user._doc._id
        }).populate('company').lean()
        res.render('profile', {
            user
        })
    } catch(err) {
        console.log(err)
    }
    
})

router.get('/is-available', async (req, res) => {
    const username = req.query.username
    const email = req.query.email
    const name = req.query.name
    try {
        const user = await User.findOne({$or: [
            {username: username},
            {email: email}
        ]})
        const company = await Company.findOne({
            name
        })

        if(user || company) return res.json(false)
        res.json(true)
    } catch(err) {
        console.log(err)
    }
})

router.get('/is-found', async (req, res) => {
    const password = req.query.password
    try {
        const user = await User.findOne({
            username: req.user._doc.username
        })
        const result = await bcrypt.compare(password, user.password)

        if(result) return res.json(true)
        res.json(false)
    } catch(err) {
        console.log(err)
    }
})

router.post('/', async (req, res) => {
    let updatedValue = {fullname, username, email, n_password, age, phone_num} = req.body
    for(let i in updatedValue)
        if(!updatedValue[i])
            delete updatedValue[i]

    let isSuccessful = false
    try {
        if(n_password) {
            const hashedPassword = await bcrypt.hash(n_password, 10)
            updatedValue.password = hashedPassword
            isSuccessful = true
        }
        const updatedUser = await User.findOneAndUpdate(
            {
                username: req.user._doc.username
            }, updatedValue,
            {
                new: true,
                useFindAndModify: false
            }
        ).populate('company').lean()
        res.render('profile', {
            isSuccessful,
            user: updatedUser
        })
    } catch(err) {
        console.log(err)
    }
})

router.post('/company', async (req, res) => {
    let updatedValue = {name, desc} = req.body
    for(let i in updatedValue)
        if(!updatedValue[i])
            delete updatedValue[i]

    try {
        const company = await Company.findOneAndUpdate(
            {
                user: req.user._doc._id
            }, updatedValue,
            {
                new: true,
                useFindAndModify: false
            }
        )
        const user = await User.findOne({
            _id: req.user._doc._id
        }).populate('company').lean()
        res.render('profile', {
            user
        })
    } catch(err) {
        console.log(err)
    }
})

module.exports = router