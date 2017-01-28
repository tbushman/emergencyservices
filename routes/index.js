var express = require('express');
var passport = require('passport');
var router = express.Router();
var url = require('url');
var fs = require('fs');
var path = require('path');
var moment = require("moment");
var async = require("async");
var multer = require('multer');
var mkdirp = require('mkdirp');
var spawn = require("child_process").spawn;
var dotenv = require('dotenv');
var Publisher = require('../models/publishers.js');
var Content = require('../models/content.js');
var publishers = path.join(__dirname, '/../../..');
var upload = multer();
//var uploadmedia = null;
//Todo: user remove triggers userindex $inc -1
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		var p = ''+publishers+'/pu/publishers/emergencyservices/images/full'
		var q = ''+publishers+'/pu/publishers/emergencyservices/images/thumbs'
		fs.access(p, function(err) {
			if (err && err.code === 'ENOENT') {
				mkdirp(p, function(err){
					if (err) {
						console.log("err", err);
					}
					mkdirp(q, function(err){
						if (err) {
							console.log("err", err);
						}
    					cb(null, p)
					})
				})
			} else {
				cb(null, p)
			}
		})
  	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '_' + req.params.id + '.jpeg')   	
  	}
})
 
var uploadmedia = multer({ storage: storage })
dotenv.load();

var geolocation = require ('google-geolocation') ({
	key: process.env.GOOGLE_KEY
});

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { 
		return next(); 
	}
	return res.redirect('/login');
}

//if logged in, go to your own profile
//if not, go to global profile (home)
router.get('/', function (req, res) {
	
	if (req.user) {
		req.app.locals.userId = req.user._id;
		req.app.locals.givenName = req.user.givenName;
		req.app.locals.loggedin = req.user.username;
		return res.redirect('/api/publish')
	} else {
		return res.redirect('/home')
	}
});

router.get('/register', function(req, res) {
    return res.render('register', { } );
});


router.post('/register', upload.array(), function(req, res, next) {
	var imgurl;
	var imgbuf;
	Publisher.register(new Publisher({ username : req.body.username, givenName: req.body.givenName, email: req.body.email}), req.body.password, function(err, user) {
		if (err) {
			return res.render('register', {info: "Sorry. That username already exists. Try again."});
		}
		req.app.locals.givenName = req.body.givenName;
		req.app.locals.username = req.body.username;
		passport.authenticate('local')(req, res, function () {
			Publisher.findOne({username: req.body.username}, function(error, doc){
				if (error) {
					return next(error)
				}
				req.app.locals.userId = doc._id;
				req.app.locals.loggedin = doc.username;
				return res.redirect('/api/publish')
			})
		});
  	});
});

router.get('/login', function(req, res, next){
	return res.render('login', { 
		user: req.user
	});
});

router.post('/login', upload.array(), passport.authenticate('local'), function(req, res, next) {
	req.app.locals.userId = req.user._id;
	req.app.locals.loggedin = req.user.username;
    res.redirect('/api/publish')
});

router.get('/logout', function(req, res) {
	
	req.app.locals.username = null;
	req.app.locals.userId = null;
	req.app.locals.zoom = null;
	req.logout();
	if (req.user || req.session) {
		req.user = null;
		req.session.destroy(function(err){
			if (err) {
				req.session = null;
				return next(err);
			} else {
				req.session = null;
				return res.redirect('/');
			}
		});		
	} else {
		return res.redirect('/');
	}
});

