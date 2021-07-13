const passport = require('passport');
const {authenticateUser} = require('./users/userManagement');
const LocalStrategy = require('passport-local').Strategy;

// Configure local authentication.
passport.use('local', new LocalStrategy({},
    function(username, password, cb) {
        authenticateUser(username, password).then(user => {
            if (user) {
                return cb(null, user);
            } else {
                return cb(null, false, { message: 'Incorrect user credentials.' });
            }
        });
    }
));

passport.serializeUser(function(user, cb) {
    cb(null, user.username);
});

passport.deserializeUser(function(id, cb) {
    cb(null, {username: id});
});

/**
 * Exports the passport object.
 * @type {Authenticator}
 */
module.exports.passport = passport;

/**
 * Checks if the user is logged in.
 * @param req Request.
 * @param res Response.
 * @param next Next.
 */
module.exports.isLoggedIn = function (req,res,next) {
    if (!req.user) {
        res.status(401).json({'error' : 'Not logged in'});
    } else {
        next();
    }
}

/**
 * Gets the user if logged in.
 * @param req Request.
 * @param res Response.
 */
module.exports.getUser = function(req, res) {
    res.json({user: req.user});
}

