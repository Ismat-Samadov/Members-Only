const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoDBStore = require('connect-mongo');
const User = require('../models/User');
require('dotenv').config();

// Create a session store
const store = MongoDBStore.create({
    mongoUrl: process.env.DB_URL, // Changed from MONGO_URL to DB_URL
    collectionName: 'sessions'
});

// Use express-session middleware
router.use(session({
    secret: process.env.SESSION_SECRET, // Use the SESSION_SECRET from .env file
    resave: false,
    saveUninitialized: false,
    store: store
}));


// Display the registration form
router.get('/register', function (req, res) {
    res.render('register');
});

// Handle the registration form submission
router.post('/register', async function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Store the user in the database
        const user = new User({ username: username, password: hashedPassword });
        await user.save();

        res.redirect('/users/login');
    } catch {
        res.redirect('/users/register');
    }
});

// Display the login form
router.get('/login', function (req, res) {
    res.render('login');
});

// Handle the login form submission
router.post('/login', async function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    const user = await User.findOne({ username: username });
    if (user == null) {
        return res.redirect('/users/login');
    }

    try {
        if (await bcrypt.compare(password, user.password)) {
            req.session.userId = user._id;
            res.redirect('/');
        } else {
            res.redirect('/users/login');
        }
    } catch {
        res.redirect('/users/login');
    }
});

module.exports = router;