var express = require('express');

var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
var path = require('path');
var url = require('url');
var dotenv = require('dotenv');
var mongoose = require('mongoose');
var promise = require('bluebird');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
const moment = require('moment');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var routes = require('./routes/index');
var Publisher = require('./models/publishers');
var Content = require('./models/content');
var VueTimepicker = require('vue2-timepicker');
// const OfficeUIFabricVue = require('office-ui-fabric-vue');
var pug = require('pug');
dotenv.load();

mongoose.Promise = promise;
passport.use(new LocalStrategy(Publisher.authenticate()));
passport.use(new GoogleStrategy({
	clientID: process.env.GOOGLE_OAUTH_CLIENTID,
	clientSecret: process.env.GOOGLE_OAUTH_SECRET,
	callbackURL: (process.env.NODE_ENV === 'production' ? process.env.GOOGLE_CALLBACK_URL : process.env.GOOGLE_CALLBACK_URL_DEV),
	passReqToCallback: true
	},
	function(req, accessToken, refreshToken, profile, done) {
		console.log(accessToken, refreshToken, profile)
		Publisher.find({}).lean().exec(function(err, data){
			if (err) {
				return done(err)
			}
			Publisher.findOne({ 'google.oauthID': profile.id }).lean().exec(async function(err, user) {
				if(err) {
					console.log(err);  // handle errors!
				}
				console.log(moment(new Date()).utc().format(), moment.unix((+user.google.created/1000)).add(5, 'months').utc().format())
				if (!err && user && user.google && moment(new Date()).utc().format() > moment.unix((+user.google.created/1000)).add(5, 'months').utc().format() ) {
					user = await Publisher.findOne({_id: req.session.userId}).then(pu=>pu).catch(err=>next(err));
					user.gaaccess = accessToken;
					user.garefresh = refreshToken,
					user.google = {
						oauthID: profile.id,
						name: profile.displayName,
						created: Date.now()
					}
					user.admin = true;
					user.save(function(err) {
						if(err) {
							console.log(err);  // handle errors!
						} else {
							console.log("saving user ...");
							done(null, user);
						}
					});
				}
				//console.log(profile, user)
				else if (!err && user !== null) {
					done(null, user);
				} else {
					console.log(req.session)
					if (!req.session || !req.session.userId) {
						user = new Publisher({
							userindex: data.length,
							username: profile.name.givenName,
							email: profile.emails[0].value,
							admin: true,
							avatar: profile.photos[0].value,
							gaaccess: accessToken,
							garefresh: refreshToken,
							google: {
								oauthID: profile.id,
								name: profile.displayName,
								created: Date.now()
							}
						});
					} else {
						user = await Publisher.findOne({_id: req.session.userId}).then(pu=>pu).catch(err=>next(err));
						user.gaaccess = accessToken;
						user.garefresh = refreshToken,
						user.google = {
							oauthID: profile.id,
							name: profile.displayName,
							created: Date.now()
						}
						user.admin = true;
					}

					user.save(function(err) {
						if(err) {
							console.log(err);  // handle errors!
						} else {
							console.log("saving user ...");
							done(null, user);
						}
					});

				}
			});
		})

	}
));

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
		res.setHeader('Content-Security-Policy', "default-src 'self' http://localhost:8010")
	    res.setHeader('Access-Control-Allow-Origin', '*');
	    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE');
	    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control, Origin, Content-Type, Accept');
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
		uri: process.env.DEVDB,
        collection: 'esSession'
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
app.use(function (req, res, next) {
	// console.log(VueTimepicker)
	// console.log(VueTimepicker.default)
	// app.locals.VueTimepicker = VueTimepicker;
	// app.locals.OfficeUIFabricVue = OfficeUIFabricVue;
	// app.locals.VueTimepicker = VueTimepicker;
res.locals.session = req.session;
  next();
})

app.use('/', routes);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var outputPath = url.parse(req.url).pathname;
  var err = new Error('Not Found');
  err.status = 404;
  console.log(outputPath);
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

var promise = mongoose.connect(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false
	// useMongoClient: true 
}/*, {authMechanism: 'ScramSHA1'}*/);
promise.then(function(db){
	console.log('connected es')
	// db.on('error', console.error.bind(console, 'connection error:'));
})
.catch(err => console.log(err));

module.exports = app;