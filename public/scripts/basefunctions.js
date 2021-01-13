var baseFunctions = {
	isResponsive: function() {
		return (window.innerWidth < 600)
	},
	parseObj: function(obj) {
		if (!obj) return '';
		return obj;
	},
	parseBool: function(item) {
		if (!item) return false;
		return true;
	},
	ifNullThenArr: function(obj) {
		if (!obj) return [];
		return obj;
	},
	resizeFrame: function(e) {
		var self = this;
		self.wWidth = window.innerWidth;
		self.wHeight = window.innerHeight;
		self.pWidth = (self.wWidth > 600 ? self.wWidth / 2 : self.wWidth);
		self.pHeight = self.wHeight / 2;
		self.btn.x = self.wWidth / 2;
		self.btn.y = self.wHeight / 2;
		self.dPath = self.dPathAttr();
		var graph = document.getElementById('graph');
		if (graph && self.sw) {
			graph.innerHTML = ''
			self.sw.sort(function(a, b) { return b.Date - a.Date; });
			self.generateGraph(self.sw);
		}
		else if (graph && self.doc && self.doc.properties.sw && self.doc.properties.sw.length > 0) {
			graph.innerHTML = ''
			self.sw = self.doc.properties.sw;
			self.sw.sort(function(a, b) { return b.Date - a.Date; });
			self.generateGraph(self.sw);
		}
	},
	drop: function(code, e) {
		var self = this;
		var cd = self.dropped[code];
		
		self.dropped[code] = !cd;
	},
	subDropdown: function(e) {
		var self = this;
		if (!$(e.target).next('.slidedown')) {
	
			return;
		} else {
			var sub = $(e.target).next('.slidedown')[0];
			//- console.log(e.target.nextSibling)
			//- console.log(sub)
			$('.drop').not($(e.target)).removeClass('active');
			$(sub).slideToggle(100);
			$(e.target).toggleClass('active');
		}
	},
	mainDropdown: function(e) {
		var self = this;
		if ($('.dropdown').hasClass('active')) {
			$('.dropdown').removeClass('active');
		} else {
			$('.dropdown').addClass('active');
		}
		$('.submenu.drop').slideToggle(100);
	},
	switchSwedit: function() {
		var self = this;
		var swedit = self.swedit;
		self.swedit = !swedit;
		if (self.swedit && self.swedit === true) {
			var slcut = encodeURIComponent('84101,us');
			// $.getJSON('https://api.openweathermap.org/data/2.5/weather?zip='+slcut+'&units=imperial&appid='+self.owkey, function(result){
			// 	console.log(result)
			// })
			$.ajax({
				type: "GET",
				url: 'https://api.openweathermap.org/data/2.5/weather?zip='+slcut+'&units=imperial&appid='+self.owkey,
				dataType: "json",
				success: function (result, status, xhr) {
					console.log(result)
					var temp = result["main"]["temp"];
					var temp_min = result["main"]["temp_min"];
					$('#temp').val(temp);
					$('#temp_low').val(temp_min);
				},
				error: function (xhr, status, error) {
					alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
				}
			});
		}
	},
	switchSwactive: function() {
		var self = this;
		var swactive = self.swactive;
		self.swactive = !swactive;
	},
	processImage: function () {
		var self = this;
		var dataurl = null;
		var filesToUpload = document.getElementById('media').files;
		var file = filesToUpload[0];
		var imagefile = file.type;
		console.log(file.name)
		var imageTypes= ["image/jpeg","image/png","image/jpg"];
		if(imageTypes.indexOf(imagefile) == -1) {
			$("#info").html("<span class='msg-error'>Please Select A valid Image File</span><br /><span>Only jpeg, jpg, and png types allowed</span>");
			return false;
	 
		} else {
			img = document.getElementById('return');
			var reader = new FileReader();
			reader.onloadend = function(e) {
				var maxWidth = 1200 ;
				var maxHeight = 1200 ;
				img.src = e.target.result;
				img.onload = function () {
	 
					var w = img.width;
					var h = img.height;
					var can = $('#canvas')[0];
					self.checkImage(can, w, h, maxWidth, maxHeight)
				}
			}
			reader.readAsDataURL(file);
		}
	},
	
	reSize: function (can, w, h, maxWidth, maxHeight){
		var self = this;
		can.height = h*0.75;
		can.width = w*0.75;
	
		var can2 = document.createElement('canvas');
		can2.width = w*0.75;
		can2.height = h*0.75;
		var ctx2 = can2.getContext('2d');
		ctx2.drawImage(img, 0, 0, w*0.75, h*0.75);
		var ctx = can.getContext('2d');
		ctx.drawImage(can2, 0, 0, w*0.75, h*0.75, 0, 0, w*0.75, h*0.75);
		w = w*0.75;
		h = h*0.75;
		img.width = w;
		img.height = h;
		self.checkImage(can, w, h, maxWidth, maxHeight)
	},
	checkImage: function (can, w, h, maxWidth, maxHeight) {
		var self = this;
		if (h > maxHeight) {
			console.log('half')
			reSize(can, w, h, maxWidth, maxHeight)
		} else {
			if (maxHeight === 200) {
				self.drawThumb(can, w, h)
			} else {
				self.drawImage(can, w, h)
			}
		}
	},	
	
	drawImage: function (can, w, h) {
		var self = this;
		can.height = h;
		can.width = w;
		var ctx = can.getContext('2d');
		ctx.drawImage(img, 0, 0, w, h);
		if (!HTMLCanvasElement.prototype.toBlob) {
		 Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
		  value: function (callback, type, quality) {
	 
		    var binStr = atob( this.toDataURL(type, quality).split(',')[1] ),
		        len = binStr.length,
		        arr = new Uint8Array(len);
	 
		    for (var i = 0; i < len; i++ ) {
		     arr[i] = binStr.charCodeAt(i);
		    }
	 
		    callback( new Blob( [arr], {type: type || 'image/png'} ) );
		  }
		 });
		}
		can.toBlob(function(blob) {
			var fd = new FormData();
	 
			fd.append("img", blob);
	 
			uploadurl = '/api/uploadmedia/'+id+'/jpeg';
	 
			console.log(blob)
			console.log(uploadurl)
			$.ajax({
				url: uploadurl,
				type: 'POST',
				data: fd,
				processData: false,
				contentType: false,
				success: function(response) { 
					img.src = response.replace('/var/www/pu', '').replace('/Users/traceybushman/Documents/pu.bli.sh/pu', '');
					img.onload = function () {
						$('#inputimg').val(response.replace('/var/www/pu', '').replace('/Users/traceybushman/Documents/pu.bli.sh/pu', ''))
						var can = $('#canvas')[0];
						var maxWidth = 200 ;
						var maxHeight = 200 ;
						var w = img.width;
						var h = img.height;
						self.checkImage(can, w, h, maxWidth, maxHeight);
					}
				}
			})
		}, 'image/jpeg', 0.95);
	},
	drawThumb: function (can, w, h) {
		var self = this;
		can.height = h;
		can.width = w;
		var ctx = can.getContext('2d');
		ctx.drawImage(img, 0, 0, w, h);
		dataurl = can.toDataURL("image/jpeg", 0.8);
		setTimeout(function(){
	 
			$('#inputthumb').val(dataurl.replace(/data:image\/jpeg;base64,/, ''))
	 
		}, 100)
	},
	searchThis: function(e) {
		var self = this;
		// e.preventDefault();
		var term = e.target.value;
		console.log(term)
		if (term !== '' && term !== ' ') {
			$.post('/search/'+encodeURIComponent(term)+'').then(function(response){
				console.log(response)
				if (!$('.searchbox')) {
					
				} else {
					$('.searchbox').slideUp(100);
					$('.searchbox').remove();
				}
				
				$(e.target).parent().append('<div id="dropdown" class="searchbox"></div>')
				if (response == 'none') {
					$('.searchbox').slideDown(200);
					$('.searchbox').append('<p class="drop ms-Grid-col ms-u-sm12">No results</p>')
				}
				for (var i in response) {
					$('.searchbox').slideDown(200);
					$('.searchbox').append('<a class="drop ms-Grid-col ms-u-sm12" href="/focus/'+response[i]._id+'/'+6+'/'+response[i].geometry.coordinates[1]+'/'+response[i].geometry.coordinates[0]+'"><span class="ms-font-l">'+response[i].properties.label+'</span></a>')
				}
			})
			.catch(function(err){
				console.log(err)
			})
		}
	},
	onGapiLoad: function() {
		var self = this;
		// console.log(gapi)
		self.initPicker(self.gp.access_token)
	},
	initPicker: function(authresult) {
		var self = this;
		
				gapi.load('picker', {
					callback: function() {
						self.createPicker(authresult);
					},
					onerror: function() {
						alert('gapi.client failed to load!');
					},
					timeout: 5000, // 5 seconds.
					ontimeout: function() {
						alert('gapi.client could not load in a timely manner!');
					}
				});

	},
	// Create and render a Picker object for picking user Photos.
	createPicker: function(authresult) {
		// console.log(authresult)
		var self = this;
		if (self.gp && self.gp.access_token) {
			var picker = new google.picker.PickerBuilder().
				addView(google.picker.ViewId.SPREADSHEETS).
				setOAuthToken(authresult).
				setDeveloperKey(self.gp.picker_key).
				setCallback(self.pickerCallback).
				build();
			picker.setVisible(true);
		}
	},
	// A simple callback implementation.
	pickerCallback: function (data) {
		var self = this;
		// google.picker.Response.ACTION
		var url = 'nothing';
		if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
			var doc = data[google.picker.Response.DOCUMENTS][0];
			url = doc[google.picker.Document.URL];
			console.log(doc);
			self.initGdocFileUploader(doc, 'doc');
			//self.initGdriveRevisionGetter(doc);
		}
	},
	initGdriveRevisionGetter: function(file){
		var self = this;
		console.log(file)
		$.post('/api/importgdriverev/'+file.id, function(err, doc){
			
			window.location.href = '/'
		})
		

		
	},
	initGdocFileUploader: function(file, type){
		var self = this;
		
		$.post('/api/importgdoc/'+file.id, function(data){
			console.log(data);
			// self.generateGraph(data)
			window.location.href = '/shelterwatch'
		})
	},
	generateGraph: function(data){
		var self = this;
		data = data.filter(function(d){return d['Date'] && d['Date'] !== undefined})
		var minyears = new Date(data[0].Date).getFullYear();
		var maxyears = new Date(data[data.length-1].Date).getFullYear();
		var yearstimesdays = (maxyears - minyears) * 365
		if (yearstimesdays === 0) {
			yearstimesdays = 365
		}
		
		// set the dimensions and margins of the graph
		var margin = {top: 20, right: 20, bottom: 50, left: 25},
		barWidth = (self.pWidth - 50) * 0.05,
		width = (yearstimesdays * barWidth)  - (margin.left + margin.right),
		//self.pWidth - margin.left - margin.right,
		height = self.pHeight - (margin.top + margin.bottom + 50);

		console.log(yearstimesdays, barWidth, width)
		// parse the date / time
		var parseDate = d3.utcParse("%Y-%m-%dT%H:%M:%S.%LZ");
		var parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S.%LZ");
		var color = d3.scaleOrdinal(["#3D7AB4","#E79404","#229701","#DA1912"]
			// d3.schemeCategory10
		);
		// var colorD = d3.map(["Geraldine King","Mens Shelter","Gail Miller","Overflow Center"], function(d) { return d });
		
		// 
		color.domain(['Geraldine King','Mens Shelter','Gail Miller','Overflow Center']);

		var svg = d3.select("#graph").append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform",
			"translate(" + margin.left + "," + margin.top + ")");
		// set the ranges
		var xScale = d3.scaleTime().range([0, width]);
		var yScale = d3.scaleLinear().range([height, 0]);
		var xAxis = d3.axisBottom(xScale).ticks(d3.timeDay.every(7))
		//.ticks(d3.timeDay.filter(d => d3.timeDay.count(0, d) % 10 === 0));
		var yAxis =  d3.axisLeft(yScale);
		// console.log(Object.keys(data[0]))
		
		var stack = d3.stack()
			.keys(['Geraldine King','Mens Shelter','Gail Miller','Overflow Center'])
			.order(d3.stackOrderNone)
			.offset(d3.stackOffsetNone);
		
		var adjustedData = data.map(function(d){
			if (d['Gail Miller (Men)'] >= 0 && d['Gail Miller (Women)'] >= 0 && d['Gail Miller'] === '') {
				d['Gail Miller'] = parseInt(d['Gail Miller (Men)'], 10) + parseInt(d['Gail Miller (Women)'], 10)
			}
			return d
		})
		var layers= stack(adjustedData);
		console.log(layers)
		xScale.domain(d3.extent(data, function(d) { return parseDate(d.Date); }));
		yScale.domain(
			[0, d3.max(data, function(d) {
			return d['Geraldine King'] })]
		);

		var layer = svg.selectAll(".layer")
			.data(layers)
			.enter().append("g")
			.attr("class", "layer")
			.style("fill", function(d, i) { return color(d.key); });

			layer.selectAll("rect")
				.data(function(d) { return d; })
				.enter().append("rect")
				.attr("x", function(d) { 
					// console.log(d)
					return xScale(parseTime(d.data.Date)); 
				})
				.attr("y", function(d) { return (!isNaN(+d[1]) ? yScale(d[1]) : 0); })
				.attr("height", function(d) { return (!isNaN(+d[0]) && !isNaN(+d[1]) ? (yScale(d[0]) - yScale(d[1])) : 0 )  })
				.attr("width", function(d){
					return barWidth
					// var combinedMargins = (width - margin.left - margin.right) / (2 * d.values.length)
					// return ((width - margin.left - margin.right) / data.length) - 8;
				});

		var legend = svg.selectAll('.legend')
			.data(layers)
			.enter()
			.append('g')
			.attr('class', 'legend');

			legend.append('rect')
				.attr('x', width - 200)
				.attr('y', function(d, i) {
					return (!isNaN((i*20)) ? (i * 20) : 0);
				})
				.attr('width', 10)
				.attr('height', 10)
				.style('fill', function(d) {
					return color(d.key);
				});

			legend.append('text')
				.attr('x', width - 180)
				.attr('y', function(d, i) {
					return (!isNaN(((i * 20) + 9)) ? ((i * 20) + 9) : 0);
				})
				.text(function(d) {
					return d.key;
				})
				.style('fill', 'black');
			
			svg.append("g")
			.attr("class", "axis axis--x")
			.attr("transform", "translate(0," + (height+5) + ")")
			.call(xAxis);

			svg.append("g")
			.attr("class", "axis axis--y")
			.attr("transform", "translate(0,0)")
			.call(yAxis);

		// var mouseG = svg.append("g")
		// 	.attr("class", "mouse-over-effects");
		// 
		// 	mouseG.append("path") // this is the black vertical line to follow mouse
		// 		.attr("class", "mouse-line")
		// 		.style("stroke", "black")
		// 		.style("stroke-width", "1px")
		// 		.style("opacity", "0");
		// 
		// var lines = document.getElementsByClassName('layer');
		// 
		// var mousePerLine = mouseG.selectAll('.mouse-per-line')
		// 	.data(layers)
		// 	.enter()
		// 	.append("g")
		// 	.attr("class", "mouse-per-line");
		// 
		// mousePerLine.append("circle")
		// 	.attr("r", 7)
		// 	.style("stroke", function(d) {
		// 		return color(d.key);
		// 	})
		// 	.style("fill", "none")
		// 	.style("stroke-width", "1px")
		// 	.style("opacity", "0");
		// 
		// mousePerLine.append("text")
		// 	.attr("transform", "translate(10,3)");
		// 
		// var mouse;
		// mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
		// 	.attr('width', width) // can't catch mouse events on a g element
		// 	.attr('height', height)
		// 	.attr('fill', 'none')
		// 	.attr('pointer-events', 'all')
		// 	.on('mouseout', function() { // on mouse out hide line, circles and text
		// 		d3.select(".mouse-line")
		// 			.style("opacity", "0");
		// 		d3.selectAll(".mouse-per-line circle")
		// 			.style("opacity", "0");
		// 		d3.selectAll(".mouse-per-line text")
		// 			.style("opacity", "0");
		// 	})
		// 	.on('mouseover', function() { // on mouse in show line, circles and text
		// 		d3.select(".mouse-line")
		// 			.style("opacity", "1");
		// 		d3.selectAll(".mouse-per-line circle")
		// 			.style("opacity", "1");
		// 		d3.selectAll(".mouse-per-line text")
		// 			.style("opacity", "1");
		// 	})
		// 	.on('mousemove', function() { // mouse moving over canvas
		// 		mouse = d3.mouse(this);
		// 		d3.select(".mouse-line")
		// 			.attr("d", function() {
		// 				var d = "M" + mouse[0] + "," + height;
		// 				d += " " + mouse[0] + "," + 0;
		// 				return d;
		// 			});
		// 
		// d3.selectAll(".mouse-per-line")
		// 	.attr("transform", function(d, i) {
		// 		var xDate = xScale.invert(mouse[0]),
		// 				bisect = d3.bisector(function(d) { return d.Date; }).right;
		// 				idx = bisect(d.values, xDate);
		// 
		// 		var beginning = 0,
		// 				end = width + margin.left + margin.right,//lines[i].getTotalLength(),
		// 				target = null;
		// 
		// 		while (true){
		// 			target = Math.floor((beginning + end) / 2);
		// 			pos = {x: mouse[0], y: mouse[1]};//lines[i].getPointAtLength(target);
		// 			if ((target === end || target === beginning) && pos.x !== mouse[0]) {
		// 					break;
		// 			}
		// 			if (pos.x > mouse[0])      end = target;
		// 			else if (pos.x < mouse[0]) beginning = target;
		// 			else break; //position found
		// 		}
		// 
		// 		d3.select(this).select('text')
		// 			.text(function(d) {
		// 				console.log(d)
		// 				return d.Date
		// 			});
		// 
		// 		return "translate(" + mouse[0] + "," + pos.y +")";
		// 	});
		// });
	}
}