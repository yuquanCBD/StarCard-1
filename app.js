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

var wiki_route = require('./routes/wiki');              //百科路由
var home_route = require('./routes/home');              //首页路由
var mycard_route = require('./routes/mycard');          //我的卡圈路由
var comment_route = require('./routes/comment');        //卡片评论路由
var exchange_route = require('./routes/exchange');      //交换卡片路由
var test_route = require('./routes/test');              //测试路由
var order_route = require('./routes/order');            //订单路由

var webUser_route = require('./routes/webUser');        //web用户以及管理员管理
var admin_route = require('./routes/admin');            //web登录以及卡管理
var webOrder_route = require('./routes/webOrder');      //web登录以及订单管理

var message_route = require('./routes/message');        //消息路由

var io = require('./my_server');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', require('ejs').renderFile);  
app.set('view engine', 'html');  

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


app.get('/chat', function (req, res) {
    setInterval(function() {
        console.log('-----------------------emit message---------------', io.socket_id);
        io.emit('message+' + io.socket_id, 'hello')
    }, 5000);

  res.sendfile(__dirname + '/client/index.html');
});

//获取状态
app.use(function(req,res,next){
    console.log('%s', new Date());
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
app.use('/admin', admin_route);
app.use('/wiki', wiki_route);
app.use('/home', home_route);
app.use('/mycard', mycard_route);
app.use('/comment',comment_route);
app.use('/exchange',exchange_route);
app.use('/test', test_route);
app.use('/order', order_route);
app.use('/webUser',webUser_route);
app.use('/message', message_route);
app.use('/webOrder', webOrder_route);

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
    res.json({'error' : err.message,});
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({'error' : err.message,});
});


module.exports = app;
