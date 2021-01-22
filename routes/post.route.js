const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Company = require('../models/company')
const Post = require('../models/post')
const authenticate = require('../middlewares/authentication')
const multer = require('multer')
const fs = require('fs')
const utils = require('../config/utils')

router.get('/', authenticate.checkAuthenticated, (req, res) => {
    res.render('post', {
        user: req.user ? req.user._doc : null
    })
})

let filename
let dir
const storage = multer.diskStorage({
    destination: async function(req,file,cb){
        dir = './public/tmp'
        await fs.promises.mkdir(dir, { recursive: true })
        cb(null, dir)
    },
    filename : function(req,file,cb){
        filename = Date.now() + file.originalname
        cb(null, filename)
    }
})
const upload=multer({storage})

router.post('/', upload.single('image'), async (req, res) => {
    const {image,content,test} = req.body
    try {
        const company = await Company.findOne({
            user: req.user._doc._id
        })
        const post = new Post({
            content,
            image: filename,
            company: company._id,
            createdOn: new Date(),
            test: test ? utils.convertId(test) : null
        })
        await post.save()

        const trueDir = './public/images/' + company.name
        await fs.promises.mkdir(trueDir, { recursive: true })

        await fs.promises.rename(
            dir + '/' + filename,
            trueDir + '/' + filename
        )
        res.redirect('/')
    } catch(err) {
        console.log(err)
    }
})

module.exports = router