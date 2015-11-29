
function main() {
  $("leftlist").hide();	
  $("rightlist").hide();	
  $("day").hide();	
  var map;

  //leaflet map
  map = L.map('map', {
    zoomControl: true,
    center: [40.75, -111.9],
    zoom: 12,
	minZoom: 2,
    maxZoom: 18
  });
  

  
  // add a base layer with labels layer
  // don't forget to remind to add attribution. Have included in footer.
L.tileLayer('https://dnv9my2eseobd.cloudfront.net/v3/cartodb.map-4xtxp73f/{z}/{x}/{y}.png', {
  attribution: '</a>'
}).addTo(map);
L.tileLayer('http://{s}.tiles.mapbox.com/v3/tbushman.1pnqxgvi/{z}/{x}/{y}.png').addTo(map);
  var layerUrl = 'http://saltlakecity.cartodb.com/api/v2/viz/248cae7e-c103-11e3-a511-0e230854a1cb/viz.json';

  

  
  
  // create layer and add to the map, then add some interactivity
  var lyr1 = [];//aka 'sublayers' in some other maps  
  cartodb.createLayer(map, layerUrl)
   .addTo(map)
   .on('done', function(layer) {
     var subLayerOptions = {
       sql: "SELECT * FROM emergency_services",
       interactivity: 'cartodb_id'
     };
     //create sublayer
     var sublayer = layer.getSubLayer(0);
     sublayer.setInteraction(true);
     addCursorInteraction(sublayer);

     lyr1.push(sublayer);

     var sql = new cartodb.SQL({ user: 'saltlakecity' });
     //wire buttons (drop-down menu)
     $('.button').click(function(e, latlon, pxPos, data, layer) {
       
       $('.button').removeClass('selected');
       $(this).addClass('selected');
       $('#image').html("");
       $('.here').html("");
       $('.here-title').html("");
       LayerActions[$(this).attr('id')] ();
	   $("sidebar").hide();
     
   });
});

//This next part selects the sql statement passed to it (see 'LayerActions')
	function LayerSelect (sql_select) {
  		var sql_init = new cartodb.SQL({ user: 'saltlakecity' });
  		sql_init.getBounds(sql_select).done(function(bounds) {
     		map.fitBounds(bounds);
  		});
  		lyr1[0].setSQL(sql_select);
  		return true;
	};

	var LayerActions = { 
		all: function() { LayerSelect("SELECT * FROM emergency_services") },
  		hous: function() { LayerSelect("SELECT * FROM emergency_services WHERE type = 'H'") },
		trav: function() { LayerSelect("SELECT * FROM emergency_services WHERE type = 'B'") },
		med: function() { LayerSelect("SELECT * FROM emergency_services WHERE type = 'M'") },
		food: function() { LayerSelect("SELECT * FROM emergency_services WHERE type = 'F'") },
	};
	
	//search function
	
	var sql = new cartodb.SQL({ user: 'saltlakecity' });
	$('#input').autocomplete({
		
	    source: function( request, response ) {
			sql.execute("select cartodb_id, label from emergency_services where label ilike'%"+request.term+"%' ORDER BY label").done( function(ret) {
                var list = ret.rows;
				$("h6").hide();
				$("sidebar").show();
				$("#services").html("");
				$("#providers").html("");
				$("rightlist").show();
				$("here").html("");
				$("day").hide();
			    $("times").hide();
			    $("leftlist").hide();
				$('contact').html("");
				$('.title').hide();
                $('#image').html("");
                $('image2').html("");
                $('list').html("");
                $('list').html("<ul></ul>");
	             if (list.length > 1) {
		
				    $('#providers').html("<h2>"+list.length + " search results:</h2>");
	                var i = 0;
	                for (i in list){
	                var newelement = $('<li></li>');
	                newelement
	                .attr('id', ret.rows[i].cartodb_id)
	                .html('<a href="#'+list[i].cartodb_id+'" class="cartodb_id" id="'+list[i].cartodb_id +'">'+list[i].label+'</a>');
	                $('list').append(newelement);
	                  
	             }
	                //This is what happens when one of the list items is clicked
	             $('.cartodb_id').on('click', function () {

	                $.get("http://saltlakecity.cartodb.com/api/v2/sql?q=select cartodb_id, label, image, phone, address, zip, hours_monday, hours_tuesday, hours_wednesday, hours_thursday, hours_friday, hours_saturday, hours_sunday ,available_clothing, available_computer_access, available_day_room, available_dental_services, available_food_pantry, available_housing_assistance, available_meals, available_medical_services, available_personal_care_items, available_showers, available_shelter, available_transportation_assistance, ST_X(the_geom) lon, ST_Y(the_geom) lat  from emergency_services WHERE cartodb_id = " + $(this).attr('id'), function (ret) {
	                    var list = ret.rows[0];
	                    var lat = ret.rows[0].lat;
	                    delete ret.rows[0].lat;
	                    var lon = ret.rows[0].lon;
	                    delete ret.rows[0].lon;
	                    map.setView(new L.LatLng(lat, lon), 16);
						$("h6").hide();
						$("#services").html("");
						$("#providers").html("");
					    $("leftlist").show();	
					    $("rightlist").hide();	
					    $("day").show();	
	                    $('image').html("");
	                    $('image2').html("");
					    $("times").show();
	                    $('times').html("");
	                    $('here').html("");
	                    $('contact').html("");
						$('.title').show("");
						$('.title').html("");

	                  	var label = list.label;
	                  	console.log(label);
	                  	$('.title').append( label );
	/*					var image = list.image;
						console.log(image);
						$('contact').append('<div><img src="'+image+'"></img></div>');
	*/					var phone = list.phone;
						console.log(phone);
						$('contact').append('<h2>'+phone+'</h2>');
						var address = list.address;
						console.log(address);
						$('contact').append('<p>'+address+'</p>');
	                  	var monday = list.hours_monday;
	                  	console.log(monday);
	                  	$('times').append('<mo><h5>' + monday + '</h5></mo>');
	                  	var tuesday = list.hours_tuesday;
	                  	console.log(tuesday);
	                  	$('times').append('<tu><h5>' + tuesday + '</h5></tu>');
	                  	var wednesday = list.hours_wednesday;
	                  	console.log(wednesday);
	                  	$('times').append('<we><h5>' + wednesday + '</h5></we>');
	                  	var thursday = list.hours_thursday;
	                  	console.log(thursday);
	                  	$('times').append('<thu><h5>' + thursday + '</h5></thu>');
	                  	var friday = list.hours_friday;
	                  	console.log(friday);
	                  	$('times').append('<fr><h5>' + friday + '</h5></fr>');
	                  	var saturday = list.hours_saturday;
	                  	console.log(saturday);
	                  	$('times').append('<sa><h5>' + saturday + '</h5></sa>');
	                  	var sunday = list.hours_sunday;
	                  	console.log(sunday);
	                  	$('times').append('<su><h5>' + sunday + '</h5></su>');
						$('#services').html("<h2>Services at this location:</h2>");
						$('here').html("<ul></ul>");
	                  	var clothing = list.available_clothing;
	                  	console.log(clothing);
	                  	$('here ul').append('<li>' +clothing +'</li>');
	                  	var computer = list.available_computer_access;
	                  	console.log(computer);
	                  	$('here ul').append('<li>' + computer +'</li>');
	                  	var day = list.available_day_room;
	                  	console.log(day);
	                  	$('here ul').append('<li>' +day+'</li>');
	                  	var dental = list.available_dental_services;
	                  	console.log(dental);
	                  	$('here ul').append('<li>' +dental+'</li>');
	                  	var food = list.available_food_pantry;
	                  	console.log(food);
	                  	$('here ul').append('<li>' +food+'</li>');
	                  	var housing = list.available_housing_assistance;
	                  	console.log(housing);
	                  	$('here ul').append('<li>' +housing+'</li>');
	                  	var meals = list.available_meals;
	                  	console.log(meals);
	                  	$('here ul').append('<li>' +meals+'</li>');
	                  	var medical = list.available_medical_services;
	                  	console.log(medical);
	                  	$('here ul').append('<li>' +medical+'</li>');
	                  	var personal = list.available_personal_care_items;
	                  	console.log(personal);
	                  	$('here ul').append('<li>' +personal+'</li>');
	                  	var showers = list.available_showers;
	                  	console.log(showers);
	                  	$('here ul').append('<li>' +showers+'</li>');
	                  	var shelter = list.available_shelter;
	                  	console.log(shelter);
	                  	$('here ul').append('<li>' +shelter+'</li>');
	                  	var trans = list.available_transportation_assistance;
	                  	console.log(trans);
	                  	$('here').append('<li>' +trans+'</li>');
	                });
	              });
	             }
	             else 
	             {
	                //If no coincident features within resolution: append only single feature info (no list)
	               $('#image').html("");
	               $.get("http://saltlakecity.cartodb.com/api/v2/sql?q=select cartodb_id, label, image, phone, address, zip, hours_monday, hours_tuesday, hours_wednesday, hours_thursday, hours_friday, hours_saturday, hours_sunday, available_clothing, available_computer_access, available_day_room, available_dental_services, available_food_pantry, available_housing_assistance, available_meals, available_medical_services, available_personal_care_items, available_showers, available_shelter, available_transportation_assistance, ST_X(the_geom) lon, ST_Y(the_geom) lat  from emergency_services WHERE cartodb_id = " + data.cartodb_id, function (ret) {
	                  var list = ret.rows[0];
	                  var lat = ret.rows[0].lat;
	                  delete ret.rows[0].lat;
	                  var lon = ret.rows[0].lon;
	                  delete ret.rows[0].lon;
	                  var zoom = map.getZoom(zoom);
	                  console.log(zoom);
	                  map.setView(new L.LatLng(lat, lon));

					  $("h6").hide();
	                  $('.title').show();
	                  $('.title').html("");
					  $("times").show();
	                  $('times').html("");
	                  $('here').html("");
	                  $('image').html("");
	                  $('image2').html("");
					  $('contact').html("");
					  $('.title').html("");
	                  $('day').show();
	                  $('leftlist').show();
	                  $('rightlist').hide();
	                  $('list').html("");


	                  var label = list.label;
	                  console.log(label);
	                  $('.title').append( label );
	/*				  var image = list.image;
					  console.log(image);
					  $('contact').append('<div><img src="'+image+'"></img></div>');
	*/				  var phone = list.phone;
					  console.log(phone);
					  $('contact').append('<h2>'+phone+'</h2>');
					  var address = list.address;
					  console.log(address);
					  $('contact').append('<p>'+address+'</p>');
	                  	var monday = list.hours_monday;
	                  	console.log(monday);
	                  	$('times').append('<mo><h5>' + monday + '</h5></mo>');
	                  	var tuesday = list.hours_tuesday;
	                  	console.log(tuesday);
	                  	$('times').append('<tu><h5>' + tuesday + '</h5></tu>');
	                  	var wednesday = list.hours_wednesday;
	                  	console.log(wednesday);
	                  	$('times').append('<we><h5>' + wednesday + '</h5></we>');
	                  	var thursday = list.hours_thursday;
	                  	console.log(thursday);
	                  	$('times').append('<thu><h5>' + thursday + '</h5></thu>');
	                  	var friday = list.hours_friday;
	                  	console.log(friday);
	                  	$('times').append('<fr><h5>' + friday + '</h5></fr>');
	                  	var saturday = list.hours_saturday;
	                  	console.log(saturday);
	                  	$('times').append('<sa><h5>' + saturday + '</h5></sa>');
	                  	var sunday = list.hours_sunday;
	                  	console.log(sunday);
	                  	$('times').append('<su><h5>' + sunday + '</h5></su>');
					  $('#services').html("<h2>Services at this location:</h2>");
					  $('here').html("<ul></ul>");
	                  var clothing = list.available_clothing;
	                  console.log(clothing);
	                  $('here ul').append('<li>' +clothing +'</li>');
	                  var computer = list.available_computer_access;
	                  console.log(computer);
	                  $('here ul').append('<li>' + computer +'</li>');
	                  var day = list.available_day_room;
	                  console.log(day);
	                  $('here ul').append('<li>' +day+'</li>');
	                  var dental = list.available_dental_services;
	                  console.log(dental);
	                  $('here ul').append('<li>' +dental+'</li>');
	                  var food = list.available_food_pantry;
	                  console.log(food);
	                  $('here ul').append('<li>' +food+'</li>');
	                  var housing = list.available_housing_assistance;
	                  console.log(housing);
	                  $('here ul').append('<li>' +housing+'</li>');
	                  var meals = list.available_meals;
	                  console.log(meals);
	                  $('here ul').append('<li>' +meals+'</li>');
	                  var medical = list.available_medical_services;
	                  console.log(medical);
	                  $('here ul').append('<li>' +medical+'</li>');
	                  var personal = list.available_personal_care_items;
	                  console.log(personal);
	                  $('here ul').append('<li>' +personal+'</li>');
	                  var showers = list.available_showers;
	                  console.log(showers);
	                  $('here ul').append('<li>' +showers+'</li>');
	                  var shelter = list.available_shelter;
	                  console.log(shelter);
	                  $('here ul').append('<li>' +shelter+'</li>');
	                  var trans = list.available_transportation_assistance;
	                  console.log(trans);
	                  $('here').append('<li>' +trans+'</li>');
	                });
	              }
	            });
	          
		   },
		   minLength: 2
	     });



     function addCursorInteraction(sublayer) {
        
       var hovers = [];
       //1 is the points: 'pointer' when mouse over
        sublayer.bind('featureOver', function(e, latlon, pxPos, data, layer) {
          hovers[layer] = 1;
          if(_.any(hovers)) {
            $('#map').css('cursor', 'pointer');
          }
        });
       //0 is the base layer. Cursor 'auto' if mouse over
        sublayer.bind('featureOut', function(m, layer) {
          hovers[layer] = 0;
          if(!_.any(hovers)) {
            $('#map').css('cursor', 'auto');
          }
        });

       //when feature clicked, move to location, append returned items to ul
       sublayer.bind('featureClick', function (e, latlon, pxPos, data, layer) {
           
          
         $.get("http://saltlakecity.cartodb.com/api/v2/sql?q=select label, image, ST_X(the_geom) lon, ST_Y(the_geom) lat  from emergency_services WHERE cartodb_id = " + data.cartodb_id, function (ret) {
           var list = ret.rows[0];
           var lat = ret.rows[0].lat;
           delete ret.rows[0].lat;
           var lon = ret.rows[0].lon;
           delete ret.rows[0].lon;
           var zoom = map.getZoom(zoom);
           console.log(zoom);
           map.setView(new L.LatLng(lat, lon));
		   $("sidebar").show();
		   $('#providers').html("");
            
              
           //This is the query for generating the list of nearby features
           var sql = cartodb.SQL({ user: 'saltlakecity' });
           sql.execute("select cartodb_id, label, image, phone, address, zip from emergency_services where st_distance( the_geom, st_GeomFromText('POINT("+lon+" "+lat+")', 4326), true ) < (SELECT CDB_XYZ_Resolution("+zoom+")*(("+zoom+")*1.75)) ORDER BY label", function (ret) {
             
             var list = ret.rows;
             if (list.length > 1) {
			    $("h6").hide();
				$("rightlist").show();
			    $("leftlist").hide();
				$("here").html("");
			    $("day").hide();
			    $("times").hide();
				$('contact').html("");
				$('.title').hide();
                $('#image').html("");
                $('image2').html("");
                $('list').html("");
                $('list').html("<ul></ul>");
				$('#providers').html("<h2>"+list.length + " Providers at this location:</h2>");
                var i = 0;
                for (i in list){
                var newelement = $('<li></li>');
                newelement
                .attr('id', ret.rows[i].cartodb_id)
                .html('<a href="#'+list[i].cartodb_id+'" class="cartodb_id" id="'+list[i].cartodb_id +'">'+list[i].label+'</a>');
                $('list').append(newelement);
                  map.setView(new L.LatLng(lat, lon), (zoom+2));
                }
                //This is what happens when one of the list items is clicked
                $('.cartodb_id').on('click', function () {
                  
                  $.get("http://saltlakecity.cartodb.com/api/v2/sql?q=select cartodb_id, label, image, phone, address, zip, hours_monday, hours_tuesday, hours_wednesday, hours_thursday, hours_friday, hours_saturday, hours_sunday ,available_clothing, available_computer_access, available_day_room, available_dental_services, available_food_pantry, available_housing_assistance, available_meals, available_medical_services, available_personal_care_items, available_showers, available_shelter, available_transportation_assistance, ST_X(the_geom) lon, ST_Y(the_geom) lat  from emergency_services WHERE cartodb_id = " + $(this).attr('id'), function (ret) {
                    var list = ret.rows[0];
                    var lat = ret.rows[0].lat;
                    delete ret.rows[0].lat;
                    var lon = ret.rows[0].lon;
                    delete ret.rows[0].lon;
                    map.setView(new L.LatLng(lat, lon), 16);
				    $("h6").hide();
					$("leftlist").show();	
				    $("rightlist").hide();	
				    $("day").show();	
                    $('image').html("");
                    $('image2').html("");
				    $("times").show();
                    $('times').html("");
                    $('here').html("");
                    $('contact').html("");
					$('.title').show("");
					$('.title').html("");
                    
                  var label = list.label;
                  console.log(label);
                  $('.title').append( label );
/*					var image = list.image;
					console.log(image);
					$('contact').append('<div><img src="'+image+'"></img></div>');
*/					var phone = list.phone;
					console.log(phone);
					$('contact').append('<h2>'+phone+'</h2>');
					var address = list.address;
					console.log(address);
					$('contact').append('<p>'+address+'</p>');
                  	var monday = list.hours_monday;
                  	console.log(monday);
                  	$('times').append('<mo><h5>' + monday + '</h5></mo>');
                  	var tuesday = list.hours_tuesday;
                  	console.log(tuesday);
                  	$('times').append('<tu><h5>' + tuesday + '</h5></tu>');
                  	var wednesday = list.hours_wednesday;
                  	console.log(wednesday);
                  	$('times').append('<we><h5>' + wednesday + '</h5></we>');
                  	var thursday = list.hours_thursday;
                  	console.log(thursday);
                  	$('times').append('<thu><h5>' + thursday + '</h5></thu>');
                  	var friday = list.hours_friday;
                  	console.log(friday);
                  	$('times').append('<fr><h5>' + friday + '</h5></fr>');
                  	var saturday = list.hours_saturday;
                  	console.log(saturday);
                  	$('times').append('<sa><h5>' + saturday + '</h5></sa>');
                  	var sunday = list.hours_sunday;
                  	console.log(sunday);
                  	$('times').append('<su><h5>' + sunday + '</h5></su>');
					$('#services').html("<h2>Services at this location:</h2>");
					$('here').html("<ul></ul>");
                  var clothing = list.available_clothing;
                  console.log(clothing);
                  $('here ul').append('<li>' +clothing +'</li>');
                  var computer = list.available_computer_access;
                  console.log(computer);
                  $('here ul').append('<li>' + computer +'</li>');
                  var day = list.available_day_room;
                  console.log(day);
                  $('here ul').append('<li>' +day+'</li>');
                  var dental = list.available_dental_services;
                  console.log(dental);
                  $('here ul').append('<li>' +dental+'</li>');
                  var food = list.available_food_pantry;
                  console.log(food);
                  $('here ul').append('<li>' +food+'</li>');
                  var housing = list.available_housing_assistance;
                  console.log(housing);
                  $('here ul').append('<li>' +housing+'</li>');
                  var meals = list.available_meals;
                  console.log(meals);
                  $('here ul').append('<li>' +meals+'</li>');
                  var medical = list.available_medical_services;
                  console.log(medical);
                  $('here ul').append('<li>' +medical+'</li>');
                  var personal = list.available_personal_care_items;
                  console.log(personal);
                  $('here ul').append('<li>' +personal+'</li>');
                  var showers = list.available_showers;
                  console.log(showers);
                  $('here ul').append('<li>' +showers+'</li>');
                  var shelter = list.available_shelter;
                  console.log(shelter);
                  $('here ul').append('<li>' +shelter+'</li>');
                  var trans = list.available_transportation_assistance;
                  console.log(trans);
                  $('here').append('<li>' +trans+'</li>');
                });
              });
             }
              else 
              {
                //If no coincident features within resolution: append only single feature info (no list)
                $('#image').html("");
                $.get("http://saltlakecity.cartodb.com/api/v2/sql?q=select cartodb_id, label, image, phone, address, zip, hours_monday, hours_tuesday, hours_wednesday, hours_thursday, hours_friday, hours_saturday, hours_sunday, available_clothing, available_computer_access, available_day_room, available_dental_services, available_food_pantry, available_housing_assistance, available_meals, available_medical_services, available_personal_care_items, available_showers, available_shelter, available_transportation_assistance, ST_X(the_geom) lon, ST_Y(the_geom) lat  from emergency_services WHERE cartodb_id = " + data.cartodb_id, function (ret) {
                  var list = ret.rows[0];
                  var lat = ret.rows[0].lat;
                  delete ret.rows[0].lat;
                  var lon = ret.rows[0].lon;
                  delete ret.rows[0].lon;
                  var zoom = map.getZoom(zoom);
                  console.log(zoom);
                  map.setView(new L.LatLng(lat, lon));
                  
                  $("h6").hide();
				  $('.title').show();
                  $('.title').html("");
				  $("times").show();
                  $('times').html("");
                  $('here').html("");
                  $('image').html("");
                  $('image2').html("");
				  $('contact').html("");
				  $('.title').html("");
                  $('day').show();
                  $('leftlist').show();
                  $('rightlist').hide();
                  $('list').html("");

              
                  var label = list.label;
                  console.log(label);
                  $('.title').append( label );
/*				  var image = list.image;
				  console.log(image);
				  $('contact').append('<div><img src="'+image+'"></img></div>');
*/					var phone = list.phone;
					console.log(phone);
					$('contact').append('<h2>'+phone+'</h2>');
					var address = list.address;
					console.log(address);
					$('contact').append('<p>'+address+'</p>');
                  	var monday = list.hours_monday;
                  	console.log(monday);
                  	$('times').append('<mo><h5>' + monday + '</h5></mo>');
                  	var tuesday = list.hours_tuesday;
                  	console.log(tuesday);
                  	$('times').append('<tu><h5>' + tuesday + '</h5></tu>');
                  	var wednesday = list.hours_wednesday;
                  	console.log(wednesday);
                  	$('times').append('<we><h5>' + wednesday + '</h5></we>');
                  	var thursday = list.hours_thursday;
                  	console.log(thursday);
                  	$('times').append('<thu><h5>' + thursday + '</h5></thu>');
                  	var friday = list.hours_friday;
                  	console.log(friday);
                  	$('times').append('<fr><h5>' + friday + '</h5></fr>');
                  	var saturday = list.hours_saturday;
                  	console.log(saturday);
                  	$('times').append('<sa><h5>' + saturday + '</h5></sa>');
                  	var sunday = list.hours_sunday;
                  	console.log(sunday);
                  	$('times').append('<su><h5>' + sunday + '</h5></su>');
					$('#services').html("<h2>Services at this location:</h2>");
					$('here').html("<ul></ul>");
                  var clothing = list.available_clothing;
                  console.log(clothing);
                  $('here ul').append('<li>' +clothing +'</li>');
                  var computer = list.available_computer_access;
                  console.log(computer);
                  $('here ul').append('<li>' + computer +'</li>');
                  var day = list.available_day_room;
                  console.log(day);
                  $('here ul').append('<li>' +day+'</li>');
                  var dental = list.available_dental_services;
                  console.log(dental);
                  $('here ul').append('<li>' +dental+'</li>');
                  var food = list.available_food_pantry;
                  console.log(food);
                  $('here ul').append('<li>' +food+'</li>');
                  var housing = list.available_housing_assistance;
                  console.log(housing);
                  $('here ul').append('<li>' +housing+'</li>');
                  var meals = list.available_meals;
                  console.log(meals);
                  $('here ul').append('<li>' +meals+'</li>');
                  var medical = list.available_medical_services;
                  console.log(medical);
                  $('here ul').append('<li>' +medical+'</li>');
                  var personal = list.available_personal_care_items;
                  console.log(personal);
                  $('here ul').append('<li>' +personal+'</li>');
                  var showers = list.available_showers;
                  console.log(showers);
                  $('here ul').append('<li>' +showers+'</li>');
                  var shelter = list.available_shelter;
                  console.log(shelter);
                  $('here ul').append('<li>' +shelter+'</li>');
                  var trans = list.available_transportation_assistance;
                  console.log(trans);
                  $('here').append('<li>' +trans+'</li>');
                });
              }
            });
          });
        });
     }
}

window.onload = main;
