var express = require('express');
var passport = require('passport');
var router = express.Router();
var url = require('url');
var fs = require('fs');
var path = require('path');
var moment = require("moment");
var asynk = require("async");
var multer = require('multer');
var mkdirp = require('mkdirp');
var spawn = require("child_process").exec;
var dotenv = require('dotenv');
var Publisher = require('../models/publishers.js');
var Content = require('../models/content.js');
var Import = require('../models/import.js');
const ShelterWatch = require('../models/shelterwatch.js');
var publishers = path.join(__dirname, '/../../..');
var upload = multer();
// var Client = require('node-rest-client').Client;
var {google} = require('googleapis');

//Todo: user remove triggers userindex $inc -1

//todo: google drive auth
function ensureApiTokens(req, res, next){
	var OAuth2 = google.auth.OAuth2;

	var authClient = new OAuth2(process.env.GOOGLE_OAUTH_CLIENTID, process.env.GOOGLE_OAUTH_SECRET, (process.env.NODE_ENV === 'production' ? process.env.GOOGLE_CALLBACK_URL : process.env.GOOGLE_CALLBACK_URL_DEV));
	/*if (!req.user) {
		return res.redirect('/login')
	}*/
	Publisher.findOne({_id: req.session.userId}).lean().exec(function(err, pu){
		if (err) {
			return next(err)
		}
		if (!pu) {
			return res.redirect('/logout')
		}
		if (!pu.google || moment(new Date()).utc().format() > moment.unix((+pu.google.created/1000)).add(5, 'months').utc().format()) {
			return res.redirect('/auth/google')
		}
		authClient.setCredentials({
			refresh_token: pu.garefresh,
			access_token: pu.gaaccess
		});
		google.options({auth:authClient})
		authClient.refreshAccessToken()
		.then(function(response){
			if (!response.tokens && !response.credentials) {
				return res.redirect('/login');
  		}
			var tokens = response.tokens || response.credentials;
			Publisher.findOneAndUpdate({_id: req.user._id}, {$set:{garefresh:tokens.refresh_token, gaaccess:tokens.access_token}}, {safe:true,new:true}, function(err, pub){
				if (err) {
					return next(err)
				}
				console.log('!!! session.gp !!!')
				console.log(req.session.gp)
				// if (req.session.importgdrive) {
					req.session.gp = {
						google_key: process.env.GOOGLE_KEY,
						scope: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.appdata', 'https://www.googleapis.com/auth/drive.metadata', 'https://www.googleapis.com/auth/drive.file'],
						//google_clientid: process.env.GOOGLE_OAUTH_CLIENTID,
						access_token: pub.gaaccess,
						picker_key: process.env.GOOGLE_KEY
					}
					req.session.authClient = true;
				// }
				return next()
			})
		})
	})
}

router.get('/importgdrive', ensureApiTokens, function(req, res, next){
	req.session.importgdrive = true;
	if (!req.session.authClient) {
		return res.redirect('/auth/google');
	}
	var OAuth2 = google.auth.OAuth2;
	Publisher.findOne({_id: req.session.userId}, function(err, pu){
		if (err) {
			return next(err)
		}
		req.session.gp = {
			google_key: process.env.GOOGLE_KEY,
			scope: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.appdata', 'https://www.googleapis.com/auth/drive.metadata', 'https://www.googleapis.com/auth/drive.file'],
			//google_clientid: process.env.GOOGLE_OAUTH_CLIENTID,
			access_token: pu.gaaccess,
			picker_key: process.env.GOOGLE_KEY
		}
		return res.redirect('/api/publish')
	})

})

// router.get('/sw', ensureApiTokens, async (req, res, next) => {
// 
// 	return res.render('publish', {
// 		gp: (req.isAuthenticated() && req.session.authClient ? req.session.gp : null),
// 	})
// 
// })

function mkdirpIfNeeded(p, cb){
	fs.access(p, function(err) {
		if (err && err.code === 'ENOENT') {
			mkdirp(p, function(err){
				if (err) {
					console.log("err", err);
				} else {
					cb()
				}
			})
		} else {
			cb()
		}
	})
	
}

