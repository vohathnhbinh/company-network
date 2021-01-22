const express = require('express')
const router = express.Router()
const Company = require('../models/company')
const Post = require('../models/post')
const utils = require('../config/utils')

router.get('/', async (req, res) => {
    const result = req.query.q
    try {
        let companies
        if(result) {
            companies = await Company.find({
                $text: {
                    $search: result
                }
            }).lean()
        } else {
            companies = await Company.find({}).lean()
        }
        
        res.render('search', {
            user: req.user ? req.user._doc : null,
            companies,
            empty: companies.length === 0
        })
    } catch(err) {
        console.log(err)
    }
})

router.get('/detail', async (req, res) => {
    const companyId = req.query.companyId
    try {
        const company = await Company.findOne({
            _id: utils.convertId(companyId)
        }).lean()

        const posts = await Post.find({
            company: utils.convertId(companyId)
        })
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

        res.render('thiscompany', {
            user: req.user ? req.user._doc : null,
            company,
            posts
        })
    } catch(err) {
        console.log(err)
    }
})

module.exports = router