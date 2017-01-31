var express = require('express');

var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
var path = require('path');
var dotenv = require('dotenv');
var mongoose = require('mongoose');
var promise = require('bluebird');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var routes = require('./routes/index');
var Publisher = require('./models/publishers');
var Content = require('./models/content');
var pug = require('pug');
dotenv.load();

passport.use(new LocalStrategy(Publisher.authenticate()));
mongoose.Promise = promise;

// serialize and deserialize
passport.serializeUser(function(user, done) {
  //console.log('serializeUser: ' + user._id);
  done(null, user._id);
});
passport.deserializeUser(function(id, done) {
  Publisher.findById(id, function(err, user){
    //console.log(user);
      if(!err) done(null, user);
      else done(err, null);
    });
});

var app = express();
// Add headers
if (app.get('env') === 'production') {
	app.set('trust proxy', 1) // trust first proxy	
	app.use(function (req, res, next) {
	    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:80');
	    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control, Origin, X-Requested-With, Content-Type, Accept, Authorization');
	    res.setHeader('Access-Control-Allow-Credentials', true);
	    next();
	});
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.locals.appTitle = 'emergencyservices';
app.use(favicon(path.join(__dirname, 'public/img', 'favicon.ico')));
app.locals.moment = require('moment');
app.locals.$ = require('jquery');
//app.locals.L = require('leaflet');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
var store = new MongoDBStore(
	{
		uri: 'mongodb://localhost/session_es',
        collection: 'mySessions'
	}
)
store.on('error', function(error, next){
	next(error)
})
var sess = {
	secret: '12345QWERTY-SECRET',
	name: 'nodecookie',
	resave: false,
	saveUninitialized: false,
	store: store
}
app.use(cookieParser(sess.secret));

// session middleware configuration
// see https://github.com/expressjs/session
app.use(session(sess));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/publishers', express.static(path.join(__dirname, '../../pu/publishers')));
app.use('/publishers/emergencyservices/images', express.static(path.join(__dirname, '../../pu/publishers/emergencyservices/images')));
app.use('/publishers/emergencyservices/images/full', express.static(path.join(__dirname, '../../pu/publishers/emergencyservices/images/full')));
app.use('/publishers/emergencyservices/images/thumbs', express.static(path.join(__dirname, '../../pu/publishers/emergencyservices/images/thumbs')));
app.use('/', routes);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var uri = process.env.DEVDB;

mongoose.connect(uri, {authMechanism: 'ScramSHA1'});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
module.exports = app;