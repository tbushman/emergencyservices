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
var spawn = require("child_process").exec;
var dotenv = require('dotenv');
var Publisher = require('../models/publishers.js');
var Content = require('../models/content.js');
var publishers = path.join(__dirname, '/../../..');
var upload = multer();

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
				if (err && err.code === 'EACCESS') {
					console.log('permission error: '+err)
				} else {
					cb(null, p)
				}
			}
		})
  	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '_' + req.params.id + '.jpeg')   	
  	}
})

//use uploadmedia var as middleware 
var uploadmedia = multer({ storage: storage })

//always
dotenv.load();

var geolocation = require ('google-geolocation') ({
	key: process.env.GOOGLE_KEY
});

function ensureNoOldImgs(req, res, next) {
	Content.find({}, function(err, data) {
		if (err) {
			return next(err)
		}
		data = JSON.parse(JSON.stringify(data));
		async.waterfall([
			function(cb) {
				var qs = [];
				for (var i in data) {
					i = parseInt(i, 10);
					var doc = data[i];
					var q1 = {
						query: {_id: doc._id},
						key: 'image',
						index: i,
						image: doc.properties.image.replace('http://pu.bli.sh/maps', '/publishers/emergencyservices/images/full')
					}
					qs.push(q1);
					var q2 = {
						query: {_id: doc._id},
						key: 'thumb',
						index: i,
						image: doc.properties.thumb ? doc.properties.thumb.replace('http://pu.bli.sh/maps', '/publishers/emergencyservices/images/full') : doc.properties.image.replace('http://pu.bli.sh/maps', '/publishers/emergencyservices/images/full')
					}
					qs.push(q2);
				}
				cb(null, qs)
			},
			function(qs, cb) {
				async.eachSeries(qs, function(q, nxt){
				Content.findOne(q.query, function(err, doc){
					if (err) {
						nxt(err)
					}
					if (doc) {
						doc.properties[q.key] = q.image;
						doc.save(function(err){
							if (err) {
								nxt(err)
							} else {
								nxt(null)
							}
						})
					} else {
						nxt(null)
					}
				})
			}, function(err){
				if(err) {
					cb(err)
				} else {
					cb(null)
				}
			})
			}
		], function(err) {
			if (err) {
				return next(err)
			}
			return next();
		})
	})
}

//for all /api/*
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { 
		return next(); 
	}
	return res.redirect('/login');
}

//if logged in, go to edit profile
//if not, go to global profile (home)
router.get('/', function (req, res) {
	var outputPath = url.parse(req.url).pathname;
	// console.log(outputPath)

	if (req.user) {
		req.session.userId = req.user._id;
		req.session.givenName = req.user.givenName;
		req.session.loggedin = req.user.username;
		req.session.username = req.user.username;
		return res.redirect('/api/publish')
	} else {
		return res.redirect('/home')
	}
});

//improve error handling
router.get('/register', function(req, res) {
	var outputPath = url.parse(req.url).pathname;
	// console.log(outputPath)
    return res.render('register', { } );
});


router.post('/register', upload.array(), function(req, res, next) {
	var outputPath = url.parse(req.url).pathname;
	var imgurl;
	var imgbuf;
	Publisher.register(new Publisher({ username : req.body.username, givenName: req.body.givenName, email: req.body.email}), req.body.password, function(err, user) {
		if (err) {
			return res.render('register', {info: "Sorry. That username already exists. Try again."});
		}
		req.session.givenName = req.body.givenName;
		req.session.username = req.body.username;
		passport.authenticate('local')(req, res, function () {
			Publisher.findOne({username: req.body.username}, function(error, doc){
				if (error) {
					console.log(outputPath)
					return next(error)
				}
				req.session.userId = doc._id;
				req.session.loggedin = doc.username;
				return res.redirect('/api/publish')
			})
		});
  	});
});

router.get('/login', function(req, res, next){
	var outputPath = url.parse(req.url).pathname;
	// console.log(outputPath)
	return res.render('login', { 
		user: req.user
	});
});