router.get('/home', function(req, res, next) {
	req.app.locals.username = null;
	var arp = spawn('arp', ['-a']);
	//console.log(arp.stdio[0].Pipe)
	var mac;
	arp.stdout.on('data', function(data){
		data += '';
		data = data.split('\n');
		mac = data[0].split(' ')[3];
	})
	// Configure API parameters 
	const params = {
		wifiAccessPoints: [{
			macAddress: ''+mac+'',
			signalStrength: -65,
			signalToNoiseRatio: 40
	    }]
	};
	
	var loc;
	var info;
	// Get data 
	async.waterfall([
		function(next){
			geolocation(params, function(err, data) {
				if (err) {
					console.log (err);
					loc = null;
					info = 'Could not find your location'
				} else {
					loc = JSON.parse(JSON.stringify({ lng: data.location.lng, lat: data.location.lat }))
					info = 'Publish something'
				}
				next(null, loc, info)
			});
		},
		function(loc, info, next){
			
			Content.find({}, function(err, data){
				if (err) {
					next(err)
				}
				if (!err && data.length === 0){
					return res.redirect('/register')
				}
				var datarray = [];
				for (var l in data) {
					datarray.push(data[l])
				}
				loc = datarray[datarray.length-1].geometry.coordinates;
				next(null, loc, info, datarray)
				
			})
		}
	], function(err, loc, info, data) {
		var zoom;
		var lat = loc[1]
		var lng = loc[0]
		if (req.app.locals.zoom) {
			zoom = req.app.locals.zoom
			//lat = req.app.locals.lat
			//lng = req.app.locals.lng
			info = 'Refreshed'
		} else {
			zoom = 3
			
		}

		if (req.isAuthenticated()) {
			return res.render('publish', {
				loggedin: req.app.locals.loggedin,
				data: data,
				id: data.length - 1,
				zoom: zoom,
				lng: lng,
				lat: lat,
				info: info
			})
		} else {
			return res.render('publish', {
				data: data,
				id: data.length - 1,
				zoom: zoom,
				lng: lng,
				lat: lat,
				info: info
			})
		}		
	})
})

router.post('/zoom/:zoom/:lat/:lng', function(req, res, next){
	var zoom = parseInt(req.params.zoom, 10);
	var lat = req.params.lat;
	var lng = req.params.lng;
	Content.find({}, function(err, data){
		if (err) {
			next(err)
		}
		var index;

		var datarray = [];
		for (var l in data) {
			datarray.push(data[l])
		}
		req.app.locals.zoom = zoom;
		req.app.locals.lat = lat;
		req.app.locals.lng = lng;

		return res.send('home')
	})
})


router.all('/mydata/:zoom/:lat/:lng', function(req, res, next){
	Content.find({}, function(err, doc){
		if (err) {
			return next(err)
		}
		return res.json(doc)
	})
});

router.all('/focus/:id/:zoom/:lat/:lng', function(req, res, next){
	var outputPath = url.parse(req.url).pathname;
	var id = req.params.id;
	var zoom = req.params.zoom;
	var lat = req.params.lat;
	var lng = req.params.lng;
	Content.findOne({_id: id},function(err, doc){
		if (err) {
			return next(err)
		}
		Content.find({}, function(error, data) {
			if (error) {
				return next(error)
			}
			if (req.params.lat === null || req.params.lat === 'null') {
				lat = doc.geometry.coordinates[1]
				lng = doc.geometry.coordinates[0]
			}
			req.app.locals.zoom = zoom;
			req.app.locals.lat = lat;
			req.app.locals.lng = lng;
			var datarray = [];
			for (var l in data) {
				datarray.push(data[l])
			}
			
			if (req.isAuthenticated()) { 
					return res.render('publish', {
						loggedin: req.app.locals.loggedin,
						infowindow: 'doc',
						zoom: zoom,
						id: id,
						data: datarray,
						doc: doc,
						lat: lat,
						lng: lng,
						info: ':)'
					})

			} else {
				return res.render('publish', {
					infowindow: 'doc',
					zoom: zoom,
					data: datarray,
					id: datarray.length - 1,
					doc: doc,
					lat: lat,
					lng: lng,
					info: ':)'
				})
			}			
		})						
	})	
})

router.post('/list/:id/:zoom/:lat/:lng', function(req, res, next){
	var outputPath = url.parse(req.url).pathname;
	var id = parseInt(req.params.id, 10)
	var zoom = req.params.zoom;
	var lat = req.params.lat;
	var lng = req.params.lng;
	req.app.locals.zoom = zoom;
	req.app.locals.lat = lat;
	req.app.locals.lng = lng;
	Content.findOne({_id: id}, function(err, doc){
		if (err) {
			return next(err)
		}
		return res.json(doc)				
	})
	
})


router.all('/search/:term', function(req, res, next){
	var term = req.params.term;
	var regex = new RegExp(term);
	console.log(regex)
	Content.find({label: { $regex: regex }}, function(err, pu){
		if (err) {
			return next(err)
		}
		if (!err && pu === null) {
			return ('none')
		}
		return res.json(pu)
	})
})