function textImporter(req, str, gid, cb) {
	
	console.log(str)
	cb(str)
}
router.post('/api/importgdoc/:fileid', function(req, res, next) {
	var outputPath = url.parse(req.url).pathname;
	console.log(outputPath)
	var fileId = req.params.fileid;
	Publisher.findOne({_id: req.session.userId}, async function(err, pu){
		if (err) {
			return next(err)
		}
		var OAuth2 = google.auth.OAuth2;
		var authClient = new OAuth2(process.env.GOOGLE_OAUTH_CLIENTID, process.env.GOOGLE_OAUTH_SECRET, (process.env.NODE_ENV === 'production' ? process.env.GOOGLE_CALLBACK_URL : process.env.GOOGLE_CALLBACK_URL_DEV));
		authClient.setCredentials({refresh_token: pu.garefresh, access_token: pu.gaaccess});
		// google.options({auth:authClient})
		req.session.authClient = true;
		const sheets = google.sheets({version: 'v4', auth: authClient});
		sheets.spreadsheets.values.get({
			spreadsheetId: fileId,
			range: 'Morning & Night Log',
		}, async (err, result) => {
			if (err) return next(err);//return console.log('The API returned an error: ' + err);
			const rows = result.data.values;
			if (rows.length) {
				// let csvContent = "data:text/csv;charset=utf-8,";
				var hr = [];
				rows.forEach((row, i) => {
				
					var nullcount = 0;
					row.forEach(function(c, j){
						if (i === 0) {
							hr.push(c)
						}
						if (!c || c === 'undefined') {
							c = null;
							nullcount++;
						}
					});
					if (nullcount === row.length) {
						delete row;
					};
				});
				// rows[0].map((col, i) => rows.map(row => row[i]));
				// console.log(rows)
				const sw = await ShelterWatch.find({}).then(sw=>sw).catch(err=>next(err));
				// const latest = new Date(sw[sw.length-1]['Date']);
				// if (sw.length > 0 && latest && newRow['Date'].getFullYear() === latest.getFullYear() && newRow['Date'].getMonth() === latest.getMonth() && newRow['Date'].getDate() === latest.getDate()) {
				// 	return newRow;
				// }
				const noSwYet = sw.length === 0;
				const newRows = await rows.map((row, i) => {
					let newRow = {}
					row.forEach((c, j) => {
						if (c !== hr[j]) {
							if (hr[j] === 'Date') {
								if (c.split('/')[c.split('/').length - 1] !== '2019' || c.split('/')[c.split('/').length - 1] !== '20' || c.split('/')[c.split('/').length - 1] !== '20') {
									if (c.split('/')[c.split('/').length - 1] === '28') {
										newRow[hr[j]] = new Date(c + '/2019');
									} else if (c.split('/')[c.split('/').length - 1] === '15') {
										newRow[hr[j]] = new Date(c + '/20');
									} else {
										newRow[hr[j]] = new Date(c)
									}
								}
							} else if (hr[j] === 'Time') {
								newRow[hr[j]] = c
							} else if (/cot/i.test(c)) {
								var d = c.split(/\s{0,5}cot/ig)[0];
								newRow[hr[j]] = +d;
							} else if (/mat/i.test(c)) {
								var d = c.split(/\s{0,5}mat/ig)[0];
								console.log('mats')
								console.log(c, d)
								newRow[hr[j]] = +d;
							} else if (c === '') {
								newRow[hr[j]] = c;
							} else if (isNaN(+c)) {
								// console.log('is NaN')
								// console.log(c)
								var womens, mens, cots;
								if (/women/i.test(c)) {
									
									var women = c.split(/women|womens/i)[0].replace(',', '');
									if (isNaN(+women)) {
										var men = women.split(/men|mens/i)[0].replace(',', '');
										if (!isNaN(+men)) {
											mens = parseInt(men, 10); 
											womens = parseInt(women.split(/men|mens/i)[1].replace(',',''), 10);
											// console.log(womens)
										} else {
											// console.log(men)
										}
									} else {
										if (!isNaN(+women)) {
											womens = parseInt(women, 10);
										} else {
											// console.log(c)
										}
									}
									if (!mens) {
										// if (!womens) {
										// 	console.log(c)
										// }
										mens = parseInt(c.split(/women|womens/i)[1].replace(',','').replace('s','').split(/men|mens/i)[0], 10);
										if (isNaN(mens)) {
											mens = '';
										}
										// console.log(mens, c.split(/women|womens/i))
									}
									if (!womens) {
										newRow[hr[j]] = '';
									}
									newRow[hr[j]] = mens + womens
								} else {
									// console.log(hr[j], c)
									if (/unknown|capacity|not/i.test(c)) {
										newRow[hr[j]] = 0;
									} else if (/\d/g.test(c)) {
										var d = null;
										if (c.match(/\d/g).length > 0) {
											if (c.split(/\d/g).length > 2) {
												if (c.match(/\d/g).indexOf(c.split(/\d/g)[1]) === 1) {
													d = +c.match(/\d/g).join('')
												} else {
													d = +c.match(/\d/g)[0];
												}
											} else {
												d = +c.split(/\D/g)[0];
											}
											newRow[hr[j]] = d;
										} else {
											newRow[hr[j]] = '';
										}
									} else {
										newRow[hr[j]] = '';
									}
								}
							} else if (!isNaN(parseInt(+c, 10))) {
								// console.log(parseInt(+c, 10))
								newRow[hr[j]] = +c;
							} else {
								// console.log(c)
								newRow[hr[j]] = c;
							}
						}
					});
					if (noSwYet) {
						const swNew = new ShelterWatch(newRow);
						swNew.save(err=>next(err));
					}
					return newRow;
					
				})
				.filter(row => Object.keys(row).length > 0)
				// console.log(newRows)
				// 	// let r = row.join(',');
				// 	// csvContent += r + '\n' 
					req.session.importgdrive = false;
				const data = await Content.find({}).then(data=>data).catch(err=>next(err));
				await data.forEach(doc=>{
					if (doc.properties.cat.indexOf('H') !== -1) {
						// todo save to separate shelterwatch collection
						Content.findOneAndUpdate({_id: doc._id}, {$set:{'properties.sw': newRows}}, {new: true, safe: true}, function(err, doc){
							if (err) {
								return next(err)
							}
							// return res.json(newRows)
						})
					}
				});
				return res.status(200).send('ok')
				// return res.redirect('/');
				
					// return res.status(200).send(newRows);
					//console.log(`${row[0]}, ${row[1]}, ${row[2]}, ${row[3]}, ${row[4]}, ${row[5]}, ${row[6]}, ${row[7]}, ${row[8]}, ${row[9]}, ${row[10]}, ${row[11]}`);
				// });
			} else {
				return res.status(500).send(new Error('no rows'))
				console.log('No data found.');
			}

		});
	});
	// var fileId = req.params.fileid;
	// var now = Date.now();
	// var os = require('os');
	// var p = ''+publishers+'/pu/publishers/es/tmp';
	// mkdirpIfNeeded(p, function(){
	// 
	// 	var dest = fs.createWriteStream(''+publishers+'/pu/publishers/es/tmp/'+now+'.xlsx');
	// 	dest.on('open', function(){
	// 		var OAuth2 = google.auth.OAuth2;
	// 		Publisher.findOne({_id: req.session.userId}, async function(err, pu){
	// 			if (err) {
	// 				return next(err)
	// 			}
	// 			var authClient = new OAuth2(process.env.GOOGLE_OAUTH_CLIENTID, process.env.GOOGLE_OAUTH_SECRET, (process.env.NODE_ENV === 'production' ? process.env.GOOGLE_CALLBACK_URL : process.env.GOOGLE_CALLBACK_URL_DEV));
	// 			authClient.setCredentials({refresh_token: pu.garefresh, access_token: pu.gaaccess});
	// 			// google.options({auth:authClient})
	// 			req.session.authClient = true;
	// 			var drive = google.drive({version: 'v3', auth: authClient});
	// 
	// 			const revId = await drive.revisions.list({
	// 				fileId: fileId
	// 			}).then(function(rev){
	// 				//console.log(rev.data.revisions)
	// 				var revs = rev.data.revisions.sort(function(a,b){
	// 					if (a.modifiedTime < b.modifiedTime) {
	// 						return -1;
	// 					} else {
	// 						return 1;
	// 					}
	// 				})
	// 				return revs[revs.length-1].id;
	// 			})
	// 			.catch(function(err){
	// 				return next(err)
	// 			}) 
	// 			const rs = await drive.files.get({
	// 					fileId: fileId
	// 					,
	// 					fields: 'webViewLink'
	// 				})
	// 				.then(function(file){
	// 					console.log(file.data)
	// 					//console.log(file.downloadUrl)
	// 					var dlurl = 
	// 					//file.downloadUrl
	// 					file.data.webViewLink.split('&')[0];
	// 					//console.log(dlurl);
	// 					//https://stackoverflow.com/a/29296405/3530394
	// 					require('request').get({
	// 						url: dlurl,
	// 						encoding: null,
	// 						headers: {
	// 							Authorization: 'Bearer'+ pu.gaaccess
	// 						}
	// 					}//)
	// 					//.on('response'
	// 					, async function(error, result){
	// 						if (error) {
	// 							return next(error)
	// 						}
	// 						result.pipe(dest);
	// 						await fs.writeFileSync(''+publishers+'/pu/publishers/es/tmp/'+now+'.xslx', result.body);
	// 
	// 						// require('mammoth').extractRawText({path: ''+publishers+'/pu/publishers/es/tmp/'+now+'.xlsx'})
	// 						// .then(function(result){
	// 							// var text = result.value;
	// 							//console.log(text)
	// 							// var messages = result.messages;
	// 							//console.log(messages)
	// 							var str = result.toString();
	// 							var gid = {
	// 								fileId: fileId,
	// 								revisionId: revId
	// 							}
	// 							textImporter(req, str, gid, function(err, chind){
	// 								if (err) {
	// 									return next(err)
	// 								}
	// 								console.log('hooray')
	// 								req.session.importgdrive = false;
	// 								//console.log(req.session)
	// 								return res.status(200).send(str)
	// 								//return cbk(null, gid, chind)
	// 							})
	// 
	// 						// })
	// 						// .done()
	// 						// .then(() => {
	// 						// 
	// 						// 	// save draft to gdrive
	// 						// 	// return res.redirect('/api/exportgdriverev/'+gid.fileId+'/'+chind)
	// 						// 	//return res.status(200).send('ok')
	// 						// })
	// 						// .catch(err=>next(err));
	// 					})
	// 				})
	// 				.catch(function(err){
	// 					return next(err)
	// 				})
	// 
	// 
	// 
	// 		})
	// 	})
	// });
})





