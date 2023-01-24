let createError = require('http-errors');
let fs = require('fs')
const nocache = require("nocache");

let path = require('path');
let logger = require('morgan');
const express = require('express');

const bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');

const feedRouter = require('./routes/feed');
const indexRouter = require('./routes/index');
const errorController = require('./controllers/error');

let app = express();

// view engine setup: add EJS folder
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(nocache());

// enable parsing request data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//static folder
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// enable database session store
let Sequelize = require('sequelize')
let session = require('express-session');
let SequelizeStore = require('connect-session-sequelize')(session.Store);

let sequelize = new Sequelize({
  "dialect": "sqlite",
  "storage": "./session.sqlite"
});


let myStore = new SequelizeStore({
  db: sequelize
})


// enable sessions
app.use(session({
  secret:"somesecretkey",
  resave: false, // Force save of session for each request
  saveUninitialized: false, // Save a session that is new, but has not been modified
  cookie: {maxAge: 10*60*1000 } // milliseconds!
}));

app.use('/', indexRouter);
app.use('/feed', feedRouter);

// plug in the error controller
app.use(errorController.get404);

module.exports = app;