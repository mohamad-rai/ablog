const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');

const Config = require(path.join(__dirname,'config','const'));
const router = require(path.join(__dirname, 'routes', 'router'));

const app = express();

// session config
app.use(session({
  secret: Config.SECRET_SESSION,
  key: 'user_sid',
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: Config.EXPIRE_SESSION}
}));

//connect to database
mongoose.connect(
    `mongodb://${Config.DATABASE_ADDRESS}/${Config.DATABASE_NAME}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// router
app.use('/', router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
