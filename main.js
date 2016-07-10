function initiate_geolocation() {
		
	$('#apikey').val('');
	$('#map').html('');
	navigator.geolocation.getCurrentPosition(handle_geolocation_query);

};

function handle_geolocation_query(position){

	var lat = position.coords.latitude;
	console.log(lat);
	var lon = position.coords.longitude;
	console.log(lon);
	var geom = $('#the_geom');
	geom.val(''+lat+','+lon + '');
	var the_geom = geom.val();
	
	var latinput = $('#lat');
	latinput.val(''+lat+'');
	var loninput = $('#lon');
	loninput.val(''+lon+'');
	
	main();
}

$('#geolocate').click(initiate_geolocation); //form submit button
$('#map').click(function(e){ //click on map to close gallery
	var mainlabel = $('#mainlabel');
	mainlabel.removeClass('search');
	mainlabel.removeClass('point');
	mainlabel.removeClass('expand');
	mainlabel.removeClass('list');
	mainlabel.addClass('point');
	$('#mainlabel').css('width',  'auto');
	$('lightbox').html('');
	$('#map').css('z-index', '0');
});

//Global vars from hidden html form
var user_id = $("#user_id").val();
console.log(user_id);
var table_name = $("#table_name").val();
console.log(table_name);
var json_url = $("#json_url").val();
console.log(json_url);
$('input:checkbox').change(function() {

	
	if($(this).is(':checked')) {
		
		var id = $(this).attr('id');
		$("#"+id+"").val(id.replace('available_'+'_', ' '));
	}
	else {
		
		$(this).val(''+[]+'');
	}
	
}); 

$('#close').click(main);
$('#all').hide(); //Button 'ALL' is not used in the form
$('.button').click(function(){

  	$('.button').removeClass('selected');
   	$(this).addClass('selected');
	$('btn').removeClass('activebutton');
	var radio = $(this).attr('id');
	console.log(radio);
	$('input#'+radio+'').click();
	$('input:radio').change(function() {

		if($(this).is(':checked')) {

			$('.button '+radio).css('display', 'inline-block');
			var radio = $(this).attr('id');
			$('#typeinput').val(radio);
		}
		else {

			$('.button '+radio).css('display', 'none');
			$('#typeinput').val(''+[]+'');
		}

	});
});

