var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/userAuth/auth");


//estalishing mongodb connection
mongoose.connect(
  process.env.MONGO_URL_STRING,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useFindAndModify: false,
    // useCreateIndex: true,
  },
  (err) => {
    if (err) {
      console.log("error occured is:", err);
    } else {
      console.log("connected to database successfully");
    }
  }
);


var app = express();




app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//MIDDLEWARE -> DISALBING CORS
app.use(cors());

app.use('/', indexRouter);
app.use("/user", usersRouter);

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
