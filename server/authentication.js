const {config} = require('./config');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.use('local', new LocalStrategy({},
    function(username, password, cb) {
        // For now we keep this super simple.
        if ((username === config.username) && (password === config.password)) {
            const user = {
                username: username
            }
            return cb(null, user);
        } else {
            return cb(null, false, { message: 'Incorrect user credentials.' });
        }
    }
));
passport.serializeUser(function(user, cb) {
    cb(null, user.username);
});

passport.deserializeUser(function(id, cb) {
    cb(null, {username: id});
});

module.exports.passport = passport;

module.exports.isLoggedIn = function (req,res,next) {
    if (!req.user) {
        res.status(401).json({'error' : 'Not logged in'});
    } else {
        next();
    }
}

