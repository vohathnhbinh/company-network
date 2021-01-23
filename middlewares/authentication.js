module.exports = {
    checkAuthenticated: (req, res, next) => {
        if(req.isAuthenticated()) {
            return next()
        }

        res.redirect('/login')
    },
    checkNotAuthenticated: (req, res, next) => {
        if(req.isAuthenticated()) {
            return res.redirect('/')
        }

        next()
    },
    checkCompany: (req, res, next) => {
        if(req.user) {
            if(req.user._doc.company) {
                return next()
            }
        }
        
        res.redirect('/register/company')
    }
}