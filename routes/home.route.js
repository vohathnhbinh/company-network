const express = require('express')
const router = express.Router()
const Company = require('../models/company')
const Post = require('../models/post')
const Test = require('../models/test')
const utils = require('../config/utils')
const authenticate = require('../middlewares/authentication')

router.get('/', async (req, res) => {
    try {
        const company = await Company.findOne({
            user: req.user ? req.user._doc._id : null
        }).lean()

        const posts = await Post.find({})
        .populate('company')
        .populate({
            path: 'test',
            model: 'Test',
            populate: {
                path: 'examinees.user',
                model: 'User'
            }
        })
        .sort({
            createdOn: -1
        })
        .lean()

        res.render('home', {
            user: req.user ? req.user._doc : null,
            company,
            posts,
            success: req.query.success,
            expired: req.query.expired,
            limited: req.query.limited
        })
    } catch(err) {
        console.log(err)
    }
})

router.get('/taketest', authenticate.checkAuthenticated, authenticate.checkCompany, async (req, res) => {
    const testId = req.query.testId
    try {
        const altTest = await Test.findOne({
            _id: utils.convertId(testId),
            'examinees.user': req.user._doc._id
        })
        let success = false
        let expired = false
        let limited = false
        if(!altTest) {
            const examinee = {
                user: req.user._doc._id,
                result: Math.floor(Math.random() * 101)
            }

            const test = await Test.findOneAndUpdate(
                {
                    _id: utils.convertId(testId)
                },
                {
                    $push: {
                        examinees: examinee
                    }
                }
            )
            success = true
            const today = new Date()
            if(test.end_date.getTime() === today.getTime()) expired = true
            if(test.max_examinee === test.examinees.length) limited = true
        }

        res.redirect(`/?success=${success}&expired=${expired}&limited=${limited}`)
    } catch(err) {
        console.log(err)
    }
})

module.exports = router