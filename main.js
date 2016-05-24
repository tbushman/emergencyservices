
window.onload = function() {
	
	main();
	
  	
	var txt = document.getElementById('txt');
	txt.value = main + '';

	$('#link').click(function(code){

	  	this.href = 'data:text/javascript;charset=utf-8,'
	    + encodeURIComponent(txt.value);

	});

	$("#submit").click(function(){

		var txt = $('#txt');
		txt.html('');
				
		main(this);

		txt.value = main + '';
		txt.text(txt.value);


	});
};



function main(){
	
	//Global vars from html form values
  	var user_id = $("#user_id").val();
	console.log(user_id);
  	var table_name = $("#table_name").val();
	console.log(table_name);
 	var json_url = $("#json_url").val();
	console.log(json_url);
	//
	
	////////////////////////////////////////////////////////////////////////////////////////////
	//UI Setup _________________________________________________________________________________

	var cdbidlist = document.getElementsByClassName("tltab");

	for (var i=0; i<cdbidlist.length; i++) {

		cdbidlist[i].onmouseover=function() { //tl hover
			this.title+=" sfhover"; //tl hover
		};
		cdbidlist[i].onmouseout=function() {
			this.title=this.title.replace(new RegExp(" sfhover\\\\b"), "");
		};
	}
	var map = $('#map'); 
	map.click(function(e){ //click on map to close gallery
		var mainlabel = $('#mainlabel');
		mainlabel.removeClass('search');
		mainlabel.removeClass('point');
		mainlabel.removeClass('expand');
		mainlabel.removeClass('list');
		mainlabel.addClass('point');
		$('#mainlabel').css('width',  'auto');
		$('h1').css('height', 'auto');
		$('lightbox').html('');
		$('#map').css('z-index', '0');
	});
	$('#info').click(function(e, data){
		
		var mainlabel = $('#mainlabel');
		mainlabel.html('');
		mainlabel.removeClass('search');
		mainlabel.removeClass('point');
		mainlabel.removeClass('expand');
		mainlabel.removeClass('list');
		var helplabel = $('#helplabel');
		helplabel.removeClass('one');
		helplabel.removeClass('two');
		helplabel.removeClass('three');
		helplabel.addClass('one');
		helplabel.html('');
		helplabel.append('<help><h3 id="title"></h3><h4 id="blurb">Three ways to navigate the site</h4><br><hide><h6> The code for running the pu.bli.sh framework is on <a href="https://github.com/tbushman/pu.bli.sh" target="_blank" >GitHub</a>.</h6></hide></help><a href="#" id="about" class="info"></a><steps><one><a href="#" id="one"><h1>1</h1></a></one><two><a href="#" id="two"><h1>2</h1></a></two><three><a href="#" id="three"><h1>3</h1></a></three><four><a href="#" id="four"><h7>x</h7></a></four></steps>');
		$('hide').hide();
		$('#about').click(function(){
			
			helplabel.removeClass('one');
			helplabel.removeClass('two');
			helplabel.removeClass('three');
			helplabel.addClass('one');
			$('hide').show();
			
		});
		$('#one').click(function(){
			
			$('.leaflet-control-zoom-in')[0].click();
			$('hide').hide();
			helplabel.removeClass('one');
			helplabel.removeClass('two');
			helplabel.removeClass('three');
			helplabel.addClass('one');
			$('#two').removeClass('highlight');
			$('#three').removeClass('highlight');
			$('#one').removeClass('highlight');
			$('#one').addClass('highlight');
			$('#blurb').html('');
			$('#title').html('');
			$('#blurb').append('Use zoom, click on map features');
			$('#title').append('MAP');
			$('.leaflet-control-zoom-out')[0].click();
			
		});
		$('#two').click(function(){
			
			$('hide').hide();
			helplabel.removeClass('one');
			helplabel.removeClass('two');
			helplabel.removeClass('three');
			helplabel.addClass('two');
			$('#two').removeClass('highlight');
			$('#three').removeClass('highlight');
			$('#one').removeClass('highlight');
			$('#two').addClass('highlight');
			$('#blurb').html('');
			$('#title').html('');
			$('#blurb').append('Click timeline / Arrows');
			$('#title').append('TIMELINE');
			$('.go').click();
			
		});
		$('#three').click(function(){
			
			$('hide').hide();
			helplabel.removeClass('one');
			helplabel.removeClass('two');
			helplabel.removeClass('three');
			helplabel.addClass('three');
			$('#two').removeClass('highlight');
			$('#three').removeClass('highlight');
			$('#one').removeClass('highlight');
			$('#three').addClass('highlight');
			$('#blurb').html('');
			$('#title').html('');
			$('#blurb').append('Menu / Search functions');
			$('#title').append('MENU');
			
		});
		$('#four').click(function(){
		
			$('hide').hide();
			helplabel.removeClass('one');
			helplabel.removeClass('two');
			helplabel.removeClass('three');
			helplabel.html('');
		});
		e.stopPropagation();
	});
	$('.go').click(function(){ //click on the refresh symbol to instantiate timeline.

		var mainlabel = $('#mainlabel');
		mainlabel.removeClass('search');
		mainlabel.removeClass('point');
		mainlabel.removeClass('expand');
		mainlabel.removeClass('list');
		$('#mainlabel').html('');
		var cdbid = [$(this).attr('id')];

		$("#"+cdbid+"")[0].click();

	});

	var wrapper = $('#wrapper');
	console.log(wrapper);
	wrapper.css('left', 50+'%'); //'#wrapper' encloses the moving timeline, with initiation mid-screen

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//MAP/TL setup/functions__________________________________________________________________________________________

	var map;

	//leaflet map
	map = new L.map('map', { //Leaflet map
	  	zoomControl: true,
	  	center: [40.75, -111.9],
	  	zoom: 11,
		minZoom: 2,
	  	maxZoom: 14
	});

	// add a base layer with transit layer
	L.tileLayer('https://dnv9my2eseobd.cloudfront.net/v3/cartodb.map-4xtxp73f/{z}/{x}/{y}.png', {
	  attribution: '</a>'
	}).addTo(map);
	L.tileLayer('http://{s}.tiles.mapbox.com/v3/tbushman.1pnqxgvi/{z}/{x}/{y}.png').addTo(map); //slc transit

	//define CartoDB api url
	var layerUrl = json_url; //CartoDB .json from global var
	console.log(layerUrl);
	var testLayer = new L.LayerGroup();
	var lyr1 = [];
	cartodb.createLayer(map, layerUrl)
	.addTo(map)
	.on('done', function(layer){
		var subLayerOptions = {
			sql: "SELECT * FROM "+table_name+"",
			interactivity: 'cartodb_id'
		};
		var sublayer = layer.getSubLayer(0);
		sublayer.setInteraction(true);
		addCursorInteraction(sublayer);

		lyr1.push(sublayer);

		var sql = new cartodb.SQL({ user: ''+user_id+'' });

	    //wire buttons (drop-down menu)
	    $('.button').click(function(e, latlon, pxPos, data, layer) {

	       	$('.button').removeClass('selected');
	       	$(this).addClass('selected');
	       	LayerActions[$(this).attr('id')] ();
			var mainlabel = $('#mainlabel');
			mainlabel.html('');
			mainlabel.removeClass('search');
			mainlabel.removeClass('point');
			mainlabel.removeClass('expand');
			mainlabel.removeClass('list');
	   	});
	});
	//lyr1 createD
	function LayerSelect(sql_select) {

		var sql_init = new cartodb.SQL({ user: ''+user_id+'' });
		sql_init.getBounds(sql_select).done(function(bounds){

		   	var zoom = map.getZoom(zoom);
		   	console.log(zoom);
     		map.fitBounds(bounds);

//		 	map.setView(new L.LatLng(lat, lon), 11); //initial zoom/latlon
			uiActions(sql_select);

		});
		lyr1[0].setSQL(sql_select);					
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
		   	console.log(zoom);
			var size = zoom*1.5;
			console.log(size);
			var latlong = new L.LatLng(lat, lon);
			console.log(latlong);
			var resolution = size*20;
			console.log(resolution);
		 	
			map.setView(latlong, zoom+1); //zoom to single feature
			

			$('h1').css('height', 'auto');
			var mainlabel = $('#mainlabel');
			mainlabel.html('');
			mainlabel.removeClass('search');
			mainlabel.removeClass('point');
			mainlabel.removeClass('expand');
			mainlabel.removeClass('list');
			mainlabel.addClass('point');
			//'#mainlabel' becomes a map tooltip

			var cdbid = item.cartodb_id;
			console.log(cdbid);

			var label = item.label;
			console.log(label);
			var website = item.website;
			console.log(website);
			var image = item.image;
			console.log(image);
			var phone = item.phone;
			console.log(phone);
			var address = item.address;
			console.log(address);
          	var monday = item.hours_monday;
          	console.log(monday);
          	var tuesday = item.hours_tuesday;
          	console.log(tuesday);
          	var wednesday = item.hours_wednesday;
          	console.log(wednesday);
          	var thursday = item.hours_thursday;
          	console.log(thursday);
          	var friday = item.hours_friday;
          	console.log(friday);
          	var saturday = item.hours_saturday;
          	console.log(saturday);
         	var sunday = item.hours_sunday;
          	console.log(sunday);

			var header = $('<text><h1 class="title">'+label+'</h1><lightbox></lightbox><infobox><info><contact><h2>'+phone+'</h2><p>'+address+'</p></contact></info><hours><wrapper><day><mo><h5>Mo:</h5></mo><tu><h5>Tu:</h5></tu><we><h5>We:</h5></we><thu><h5>Th:</h5></thu><fr><h5>Fr:</h5></fr><sa><h5>Sa:</h5></sa><su><h5>Su:</h5></su></day><times><mo><h5>' + monday + '</h5></mo><tu><h5>' + tuesday + '</h5></tu><we><h5>' + wednesday + '</h5></we><thu><h5>' + thursday + '</h5></thu><fr><h5>' + friday + '</h5></fr><sa><h5>' + saturday + '</h5></sa><su><h5>' + sunday + '</h5></su></times></wrapper></hours></infobox></text><leftlist><list><ul id="services"></ul></list></leftlist><rightlist><list><ul id="nearby"></ul></list></rightlist><images><a href="#'+cdbid+'" class="items pic" id="'+cdbid+'"><img src="'+image+'"></img></a></images>');
			console.log(header);
			$('#mainlabel').append(header); //Single feature attribute appendage
			
          	var clothing = item.available_clothing;
          	console.log(clothing);
          	var computer = item.available_computer_access;
          	console.log(computer);
          	var day = item.available_day_room;
          	console.log(day);
          	var dental = item.available_dental_services;
          	console.log(dental);
          	var food = item.available_food_pantry;
          	console.log(food);
          	var housing = item.available_housing_assistance;
          	console.log(housing);
          	var meals = item.available_meals;
          	console.log(meals);
          	var medical = item.available_medical_services;
          	console.log(medical);
          	var personal = item.available_personal_care_items;
          	console.log(personal);
          	var showers = item.available_showers;
          	console.log(showers);
          	var shelter = item.available_shelter;
          	console.log(shelter);
          	var trans = item.available_transportation_assistance;
          	console.log(trans);

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
				$('h1').css('height', 'auto');
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
						$('h1').css('height', 'auto');
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
					$('h1').css('height', height);
					var width = $('lightbox > img').css('width');
					$('#mainlabel').css('width', width);

				});
				e.preventDefault();
				return false;
			});
		
		});
		
	};
	var LayerActions = { 
  		cdbid: function() { LayerSelect("SELECT * FROM emergency_services WHERE cartodb_id = '"+data.cartodb_id+"'") },
		all: function() { LayerSelect("SELECT * FROM emergency_services") },
  		hous: function() { LayerSelect("SELECT * FROM emergency_services WHERE type = 'H'") },
		trav: function() { LayerSelect("SELECT * FROM emergency_services WHERE type = 'B'") },
		med: function() { LayerSelect("SELECT * FROM emergency_services WHERE type = 'M'") },
		food: function() { LayerSelect("SELECT * FROM emergency_services WHERE type = 'F'") },
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
	        	$('#mainlabel').append('<list><ul></ul></list>');
				var i = 0;
				for (i in list) {

					var item = ret.rows[i];
					console.log(item);
					var clicked = item.cartodb_id;
					console.log(clicked);

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



	//////////////////////////////////////////////////////////////////////////////////////


	//DEMARCATION


	////////////////////////////////////////////////////////////////////////////////

	//*/ALWAYS KEEP THIS AT THE END!!*//*/*//*/*//
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
			console.log(sql_select);
			sql_init.execute(sql_select).done(function(ret){

				mainlabel.html('');
				mainlabel.removeClass('search');
				mainlabel.removeClass('point');
				mainlabel.removeClass('expand');
				mainlabel.removeClass('list');
				$('images').remove();
				var item = ret.rows[0]; //return top-clicked feature attribute data
		   		var lat = item.lat;
		   		delete item.lat;
		   		var lon = item.lon;
		   		delete item.lon;
		   		var zoom = map.getZoom(zoom);
		   		console.log(zoom);
		 		map.setView(new L.LatLng(lat, lon), 11); //zoom to top-clicked feature

				var sql_init = new cartodb.SQL({ user: ''+user_id+'' });
				//pixel distance from selected feature sql query
				var bounds_select = "select cartodb_id, label, image, phone, address, zip, hours_monday, hours_tuesday, hours_wednesday, hours_thursday, hours_friday, hours_saturday, hours_sunday ,available_clothing, available_computer_access, available_day_room, available_dental_services, available_food_pantry, available_housing_assistance, available_meals, available_medical_services, available_personal_care_items, available_showers, available_shelter, available_transportation_assistance from "+table_name+" where st_distance( the_geom, st_GeomFromText('POINT("+lon+" "+lat+")', 4326), true ) < (SELECT CDB_XYZ_Resolution("+zoom+")*(("+zoom+")*1.15)) ";
				//query for euclidian nearby features
				sql_init.execute(bounds_select).done(function(ret) {

					var list = ret.rows;

					if (list.length > 1 ) {

						var i = 0;

						mainlabel.addClass('list');
						mainlabel.append('<text><here><h6>'+list.length + ' records in this area:</h6></here></text>');
			        	$('text').append('<list><ul></ul></list>');
						for (i in list) {

							var item = ret.rows[i];
							console.log(item);

							var clicked = item.cartodb_id;
							console.log(clicked);

							//build feature list
							var $listelement = $('<li><a href="#'+clicked+'" id="'+clicked+'" class="cartodb_id"><h5>'+item.label+'</h5><h6>'+item.phone+'</h6></a></li>');
							$('ul').append($listelement); //list of matching search queries
							$('#'+clicked+'').click(function(e){

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
	}
};    



	
