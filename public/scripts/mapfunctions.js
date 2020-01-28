var mapFunctions = {
	catColor: function(cat) {
		var fillColor = null;
		switch (cat) {
			case 'all':
				//- location.reload(true)
				break;
			case 'B':
				fillColor = '#3D7AB4'
				break;
			case 'H':
				fillColor = '#E79404'
				break;
			case 'M':
				fillColor = '#DA1912'
				break;
			case 'F':
				fillColor = '#229701'
				break;
			default:
				fillColor = '#fff'
				break;
		}
		return fillColor;
	},
	panZoom: function(){
		var self = this;
		//console.log(self.map)
		if (self.map && self.latlng) {
			$.post('/panzoom/'+self.latlng.lat+'/'+self.latlng.lng+'/'+self.map.getZoom()+'', function(result){
			})
		}
		
	},
	isPointCoords: function(ll) {
		if (ll.length === 2 || ll.length === 3 && !Array.isArray(ll[0])) {
			return true
		} else 
		if (ll[0][0] && ll[0].length === 2 && !Array.isArray(ll[0][0])) {
			return true
		} else if (ll[0][0][0] && ll[0][0].length === 2 && !Array.isArray(ll[0][0][0])) {
			return true
		} else {
			return false;
		}
	},

	highlightFeature: function(go) {
		var self = this;
		if (self.buf && self.buf.length > 0) {
			self.buf.forEach(function(item){
				item.remove()
			})
		}
		if (self.isPointCoords(go.geometry.coordinates)) {
			go.geometry.coordinates.reverse()
		}
		self.buf.push(!self.isPointCoords(go.geometry.coordinates) ? 
			L.geoJSON(go, {
				style: function (feature) {
					return {color: 'tomato', interactive: false};
				}
			}).addTo(self.map) :
			L.GeoJSON.geometryToLayer(go, {
				pointToLayer: function(ft, latlng) {
					var style = {fillColor:'tomato', color:'tomato', opacity: 0.8, fillOpacity: 0.6, radius: 8, interactive: false}
					var circle = new L.CircleMarker(latlng, style)//, self.styleOf(ft, ft.geometry.type))
					return circle;
				}

			}).addTo(self.map)
		);
	},
	unHighlightFeature: function(go) {
		var self = this;
		if (self.buf && self.buf.length > 0) {
			self.buf.forEach(function(item){
				item.remove()
			})
		}
	},
	// onClick: function(e) {
	// 	var self = this;
	// 	zoom = self.map.getZoom();
	// 	var center = self.map.getCenter();
	// 	var latlng = self.clicked;
	// 	var lng = self.clicked.lng;
	// 	var lat = self.clicked.lat;
	// 	// console.log($(e.originalEvent.explicitOriginalTarget))
	// 	var d = $(e.originalEvent.explicitOriginalTarget).attr('d').split('a')[0];
	// 	var dxm = d.split(',')[0]
	// 	var dx = parseInt(dxm.replace('M', ''), 10);
	// 	var dy = parseInt(d.split(',')[1], 10);
	// 	var rangex = [dx-8, dx-7, dx-6, dx-5, dx-4, dx-2, dx-1, dx, dx+1, dx+2, dx+3, dx+4, dx+5, dx+6, dx+7, dx+8];
	// 	var rangey = [dy-8, dy-7, dy-6, dy-5, dy-4, dy-2, dy-1, dy, dy+1, dy+2, dy+3, dy+4, dy+5, dy+6, dy+7, dy+8];
	// 
	// 	var grid = [[]];
	// 	for (var x = 0; x < rangex.length; x++) {
	// 		grid[x] = [];
	// 		for (var y = 0; y < rangey.length; y++) {
	// 			grid[x][y] = 'M' + rangex[x] + ',' + rangey[y]
	// 		}
	// 	}
	// 	// console.log(rangex, rangey, grid)
	// 	var that = $(document).find($("path[d^='"+d+"']"))
	// 	// console.log(d, that)
	// 	var list = 0;
	// 	var bounds = [];
	// 	$('.list > .ms-Grid > .ms-Panel-contentInner').html('')
	// 	for (var i in grid) {
	// 		for (var j in grid[i]) {
	// 			var indexes = []
	// 			for (var k = 0; k < $('#map').find($("path[d^='"+grid[i][j]+"']")).length; k++) {
	// 				if ($('#map').find($("path[d^='"+grid[i][j]+"']")[k]).attr('class') !== undefined) {
	// 					list++;
	// 					var classi = $('#map').find($("path[d^='"+grid[i][j]+"']")[k]).attr('class');
	// 					var id = classi
	// 					$.ajax({
	// 						url: '/list/'+id+'/'+zoom+'/'+lat+'/'+lng+'',
	// 						processData: false,
	// 						contentType: false,
	// 						type: 'POST',
	// 						success: function(data){
	// 							$('.list > .ms-Grid > .ms-Panel-contentInner').append('<a href="/focus/'+data._id+'/14/'+data.geometry.coordinates[1]+'/'+data.geometry.coordinates[0]+'" class="ms-Grid-col ms-u-sm12"><span class="ms-font-l">'+data.properties.label+'</span></a>')
	// 							self.map.setView([data.geometry.coordinates[1], data.geometry.coordinates[0]])
	// 							self.lMarker.remove()
	// 						}
	// 					});
	// 				} else {
	// 
	// 				}
	// 
	// 			}
	// 
	// 		}												
	// 	}
	// 
	// 	if (list > 1) {
	// 		console.log(list)
	// 		$('.list').css({display: 'block'})
	// 		$('.list > .ms-Panel-main').css({display: 'block'})
	// 		$('.list').addClass("is-open");
	// 		$('.listheader').remove()
	// 		$('.list > .ms-Grid > .ms-Panel-contentInner').prepend('<p class="ms-font-s listheader ms-fontWeight-semibold">'+list+' features nearby:</p>');
	// 		var center = self.map.getCenter();
	// 		var lat = center.lat;
	// 		var lng = center.lng;
	// 		self.map.setView([lat, lng])
	// 		self.map.dragging.disable();
	// 		self.map.touchZoom.disable();
	// 		self.map.doubleClickZoom.disable();
	// 		self.map.scrollWheelZoom.disable();
	// 		self.map.boxZoom.disable();
	// 		self.map.keyboard.disable();
	// 		if (self.map.tap) self.map.tap.disable();
	// 		document.getElementById('map').style.cursor='default';
	// 		$('.list > .js-togglePanel').css('pointer-events', 'auto')
	// 		console.log(bounds)
	// 	} else {
	// 		if (list === 0) {
	// 			self.map.setView([self.position.lat, self.position.lng])
	// 			//clicked = {lat: self.position.lat, lng: self.position.lng}
	// 		} else {
	// 			var id = $(e.target).attr('class').split(' ')[0];
	// 			var center = self.map.getCenter();
	// 			lat = center.lat;
	// 			lng = center.lng;
	// 			console.log(id)
	// 			$.post('/focus/'+id+'/14/'+lat+'/'+lng+'').done(function(result){
	// 				var lat = result.geometry.coordinates[1];
	// 				var lng = result.geometry.coordinates[0];
	// 
	// 				window.location.href = '/focus/'+id+'/14/'+lat+'/'+lng+''
	// 			})
	// 		}
	// 	}
	// },
	//- arrayEqArray(arr1, arr2)
	setView: function(feature, id, latlng, e){
		var self = this;
		self.geo = []
		if (self.buf && self.buf.length > 0) {
			self.buf.forEach(function(item){
				item.remove()
			})
		}
		self.buf = [];
		self.wWidth = window.innerWidth;
		self.wHeight = window.innerHeight;
		if (!latlng) {
			console.log('no latlng')
			if (self.isPointCoords(feature.geometry.coordinates)) {
				feature.geometry.coordinates.reverse();
			} else {
				console.log(feature)
			}
			var bf = L.geoJSON(feature).addTo(self.map);
			latlng = //self.map.latLngToContainerPoint(
				bf.getBounds().getCenter()
			//);
			bf.remove()
		}
		var cp = self.map.latLngToContainerPoint(latlng);
		var x1 = cp.x-30;
		var y1 = cp.y-30;
		var x2 = cp.x+30;
		var y2 = cp.y+30;
		var northWest = self.map.containerPointToLatLng(L.point(x1,y1));//L.latLng(y1,x1);
		var southEast = self.map.containerPointToLatLng(L.point(x2,y2));//L.latLng(y2,x2);
		var bounds = L.latLngBounds(northWest, southEast)//[[x1,y1],[x2,y2]];
		var buf = L.rectangle(bounds, {fill: 'rgba(255,255,255,0.5)', color: 'rgba(255,255,255,0.5)', interactive: false }).addTo(self.map)//L.featureGroup([L.circle(p1), L.circle(p2)]).addTo(self.map);
		var ll2 = (!latlng ? bounds.getCenter() : latlng);
		var keys;
		var vals;
		// if (!self.dataLayer._layers && self.lyr[id]) {
		// 	vals = self.lyr[id];
		// } else {
			console.log('clicking dataLayer')
			vals = self.dataLayer;
		// }
		self.filterViewerList(bounds, ll2, feature, id/*, keys*/, vals, buf)
		
		
	},
	filterViewerList: async function(ll1, ll2, feature, id/*, keys*/, vals, buf) {
		var self = this;
		var latlng = ll2;
		// console.log(ll1, ll2, feature, id, vals, buf)
		if (self.dataLayer) {
			var counter = 0;
			self.geo = await self.data
			.filter(function(ft, j){
				// ft._id = id
				var bff = L.geoJSON(ft).addTo(self.map);
				latlng = bff.getBounds().getCenter();
				var lltcp = self.map.latLngToContainerPoint(latlng);
				var cptll = self.map.containerPointToLatLng(lltcp);
				latlng = cptll;
				bff.remove();
				if (ll1.contains(cptll)) {
					// console.log(cptll, ll1)
					var bf = L.GeoJSON.geometryToLayer(ft, {
						pointToLayer: function(ft, latlng) {
							var style = {fillColor:'tomato', color:'tomato', opacity: 0.8, fillOpacity: 0.6, radius: 8, interactive: false}
							var circle = new L.CircleMarker(latlng, style)//, self.styleOf(ft, ft.geometry.type))
							return circle;
						}

					}).addTo(self.map)
					self.buf[counter] = bf;
					counter++
				} else {
				}
				return ll1.contains(cptll);
			})
			if (self.geo && self.geo.length > 0) {
				if (ll1._southWest && self.geo.length > 1) {
					// self.map.fitBounds(ll1);
					console.log(self.geo[0])
					var mark = L.latLngBounds(ll1).getCenter();
					self.map.panTo(mark);
					self.lMarker.setLatLng(mark);
					self.lMarker.setOpacity(1);
				} else {
					self.map.panTo(L.latLngBounds(ll1).getCenter());
					self.lMarker.setLatLng(L.latLngBounds(ll1).getCenter());
					window.location.href = '/focus/'+self.geo[0]._id+'/14/'+self.geo[0].geometry.coordinates[1]+'/'+self.geo[0].geometry.coordinates[0]+''
					// window.location.href = 
				}

				// self.btn.x = (self.wWidth/2);
				// self.btn.y = (self.wHeight/2);

			} else {
				console.log(ll1, latlng)
				self.viewerList = false;
				self.geo = [];

			}
			if (counter === 0) {
				self.geo = [];
				self.viewerList = false;
			}
			// if (self.geo.length > 0) {
			// 	self.viewerList = true;
			// } else {
			// 	console.log('no geo?')
			// 	self.viewerList = false;
			// }

			if (buf) {
				if (self.buf && self.buf.length){
					self.buf.forEach(function(b){
						if (typeof b.remove === 'function') {
							b.remove();
						}
					})
				} 
				setTimeout(function(){
					self.buf = [];
					buf.remove()
				},3000)
			}
		}
		
	}

	 /*Leaflet requires reversed geo-coordinate (lat, lng)*/,
	loadMap: async function(cb) {
		var self = this;
		var dataLayer;
		var dataCoords;
		console.log(window.location.href.split('/'), parseFloat(window.location.href.split('/')[window.location.href.split('/').length - 2]))
		var lat = (/focus/.test(window.location.href) ? parseFloat(window.location.href.split('/')[window.location.href.split('/').length - 2]) : (!self.position || !self.position.lat ? 40.7608 : self.position.lat));
		var lng = (/focus/.test(window.location.href) ? parseFloat(window.location.href.split('/')[window.location.href.split('/').length - 1]) : (!self.position || !self.position.lng ? -111.8910 : self.position.lng));
		var zoom = (/focus/.test(window.location.href) ? parseInt(window.location.href.split('/')[window.location.href.split('/').length - 3], 10) : (!self.position || !self.position.zoom ? 6 : self.position.zoom));
		var map = new L.map('map', { 
			center: [
				lat,
				lng
			], 
			zoom: zoom,
			// zoomControl: false,
			minZoom: 2,
			maxZoom: 18,
			// editable: true,
			// renderer: L.canvas(),
			// preferCanvas: true,
			// editOptions: {
			// 	skipMiddleMarkers: true
			// }
		});
		// L.control.zoom({
		// 	position:'topleft'
		// }).addTo(map);
		
		self.map = map;
		self.tileLayer = L.tileLayer(self.baseMaps[self.base].url, {renderer: L.canvas({padding:0.5}), bounds: self.map.getBounds().pad(1000), attribution: self.baseMaps[self.base].attribution}).addTo(self.map);
		cb(self.map.getCenter())

	},

	changeBase: function(i, e) {
		var self = this;
		if (e.target.checked) {
			self.base = i
			self.tileLayer.remove();
			self.tileLayer = L.tileLayer(self.baseMaps[self.base].url, {renderer: L.canvas({padding:0.5}), bounds: self.map.getBounds().pad(1000), attribution: self.baseMaps[self.base].attribution}).addTo(self.map);
		}

	},
	rePan: function(href) {
		var self = this;
		if( /focus/.test(href)) {
			setTimeout(function(){
				var mll = self.lMarker.getLatLng();
				self.map.panTo(mll);
			}, 500);
		}
	},
	dPathAttr: function() {
		var self = this;
		if (self.btn) {// make central clipping svg d value reactive
			// console.log(window.innerWidth)
		var wW = ( !self.wWidth ? window.innerWidth : self.wWidth ), 
		wH = ( !self.wHeight ? window.innerHeight : self.wHeight ), 
		pW = ( !self.pWidth ? ( wW * (self.res?0.5:0.5) ) : self.pWidth ), 
		pH = ( !self.pHeight ? (wH * (self.res?0.5:0.5) ) : self.pHeight ), 
		r = self.btn.r, cRc = (r * 0.5523), cRr = 0.81, 
		sY = (isNaN(self.btn.y)?(wH*(self.res?0.5:0.5)):self.btn.y);
		var str =`M${wW},${wH}H0V0h${wW}V${wH}z 
		M${(wW - pW) + r},${sY}c0-${cRc}-${(cRc * cRr)}-${r}-${r}-${r}
			c-${cRc},0-${r},${(cRc * cRr)}-${r},${r} 
		c0,${cRc},${(cRc * cRr)},${r},${r},${r}
			C${(wW - pW) + cRc},${(sY+r)},${(wW - pW)+r},${(sY + cRc)},
			${((wW - pW) + r)},${sY}z`
		return str; }
	},
	resetView: function() {
		var self = this;
		self.doc = '';
		self.geo = []// window.location.href = '/'
	}
}