router.post('/login', upload.array(), passport.authenticate('local'), function(req, res, next) {
	var outputPath = url.parse(req.url).pathname;
	// console.log(outputPath)
	req.session.userId = req.user._id;
	req.session.loggedin = req.user.username;
	req.session.username = req.user.username;
    res.redirect('/api/publish')
});

router.get('/logout', function(req, res) {
	var outputPath = url.parse(req.url).pathname;
	// console.log(outputPath)
	
	req.session.username = null;
	req.session.userId = null;
	req.session.zoom = null;
	req.session.loggedin = null;
	req.logout();
	if (req.user || req.session) {
		req.user = null;
		req.session.destroy(function(err){
			if (err) {
				req.session = null;
				//improve error handling
				return res.redirect('/');
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
	var outputPath = url.parse(req.url).pathname;
	// console.log(outputPath)
	req.session.username = null;
	// var arp = spawn('arp', ['-a']);
	// //console.log(arp.stdio[0].Pipe)
	// var mac;
	// arp.stdout.on('data', function(data){
	// 	data += '';
	// 	data = data.split('\n');
	// 	mac = data[0].split(' ')[3];
	// })
	// // Configure API parameters 
	// const params = {
	// 	wifiAccessPoints: [{
	// 		macAddress: ''+mac+'',
	// 		signalStrength: -65,
	// 		signalToNoiseRatio: 40
	//     }]
	// };
	
	var loc;
	var info;
	// Get data 
	async.waterfall([
		function(next){
			// geolocation(params, function(err, data) {
			// 	if (err) {
			// 		console.log ('Could not find your location');
					loc = null;
					info = 'Could not find your location'
				// } else {
				// 	loc = JSON.parse(JSON.stringify({ lng: data.location.lng, lat: data.location.lat }))
				// 	info = 'Publish something'
				// }
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
		if (req.session.zoom) {
			zoom = req.session.zoom
			//lat = req.session.lat
			//lng = req.session.lng
			info = 'Refreshed'
		} else {
			zoom = 3
			
		}

		if (req.isAuthenticated()) {
			return res.render('publish', {
				loggedin: req.session.loggedin,
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

router.post('/zoom/:zoom', function(req, res, next){
	var outputPath = url.parse(req.url).pathname;
	// console.log(outputPath)
	var zoom = parseInt(req.params.zoom, 10);
	req.session.zoom = zoom;
	//req.session.lat = lat;
	//req.session.lng = lng;
	return res.send('ok')
})


router.all('/mydata/:zoom/:lat/:lng', function(req, res, next){
	var outputPath = url.parse(req.url).pathname;
	// console.log(outputPath)
	Content.find({}, function(err, doc){
		if (err) {
			return next(err)
		}
		return res.json(doc)
	})
});

router.get('/near', function(req, res, next){
	var outputPath = url.parse(req.url).pathname;
	// console.log(outputPath)
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
	geolocation(params, function(err, data) {
		if (err) {
			console.log ('Could not find your location');
			return res.redirect('/')
		} else {
			loc = JSON.parse(JSON.stringify({ lng: data.location.lng, lat: data.location.lat }))
		}
		Content.find({}, function(err, data){
			if (err) {
				return next(err)
			}
			if (req.isAuthenticated()) {
				return res.render('publish', {
					loggedin: req.session.loggedin,
					data: data,
					id: data.length - 1,
					zoom: req.session.zoom?req.session.zoom:6,
					lng: loc.lng,
					lat: loc.lat
				})
			} else {
				return res.render('publish', {
					data: data,
					id: data.length - 1,
					zoom: req.session.zoom?req.session.zoom:6,
					lng: loc.lng,
					lat: loc.lat
				})
			}
		})
	});
})
router.all('/near/:zoom/:lat/:lng', function(req, res, next){
	var outputPath = url.parse(req.url).pathname;
	// console.log(outputPath)
	Content.find({geometry:{$near:{$geometry:{type:'Point', coordinates:[req.params.lng, req.params.lat]},$minDistance:0,$maxDistance:24000}}}, function(err, doc){
		if (err) {
			return next(err)
		}
		return res.json(doc)
	})
})

router.all('/type/:cat/:zoom/:lat/:lng', function(req, res, next){
	var outputPath = url.parse(req.url).pathname;
	// console.log(outputPath)
	var cat = req.params.cat;
	Content.find({'properties.cat': cat}, function(err, doc){
		if (err) {
			return next(err)
		}
		return res.json(doc)
	})
});
router.get('/focus/:id/:zoom/:lat/:lng', function(req, res, next){
	var outputPath = url.parse(req.url).pathname;
	// console.log(outputPath)
	var outputPath = url.parse(req.url).pathname;
	var id = parseInt(req.params.id, 10);
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
			//if (req.params.lat === null || req.params.lat === 'null') {
				lat = doc.geometry.coordinates[1]
				lng = doc.geometry.coordinates[0]
			//}
			var datarray = [];
			for (var l in data) {
				datarray.push(data[l])
			}
			if (req.isAuthenticated()) { 
					return res.render('publish', {
						loggedin: req.session.loggedin,
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
					id: id,
					doc: doc,
					lat: lat,
					lng: lng,
					info: ':)'
				})
			}		
		})						
	})
})
router.post('/focus/:id/:zoom/:lat/:lng', function(req, res, next){
	var outputPath = url.parse(req.url).pathname;
	// console.log(outputPath)
	var id = parseInt(req.params.id, 10);
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
			var datarray = [];
			for (var l in data) {
				datarray.push(data[l])
			}
			return res.json(doc)
		})						
	})	
})

router.get('/listing/:id/:zoom/:lat/:lng', function(req, res, next){
	var outputPath = url.parse(req.url).pathname;
	// console.log(outputPath)
	var id = parseInt(req.params.id, 10)
	var zoom = req.params.zoom;
	var lat = req.params.lat;
	var lng = req.params.lng;
	req.session.zoom = zoom;
	req.session.lat = lat;
	req.session.lng = lng;
	Content.findOne({_id: id}, function(err, doc){
		if (err) {
			return next(err)
		}
		return res.json(doc)				
	})	
})

router.post('/list/:id/:zoom/:lat/:lng', function(req, res, next){
	var outputPath = url.parse(req.url).pathname;
	// console.log(outputPath)
	var id = parseInt(req.params.id, 10)
	var zoom = req.params.zoom;
	var lat = req.params.lat;
	var lng = req.params.lng;
	req.session.zoom = zoom;
	req.session.lat = lat;
	req.session.lng = lng;
	Content.findOne({_id: id}, function(err, doc){
		if (err) {
			return next(err)
		}
		return res.json(doc)				
	})
	
})


router.all('/search/:term', function(req, res, next){
	var outputPath = url.parse(req.url).pathname;
	// console.log(outputPath)
	var term = req.params.term;
	var regex = new RegExp(term);
	Content.find({'properties.label': { $regex: regex }}, function(err, pu){
		if (err) {
			return next(err)
		}
		if (!err && pu.length === 0) {
			var key = 'properties.'+term+'';
			var query = {}
			query[key] = true;
			Content.find(query, function(er, doc){
				if (er) {
					return next(err)
				}
				if (!err && pu === null) {
					return ('none')
				}
				return res.json(doc)
			})			
		} else {
			return res.json(pu)			
		}
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
					hours = str.split(';').join('-')
				} else {
					
					hours = str.split('_').join('-')
				}
			} else {
				hours = str
			}
			var result = separateHourFromMin(hours)
			return result;
			
		} else {
			var hours;
			if (str.split('&')[1] !== undefined) {
				hours = str.split(' & ').join('-');
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
	var outputPath = url.parse(req.url).pathname;
	// console.log(outputPath)
	req.session.username = req.user.username;
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
					console.log ('Could not find your location');
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
							for (var i = 0; i < importjson.length; i++) {
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
										//this could come in handy as app improves, but not currently in use:
										current: false,
										//for hours of operation
										website: importjson[i].properties.website,
										cat: importjson[i].properties.type,
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
										console.log('save error: '+err);  // handle errors!
										//next(err, info)
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
			if (req.session.zoom) {
				zoom = req.session.zoom
				lat = req.session.lat
				lng = req.session.lng
				info = 'Refreshed'
			} else {
				zoom = 3
				lat = loc[1]
				lng = loc[0]
			}
			return res.render('publish', {
				loggedin: req.session.loggedin,
				username: req.session.username,
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
	var outputPath = url.parse(req.url).pathname;
	// console.log(outputPath)
	var id = parseInt(req.params.id, 10);
	Content.remove({_id: id}, function(e, doc){
		if (e) {
			console.log('delete error: '+e)
			return next(e);
		}
		Content.findOneAndUpdate({_id: {$gte:id}}, {$inc:{_id:-1}}, function(err, doc){
			if (err){
				return next(err)
			}
			Content.find({}, function(error, data){
				if (error) {
					return next(error)
				}
				var datarray = [];
				for (var l in data) {
					datarray.push(data[l])
				}
				return res.render('publish', {
					loggedin: req.session.loggedin,
					username: req.session.username,
					id: datarray.length - 1,
					zoom: (req.session.zoom)?req.session.zoom:6,
					data: datarray,
					lng: data[0].geometry.coordinates[0],
					lat: data[0].geometry.coordinates[1],
					info: 'Deleted'
				})
			})
		})
	})
})

router.get('/api/editcontent/:id', function(req, res, next){
	var outputPath = url.parse(req.url).pathname;
	// console.log(outputPath)
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
				loggedin: req.session.loggedin,
				username: req.session.username,
				id: id,
				zoom: (req.session.zoom)?req.session.zoom:6,
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
	var outputPath = url.parse(req.url).pathname;
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
								console.log(outputPath)

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
			keys.splice(keys.indexOf('img', 1))
			next(null, id, thumburl, imgurl, body, keys)
		},
		function(id, thumburl, imgurl, body, keys, next) {
			var type;
			
			if (keys.indexOf('b') !== -1) {
				type = 'B'
			}
			if (keys.indexOf('f') !== -1) {
				type = 'F'
			}
			if (keys.indexOf('h') !== -1) {
				type = 'H'
			}
			if (keys.indexOf('m') !== -1) {
				type = 'M'
			}
			
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
				cat: type,
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
			loggedin: req.session.loggedin,
			username: doc.username,
			id: parseInt(id, 10),
			zoom: (req.session.zoom)?req.session.zoom:6,
			doc: doc,
			data: datarray,
			lng: loc[0],
			lat: loc[1],
			info: ':)'
		})
	})	
})

router.get('/api/addfeature/:zoom/:lat/:lng', function(req, res, next) {
	var outputPath = url.parse(req.url).pathname;
	// console.log(outputPath)

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
				loggedin: req.session.loggedin,
				username: req.session.username,
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
	var outputPath = url.parse(req.url).pathname;
	// console.log(outputPath)
	return res.send(req.file.path)
});

router.post('/api/addcontent/:id', upload.array(), function(req, res, next){
	var outputPath = url.parse(req.url).pathname;
	// console.log(outputPath)
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
			var type;
			
			if (keys.indexOf('b') !== -1) {
				type = 'B'
			}
			if (keys.indexOf('f') !== -1) {
				type = 'F'
			}
			if (keys.indexOf('h') !== -1) {
				type = 'H'
			}
			if (keys.indexOf('m') !== -1) {
				type = 'M'
			}
			
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
					cat: type,
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
			loggedin: req.session.loggedin,
			username: req.session.loggedin,
			id: id,
			zoom: (req.session.zoom)?req.session.zoom:6,
			doc: entry,
			data: datarray,
			lng: loc[0],
			lat: loc[1],
			info: ':)'
		})
	})	
})


module.exports = router;