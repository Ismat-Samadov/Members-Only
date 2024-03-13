const express = require('express');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const path = require('path'); // Add this line
require('dotenv').config();

const app = express();

const dbUrl = process.env.DB_URL;
app.use(session({
  secret: 'your secret',
  resave: false,
  saveUninitialized: false
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());

app.set('views', path.join(__dirname, 'views'));

const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

const usersRouter = require('./routes/users');
app.use('/users', usersRouter);

const homeRoutes = require('./routes/home');
app.use('/', homeRoutes);

module.exports = app;