const {check, validationResult} = require('express-validator')
const User = require('../models/user')
const Company = require('../models/company')

const validateRegister = () => {
    return [
        check('username', 'Username must have at least 6 characters').isLength({min: 6}),
        check('password', 'Password must have at least 6 characters').isLength({min: 6}),
        check('email', 'Email is invalid').isEmail(),
        check('repassword', 'Password does not match').custom((value, {req}) => {
            if (value !== req.body.password) return false
            return true
        }),
        check('age', 'Age is not possible').optional({checkFalsy: true}).isNumeric(),
        check('phone_num', 'Phone number is invalid').optional({checkFalsy: true}).isMobilePhone(),
        check('username', 'Username is unavailable').custom(async value => {
            let existUser = await User.findOne({
                username: value
            })

            if (existUser) return Promise.reject()
            return true
        }),
        check('email', 'Email is already in use').custom(async value => {
            let existEmail = await User.findOne({
                email: value
            })

            if (existEmail) return Promise.reject()
            return true
        }),
        
        (req, res, next) => {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                res.locals.errors = errors.mapped()
                res.locals.fail = true
            } else res.locals.fail = false
    
            next()
        }
    ]
}

const validate = {
    validateRegister
}

module.exports = validate