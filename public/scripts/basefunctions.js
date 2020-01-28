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
		self.pWidth = self.wWidth / 2;
		self.pHeight = self.wHeight / 2;
		self.btn.x = self.wWidth / 2;
		self.btn.y = self.wHeight / 2;
		self.dPath = self.dPathAttr()
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
		if (!$('.searchbox')) {
			
		} else {
			$('.searchbox').slideUp(100);
			$('.searchbox').remove();
		}
		var term = $(e.target).val();
		console.log(term)
		$.get('/search/'+term+'').done(function(response){
			console.log(response)
			
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
	},
	onGapiLoad: function() {
		var self = this;
		console.log(gapi)
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
		console.log(authresult)
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
			// window.location.href = '/'
		})
	},
	generateGraph: function(data){
		// set the dimensions and margins of the graph
		var margin = {top: 20, right: 20, bottom: 30, left: 50},
		width = 960 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;

		// parse the date / time
		var parseDate = d3.utcParse("%Y-%m-%dT%H:%M:%S.%LZ");
		var parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S.%LZ");
		var color = d3.scaleOrdinal(d3.schemeCategory10);
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
		var xAxis = d3.axisBottom(xScale);
		var yAxis =  d3.axisLeft(yScale);
		// console.log(Object.keys(data[0]))
		
		var stack = d3.stack()
			.keys(['Geraldine King','Mens Shelter','Gail Miller','Overflow Center'])
			.order(d3.stackOrderNone)
			.offset(d3.stackOffsetNone);
	
		var layers= stack(data);
		console.log(layers)
		data.sort(function(a, b) { return b.Date - a.Date; });
		xScale.domain(d3.extent(data, function(d) { return parseDate(d.Date); }));
		yScale.domain(
			[0, d3.max(data, function(d) {
			return d['Gail Miller'] })]
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
					console.log(d)
					return xScale(parseTime(d.data.Date)); 
				})
				.attr("y", function(d) { return yScale(d[1]); })
				.attr("height", function(d) { return yScale(d[0]) - yScale(d[1]); })
				.attr("width", function(){
					return ((width - margin.left - margin.right) / data.length) - 20;
				});

			var legend = svg.selectAll('.legend')
				.data(layers)
				.enter()
				.append('g')
				.attr('class', 'legend');

			legend.append('rect')
				.attr('x', width - 200)
				.attr('y', function(d, i) {
					return i * 20;
				})
				.attr('width', 10)
				.attr('height', 10)
				.style('fill', function(d) {
					return color(d.key);
				});

			legend.append('text')
				.attr('x', width - 180)
				.attr('y', function(d, i) {
					return (i * 20) + 9;
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
		
		


		
		
		
		
		
		
		
		
		
		
		// var valueLine1 = //["Geraldine King","Mens Shelter","Gail Miller","Overflow Center"].map(function(key) {
		// 	d3.line()
		// 	.x(function(d) { return x(parseTime(d.Date)); })
		// 	.y(function(d) { 
		// 		var ret = (!isNaN(+d["Geraldine King"]) ? d["Geraldine King"] : 0)
		// 		return y(ret); 
		// 	});
		// //});
		// var valueLine2 = d3.line()
		// .x(function(d) { return x(parseTime(d.Date)); })
		// .y(function(d) { 
		// 	var ret = (!isNaN(+d["Mens Shelter"]) ? d["Mens Shelter"] : 0)
		// 	return y(ret); });
		// var valueLine3 = d3.line()
		// .x(function(d) { return x(parseTime(d.Date)); })
		// .y(function(d) { 
		// 	var ret = (!isNaN(+d["Gail Miller"]) ? d["Gail Miller"] : 0)
		// 	return y(ret); });
		// var valueLine4 = d3.line()
		// .x(function(d) { return x(parseTime(d.Date)); })
		// .y(function(d) { 
		// 	var ret = (!isNaN(+d["Overflow Center"]) ? d["Overflow Center"] : 0)
		// 	return y(ret); });
		// // append the svg obgect to the body of the page
		// // appends a 'group' element to 'svg'
		// // moves the 'group' element to the top left margin
		// var svg = d3.select("#graph").append("svg")
		// 	.attr("width", width + margin.left + margin.right)
		// 	.attr("height", height + margin.top + margin.bottom)
		// 	.append("g")
		// 	.attr("transform",
		// 	"translate(" + margin.left + "," + margin.top + ")");
		// 
		// 	// Scale the range of the data
		// x.domain(d3.extent(data, function(d) { return parseTime(d.Date); }));
		// y.domain([0, d3.max(data, function(d) {
		// 	return d['Gail Miller'] })]);
		// 
		// svg.append("path")
		// .data([data])
		// .attr("class", "line")
		// .style("stroke", function(d){ return color("Geraldine King")})
		// .attr("d", valueLine1);
		// svg.append("path")
		// .data([data])
		// .attr("class", "line")
		// .style("stroke", function(d){ return color("Mens Shelter")})
		// .attr("d", valueLine2);
		// svg.append("path")
		// .data([data])
		// .attr("class", "line")
		// .style("stroke", function(d){ return color("Gail Miller")})
		// .attr("d", valueLine3);
		// svg.append("path")
		// .data([data])
		// .attr("class", "line")
		// .style("stroke", function(d){ return color("Overflow Center")})
		// .attr("d", valueLine4);
		// // Add the X Axis
		// svg.append("g")
		// .attr("transform", "translate(0," + height + ")")
		// .call(d3.axisBottom(x));
		// 
		// // Add the Y Axis
		// svg.append("g")
		// .call(d3.axisLeft(y));


		// var self = this;
		// var w = 250;
		// var h = 200;
		// // set up size
		// var margin = { top: 10, right: 10, bottom: 20, left: 10 };
		// var width = w - margin.left - margin.right;
		// var height = h - margin.top - margin.bottom;
		// 
		// var color = d3.scaleOrdinal(d3.schemeCategory10);
		// var colorD = d3.map(Object.keys(data[0]), function(d) { return d });
		// 
		// color.domain(colorD);
		// var svg = d3.select('#graph')
		// .append('svg')
		// .attr('width', width + margin.left + margin.right)
		// .attr('height', height + margin.top + margin.bottom);
		// console.log(svg)
		// var g = svg
		// .append('g')
		// .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
		// 
		// var minVal = d3.min(data, function(c) { return c['Gail Miller']; });
		// var maxVal = d3.max(data, function(c) { return c['Gail Miller']; });
		// var minDate = d3.min(data, function(c) { return new Date(c.Date); });
		// var maxDate = d3.max(data, function(c) { return new Date(c.Date); });
		// 
		// var x = d3.scaleTime().range([0, width]);
		// var y = d3.scaleLinear().range([height, 0]);
		// 
		// var line = d3.line()
		// .x(function (d, i) {
		// 	return x(new Date(d.Date));
		// })
		// .y(function (d, i) {
		// 	return y(d['Gail Miller']);
		// });
		// 
		// x.domain(
		// 	[minDate, maxDate]
		// );
		// y.domain(
		// 	[minVal,maxVal]
		// );
		// 
		// var xAxis = d3.axisBottom(x);
		// 
		// g.append('g').attr('class', 'x axis')
		// .attr('transform', 'translate(0,' + height + ')')
		// .call(xAxis);
		// g.append('g').attr('class', 'y axis')
		// .call(d3.axisLeft(y));
		// 
		// var serie = g.selectAll(".line")
		// 		.data(data)
		// 	.enter().append("g")
		// 		.attr("class", "serie");
		// 
		// serie.append("path")
		// 		.attr("class", "line")
		// 		.style("stroke", function(d, i) { return color(d[Object.keys(data[0])[i]]); })
		// 		.attr("d", d3.line()
		// 				.x(function(d) { return x(d.Date); })
		// 				.y(function(d) { return y(d['Geraldine King']); }));

	}
}