function convertTime(str, cb) {
	var str_hr;
	var str_mn;
	if (str.split('a')[1] !== undefined || str.split('A')[1] !== undefined) {
		str = str.replace('am', '').replace('a', '').replace('AM', '');
		if (str.split(':')[1] !== undefined) {
			str_mn = parseInt(str.split(':')[1].trim(), 10);
			str_hr = parseInt(str.split(':')[0].trim(), 10);
		} else {
			str_mn == 0;
			str_hr = parseInt(str, 10);
		}
	} 
	if (str.split('p')[1] !== undefined || str.split('P')[1] !== undefined) {
		str = str.replace('pm', '').replace('p', '').replace('PM', '');
		if (str.split(':')[1] !== undefined) {
			str_mn = parseInt(str.split(':')[1].trim(), 10);
			str_hr = parseInt(str.split(':')[0].trim(), 10) + 12;
		} else {
			str_mn == 0;
			str_hr = parseInt(str, 10) + 12;
		}
	}
	return moment({ hour: str_hr, minute: str_mn })
}

function separateHourFromMin(hours, cb) {
	if (hours === undefined) {
		return {
			begin: null,
			end: null,
			allday: false,
			closed: false
		}
	} else {
		var beg = hours.split('-')[0];
		var end = hours.split('-')[1];

		console.log(beg, end)
		var begin = convertTime(beg);
		var endd = convertTime(end);
		return {
			begin: begin,
			end: endd,
			allday: false,
			closed: false		
		}
	}
}

//WIP convert import hours of operation
function convertHoO(str) {
	if (str === 'Closed' || str === 'Call' || str === '24 hours' || str === '') {
		var hours;
		if (str === 'Closed') {
			hours = {
				begin: null,
				end: null,
				allday: false,
				closed: true
			}
		} else if (str === 'Call') {
			hours = {
				begin: null,
				end: null,
				allday: false,
				closed: true
			}
		} else if (str === '24 hours') {
			hours = {
				begin: null,
				end: null,
				allday: true,
				closed: false
			}
		} else if (str === '') {
			hours = {
				begin: null,
				end: null,
				allday: false,
				closed: true
			}
		}
		return hours;
		
	} else {
		
		if (str.split('-')[1] !== undefined) {
			var hours;
			if (str.split(';')[1] !== undefined || str.split('_')[1] !== undefined) {
				if (str.split(';')[1] !== undefined) {
					str.split(';').pop();
					hours = str;
				} else {
					str.split('_').pop()
					hours = str;
				}
			} else {
				hours = str
			}
			var result = separateHourFromMin(hours)
			return result;
			
		} else {
			var hours;
			if (str.split('&')[1] !== undefined) {
				hours = str.split('&').join('-');
			} else
			if (str.split(';')[1] !== undefined) {
				hours = str.split(';')[0];
			} else
			if (str.split('_')[1] !== undefined) {
				hours = str.split('_')[0]
			}
			var result = separateHourFromMin(hours)
			return result;
		}
	}	
}

function convertAvailableServices(str) {
	if (str === "") {
		return false
	} else {
		return true;
	}
}

router.all('/api/*', ensureAuthenticated)

