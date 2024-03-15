const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

passport.use(new LocalStrategy(
    function (username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            if (err) return done(err);
            if (!user) return done(null, false, { message: 'Incorrect username.' });

            bcrypt.compare(password, user.password, function (err, res) {
                if (res) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Incorrect password.' });
                }
            });
        });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});





router.get('/login', function (req, res) {
    res.render('login');
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/protected-route', function (req, res) {
    if (req.isAuthenticated()) {
        res.render('protected');
    } else {
        res.redirect('/login');
    }
});

module.exports = router;