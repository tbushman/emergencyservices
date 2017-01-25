var map;
map = new L.map('map', { //Leaflet map
  	zoomControl: true,
  	center: [40.7, -111.8], //For now, map opens on slc
  	zoom: 11,
	minZoom: 2,
  	maxZoom: 18
});
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map)
//console.log(map);
//Mapbox option (courtesy acct tbushman)
//var options3 = {
//	attribution: 'Map tiles by <a href="http://mapbox.com/">Mapbox</a><a href="http://cartodb.com/attributions"</a>'
//};
//	L.tileLayer('http://{s}.tiles.mapbox.com/v3/tbushman.iba1gl27/{z}/{x}/{y}.png', options3).addTo(map); //Mapbox Terrain Attribution

//L.tileLayer('https://dnv9my2eseobd.cloudfront.net/v3/cartodb.map-4xtxp73f/{z}/{x}/{y}.png', options3).addTo(map);
//L.tileLayer('http://{s}.tiles.mapbox.com/v3/tbushman.1pnqxgvi/{z}/{x}/{y}.png').addTo(map); //slc transit