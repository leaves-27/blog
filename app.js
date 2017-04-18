var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser =require('cookie-parser');

var bodyParser = require('body-parser');
var sesstion = require('express-session');//生成会话
var MongoStore = require('connect-mongo')(sesstion);//用来将会话信息存储到mongodb中
var flash = require('connect-flash');

var routes = require('./routes/index');
var settings = require('./settings');
var fs = require('fs');
var accessLog = fs.createWriteStream('access.log',{flags:"a"});
var errorLog = fs.createWriteStream('error.log',{flags:"a"});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(logger({stream : accessLog}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(err,req,res,next){
  var meta = '[' + new Date() + ']' + req.url + '\n';
  errorLog.write(meta + err.stack +'\n');
  next();
});

app.use(sesstion({
  saveUninitialized : false,
  resave : true,
  secret : settings.cookieSecret,
  key : settings.db,
  cookie : { 
    maxAge:1000*60*60*24*30
  },
  store : new MongoStore({
    db:settings.db,
    host:settings.host,
    port:settings.port
  })
}));
app.use(flash());


app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.render('404');
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
  res.render('error',{
    message: err.message,
    error: {}
  });
});

app.listen();
module.exports = app;