router.get('/api/publish', function(req, res, next){
	req.app.locals.username = req.user.username;
	var arp = spawn('arp', ['-a']);
	//console.log(arp.stdio[0].Pipe)
	var mac;
	arp.stdout.on('data', function(data){
		data += '';
		data = data.split('\n');
		mac = data[0].split(' ')[3];
	})
	// Configure API parameters 
	const params = {
		wifiAccessPoints: [{
			macAddress: ''+mac+'',
			signalStrength: -65,
			signalToNoiseRatio: 40
	    }]
	};
	var loc;
	var info;
	// Get data 
	async.waterfall([
		function(next){
			geolocation(params, function(err, data) {
				if (err) {
					console.log (err);
					loc = null;
					info = 'Could not find your location'
				} else {
					loc = JSON.parse(JSON.stringify({ lng: data.location.lng, lat: data.location.lat }))
					info = 'Publish something'
				}
				next(null, loc, info)
			});
		},
		function(loc, info, next){
			Content.find({}, function(err, pu){
				if (err) {
					next(err)
				}
				if (!err && pu.length === 0) {
					console.log('new')
					fs.access('./json/emergency_services.json', function(err) {
						if (err && err.code === 'ENOENT') {
							//console.log(err)
							next(err)
						} else {
							var importthis = require('../json/emergency_services.json');

							var importjson = JSON.parse(JSON.stringify(importthis.features));
							/*importjson.sort(function(a, b){
								return (a.properties.cartodb_id > b.properties.cartodb_id) ? -1 : ((a.properties.cartodb_id < b.properties.cartodb_id) ? 1 : 0);
							})*/

							for (var i in importjson) {

								var entry = new Content({
									_id: i,
									type: "Feature",
									properties: {
										label: importjson[i].properties.label,
										address1: importjson[i].properties.address,
										address2: "",
										city: "Salt Lake City",
										state: importjson[i].properties.state,
										zip: importjson[i].properties.zip,
										phone: importjson[i].properties.phone,
										description: "",
										current: false,
										website: importjson[i].properties.website,
										hours: {
											mo: convertHoO(importjson[i].properties.hours_monday),
											tu: convertHoO(importjson[i].properties.hours_tuesday),
											we: convertHoO(importjson[i].properties.hours_wednesday),
											th: convertHoO(importjson[i].properties.hours_thursday),
											fr: convertHoO(importjson[i].properties.hours_friday),
											sa: convertHoO(importjson[i].properties.hours_saturday),
											su: convertHoO(importjson[i].properties.hours_sunday)
										},
										image: importjson[i].properties.image,
										thumb: importjson[i].properties.image,
										clothing: convertAvailableServices(importjson[i].properties.available_clothing),
										computer: convertAvailableServices(importjson[i].properties.available_computer_access),
										dayroom: convertAvailableServices(importjson[i].properties.available_day_room),
										dental: convertAvailableServices(importjson[i].properties.available_dental_services),
										pantry: convertAvailableServices(importjson[i].properties.available_food_pantry),
										housing: convertAvailableServices(importjson[i].properties.available_housing_assistance),
										meals: convertAvailableServices(importjson[i].properties.available_meals),
										medical: convertAvailableServices(importjson[i].properties.available_medical_services),
										personalcare: convertAvailableServices(importjson[i].properties.available_personal_care_items),
										showers: convertAvailableServices(importjson[i].properties.available_showers),
										shelter: convertAvailableServices(importjson[i].properties.available_shelter),
										transportation: convertAvailableServices(importjson[i].properties.available_transportation_assistance)
									},
									geometry: {
										type: "Point",
									    coordinates: [importjson[i].geometry.coordinates[0], importjson[i].geometry.coordinates[1]]
									}
								})
								entry.save(function(err) {
									if(err) {
										console.log(err);  // handle errors!
									}
								})
							}
							next(null, info)							
						}
					})					
				} else {
					next(null, info)						
				}				
			})
		}
	], function(err, info){
		if (err) {
			return next(err)
		}
		Content.find({}, function(err, data){
			if (err) {
				return next(err)
			}
			var datarray = [];
			for (var l in data) {
				datarray.push(data[l])
			}
			var loc = datarray[0].geometry.coordinates;
			var zoom;
			var lat;
			var lng;
			if (req.app.locals.zoom) {
				zoom = req.app.locals.zoom
				lat = req.app.locals.lat
				lng = req.app.locals.lng
				info = 'Refreshed'
			} else {
				zoom = 3
				lat = loc[1]
				lng = loc[0]
			}
			return res.render('publish', {
				loggedin: req.app.locals.loggedin,
				username: req.app.locals.username,
				id: datarray.length - 1,
				zoom: zoom,
				data: datarray,
				lng: lng,
				lat: lat,
				info: info
			})
		})		
	})

})

