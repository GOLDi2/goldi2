const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
//routes
const indexRouter = require('./routes/index');
const compileRouter = require('./routes/compile');
const examplesRouter = require('./routes/examples');
const boardsRouter = require('./routes/boards').router;
const minimizeRouter = require('./routes/minimize');
const IDRouter = require('./routes/GenerateKey');
const log4js = require('log4js');

//set log4js configurations
log4js.configure({
  appenders: {
    console: { type: 'stdout' },
    gcc_file: {
      type: 'file',
      filename: path.resolve('../Nodeserver/logs', 'gcc_js.log') ,
      maxLogSize: 10000
    },
    compile_file: {
      type: 'file',
      filename: path.resolve('../Nodeserver/logs', 'compile_js.log') ,
      maxLogSize: 10000
    },
    general: {
      type: 'file',
      filename: path.resolve('../Nodeserver/logs', 'nodejs.log') ,
      maxLogSize: 10000
    }
  },
  categories: {
    default: { appenders: ['console'], level: 'info' },
    compile: { appenders: ['compile_file', 'general'], level: 'info' },
    gcc: { appenders: ['gcc_file', 'general', 'console'], level: 'info' }
  }
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//use cors
app.use(cors());

//allow cors
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//use routes
app.use('/', indexRouter);
app.use('/compile', compileRouter);
app.use('/examples', examplesRouter);
app.use('/boards', boardsRouter);
app.use('/minimize', minimizeRouter);
app.use('/getID', IDRouter);

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
  console.log(err)
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