router.get('/auth/google', passport.authenticate('google', {
	scope: 
		[
			//'https://www.googleapis.com/auth/plus.login', 
			// 'https://www.googleapis.com/auth/userinfo.email', 
			'https://www.googleapis.com/auth/userinfo.profile', 
			// 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.appdata', 'https://www.googleapis.com/auth/drive.metadata', 
			'https://www.googleapis.com/auth/drive.file'
		],
		authType: 'rerequest',
		accessType: 'offline',
		prompt: 'consent',
		includeGrantedScopes: true
	}), function(req, res, next){
	return next();
});

router.get('/auth/google/callback', passport.authenticate('google', { 
	failureRedirect: '/' 
}), function(req, res, next) {
	req.session.userId = req.user._id;
	req.session.loggedin = req.user.username;
	req.session.authClient = true;
	if (!req.session.importgdrive) {
		return res.redirect('/');
		
	} else {
		return res.redirect('/importgdrive');
	}
	
});

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
		asynk.waterfall([
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
				asynk.eachSeries(qs, function(q, nxt){
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

// TODO verify if this is needed anymore
async function ensureCorrectImageDir(req, res, next) {
 const data =	await Content.find({}).then(data=>data).catch(err=>next(err));
 const rx = /(http\:\/\/pu\.bli\.sh\/maps\/images_popups)/g
 await data.forEach(doc=>{
	 
	 if (rx.test(doc.properties.thumb)) {
		 const replacethumb = doc.properties.thumb.replace(rx, '/publishers/emergencyservices/images/full/images_popups')
		 const replaceimg = doc.properties.image.replace(rx, '/publishers/emergencyservices/images/full/images_popups')
		 Content.findOneAndUpdate({'properties.thumb':  {$regex:rx}}, {$set: {'properties.thumb': replacethumb, 'properties.image': replaceimg}}, {new:true}, (err,doc) => {
			 if (err) return next(err);
		 })
	 }
 });
 return next()
}

async function convertTypeToArray(req, res, next) {
	const data =	await Content.find({}).then(data=>data).catch(err=>next(err));
	await data.forEach(async doc => {
		const cat = [doc.properties.cat];
		await Content.findOneAndUpdate({_id: doc._id}, {$set: { 'properties.cat': cat}}).then(doc => doc).catch(err => next(err));
		
	})
}

//if logged in, go to edit profile
//if not, go to global profile (home)
router.get('/'/*, ensureCorrectImageDir*/, function (req, res, next) {
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

/*
{ attributes: 
   { SHELTER_ID: 299108,
     SHELTER_NAME: 'GREATER SAINT LUKE BAPTIST CHURCH',
     ADDRESS_1: '117 WALLACE ROAD',
     CITY: 'JACKSON',
     COUNTY_PARISH: 'MADISON',
     FIPS_CODE: ' ',
     STATE: 'TN',
     ZIP: '38301',
     MAIL_ADDR_SAME_AS_PHYS_ADDR: 'NO',
     MAILING_ADDRESS_1: ' ',
     MAILING_ADDRESS_2: ' ',
     MAILING_CITY: ' ',
     MAILING_COUNTY_PARISH: ' ',
     MAILING_STATE: ' ',
     MAILING_ZIP: ' ',
     FACILITY_USAGE_CODE: 'EVAC',
     EVACUATION_CAPACITY: 100,
     POST_IMPACT_CAPACITY: 50,
     ADA_COMPLIANT: ' ',
     WHEELCHAIR_ACCESSIBLE: ' ',
     PET_ACCOMMODATIONS_CODE: ' ',
     PET_ACCOMMODATIONS_DESC: ' ',
     GENERATOR_ONSITE: ' ',
     SELF_SUFFICIENT_ELECTRICITY: ' ',
     LATITUDE: 35.64111481,
     LONGITUDE: -88.84749213,
     IN_100_YR_FLOODPLAIN: ' ',
     IN_500_YR_FLOODPLAIN: ' ',
     IN_SURGE_SLOSH_AREA: ' ',
     PRE_LANDFALL_SHELTER: ' ',
     SHELTER_CODE: 'GENERAL',
     ORG_ORGANIZATION_ID: 121505,
     ORG_ORGANIZATION_NAME: 'JACKSON AREA CHAPTER',
     ORG_MAIN_PHONE: ' ',
     ORG_FAX: ' ',
     ORG_EMAIL: ' ',
     ORG_HOTLINE_PHONE: ' ',
     ORG_OTHER_PHONE: ' ',
     ORG_ADDRESS: '1981 HOLLYWOOD DR',
     ORG_CITY: 'JACKSON',
     ORG_STATE: 'TN',
     ORG_ZIP: '38305',
     ORG_POC_NAME: ' ',
     ORG_POC_PHONE: ' ',
     ORG_POC_AFTER_HOURS_PHONE: ' ',
     ORG_POC_EMAIL: ' ',
     ORG_HOURS_OF_OPERATION: '8',
     POPULATION_CODE: 'GENERAL',
     INCIDENT_ID: 0,
     SHELTER_STATUS_CODE: 'CLOSED',
     SHELTER_OPEN_DATE: null,
     SHELTER_CLOSED_DATE: null,
     REPORTING_PERIOD: ' ',
     GENERAL_POPULATION: 0,
     MEDICAL_NEEDS_POPULATION: 0,
     OTHER_POPULATION: 0,
     OTHER_POPULATION_DESCRIPTION: ' ',
     TOTAL_POPULATION: 0,
     PET_POPULATION: 0,
     INCIDENT_NUMBER: ' ',
     INCIDENT_NAME: ' ',
     INCIDENT_CODE: ' ',
     OBJECTID: 816,
     SCORE: 100,
     STATUS: 'M',
     MATCH_TYPE: 'A',
     LOC_NAME: 'Street',
     GEOX: -88.84749213,
     GEOY: 35.64111481,
     FACILITY_TYPE: 'SHELTER',
     SUBFACILITY_CODE: 'GENPOPSHEL',
     DATA_SOURCE_ID: 0,
     ADDRESS_1_OLD: '117 WALLACE ROAD' },
  geometry: { x: -88.84749212700001, y: 35.641114813 } }

*/
router.get('/api/import', function(req, res, next){
	Import.find({}, function(err, ret){
		if (err) {
			return next(err)
		}
		Content.find({}).lean().exec(function(err, data){
			if (err) {
				return next(err)
			}
			var newk = []
			newk.push('lat')
			newk.push('lng')
			var keys = Object.keys(data[0]);
			for (var i in keys) {
				if (keys[i] === 'geometry') {
					
				} else {
					if (Object.keys(data[0][keys[i]]).length > 0 && isNaN(parseInt(Object.keys(data[0][keys[i]]) ,10))) {

						for (var j in Object.keys(data[0][keys[i]])) {
							
							var level1Key = Object.keys(data[0][keys[i]])[j]
							if (!data[0][keys[i]][level1Key]) {
								
								//newk.push(keys[i])
								//newk.push(level1Key)
							} else {
								if (!Object.keys(data[0][keys[i]][level1Key]) || !isNaN(parseInt(Object.keys(data[0][keys[i]][level1Key])[0], 10))) {
									newk.push(level1Key)
								} else {
									for (var k in Object.keys(data[0][keys[i]][level1Key])) {
										var level2Key = Object.keys(data[0][keys[i]][level1Key])[k];
										newk.push(level2Key)
									}
									
								}
							}
							
						}
					} else {
						
					}

				}
			}
			return res.render('import', {
				loggedin: req.session.loggedin,
				data: ret,
				datakeys: newk,
				info: ':)'
			})
		})
	})
})

router.post('/api/import', function(req, res, next){
	Content.find({}, function(err, data){
		if (err) {
			return next(err)
		}
		var client = new Client();
		var index = data.length;
		var body = req.body;
		var iData = body.data;
		console.log(body)
		client.get(
			'https://gis.fema.gov/arcgis/rest/services/NSS/OpenShelters/MapServer/0'+
			//'https://gis.fema.gov/arcgis/rest/services/NSS/FEMA_NSS/MapServer/5/query'+
			'/query?where=1%3D1&&outFields=*&geometryType=esriGeometryEnvelope&returnGeometry=true&f=pjson', function(dat, raw){
			if (Buffer.isBuffer(dat)){
				dat = JSON.parse(dat.toString('utf8'));
			}
			/*var keys = Object.keys(dat);
			//console.log(Object.keys(dat));
			console.log(dat.features.length)
			console.log(dat.aliases)
			//console.log(dat.features[0])
			for (var i = 0; i < dat.length; i++) {
				var entry = new Content({
					_id: index + i,
					type: "Feature",
					properties: {
						label: ,
						address1: ,
						address2: "",
						city: ,
						state: ,
						zip: ,
						phone: ,
						description: "",
						//this could come in handy as app improves, but not currently in use:
						current: false,
						//for hours of operation
						website: ,
						cat: ,
						hours: {
							mo: ,
							tu: ,
							we: ,
							th: ,
							fr: ,
							sa: ,
							su: 
						},
						image: '',
						thumb: '',
						clothing: ,
						computer: ,
						dayroom: ,
						dental: ,
						pantry: ,
						housing: ,
						meals: ,
						medical: ,
						personalcare: ,
						showers: ,
						shelter: ,
						transportation: 
					},
					geometry: {
						type: "Point",
							coordinates: [, ]
					}
				})
			}*/
			return res.redirect('/')
		})
	})
})
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
	asynk.waterfall([
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
			// });
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

router.post('/api/addsw', ensureApiTokens, upload.array(), async(req, res, next) => {
	const keys = Object.keys(ShelterWatch.schema.paths);
	let entry = {}
	await keys.forEach(key=>{
		if (key !== '_id' && key !== '__v') {
			entry[key] = (!req.body[key] ? '' : req.body[key])
		}
	});
	const sw = new ShelterWatch(entry);
	await sw.save(err=>console.log(err));
	var OAuth2 = google.auth.OAuth2;
	const pu = await Publisher.findOne({_id: req.session.userId}).then(pu=>pu).catch(err=>next(err));
	var authClient = new OAuth2(process.env.GOOGLE_OAUTH_CLIENTID, process.env.GOOGLE_OAUTH_SECRET, (process.env.NODE_ENV === 'production' ? process.env.GOOGLE_CALLBACK_URL : process.env.GOOGLE_CALLBACK_URL_DEV));
	authClient.setCredentials({refresh_token: pu.garefresh, access_token: pu.gaaccess});
	// google.options({auth:authClient})
	req.session.authClient = true;
	const sheets = google.sheets({version: 'v4', auth: authClient});
	const spreadsheetId = process.env.SPREADSHEET_ID;
	const range = 'Morning & Night Log!A91:K91';
	const majorDimension = 'ROWS';
	// const allSw = await ShelterWatch.find({}).then(sw=>sw).catch(err=>next(err));
	const v = await keys.map(k=>{
		if (k === 'Date') {
			const newDate = new Date(entry[k])
			return moment(newDate).format('M/D/YY');
		} else {
			return entry[k]
		}
	})
	const values = [  v ];
	const payload = {
		auth: authClient,
		spreadsheetId: spreadsheetId,
		range: range,
		valueInputOption: 'USER_ENTERED',
		resource: {
			majorDimension: majorDimension,
			values: values
		}
		
	}
	await sheets.spreadsheets.values.append(payload, (err, result) => {
		if (err) {
			return next(err)
		} else {
			return res.redirect('/shelterwatch')
		}
	})
})

router.get('/shelterwatch', function(req, res, next) {
	var outputPath = url.parse(req.url).pathname;
	// console.log(outputPath)
	var loc;
	var info;
	// Get data 
	asynk.waterfall([
		function(next){
					loc = null;
					info = 'Could not find your location'
				next(null, loc, info)
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
	], async function(err, loc, info, data) {
		var zoom;
		var lat = loc[1]
		var lng = loc[0]
		if (req.session.zoom) {
			zoom = req.session.zoom
			info = 'Refreshed'
		} else {
			zoom = 3
			
		}
		const sw = await ShelterWatch.find({}).then(sw=>sw).catch(err=>next(err));
		if (req.isAuthenticated()) {
			return res.render('publish', {
				owkey: process.env.OPEN_WEATHER_KEY,
				swactive: true,
				loggedin: req.session.loggedin,
				data: data,
				id: data.length - 1,
				zoom: zoom,
				lng: lng,
				lat: lat,
				info: info,
				sw: sw
			})
		} else {
			return res.render('publish', {
				owkey: process.env.OPEN_WEATHER_KEY,
				swactive: true,
				data: data,
				id: data.length - 1,
				zoom: zoom,
				lng: lng,
				lat: lat,
				info: info,
				sw: sw
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

router.get('/near', async function(req, res, next){
	var ip = require("ip");
		// var ping = spawn('ping', [ip.address()]);
		// ping.stdout.on('data', function(d){
		// 	console.log(d)
		// });
		// console.log ( ip.address(), req.headers );
		const arp = require('arp');
		// const address = require('address');
		// var network = require('network');
		// network.get_public_ip(function(err, ip) {
		// 	console.log('public ip')
		// 	console.log(err || ip); // should return your public IP address
		// })
		// network.get_private_ip(function(err, ip) {
		// 	console.log('private ip')
		// 	console.log(err || ip); // err may be 'No active network interface found'.
		// });
		// network.get_gateway_ip(function(err, ip) {
		// 	console.log('gateway ip')
		// 	console.log(err || ip); // err may be 'No active network interface found.'
		// })

		const ipa = process.env.NODE_ENV === 'production' ? req.headers['!~passenger-client-address'] : ip.address();
		const loc = await require('request-promise')({
					uri: 'https://ipinfo.io/' + ipa + '/geo?token='+process.env.IP_INFO,
					encoding: null
				}).then(response => {
					var resp = response.toString();
					console.log(resp)
					var coords = (!resp.loc ? ["40.7608","-111.8911"] : resp.loc.split(','));
					return {
						lat: parseFloat(coords[0]),
						lng: parseFloat(coords[1])
					}
				}).catch(err=>next(err));
		// arp.getMAC(ipa, (err, mac) => {
		// 
		// // address.mac('vboxnet', (err, mac) => {
		// 	console.log(mac)
		// 	const params = {
		// 		wifiAccessPoints: [{
		// 			macAddress: ''+mac+'',
		// 			signalStrength: -65,
		// 			signalToNoiseRatio: 40
		// 		}]
		// 	};
		// 	geolocation(params, function(err, loca) {
		// 		console.log(loca)
		// 		if (err) {
		// 			console.log ('Could not find your location');
		// 			console.log(err)
		// 			return res.redirect('/')
		// 		} else {
					// loc = JSON.parse(JSON.stringify({ lng: loca.location.lng, lat: loca.location.lat }))
					if (!req.session.position) req.session.position = {}
					req.session.position.lat = loc.lat;
					req.session.position.lng = loc.lng;
				// }
				console.log(loc)
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
		// 	});
		// })
		// var outputPath = url.parse(req.url).pathname;
		// // console.log(outputPath)
		// var arp = spawn('arp', ['-a']);
		// //console.log(arp.stdio[0].Pipe)
		// var mac;
		// await arp.stdout.on('data', function(data){
		// 	data += '';
		// 	data = data.split('\n');
		// 	mac = data[0].split(' ')[3];
		// });
		// console.log(mac)
		// const macaddress = await require('macaddress');
		// const mac = await macaddress.all(addr => {
		// 	console.log(addr)
		// 	return addr
		// })
		// const mac = await require('os').networkInterfaces();
		// const network = require('network-config');
		// network.interfaces((err, configs) => {
		// 	console.log(configs)
		// })
		// console.log(mac)
		// Configure API parameters 


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
	console.log(outputPath)
	var cat = req.params.cat;
	var query = {};
	if (cat === 'all') {
		query = {} 
	} else {
		query = {'properties.cat': cat} 
		
	};
	
	
	Content.find(query, function(err, doc){
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

router.get('/search', function(req, res, next) {
	return res.status(404).send(new Error('not found no params'))
})
router.post('/search', function(req, res, next) {
	return res.status(404).send(new Error('not found no params'))
})

router.post('/search/:term', async function(req, res, next){
	var outputPath = url.parse(req.url).pathname;
	// console.log(outputPath)
	var term = decodeURIComponent(req.params.term);
	if (term === '' || term === ' ') return res.status(404).send(new Error('not found no params'))
	var regex = new RegExp(term, 'gi');
	// console.log(regex, term)
	const data = await Content.find({'properties.label': { $regex: regex }}).then(data => data)
	.catch(err => console.log(err))
	var key = 'properties.'+term.toLowerCase()+'';
	var query = {}
	query[key] = true;
	const doc = await Content.find(query).then(doc=>doc)
			.catch(err=>console.log(err));
	if (doc.length === 0 && data.length === 0) {
		
		return res.status(404).send(new Error('no docs'))
	}
	var ret = [...data, ...doc];
	// console.log(ret)
	return res.json(ret)
})

function convertTime(str, cb) {
	var str_hr;
	var str_mn;
	if (!/a/i.test(str) && !/p/i.test(str)) {
		var date = moment.utc().hours(+str.split(':')[0]).minutes(+str.split(':')[1])
		// var date = new Date();
		// console.log(date)
		// date.setHours(str.split(':')[0]);
		// date.setMinutes(str.split(':')[1])
		return date;
		// return moment({ hour: str.split(':')[0], minute: str.split(':')[1] }).utc().format()
	}
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
	return moment({ hour: str_hr, minute: str_mn }).utc().format()
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

router.get('/api/publish', async (req, res, next) => {
	var outputPath = url.parse(req.url).pathname;
	// console.log(outputPath)
	req.session.username = req.user.username;
	var arp = spawn('arp', ['-a']);
	//console.log(arp.stdio[0].Pipe)
	var mac;
	await arp.stdout.on('data', function(data){
		data += '';
		data = data.split('\n');
		mac = data[0].split(' ')[3];
	}).on('error', (err)=> console.log(err))
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
	asynk.waterfall([
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
		Content.find({}).lean().exec(function(err, data){
			if (err) {
				return next(err)
			}
			var datarray = data;
			// [];
			// for (var l in data) {
			// 	datarray.push(data[l])
			// }
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
				info: info,
				gp: (req.isAuthenticated() && req.session.authClient ? req.session.gp : null)
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
	Content.findOne({_id: id}).lean().exec(function(error, doc){
		if (error) {
			return next(error)
		}
		var loc = doc.geometry.coordinates;
		Content.find({}).lean().exec(function(er, data){
			if (er) {
				return next(er)
			}
			// var datarray = [];
			// for (var l in data) {
			// 	datarray.push(data[l])
			// }
			return res.render('publish', {
				infowindow: 'edit',
				loggedin: req.session.loggedin,
				username: req.session.username,
				id: id,
				zoom: (req.session.zoom)?req.session.zoom:6,
				doc: doc,
				data: data,
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
	
	asynk.waterfall([
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
			var type = [];
			
			if (keys.indexOf('b') !== -1) {
				type.push('B')
			}
			if (keys.indexOf('f') !== -1) {
				type.push('F')
			}
			if (keys.indexOf('h') !== -1) {
				type.push('H')
			}
			if (keys.indexOf('m') !== -1) {
				type.push('M')
			}
			// console.log(body)
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
				clothing: (body.clothing || body.clothing === 'on' ? true : false),
				computer: (body.computer || body.computer === 'on' ? true : false),
				dayroom: (body.dayroom || body.dayroom === 'on' ? true : false),
				dental: (body.dental || body.dental === 'on' ? true : false),
				pantry: (body.pantry || body.pantry === 'on' ? true : false),
				housing: (body.housing || body.housing === 'on' ? true : false),
				meals: (body.meals || body.meals === 'on' ? true : false),
				medical: (body.medical || body.medical === 'on' ? true : false),
				personalcare: (body.personalcare || body.personalcare === 'on' ? true : false),
				showers: (body.showers || body.showers === 'on' ? true : false),
				shelter: (body.shelter || body.shelter === 'on' ? true : false),
				transportation: (body.transportation || body.transportation === 'on' ? true : false)
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

	Content.find({}).lean().exec(function(er, data){
			if (er) {
				return next(er)
			}
			// var datarray = [];
			// for (var l in data) {
			// 	datarray.push(data[l])
			// }
			return res.render('publish', {
				infowindow: 'new',
				loggedin: req.session.loggedin,
				username: req.session.username,
				id: data.length - 1,
				zoom: req.params.zoom,
				data: data,
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
	
	asynk.waterfall([
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
			var type = [];
			
			if (keys.indexOf('b') !== -1) {
				type.push('B')
			}
			if (keys.indexOf('f') !== -1) {
				type.push('F')
			}
			if (keys.indexOf('h') !== -1) {
				type.push('H')
			}
			if (keys.indexOf('m') !== -1) {
				type.push('M')
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
					clothing: (body.clothing || body.clothing === 'on' ? true : false),
					computer: (body.computer || body.computer === 'on' ? true : false),
					dayroom: (body.dayroom || body.dayroom === 'on' ? true : false),
					dental: (body.dental || body.dental === 'on' ? true : false),
					pantry: (body.pantry || body.pantry === 'on' ? true : false),
					housing: (body.housing || body.housing === 'on' ? true : false),
					meals: (body.meals || body.meals === 'on' ? true : false),
					medical: (body.medical || body.medical === 'on' ? true : false),
					personalcare: (body.personalcare || body.personalcare === 'on' ? true : false),
					showers: (body.showers || body.showers === 'on' ? true : false),
					shelter: (body.shelter || body.shelter === 'on' ? true : false),
					transportation: (body.transportation || body.transportation === 'on' ? true : false)
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