router.all('/api/deletefeature/:id', function(req, res, next) {
	var id = parseInt(req.params.id, 10);
	Content.deleteOne({_id: id})
	Content.find({}, function(error, data){
		if (error) {
			return next(error)
		}
		var datarray = [];
		for (var l in data) {
			datarray.push(data[l])
		}
		return res.render('publish', {
			loggedin: req.app.locals.loggedin,
			username: req.app.locals.username,
			id: datarray.length - 1,
			zoom: 6,
			data: datarray,
			lng: data[0].geometry.coordinates[0],
			lat: data[0].geometry.coordinates[1],
			info: 'Deleted'
		})
	})
})

router.get('/api/editcontent/:id', function(req, res, next){
	var id = parseInt(req.params.id, 10);
	Content.findOne({_id: id}, function(error, doc){
		if (error) {
			return next(error)
		}
		var loc = doc.geometry.coordinates;
		Content.find({}, function(er, data){
			if (er) {
				return next(er)
			}
			var datarray = [];
			for (var l in data) {
				datarray.push(data[l])
			}
			return res.render('publish', {
				infowindow: 'edit',
				loggedin: req.app.locals.loggedin,
				username: req.app.locals.username,
				id: id,
				zoom: 6,
				doc: doc,
				data: datarray,
				lng: loc[0],
				lat: loc[1],
				info: 'Edit your entry.'
			})
		})
	})
})

router.post('/api/editcontent/:id', upload.array(), function(req, res, next){
	var id = parseInt(req.params.id, 10);
	var body = req.body;
	
	async.waterfall([
		function(next){
			var keys = Object.keys(body);
			keys.splice(keys.indexOf('label'), 1)
			keys.splice(keys.indexOf('address1'), 1)
			keys.splice(keys.indexOf('address2'), 1)
			keys.splice(keys.indexOf('city'), 1)
			keys.splice(keys.indexOf('state'), 1)
			keys.splice(keys.indexOf('zip'), 1)
			keys.splice(keys.indexOf('phone'), 1)
			keys.splice(keys.indexOf('lat'), 1)
			keys.splice(keys.indexOf('lng'), 1)
			keys.splice(keys.indexOf('description'), 1)

			var thumburl;
			var i = 0;
			var thiskey = 'thumb'
			for (var i in keys) {

				if (keys[i] == thiskey) {
					var thisbody = body[thiskey]
					var thumburl;
					if (thisbody.split('').length > 100) {
						//fs.writefile
						var thumbbuf = new Buffer(body[thiskey], 'base64'); // decode
						var thumb = ''+publishers+'/pu/publishers/emergencyservices/images/thumbs/thumb_'+id+'.jpeg'
						
						fs.writeFile(thumb, thumbbuf, function(err) {
							if(err) {
								console.log("err", err);
							}
							thumburl = thumb.replace('/var/www/pu', '').replace('/Users/traceybushman/Documents/pu.bli.sh/pu', '')
						})

					} else {
						thumburl = body[thiskey]
					}						
				}
			}
			var imgurl = body['img']
			keys.splice(keys.indexOf(thiskey, 1))
			next(null, id, thumburl, imgurl, body, keys)
		},
		function(id, thumburl, imgurl, body, keys, next) {
			
			
			var entry = {
				label: body.label,
				address1: body.address1,
				address2: body.address2,
				city: body.city,
				state: body.state,
				zip: body.zip,
				phone: body.phone,
				description: body.description,
				current: false,
				website: body.website,
				hours: {
					mo: {
						begin: (body.mo_b !== '')?convertTime(body.mo_b):null,
						end: (body.mo_e !== '')?convertTime(body.mo_e):null,
						allday: (body.mo_a)?true:false,
						closed: (body.mo_c)?true:false
					},
					tu: {
						begin: (body.tu_b !== '')?convertTime(body.tu_b):null,
						end: (body.tu_e !== '')?convertTime(body.tu_e):null,
						allday: (body.tu_a)?true:false,
						closed: (body.tu_c)?true:false
					},
					we: {
						begin: (body.we_b !== '')?convertTime(body.we_b):null,
						end: (body.we_e !== '')?convertTime(body.we_e):null,
						allday: (body.we_a)?true:false,
						closed: (body.we_c)?true:false
					},
					th: {
						begin: (body.th_b !== '')?convertTime(body.th_b):null,
						end: (body.th_e !== '')?convertTime(body.th_e):null,
						allday: (body.th_a)?true:false,
						closed: (body.th_c)?true:false
					},
					fr: {
						begin: (body.fr_b !== '')?convertTime(body.fr_b):null,
						end: (body.fr_e !== '')?convertTime(body.fr_e):null,
						allday: (body.fr_a)?true:false,
						closed: (body.fr_c)?true:false
					},
					sa: {
						begin: (body.sa_b !== '')?convertTime(body.sa_b):null,
						end: (body.sa_e !== '')?convertTime(body.sa_e):null,
						allday: (body.sa_a)?true:false,
						closed: (body.sa_c)?true:false
					},
					su: {
						begin: (body.su_b !== '')?convertTime(body.su_b):null,
						end: (body.su_e !== '')?convertTime(body.su_e):null,
						allday: (body.su_a)?true:false,
						closed: (body.su_c)?true:false
					}
				},
				image: imgurl,
				thumb: thumburl,
				clothing: body.clothing,
				computer: body.computer,
				dayroom: body.dayroom,
				dental: body.dental,
				pantry: body.pantry,
				housing: body.housing,
				meals: body.meals,
				medical: body.medical,
				personalcare: body.personalcare,
				showers: body.showers,
				shelter: body.shelter,
				transportation: body.transportation
			}
			entry = JSON.parse(JSON.stringify(entry))
			var key = 'properties'
			var set = {$set: {}};
			set.$set[key] = entry;

			Content.findOneAndUpdate({_id: id}, set, {safe: true, new: true, upsert: false}, function(error, doc){
				if (error) {
					return next(error)
				}
				
					var loc = doc.geometry.coordinates;
					Content.find({}, function(er, data){
						if (er) {
							return next(er)
						}
						next(null, id, doc, data, loc)
					})
				
			});
		}
	], function(err, id, doc, data, loc){
		if (err) {
			return next(err)
		}
		var datarray = [];
		for (var l in data) {
			datarray.push(data[l])
		}
		return res.render('publish', {
			infowindow: 'doc',
			loggedin: req.app.locals.loggedin,
			username: doc.username,
			id: parseInt(id, 10),
			zoom: 6,
			doc: doc,
			data: datarray,
			lng: loc[0],
			lat: loc[1],
			info: ':)'
		})
	})	
})

