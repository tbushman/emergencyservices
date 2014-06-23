
function main() {
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
            
              
           //This is the query for generating the list of nearby features
           var sql = cartodb.SQL({ user: 'saltlakecity' });
           sql.execute("select cartodb_id, label, image from emergency_services where st_distance( the_geom, st_GeomFromText('POINT("+lon+" "+lat+")', 4326), true ) < (SELECT CDB_XYZ_Resolution("+zoom+")*(("+zoom+")*1.75)) ORDER BY label", function (ret) {
             
             var list = ret.rows;
             if (list.length > 1) {
                $('#image').html("");
                $('.here2').html("");
                $('.here-title').html(list.length + " programs at this location:");
                $('.here').html("<ul></ul>");
                var i = 0;
                for (i in list){
                var newelement = $('<li></li>');
                newelement
                .attr('id', ret.rows[i].cartodb_id)
                .html('<a href="#'+list[i].cartodb_id+'" class="cartodb_id" id="'+list[i].cartodb_id +'">'+list[i].label+'</a>');
                $('.here').append(newelement);
                  map.setView(new L.LatLng(lat, lon), (zoom+2));
                }
                //This is what happens when one of the list items is clicked
                $('.cartodb_id').on('click', function () {
                  
                  $.get("http://saltlakecity.cartodb.com/api/v2/sql?q=select cartodb_id, label, image, hours_monday, hours_tuesday, hours_wednesday, hours_thursday, hours_friday, hours_saturday, hours_sunday ,available_clothing, available_computer_access, available_day_room, available_dental_services, available_food_pantry, available_housing_assistance, available_meals, available_medical_services, available_personal_care_items, available_showers, available_shelter, available_transportation_assistance, ST_X(the_geom) lon, ST_Y(the_geom) lat  from emergency_services WHERE cartodb_id = " + $(this).attr('id'), function (ret) {
                    var list = ret.rows[0];
                    var lat = ret.rows[0].lat;
                    delete ret.rows[0].lat;
                    var lon = ret.rows[0].lon;
                    delete ret.rows[0].lon;
                    map.setView(new L.LatLng(lat, lon), 16);
                    $('.here-title').html("");
                    $('.here').html("");
                    $('.here2').html("");
                    
                    var label = list.label;
                    console.log(label);
                    $('#image').append('<h2>' + label + '</h2>');
					var image = list.image;
					console.log(image);
					$('#image').append('<img src="'+image+'" class="image-here">');
                    var monday = list.hours_monday;
                    console.log(monday);
                    $('.here').append('<h3>' +"Monday: "+ monday + '</h3>');
                    var tuesday = list.hours_tuesday;
                    console.log(tuesday);
                    $('.here').append('<h3>' +"tuesday: "+ tuesday + '</h3>');
                    var wednesday = list.hours_wednesday;
                    console.log(wednesday);
                    $('.here').append('<h3>' +"wednesday: "+ wednesday + '</h3>');
                    var thursday = list.hours_thursday;
                    console.log(thursday);
                    $('.here').append('<h3>' +"thursday: "+ thursday + '</h3>');
                    var friday = list.hours_friday;
                    console.log(friday);
                    $('.here').append('<h3>' +"friday: "+ friday + '</h3>');
                    var saturday = list.hours_saturday;
                    console.log(saturday);
                    $('.here').append('<h3>' +"saturday: "+ saturday + '</h3>');
                    var sunday = list.hours_sunday;
                    console.log(sunday);
                    $('.here').append('<h3>' +"sunday: "+ sunday + '</h3>');
                    var clothing = list.available_clothing;
                    console.log(clothing);
                    $('.here2').append('<h3>' +clothing +'</h3>');
                    var computer = list.available_computer_access;
                    console.log(computer);
                    $('.here2').append('<h3>' + computer +'</h3>');
                    var day = list.available_day_room;
                    console.log(day);
                    $('.here2').append('<h3>' +day+'</h3>');
                    var dental = list.available_dental_services;
                    console.log(dental);
                    $('.here2').append('<h3>' +dental+'</h3>');
                    var food = list.available_food_pantry;
                    console.log(food);
                    $('.here2').append('<h3>' +food+'</h3>');
                    var housing = list.available_housing_assistance;
                    console.log(housing);
                    $('.here2').append('<h3>' +housing+'</h3>');
                    var meals = list.available_meals;
                    console.log(meals);
                    $('.here2').append('<h3>' +meals+'</h3>');
                    var medical = list.available_medical_services;
                    console.log(medical);
                    $('.here2').append('<h3>' +medical+'</h3>');
                    var personal = list.available_personal_care_items;
                    console.log(personal);
                    $('.here2').append('<h3>' +personal+'</h3>');
                    var showers = list.available_showers;
                    console.log(showers);
                    $('.here2').append('<h3>' +showers+'</h3>');
                    var shelter = list.available_shelter;
                    console.log(shelter);
                    $('.here2').append('<h3>' +shelter+'</h3>');
                    var trans = list.available_transportation_assistance;
                    console.log(trans);
                    $('.here2').append('<h3>' +trans+'</h3>');
                    
                });
              });
             }
              else 
              {
                //If no coincident features within resolution: append only single feature info (no list)
                $('#image').html("");
                $.get("http://saltlakecity.cartodb.com/api/v2/sql?q=select cartodb_id, label, image, hours_monday, hours_tuesday, hours_wednesday, hours_thursday, hours_friday, hours_saturday, hours_sunday, available_clothing, available_computer_access, available_day_room, available_dental_services, available_food_pantry, available_housing_assistance, available_meals, available_medical_services, available_personal_care_items, available_showers, available_shelter, available_transportation_assistance, ST_X(the_geom) lon, ST_Y(the_geom) lat  from emergency_services WHERE cartodb_id = " + data.cartodb_id, function (ret) {
                  var list = ret.rows[0];
                  var lat = ret.rows[0].lat;
                  delete ret.rows[0].lat;
                  var lon = ret.rows[0].lon;
                  delete ret.rows[0].lon;
                  var zoom = map.getZoom(zoom);
                  console.log(zoom);
                  map.setView(new L.LatLng(lat, lon));
                  
                  $('.here-title').html("");
                  $('.here').html("");
                  $('.here2').html("");
                  $('#image').html("");
              
                    var label = list.label;
                    console.log(label);
                    $('#image').append('<h2>' + label + '</h2>');
					var image = list.image;
					console.log(image);
					$('#image').append('<img src="'+image+'" class="image-here">');
                    var monday = list.hours_monday;
                    console.log(monday);
                    $('.here').append('<h3>' +"Monday: "+ monday + '</h3>');
                    var tuesday = list.hours_tuesday;
                    console.log(tuesday);
                    $('.here').append('<h3>' +"tuesday: "+ tuesday + '</h3>');
                    var wednesday = list.hours_wednesday;
                    console.log(wednesday);
                    $('.here').append('<h3>' +"wednesday: "+ wednesday + '</h3>');
                    var thursday = list.hours_thursday;
                    console.log(thursday);
                    $('.here').append('<h3>' +"thursday: "+ thursday + '</h3>');
                    var friday = list.hours_friday;
                    console.log(friday);
                    $('.here').append('<h3>' +"friday: "+ friday + '</h3>');
                    var saturday = list.hours_saturday;
                    console.log(saturday);
                    $('.here').append('<h3>' +"saturday: "+ saturday + '</h3>');
                    var sunday = list.hours_sunday;
                    console.log(sunday);
                    $('.here').append('<h3>' +"sunday: "+ sunday + '</h3>');
                    var clothing = list.available_clothing;
                    console.log(clothing);
                    $('.here2').append('<h3>' +clothing +'</h3>');
                    var computer = list.available_computer_access;
                    console.log(computer);
                    $('.here2').append('<h3>' + computer +'</h3>');
                    var day = list.available_day_room;
                    console.log(day);
                    $('.here2').append('<h3>' +day+'</h3>');
                    var dental = list.available_dental_services;
                    console.log(dental);
                    $('.here2').append('<h3>' +dental+'</h3>');
                    var food = list.available_food_pantry;
                    console.log(food);
                    $('.here2').append('<h3>' +food+'</h3>');
                    var housing = list.available_housing_assistance;
                    console.log(housing);
                    $('.here2').append('<h3>' +housing+'</h3>');
                    var meals = list.available_meals;
                    console.log(meals);
                    $('.here2').append('<h3>' +meals+'</h3>');
                    var medical = list.available_medical_services;
                    console.log(medical);
                    $('.here2').append('<h3>' +medical+'</h3>');
                    var personal = list.available_personal_care_items;
                    console.log(personal);
                    $('.here2').append('<h3>' +personal+'</h3>');
                    var showers = list.available_showers;
                    console.log(showers);
                    $('.here2').append('<h3>' +showers+'</h3>');
                    var shelter = list.available_shelter;
                    console.log(shelter);
                    $('.here2').append('<h3>' +shelter+'</h3>');
                    var trans = list.available_transportation_assistance;
                    console.log(trans);
                    $('.here2').append('<h3>' +trans+'</h3>');
                   
                });
              }
            });
          });
        });
     }
}

window.onload = main;