function main() {	

	
	$('#all').show();
	
	var lattest = $('#lat').val();
	
	if (lattest != null) {
		
		var lat = $('#lat').val();
		var lon = $('#lon').val();
		//return;

	} else {
		
		var lat = 40.7;
		var lon = -111.8;
		//return;
		
	}
	console.log(lat);
	console.log(lon);
	var geom = $('#the_geom');
	geom.val(''+lon+','+lat + '');
	
	// vars from html form values
	var image = $('#image').val();//working on implementing an image importer. User submits an image url instead.

	var type = $('#typeinput').val();
	console.log(type);
	var the_geom = $('#the_geom').val();
	var name = $("#fname").val();
	console.log(name);
	var address = $('#address').val();
	console.log(address);
	var place = $("#place").val();
	console.log(place);
	var state = $("#state").val();
	console.log(state);
	var phone = $("#phone").val();
	console.log(phone);
	var zip = $("#zip").val();
	console.log(zip);
	var website = $("#website").val();
	console.log(website);
	var mondaybegin = $("#mondaybegin").val();
	console.log(mondaybegin);
	var tuesdaybegin = $("#tuesdaybegin").val();
	console.log(tuesdaybegin);
	var wednesdaybegin = $("#wednesdaybegin").val();
	console.log(wednesdaybegin);
	var thursdaybegin = $("#thursdaybegin").val();
	console.log(thursdaybegin);
	var thursdaybegin = $("#mondaybegin").val();
	console.log(thursdaybegin);
	var fridaybegin = $("#fridaybegin").val();
	console.log(fridaybegin);
	var saturdaybegin = $("#saturdaybegin").val();
	console.log(saturdaybegin);
	var sundaybegin = $("#sundaybegin").val();
	console.log(sundaybegin);
	var mondayend = $("#mondayend").val();
	console.log(mondayend);
	var tuesdayend = $("#tuesdayend").val();
	console.log(tuesdayend);
	var wednesdayend = $("#wednesdayend").val();
	console.log(wednesdayend);
	var thursdayend = $("#thursdayend").val();
	console.log(thursdayend);
	var thursdayend = $("#mondayend").val();
	console.log(thursdayend);
	var fridayend = $("#fridayend").val();
	console.log(fridayend);
	var saturdayend = $("#saturdayend").val();
	console.log(saturdayend);
	var sundayend = $("#sundayend").val();
	console.log(sundayend);
	
	var available_computer_access = $('#available_computer_access').val();
	var available_day_room = $("#available_day_room").val();
	var available_dental_services = $("#available_dental_services").val();
	var available_food_pantry = $("#available_food_pantry").val();
	var available_housing_assistance = $("#available_housing_assistance").val();
	var available_meals = $("#available_meals").val();
	var available_medical_services = $("#available_medical_services").val();
	var available_personal_care_items = $("#available_personal_care_items").val();
	var available_showers = $("#available_showers").val();
	var available_shelter = $("#available_shelter").val();
	var available_transportation_assistance = $("#available_transportation_assistance").val();
	
	var apikey = $('#apikey').val();
	var sql_post = "INSERT INTO "+table_name+" (type, label, address, image, website, available_computer_access, available_day_room, available_dental_services, available_food_pantry, available_housing_assistance, available_meals, available_medical_services, available_personal_care_items, available_showers, available_shelter, available_transportation_assistance, hours_monday, hours_tuesday, hours_wednesday, hours_thursday, hours_friday, hours_saturday, hours_sunday, the_geom) VALUES ('"+type+"', '"+name+"', '"+address+"', '"+image+"', '"+website+"', '"+available_computer_access+"', '"+available_day_room+"', '"+available_dental_services+"', '"+available_food_pantry+"', '"+available_housing_assistance+"', '"+available_meals+"', '"+available_medical_services+"', '"+available_personal_care_items+"', '"+available_showers+"', '"+available_shelter+"', '"+available_transportation_assistance+"', '"+mondaybegin+"-"+mondayend+"', '"+tuesdaybegin+"-"+tuesdayend+"', '"+wednesdaybegin+"-"+wednesdayend+"', '"+thursdaybegin+"-"+thursdayend+"', '"+fridaybegin+"-"+fridayend+"', '"+saturdaybegin+"-"+saturdayend+"', '"+sundaybegin+"-"+sundayend+"', ST_SetSRID(ST_MakePoint("+the_geom+"), 4326) )";
	var url = "https://"+user_id+".cartodb.com/api/v2/sql?q="+sql_post+"&api_key="+apikey+"";
	

		
	$.post(url).fail(function() { //SQL post will fail if api key not present in form, then return to create map.
	    //alert( "error" );
		var mainlabel = $('#mainlabel');
		mainlabel.html('');
		mainlabel.removeClass('search');
		mainlabel.removeClass('point');
		mainlabel.removeClass('expand');
		mainlabel.removeClass('list');	
		return;
	});

	var zoom = 11;
	var map;
	map = new L.map('map', { //Leaflet map
	  	zoomControl: true,
	  	center: [''+lat+'', ''+lon+''],
	  	zoom: zoom,
		minZoom: 2,
	  	maxZoom: 14
	});
	//console.log(map);
	//Mapbox option (courtesy acct tbushman)
	var options3 = {
		attribution: 'Map tiles by <a href="http://mapbox.com/">Mapbox</a><a href="http://cartodb.com/attributions"</a>'
	};  
	L.tileLayer('http://{s}.tiles.mapbox.com/v3/tbushman.iba1gl27/{z}/{x}/{y}.png', options3).addTo(map); //Mapbox Terrain Attribution
	//L.tileLayer('http://{s}.tiles.mapbox.com/v3/tbushman.1pnqxgvi/{z}/{x}/{y}.png').addTo(map); //slc transit
	// Clear the sublayers
	var sublayers = [];
	cartodb.createLayer(map, json_url)
	.addTo(map)
	.on('done', function(layer){

		var subLayerOptions = {
		sql: "SELECT * FROM "+table_name+"",
		interactivity: 'cartodb_id'
		}
		// When the layers inputs change fire this
	    var sublayer = layer.getSubLayer(0);
		addCursorInteraction(sublayer);
		sublayer.setInteraction(true);
		sublayers.push(sublayer);

		var sql = new cartodb.SQL({ user: ''+user_id+'' });

		$('.button').click(function(e, latlon, pxPos, data, layer) {

	       	$('.button').removeClass('selected');
	       	$(this).addClass('selected');
	       	LayerActions[$(this).attr('id')] ();
		});	
		$('.button#all').click();//Fit bounds of all records
		
	});	
	//#ID actions
	var LayerActions = { 
		cdbid: function() { LayerSelect("SELECT * FROM emergency_services WHERE cartodb_id = '"+data.cartodb_id+"'") },
		all: function() { LayerSelect("SELECT * FROM emergency_services") },
		H: function() { LayerSelect("SELECT * FROM emergency_services WHERE type = 'H'") },
		B: function() { LayerSelect("SELECT * FROM emergency_services WHERE type = 'B'") },
		M: function() { LayerSelect("SELECT * FROM emergency_services WHERE type = 'M'") },
		F: function() { LayerSelect("SELECT * FROM emergency_services WHERE type = 'F'") },
	};


	function LayerSelect(sql_select) {

		var sql_init = new cartodb.SQL({ user: ''+user_id+'' });
		sql_init.getBounds(sql_select).done(function(bounds){

		   	var zoom = map.getZoom(zoom);
		   	console.log(zoom);
	 		map.fitBounds(bounds);

			uiActions(sql_select);

		});
		sublayers[0].setSQL(sql_select);					
		return true;
	};
	function uiActions(sql_get) {

		var sql_init = new cartodb.SQL({ user: ''+user_id+'' });
		sql_init.execute(sql_get).done(function(ret){

			var item = ret.rows[0];
			console.log(item);
			var lat = item.lat;
		   	delete item.lat;
		   	var lon = item.lon;
		   	delete item.lon;
		   	var zoom = map.getZoom(zoom);
			var size = zoom*1.5;
			console.log(size);
			var latlong = new L.LatLng(lat, lon);
			console.log(latlong);
			var resolution = size*20;

			map.setView(latlong, zoom+1); //zoom to single feature


			var mainlabel = $('#mainlabel');
			mainlabel.html('');
			mainlabel.removeClass('search');
			mainlabel.removeClass('point');
			mainlabel.removeClass('expand');
			mainlabel.removeClass('list');
			mainlabel.addClass('point');
			mainlabel.show();
			//'#mainlabel' becomes a map tooltip

			var cdbid = item.cartodb_id;

			var label = item.label;
			var website = item.website;
			var image = item.image;
			var phone = item.phone;
			var address = item.address;
	      	var monday = item.hours_monday;
	      	var tuesday = item.hours_tuesday;
	      	var wednesday = item.hours_wednesday;
	      	var thursday = item.hours_thursday;
	      	var friday = item.hours_friday;
	      	var saturday = item.hours_saturday;
	     	var sunday = item.hours_sunday;

			var header = $('<text><h1 class="title">'+label+'</h1><lightbox></lightbox><infobox><info><contact><h2>'+phone+'</h2><p>'+address+'</p></contact></info><hours><wrapper><day><mo><h5>Mo:</h5></mo><tu><h5>Tu:</h5></tu><we><h5>We:</h5></we><thu><h5>Th:</h5></thu><fr><h5>Fr:</h5></fr><sa><h5>Sa:</h5></sa><su><h5>Su:</h5></su></day><times><mo><h5>' + monday + '</h5></mo><tu><h5>' + tuesday + '</h5></tu><we><h5>' + wednesday + '</h5></we><thu><h5>' + thursday + '</h5></thu><fr><h5>' + friday + '</h5></fr><sa><h5>' + saturday + '</h5></sa><su><h5>' + sunday + '</h5></su></times></wrapper></hours></infobox></text><leftlist><list><ul id="services"></ul></list></leftlist><rightlist><list><ul id="nearby"></ul></list></rightlist><images><a href="#'+cdbid+'" class="items pic" id="'+cdbid+'"><img src="'+image+'"></img></a></images>');
			$('#mainlabel').append(header); //Single feature attribute appendage
			$('h2:empty').remove();
			$('p:empty').remove();

	      	var clothing = item.available_clothing;
	      	var computer = item.available_computer_access;
	      	var day = item.available_day_room;
	      	var dental = item.available_dental_services;
	      	var food = item.available_food_pantry;
	      	var housing = item.available_housing_assistance;
	      	var meals = item.available_meals;
	      	var medical = item.available_medical_services;
	      	var personal = item.available_personal_care_items;
	      	var showers = item.available_showers;
	      	var shelter = item.available_shelter;
	      	var trans = item.available_transportation_assistance;

	      	$('#services').append('<li>' +clothing +'</li><li>' + computer +'</li><li>' +day+'</li><li>' +dental+'</li><li>' +food+'</li><li>' +housing+'</li><li>' +meals+'</li><li>' +medical+'</li><li>' +personal+'</li><li>' +showers+'</li><li>' +shelter+'</li><li>' +trans+'</li>');
			$('li:empty').remove();
			i = 0;
			var services = $('#services li');
			if ( services.length > 0 ) {

				$('leftlist').prepend('<a href="#"><h6>'+services.length+' services offered:</h6></a>');
				$('#services').hide();

			}
			$('leftlist > a').click(function(){

				var mainlabel = $('#mainlabel');
				mainlabel.removeClass('search');
				mainlabel.removeClass('point');
				mainlabel.removeClass('expand');
				mainlabel.removeClass('list');
				mainlabel.addClass('expand');
				$('lightbox').html('');
				$('#mainlabel').css('width',  'auto');
				$('#services').show();

			});
			var sql_init = new cartodb.SQL({ user: ''+user_id+'' });
			//pixel distance from selected feature sql query
			var bounds_select = "select cartodb_id, label, image, phone, address, zip, hours_monday, hours_tuesday, hours_wednesday, hours_thursday, hours_friday, hours_saturday, hours_sunday ,available_clothing, available_computer_access, available_day_room, available_dental_services, available_food_pantry, available_housing_assistance, available_meals, available_medical_services, available_personal_care_items, available_showers, available_shelter, available_transportation_assistance from "+table_name+" where st_distance( the_geom, st_GeomFromText('POINT("+lon+" "+lat+")', 4326), true ) < (SELECT CDB_XYZ_Resolution("+zoom+")*(("+zoom+")*1.15)) ";
			//query for euclidian nearby features
			sql_init.execute(bounds_select).done(function(ret) {

				var list = ret.rows;
				i = 0;

				if (list.length > 0) {

					$('rightlist').prepend('<a href="#"><h6>'+list.length+' services nearby:</h6></a>');
					for (i in list) {

						var item = ret.rows[i];
						$('#nearby').append('<li><a href="#'+item.cartodb_id+'" id="'+item.cartodb_id+'" class="cartodb_id"><h5>'+item.label+'</h5><h6>'+item.phone+'</h6></a></li>');

					}
					$('rightlist > a').click(function(){

						var mainlabel = $('#mainlabel');
						mainlabel.removeClass('search');
						mainlabel.removeClass('point');
						mainlabel.removeClass('expand');
						mainlabel.removeClass('list');
						mainlabel.addClass('expand');
						$('lightbox').html('');
						$('#mainlabel').css('width',  'auto');
						$('#nearby').show();

						$('.cartodb_id').click(function(e, latlon, pxPos, data, layer) {

							var cdbid = [$(this).attr('id')];
							var sql_get = 'select cartodb_id, label, image, phone, address, zip, hours_monday, hours_tuesday, hours_wednesday, hours_thursday, hours_friday, hours_saturday, hours_sunday ,available_clothing, available_computer_access, available_day_room, available_dental_services, available_food_pantry, available_housing_assistance, available_meals, available_medical_services, available_personal_care_items, available_showers, available_shelter, available_transportation_assistance, ST_X(the_geom) lon, ST_Y(the_geom) lat FROM '+table_name+' WHERE cartodb_id='+cdbid+'';
							uiActions(sql_get);

						});
					});
					$('#nearby').hide();

				}				

			});

			$('.pic').click(function(e){

				var mainlabel = $('#mainlabel');
				mainlabel.removeClass('search');
				mainlabel.removeClass('point');
				mainlabel.removeClass('expand');
				mainlabel.removeClass('list');
				mainlabel.addClass('expand');
				//gallery substrate
				$('lightbox').html('');
				$('#nearby').hide();
				$('#services').hide();
				var clicked = [$(this).attr('id')];
				var sql_init = new cartodb.SQL({ user: ''+user_id+'' });
				//get pic1 where cartodb_id = 'clicked'
				var sql_select = "SELECT cartodb_id, label, image, ST_X(the_geom) lon, ST_Y(the_geom) lat FROM "+table_name+" WHERE cartodb_id = "+ clicked +"";
				sql_init.execute(sql_select).done(function(ret){

					var item = ret.rows[0];
					var pic = item.image;
					$('lightbox').append('<img src="'+pic+'"></img>');
					var height = $('lightbox').css('height');
					var width = $('lightbox > img').css('width');
					$('#mainlabel').css('width', width);

				});
				e.preventDefault();
				return false;
			});

		});

	};

	//search///////////////////////////////////////////////////////////////////////////////////////
	$( "#input" ).autocomplete({

		source: function(request, response) { 

			var sql_search = new cartodb.SQL({ user: ''+user_id+'' });
			//ilike sql
			sql_search.execute("select cartodb_id, label, image, phone, address, zip, hours_monday, hours_tuesday, hours_wednesday, hours_thursday, hours_friday, hours_saturday, hours_sunday ,available_clothing, available_computer_access, available_day_room, available_dental_services, available_food_pantry, available_housing_assistance, available_meals, available_medical_services, available_personal_care_items, available_showers, available_shelter, available_transportation_assistance from "+table_name+" where label ilike '%" + request.term + "%' ORDER BY label ", function(ret) { 

				var list = ret.rows;

				var helplabel = $('#helplabel');
				helplabel.removeClass('one');
				helplabel.removeClass('two');
				helplabel.removeClass('three');
				helplabel.html('');
				var mainlabel = $('#mainlabel');
				mainlabel.html('');
				mainlabel.removeClass('search');
				mainlabel.removeClass('point');
				mainlabel.removeClass('expand');
				mainlabel.removeClass('list');
				mainlabel.addClass('search');

				$('#mainlabel').append('<here><h6>'+list.length + ' matching search results:</h6></here>');
	        	$('#mainlabel').append('<there><ul></ul></there>');
				var i = 0;
				for (i in list) {

					var item = ret.rows[i];
					var clicked = item.cartodb_id;

					var $listelement = $('<li><a href="#'+clicked+'" id="'+clicked+'" class="cartodb_id"><h5>'+item.label+'</h5><h6>'+item.phone+'</h6></a></li>');
					$('ul').append($listelement); //list of matching search queries
				}
				$('.cartodb_id').click(function(e, latlon, pxPos, data, layer) {

					var cdbid = [$(this).attr('id')];

					var sql_get = 'select cartodb_id, label, image, phone, address, zip, hours_monday, hours_tuesday, hours_wednesday, hours_thursday, hours_friday, hours_saturday, hours_sunday ,available_clothing, available_computer_access, available_day_room, available_dental_services, available_food_pantry, available_housing_assistance, available_meals, available_medical_services, available_personal_care_items, available_showers, available_shelter, available_transportation_assistance, ST_X(the_geom) lon, ST_Y(the_geom) lat FROM '+table_name+' WHERE cartodb_id='+cdbid+'';
					uiActions(sql_get);


				});
			});
		},	
		minLength: 2
	});

	//functions__________________________________________________________________________________________

	//////////////////////////////////////////////////////////////////////////////////////


	//DEMARCATION


	////////////////////////////////////////////////////////////////////////////////

	//*/ALWAYS KEEP THIS AT THE END, accessible by var map!!*//*/*//*/*//
	function addCursorInteraction(sublayer){

		var hovers = [];
	    //1 is the points: 'pointer' when mouse over
	    sublayer.bind('featureOver', function(e, latlon, pxPos, data, layer) {
	          hovers[layer] = 1;
	          if(_.any(hovers)) {
	            $('#map').css('cursor', 'pointer');
				$('#map').css('z-index', '0');
	          }
	    });
	    //0 is the base layer. Cursor 'auto' if mouse over
	    sublayer.bind('featureOut', function(m, layer) {
	          hovers[layer] = 0;
	          if(!_.any(hovers)) {
	            $('#map').css('cursor', 'auto');
				$('#map').css('z-index', '0');
	          }
	    });

	    //when feature clicked, move to location, then append items to sidepanel:
	    sublayer.bind('featureClick', function (e, latlon, pxPos, data, layer) {

			var mainlabel = $('#mainlabel');

			var sql_init = new cartodb.SQL({ user: ''+user_id+'' });
			var sql_select = 'select cartodb_id, label, image, phone, address, zip, hours_monday, hours_tuesday, hours_wednesday, hours_thursday, hours_friday, hours_saturday, hours_sunday ,available_clothing, available_computer_access, available_day_room, available_dental_services, available_food_pantry, available_housing_assistance, available_meals, available_medical_services, available_personal_care_items, available_showers, available_shelter, available_transportation_assistance, ST_X(the_geom) lon, ST_Y(the_geom) lat FROM '+table_name+' WHERE cartodb_id='+ data.cartodb_id ;
			sql_init.execute(sql_select).done(function(ret){

				mainlabel.html('');
				mainlabel.removeClass('search');
				mainlabel.removeClass('point');
				mainlabel.removeClass('expand');
				mainlabel.removeClass('list');
				$('images').remove();
				var item = ret.rows[0]; //return top-clicked feature attribute data
		   		var lat = item.lat;
				console.log(lat);
		   		delete item.lat;
		   		var lon = item.lon;
				console.log(lon);
		   		delete item.lon;
		   		var zoom = map.getZoom(zoom);
		   		console.log(zoom);
		 		map.setView(new L.LatLng(lat, lon), zoom+1); //zoom to top-clicked feature

				var sql_init = new cartodb.SQL({ user: ''+user_id+'' });
				//pixel distance from selected feature sql query
				var bounds_select = "select cartodb_id, label, image, phone, address, zip, hours_monday, hours_tuesday, hours_wednesday, hours_thursday, hours_friday, hours_saturday, hours_sunday ,available_clothing, available_computer_access, available_day_room, available_dental_services, available_food_pantry, available_housing_assistance, available_meals, available_medical_services, available_personal_care_items, available_showers, available_shelter, available_transportation_assistance from "+table_name+" where st_distance( the_geom, st_GeomFromText('POINT("+lon+" "+lat+")', 4326), true ) < (SELECT CDB_XYZ_Resolution("+zoom+")*(("+zoom+")*1.15)) ";
				//query for euclidian nearby features
				sql_init.execute(bounds_select).done(function(ret) {

					var list = ret.rows;

					if (list.length > 1 ) {

						var i = 0;

						mainlabel.removeClass('search');
						mainlabel.removeClass('point');
						mainlabel.removeClass('expand');
						mainlabel.removeClass('list');
						mainlabel.addClass('list');
						mainlabel.append('<here><h6>'+list.length + ' records in this area:</h6></here>');
			        	mainlabel.append('<there><ul></ul></there>');
						for (i in list) {

							var item = ret.rows[i];

							var clicked = item.cartodb_id;

							//build feature list
							var $listelement = $('<li><a href="#'+clicked+'" id="'+clicked+'" class="cartodb_id"><h5>'+item.label+'</h5><h6>'+item.phone+'</h6></a></li>');
							$('ul').append($listelement); //list of matching search queries
							$('#'+clicked+'').click(function(e){

								mainlabel.html('');
								mainlabel.removeClass('search');
								mainlabel.removeClass('point');
								mainlabel.removeClass('expand');
								mainlabel.removeClass('list');
								mainlabel.addClass('point');
								var cdbid = [$(this).attr('id')];
								var sql_get = 'select cartodb_id, label, image, phone, address, zip, hours_monday, hours_tuesday, hours_wednesday, hours_thursday, hours_friday, hours_saturday, hours_sunday ,available_clothing, available_computer_access, available_day_room, available_dental_services, available_food_pantry, available_housing_assistance, available_meals, available_medical_services, available_personal_care_items, available_showers, available_shelter, available_transportation_assistance, ST_X(the_geom) lon, ST_Y(the_geom) lat FROM '+table_name+' WHERE cartodb_id='+cdbid+'';
								uiActions(sql_get);

								e.preventDefault();
							});
						}
					}
					else 
					{
						mainlabel.html('');
						mainlabel.removeClass('search');
						mainlabel.removeClass('point');
						mainlabel.removeClass('expand');
						mainlabel.removeClass('list');
						mainlabel.addClass('point');
						//single feature cartodb_id query
						$.get("http://"+user_id+".cartodb.com/api/v2/sql?q=select cartodb_id, label, image, phone, address, zip, hours_monday, hours_tuesday, hours_wednesday, hours_thursday, hours_friday, hours_saturday, hours_sunday ,available_clothing, available_computer_access, available_day_room, available_dental_services, available_food_pantry, available_housing_assistance, available_meals, available_medical_services, available_personal_care_items, available_showers, available_shelter, available_transportation_assistance, ST_X(the_geom) lon, ST_Y(the_geom) lat FROM "+table_name+" WHERE cartodb_id="+data.cartodb_id, function(ret) {	

							var cdbid = ret.rows[0].cartodb_id;
							var sql_get = 'select cartodb_id, label, image, phone, address, zip, hours_monday, hours_tuesday, hours_wednesday, hours_thursday, hours_friday, hours_saturday, hours_sunday ,available_clothing, available_computer_access, available_day_room, available_dental_services, available_food_pantry, available_housing_assistance, available_meals, available_medical_services, available_personal_care_items, available_showers, available_shelter, available_transportation_assistance, ST_X(the_geom) lon, ST_Y(the_geom) lat FROM '+table_name+' WHERE cartodb_id='+cdbid+'';
							uiActions(sql_get);

						});
					}
				});	
			});
			$('#map').css('z-index', '0'); // map must always be layer 0 .
			return true;

		});
		return true;
	};
		
};
