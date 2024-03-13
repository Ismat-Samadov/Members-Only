const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
console.log("DB_URL:", process.env.DB_URL);
console.log("SESSION_SECRET:", process.env.SESSION_SECRET);
const app = express();


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.DB_URL })
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());

const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

const usersRouter = require('./routes/users');
app.use('/users', usersRouter);

const homeRoutes = require('./routes/home');
app.use('/', homeRoutes);

module.exports = app;