router.get('/api/addfeature/:zoom/:lat/:lng', function(req, res, next) {

	Content.find({}, function(er, data){
			if (er) {
				return next(er)
			}
			var datarray = [];
			for (var l in data) {
				datarray.push(data[l])
			}
			return res.render('publish', {
				infowindow: 'new',
				loggedin: req.app.locals.loggedin,
				username: req.app.locals.username,
				id: data.length - 1,
				zoom: req.params.zoom,
				data: datarray,
				lng: req.params.lng,
				lat: req.params.lat,
				info: 'drag the feature to the desired location'
			})
		})
})

router.all('/api/uploadmedia/:id/:type', uploadmedia.single('img'), function(req, res, next){
	return res.send(req.file.path)
});

router.post('/api/addcontent/:id', upload.array(), function(req, res, next){
	var body = req.body;
	
	async.waterfall([
		function(next){
			var keys = Object.keys(body);
			keys.splice(keys.indexOf('label'), 1)
			keys.splice(keys.indexOf('address1'), 1)
			keys.splice(keys.indexOf('address2'), 1)
			keys.splice(keys.indexOf('city'), 1)
			keys.splice(keys.indexOf('state'), 1)
			keys.splice(keys.indexOf('zip'), 1)
			keys.splice(keys.indexOf('phone'), 1)
			keys.splice(keys.indexOf('lat'), 1)
			keys.splice(keys.indexOf('lng'), 1)
			keys.splice(keys.indexOf('description'), 1)
			Content.find({}, function(err, pu){
				if(err) {
					next(err)
				}
				var id = pu.length;
				var thumburl;
				var i = 0;
				var thiskey = 'thumb'
				for (var i in keys) {

					if (keys[i] == thiskey) {
						//console.log(body[thiskey])
						var thisbody = body[thiskey]
						if (thisbody.split('').length > 100) {
							//fs.writefile
							var thumbbuf = new Buffer(body[thiskey], 'base64'); // decode
							var thumb = ''+publishers+'/pu/publishers/emergencyservices/images/thumbs/thumb_'+id+'.jpeg'

							fs.writeFile(thumb, thumbbuf, function(err) {
								if(err) {
									console.log("err", err);
								} 
								thumburl = thumb.replace('/var/www/pu', '').replace('/Users/traceybushman/Documents/pu.bli.sh/pu', '')
							})

						} else {
							thumburl = body[thiskey]
						}						
					}
				}
				var imgurl = body['img']
				keys.splice(keys.indexOf(thiskey, 1))
				next(null, thumburl, imgurl, body, keys, id)
			})
		
		},
		function(thumburl, imgurl, body, keys, id, next) {
			var loc = [parseFloat(body.lng), parseFloat(body.lat)]
			var entry = {
				_id: parseInt(id, 10),
				type: "Feature",
				properties: {
					label: body.label,
					address1: body.address1,
					address2: body.address2,
					city: body.city,
					state: body.state,
					zip: body.zip,
					phone: body.phone,
					description: body.description,
					current: false,
					website: body.website,
					hours: {
						mo: {
							begin: (body.mo_b !== '')?convertTime(body.mo_b):null,
							end: (body.mo_e !== '')?convertTime(body.mo_e):null,
							allday: (body.mo_a)?true:false,
							closed: (body.mo_c)?true:false
						},
						tu: {
							begin: (body.tu_b !== '')?convertTime(body.tu_b):null,
							end: (body.tu_e !== '')?convertTime(body.tu_e):null,
							allday: (body.tu_a)?true:false,
							closed: (body.tu_c)?true:false
						},
						we: {
							begin: (body.we_b !== '')?convertTime(body.we_b):null,
							end: (body.we_e !== '')?convertTime(body.we_e):null,
							allday: (body.we_a)?true:false,
							closed: (body.we_c)?true:false
						},
						th: {
							begin: (body.th_b !== '')?convertTime(body.th_b):null,
							end: (body.th_e !== '')?convertTime(body.th_e):null,
							allday: (body.th_a)?true:false,
							closed: (body.th_c)?true:false
						},
						fr: {
							begin: (body.fr_b !== '')?convertTime(body.fr_b):null,
							end: (body.fr_e !== '')?convertTime(body.fr_e):null,
							allday: (body.fr_a)?true:false,
							closed: (body.fr_c)?true:false
						},
						sa: {
							begin: (body.sa_b !== '')?convertTime(body.sa_b):null,
							end: (body.sa_e !== '')?convertTime(body.sa_e):null,
							allday: (body.sa_a)?true:false,
							closed: (body.sa_c)?true:false
						},
						su: {
							begin: (body.su_b !== '')?convertTime(body.su_b):null,
							end: (body.su_e !== '')?convertTime(body.su_e):null,
							allday: (body.su_a)?true:false,
							closed: (body.su_c)?true:false
						}
					},
					image: imgurl,
					thumb: thumburl,
					clothing: body.clothing,
					computer: body.computer,
					dayroom: body.dayroom,
					dental: body.dental,
					pantry: body.pantry,
					housing: body.housing,
					meals: body.meals,
					medical: body.medical,
					personalcare: body.personalcare,
					showers: body.showers,
					shelter: body.shelter,
					transportation: body.transportation
				},
				geometry: {
					type: "Point",
				    coordinates: loc
				}
			}
			var newentry = new Content(entry)
			//Content.insert(newentry) doesn't work in mongoose
			
			newentry.save(function(err){
				if(err) {
					console.log(err);  // handle errors!
				} else {
					Content.find({}, function(err, data){
						if (err) {
							return next(err)
						}
						next(null, entry, data, loc, id)
					})
				}
			})
			
		}
	], function(err, entry, data, loc, id){
		if (err) {
			return next(err)
		}
		var datarray = [];
		for (var l in data) {
			datarray.push(data[l])
		}
		return res.render('publish', {
			infowindow: 'doc',
			loggedin: req.app.locals.loggedin,
			username: req.app.locals.loggedin,
			id: id,
			zoom: 6,
			doc: entry,
			data: datarray,
			lng: loc[0],
			lat: loc[1],
			info: ':)'
		})
	})	
})


module.exports = router;