const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Company = require('../models/company')
const Test = require('../models/test')
const bcrypt = require('bcrypt')
const authenticate = require('../middlewares/authentication')

router.get('/', (req, res) => {
    res.render('test', {
        user: req.user ? req.user._doc : null
    })
})

router.get('/is-available', async (req, res) => {
    const name = req.query.name
    try {
        const test = await Test.findOne({
            name
        })
        if(test) return res.json(false)
        res.json(true)
    } catch(err) {
        console.log(err)
    }
})

router.post('/', async (req, res) => {
    const {name, test_length, end_date, max_examinee} = req.body
    try {
        const user = await User.findOne({
            _id: req.user._doc._id
        })

        const test = new Test ({
            name,
            test_length,
            end_date,
            max_examinee,
            company: user.company
        })

        await test.save()

        res.render('test', {
            user: req.user ? req.user._doc : null,
            test: test._id
        })
    } catch(err) {
        console.log(err)
    }
})

router.get('/mytest', async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.user._doc._id
        })
        const tests = await Test.find({
            company: user.company
        }).lean()

        res.render('mytest', {
            user: req.user ? req.user._doc : null,
            tests,
            empty: tests.length === 0
        })
    } catch(err) {
        console.log(err)
    }
})

module.exports = router