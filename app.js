var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require("express-session");
var MongoStore = require("connect-mongo")(session);
var settings = require("./settings");
var flash = require("connect-flash");
var methodOverride = require('method-override');

var index_route = require('./routes/index');            //主路由
var login_route = require('./routes/login');            //登录路由
var register_route = require('./routes/register');      //注册路由
var retrieve_route = require('./routes/retrieve');      //找回密码路由
var publish_route = require('./routes/publish');        //发帖路由

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

//session 设置
app.use(session({
  secret : settings.cookieSecret,
  resave : false,
  saveUninitialized : true
}));


//获取状态
app.use(function(req,res,next){
    console.log('%s', new Date());
    console.log("app.usr local");

    var error = req.flash('error');
    res.locals.error = error.length?error:null;

    var success = req.flash('success');
    res.locals.success = success.length?success:null;

    next();
});


//使用路由
app.use('/', index_route);
app.use('/login', login_route);
app.use('/register', register_route);
app.use('/retrieve', retrieve_route);
app.use('/publish', publish_route);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
