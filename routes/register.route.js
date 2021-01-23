const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Company = require('../models/company')
const bcrypt = require('bcrypt')
const validate = require('../middlewares/validation')
const authenticate = require('../middlewares/authentication')
const multer = require('multer')
const fs = require('fs')
const { findOneAndUpdate } = require('../models/user')

router.get('/', authenticate.checkNotAuthenticated, (req, res) => {
    res.render('register')
})

router.post('/', authenticate.checkNotAuthenticated, validate.validateRegister(), async (req, res) => {
    const {username, email, password, fullname, age, phone_num} = req.body

    if (!res.locals.fail) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10)

            const user = new User({
                username,
                fullname,
                email,
                password: hashedPassword,
                age,
                phone_num
            })
            await user.save()
            res.redirect('/login')
        } catch(err) {
            console.log(err)
            res.render('register', {
                username,
                fullname,
                email,
                age,
                phone_num
            })
        }
    } else {
        res.render('register', {
            username,
            fullname,
            email,
            age,
            phone_num
        })
    }
})

router.get('/is-available', async (req, res) => {
    const name = req.query.name
    try {
        const company = await Company.findOne({
            name
        })
        if(company) return res.json(false)
        res.json(true)
    } catch(err) {
        console.log(err)
    }
})

router.get('/company', authenticate.checkAuthenticated, (req, res) => {
    res.render('company', {
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

router.post('/company', upload.single('avatar'), async (req, res) => {
    const {avatar,name,desc} = req.body
    try {
        const company = new Company({
            name,
            desc,
            logo: filename,
            user: req.user._doc._id
        })
        await company.save()
        const user = await User.findOneAndUpdate(
            {
                _id: req.user._doc._id
            },
            {
                $set: {
                    company: company._id
                }
            }
        )

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