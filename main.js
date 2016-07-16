$('#map').click(function(e){ //click on map to close gallery
	var mainlabel = $('#mainlabel');
	mainlabel.removeClass('search');
	mainlabel.removeClass('point');
	mainlabel.removeClass('expand');
	mainlabel.removeClass('list');
	$('lightbox').remove();
	$('images').remove();
	$('text').remove();
	$('mast').remove();
	$('here').remove();
	$('there').remove();
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
$('#submit2').hide();
$('#visibleform').hide();


$(document).on('click', '#login', function(){
	
//	
	initiate_geolocation();
	function initiate_geolocation() {

		navigator.geolocation.getCurrentPosition(handle_geolocation_query);

	};

	function handle_geolocation_query(position){

		var lat = position.coords.latitude;
		console.log(lat);
		var lon = position.coords.longitude;
		console.log(lon);
		var geom = $('#the_geom');
		geom.val(''+lon+','+lat+'');
		var the_geom = geom.val();

		var latinput = $('#lat');
		latinput.val(''+lat+'');
		var loninput = $('#lon');
		loninput.val(''+lon+'');

		//main();
	}

	var mainlabel = $('#mainlabel');
	$('lightbox').remove();
	$('images').remove();
	$('text').remove();
	$('mast').remove();
	$('here').remove();
	$('there').remove();
	mainlabel.removeClass('search');
	mainlabel.removeClass('point');
	mainlabel.removeClass('expand');
	mainlabel.removeClass('list');
	$('#visibleform').show();
	$('#addmap').show();
	$('#submit2').hide();
	$('#close').click(function(){

		var mainlabel = $('#mainlabel');
		$('#visibleform').hide();
		mainlabel.removeClass('search');
		mainlabel.removeClass('point');
		mainlabel.removeClass('expand');
		mainlabel.removeClass('list');

	});
});

$(document).on('click', '#escape',function(){

	var mainlabel = $('#mainlabel');
	$('lightbox').remove();
	$('images').remove();
	$('text').remove();
	$('mast').remove();
	$('here').remove();
	$('there').remove();
	mainlabel.removeClass('search');
	mainlabel.removeClass('point');
	mainlabel.removeClass('expand');
	mainlabel.removeClass('list');
});



function main() {	
	
	$('.type').on('ifChecked', function(){
	  
		var radio = $(this).attr('id');
		console.log(radio);
		$('#typeinput').val('');
		$('#typeinput').val(''+radio+'');
	});
	$('.checkbox').on('ifChecked', function(){
		
			var checked = $(this).attr('id');
			$(this).val(checked.replace('available_', '').replace('_', ' '));
	});
	$('.checkbox').on('ifUnchecked', function(){

		$(this).val(''+[]+'');		
		
	});
	$('input').iCheck({
	    checkboxClass: 'icheckbox_minimal-grey',
	    radioClass: 'iradio_minimal-grey',
	    increaseArea: '20%' // optional
	});

	
	$('#addmap').hide();
	$('#visibleform').hide(); 
	
	$('#input').show();
	$('#all').show();
	var lat = $('#lat').val();
	var lon = $('#lon').val();
	var geom = $('#the_geom');
	geom.val(''+lon+','+lat + '');
	
    

	// vars from html form values
	//return false;

	//return true;
	$('#addmap').click(function(){

		var mainlabel = $('#mainlabel');
		mainlabel.removeClass('search');
		mainlabel.removeClass('point');
		mainlabel.removeClass('expand');
		mainlabel.removeClass('list');

		var type = $('#typeinput').val();
		var the_geom = $('#the_geom').val();
		var name = $("#fname").val();
		var address = $('#address').val();
		var image = $('#image').val();
		//var place = $("#place").val(); //fsr var place is messing up sql submit
		var state = $("#state").val();
		var phone = $("#phone").val();
		var zip = $("#zip").val();
		var website = $("#website").val();
		var mondaybegin = $("#mondaybegin").val();
		var tuesdaybegin = $("#tuesdaybegin").val();
		var wednesdaybegin = $("#wednesdaybegin").val();
		var thursdaybegin = $("#thursdaybegin").val();
		var thursdaybegin = $("#mondaybegin").val();
		var fridaybegin = $("#fridaybegin").val();
		var saturdaybegin = $("#saturdaybegin").val();
		var sundaybegin = $("#sundaybegin").val();
		var mondayend = $("#mondayend").val();
		var tuesdayend = $("#tuesdayend").val();
		var wednesdayend = $("#wednesdayend").val();
		var thursdayend = $("#thursdayend").val();
		var thursdayend = $("#mondayend").val();
		var fridayend = $("#fridayend").val();
		var saturdayend = $("#saturdayend").val();
		var sundayend = $("#sundayend").val();

		var available_clothing = $('#available_clothing').val();
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
		var sql_post = "INSERT INTO "+table_name+" (type, label, address, state, phone, zip, image, website, available_clothing, available_computer_access, available_day_room, available_dental_services, available_food_pantry, available_housing_assistance, available_meals, available_medical_services, available_personal_care_items, available_showers, available_shelter, available_transportation_assistance, hours_monday, hours_tuesday, hours_wednesday, hours_thursday, hours_friday, hours_saturday, hours_sunday, the_geom) VALUES ('"+type+"', '"+name+"', '"+address+"', '"+state+"', '"+phone+"', '"+zip+"', '"+image+"', '"+website+"', '"+available_clothing+"', '"+available_computer_access+"', '"+available_day_room+"', '"+available_dental_services+"', '"+available_food_pantry+"', '"+available_housing_assistance+"', '"+available_meals+"', '"+available_medical_services+"', '"+available_personal_care_items+"', '"+available_showers+"', '"+available_shelter+"', '"+available_transportation_assistance+"', '"+mondaybegin+"-"+mondayend+"', '"+tuesdaybegin+"-"+tuesdayend+"', '"+wednesdaybegin+"-"+wednesdayend+"', '"+thursdaybegin+"-"+thursdayend+"', '"+fridaybegin+"-"+fridayend+"', '"+saturdaybegin+"-"+saturdayend+"', '"+sundaybegin+"-"+sundayend+"', ST_SetSRID(ST_MakePoint("+the_geom+"), 4326) )";
		var url = "https://"+user_id+".cartodb.com/api/v2/sql?q="+sql_post+"&api_key="+apikey+"";

		$.post(url).fail(function() { //SQL post will fail if api key not present in form, then return to create map.
		    //alert( "error" );
			var mainlabel = $('#mainlabel');
			mainlabel.removeClass('search');
			mainlabel.removeClass('point');
			mainlabel.removeClass('expand');
			mainlabel.removeClass('list');	
			return;
		});
		$('#visibleform').hide();
		//location.reload(true);
		//$('#apikey').val('');
		//return false;
	});
	//return;
	//return true;
	
	var zoom = 11;
	var map;
	map = new L.map('map', { //Leaflet map
	  	zoomControl: true,
	  	center: [40.7, -111.8], //For now, map opens on slc
	  	zoom: zoom,
		minZoom: 2,
	  	maxZoom: 18
	});
	//console.log(map);
	//Mapbox option (courtesy acct tbushman)
	var options3 = {
		attribution: 'Map tiles by <a href="http://mapbox.com/">Mapbox</a><a href="http://cartodb.com/attributions"</a>'
	};  
//	L.tileLayer('http://{s}.tiles.mapbox.com/v3/tbushman.iba1gl27/{z}/{x}/{y}.png', options3).addTo(map); //Mapbox Terrain Attribution

	L.tileLayer('https://dnv9my2eseobd.cloudfront.net/v3/cartodb.map-4xtxp73f/{z}/{x}/{y}.png', options3).addTo(map);
	L.tileLayer('http://{s}.tiles.mapbox.com/v3/tbushman.1pnqxgvi/{z}/{x}/{y}.png').addTo(map); //slc transit


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

	       	var mainlabel = $('#mainlabel');
			$('lightbox').remove();
			$('images').remove();
			$('text').remove();
			$('mast').remove();
			$('here').remove();
			$('there').remove();


			mainlabel.removeClass('search');
			mainlabel.removeClass('point');
			mainlabel.removeClass('expand');
			mainlabel.removeClass('list');
		  	$('.button').removeClass('selected');
		   	$(this).addClass('selected');
			
	       	LayerActions[$(this).attr('id')] ();
		});
		$('#geolocate').click(initiate_geolocation); //form submit button
		
			
		$('.button#all').click();//Fit bounds of all records
		var mainlabel = $('#mainlabel');
		mainlabel.removeClass('search');
		mainlabel.removeClass('point');
		mainlabel.removeClass('expand');
		mainlabel.removeClass('list');
		mainlabel.addClass('expand');
		mainlabel.append('<here><h1>Emergency Services</h1><h4 style="line-height: 1.5em">If you are adding a new map feature, none of the fields are required, but you will be prompted for your lat/lon location.</h4><h4 style="line-height: 1.5em"> If you are updating an existing entry, please be sure to include hours of operation and selected services at the location you are updating. <b>Empty values will overwrite existing database content.</b></h4><h4 style="line-height: 1.5em">Feature edits require prior map refresh.</h4></here>');	
	});	
		
	function initiate_geolocation() {

		navigator.geolocation.getCurrentPosition(handle_geolocation_query);

	};

	function handle_geolocation_query(position){

		$('lightbox').remove();
		$('images').remove();
		$('text').remove();
		$('mast').remove();
		$('here').remove();
		$('there').remove();
		var mainlabel = $('#mainlabel');
		mainlabel.removeClass('search');
		mainlabel.removeClass('point');
		mainlabel.removeClass('expand');
		mainlabel.removeClass('list');
		mainlabel.addClass('point');

		var lat = position.coords.latitude;
		console.log(lat);
		var lon = position.coords.longitude;
		console.log(lon);
		var geom = $('#the_geom');
		geom.val(''+lon+','+lat+'');
		var the_geom = geom.val();

		var latinput = $('#lat');
		latinput.val(''+lat+'');
		var loninput = $('#lon');
		loninput.val(''+lon+'');
	   	var zoom = map.getZoom(zoom);
		var latlng = new L.LatLng(lat, lon);
		console.log(latlng);
		map.setView(latlng, zoom+1); //zoom to single feature

		var size = zoom*1.5;
		console.log(size);
		var resolution = size*20;

		var circle = new L.CircleMarker(latlng, {
                radius: size,
                fillColor: "rgba(0,0,0,0)",
                color: "#999",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.3
        });
		
		map.removeLayer(circle);
		circle.addTo(map);
		
		circle.on('click', function (e, latlon, pxPos, data, layer) {
			mainlabel.append('<here></a><h3 style="margin: 8px, auto; width: auto; display: inline-block; float: left; padding: 4px">Add Feature? </h3><a href="#" style="width: auto; left: 0; right: 30px; margin: 8px auto 4px 10px; text-align: center; padding: 10px" id="login">YES</a><a href="#" id="escape" style="float: right; position: relative; display: inline-block; margin: 0, auto"></here>');
			map.removeLayer(circle);
			//$('#visibleform').find('input[type=text], textarea').val('');
		});
		//main();
	}
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
			var resolution = size*20;
			var latlong = new L.LatLng(lat, lon);
			console.log(latlong);

			map.setView(latlong, zoom+1); //zoom to single feature


			var mainlabel = $('#mainlabel');
			mainlabel.removeClass('search');
			mainlabel.removeClass('point');
			mainlabel.removeClass('expand');
			mainlabel.removeClass('list');
			mainlabel.addClass('point');
			mainlabel.show();
			
			//'#mainlabel' becomes a map tooltip

			var cdbid = item.cartodb_id;
			console.log(cdbid);
			var type = item.type;
			var name = item.label;
			var website = item.website;
			var image = item.image;
			var phone = item.phone;
			var address = item.address;
			var state = item.state;
	      	var zip = item.zip;
			var monday = item.hours_monday.replace(':00:00-', 'am - ').replace(':00:00', 'am').replace('00am', '12am').replace('13am', '1pm').replace('14am', '2pm').replace('15am', '3pm').replace('16am', '4pm').replace('17am', '5pm').replace('18am', '6pm').replace('19am', '7pm').replace('20am', '8pm').replace('21am', '9pm').replace('22am', '10pm').replace('23am', '11pm');
	      	var tuesday = item.hours_tuesday.replace(':00:00-', 'am - ').replace(':00:00', 'am').replace('00am', '12am').replace('13am', '1pm').replace('14am', '2pm').replace('15am', '3pm').replace('16am', '4pm').replace('17am', '5pm').replace('18am', '6pm').replace('19am', '7pm').replace('20am', '8pm').replace('21am', '9pm').replace('22am', '10pm').replace('23am', '11pm');
	      	var wednesday = item.hours_wednesday.replace(':00:00-', 'am - ').replace(':00:00', 'am').replace('00am', '12am').replace('13am', '1pm').replace('14am', '2pm').replace('15am', '3pm').replace('16am', '4pm').replace('17am', '5pm').replace('18am', '6pm').replace('19am', '7pm').replace('20am', '8pm').replace('21am', '9pm').replace('22am', '10pm').replace('23am', '11pm');
	      	var thursday = item.hours_thursday.replace(':00:00-', 'am - ').replace(':00:00', 'am').replace('00am', '12am').replace('13am', '1pm').replace('14am', '2pm').replace('15am', '3pm').replace('16am', '4pm').replace('17am', '5pm').replace('18am', '6pm').replace('19am', '7pm').replace('20am', '8pm').replace('21am', '9pm').replace('22am', '10pm').replace('23am', '11pm');
	      	var friday = item.hours_friday.replace(':00:00-', 'am - ').replace(':00:00', 'am').replace('00am', '12am').replace('13am', '1pm').replace('14am', '2pm').replace('15am', '3pm').replace('16am', '4pm').replace('17am', '5pm').replace('18am', '6pm').replace('19am', '7pm').replace('20am', '8pm').replace('21am', '9pm').replace('22am', '10pm').replace('23am', '11pm');
	      	var saturday = item.hours_saturday.replace(':00:00-', 'am - ').replace(':00:00', 'am').replace('00am', '12am').replace('13am', '1pm').replace('14am', '2pm').replace('15am', '3pm').replace('16am', '4pm').replace('17am', '5pm').replace('18am', '6pm').replace('19am', '7pm').replace('20am', '8pm').replace('21am', '9pm').replace('22am', '10pm').replace('23am', '11pm');
	     	var sunday = item.hours_sunday.replace(':00:00-', 'am - ').replace(':00:00', 'am').replace('00am', '12am').replace('13am', '1pm').replace('14am', '2pm').replace('15am', '3pm').replace('16am', '4pm').replace('17am', '5pm').replace('18am', '6pm').replace('19am', '7pm').replace('20am', '8pm').replace('21am', '9pm').replace('22am', '10pm').replace('23am', '11pm');

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
			
			//Add item attributes to hidden form
			$('#typeinput').val(type);
			$("#fname").val(name);
			$('#address').val(address);
			$("#cdbid").val(cdbid);
			$("#state").val(state);
			$("#phone").val(phone);
			$("#zip").val(zip);
			$("#website").val(website);
			
			var header = $('<mast><h1 class="title">'+name+'</h1><contact><h2>'+phone+'</h2><p>'+address+'</p></contact></mast><images><a href="#'+cdbid+'" class="items pic" id="'+cdbid+'"><img src="'+image+'"></img></a></images><lightbox></lightbox><text><info><leftlist><list><ul id="services"></ul></list></leftlist><rightlist><list><ul id="nearby"></ul></list></rightlist></info><hours><wrapper><day><mo><h5>Mo:</h5></mo><tu><h5>Tu:</h5></tu><we><h5>We:</h5></we><thu><h5>Th:</h5></thu><fr><h5>Fr:</h5></fr><sa><h5>Sa:</h5></sa><su><h5>Su:</h5></su></day><times><mo><h5>' + monday + '</h5></mo><tu><h5>' + tuesday + '</h5></tu><we><h5>' + wednesday + '</h5></we><thu><h5>' + thursday + '</h5></thu><fr><h5>' + friday + '</h5></fr><sa><h5>' + saturday + '</h5></sa><su><h5>' + sunday + '</h5></su></times></wrapper></hours></text>');
			$('#mainlabel').append(header); //Single feature attribute appendage
			$('h2:empty').remove();
			$('p:empty').remove();
			
			$('mast').prepend('<topbar style="width: 100%; position: relative; display: inline-block"><a href="#" id="escape" style="pointer-events: auto"></a><a href="#" id="edit" style="pointer-events: auto"></a><a href="http://'+website+'" id="link" target="_blank"><h5>website</h5></a></topbar>')
			var height = $('mast').css('height');
			$('lightbox').css('height', height);
			
	      	$('#services').append('<li><h4>' +clothing +'</h4></li><li><h4>' + computer +'</h4></li><li><h4>' +day+'</h4></li><li><h4>' +dental+'</h4></li><li><h4>' +food+'</h4></li><li><h4>' +housing+'</h4></li><li><h4>' +meals+'</h4></li><li><h4>' +medical+'</h4></li><li><h4>' +personal+'</h4></li><li><h4>' +showers+'</h4></li><li><h4>' +shelter+'</h4></li><li><h4>' +trans+'</li>');
			var empties = $('li > h4:empty');
			empties.remove();
			$('li:empty').remove();
			i = 0;
			var services = $('#services li');
			if ( services.length > 0 ) {

				$('leftlist').prepend('<a href="#" id="listlength" style="pointer-events: auto"><h6>'+services.length+' services offered:</h6></a>');
				$('#services').hide();

				$('#listlength').click(function(){

					var mainlabel = $('#mainlabel');
					mainlabel.removeClass('search');
					mainlabel.removeClass('point');
					mainlabel.removeClass('expand');
					mainlabel.removeClass('list');
					mainlabel.addClass('expand');
					$('lightbox').html('');
					var height = $('mast').css('height');
					$('lightbox').css('height', height);
					//$('#mainlabel').css('width',  'auto');
					$('#services').show();
					$('rightlist > list').css('display', 'none');
					$('#escape').remove();
					$('topbar').prepend('<a href="#" id="escape"></a>');
					$('#escape').click(function(){

						var mainlabel = $('#mainlabel');
						mainlabel.removeClass('search');
						mainlabel.removeClass('point');
						mainlabel.removeClass('expand');
						mainlabel.removeClass('list');
						mainlabel.addClass('point');
						$('mast').css('height', 'auto');
						var height = $('mast').css('height');
						$('lightbox').css('height', height);

					});
					return true;

				});
			}

			
			$(document).on('click', '#edit', function(){

				var mainlabel = $('#mainlabel');
				$('lightbox').remove();
				$('images').remove();
				$('text').remove();
				$('mast').remove();
				$('here').remove();
				$('there').remove();

				mainlabel.removeClass('search');
				mainlabel.removeClass('point');
				mainlabel.removeClass('expand');
				mainlabel.removeClass('list');
				$('#visibleform').show();
				$('#addmap').hide();
				$('#submit2').show();
				$(document).on('click', '#close',function(){

					var mainlabel = $('#mainlabel');
					$('#visibleform').hide();
					mainlabel.removeClass('search');
					mainlabel.removeClass('point');
					mainlabel.removeClass('expand');
					mainlabel.removeClass('list');

				});
				$('#submit2').click(function(){

					mainlabel.removeClass('search');
					mainlabel.removeClass('point');
					mainlabel.removeClass('expand');
					mainlabel.removeClass('list');
					var type = $('#typeinput').val();
					var name = $("#fname").val();
					var address = $('#address').val();
					var cdbid = $("#cdbid").val();
					var image = $('#image').val();
					var state = $("#state").val();
					var phone = $("#phone").val();
					var zip = $("#zip").val();
					var website = $("#website").val();
					
					var mondaybegin = $("#mondaybegin").val();
					var tuesdaybegin = $("#tuesdaybegin").val();
					var wednesdaybegin = $("#wednesdaybegin").val();
					var thursdaybegin = $("#thursdaybegin").val();
					var fridaybegin = $("#fridaybegin").val();
					var saturdaybegin = $("#saturdaybegin").val();
					var sundaybegin = $("#sundaybegin").val();
					var mondayend = $("#mondayend").val();
					var tuesdayend = $("#tuesdayend").val();
					var wednesdayend = $("#wednesdayend").val();
					var thursdayend = $("#thursdayend").val();
					var fridayend = $("#fridayend").val();
					var saturdayend = $("#saturdayend").val();
					var sundayend = $("#sundayend").val();

					var available_clothing = $('#available_clothing').val();
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
					var sql_post = "UPDATE "+table_name+" SET type = '"+type+"', label = '"+name+"', address = '"+address+"', state = '"+state+"', phone = '"+phone+"', zip = '"+zip+"', image = '"+image+"', website = '"+website+"', available_clothing = '"+available_clothing+"', available_computer_access = '"+available_computer_access+"', available_day_room = '"+available_day_room+"', available_dental_services = '"+available_dental_services+"', available_food_pantry = '"+available_food_pantry+"', available_housing_assistance = '"+available_housing_assistance+"', available_meals = '"+available_meals+"', available_medical_services = '"+available_medical_services+"', available_personal_care_items = '"+available_personal_care_items+"', available_showers = '"+available_showers+"', available_shelter = '"+available_shelter+"', available_transportation_assistance = '"+available_transportation_assistance+"', hours_monday = '"+mondaybegin+"-"+mondayend+"', hours_tuesday = '"+tuesdaybegin+"-"+tuesdayend+"', hours_wednesday = '"+wednesdaybegin+"-"+wednesdayend+"', hours_thursday = '"+thursdaybegin+"-"+thursdayend+"', hours_friday = '"+fridaybegin+"-"+fridayend+"', hours_saturday = '"+saturdaybegin+"-"+saturdayend+"', hours_sunday = '"+sundaybegin+"-"+sundayend+"'  WHERE cartodb_id = "+cdbid+" ";
					var url = "https://"+user_id+".cartodb.com/api/v2/sql?q="+sql_post+"&api_key="+apikey+"";

					$.post(url).fail(function() { //SQL post will fail if api key not present in form, then return to create map.
					    alert( "error: refresh and try again" );
						var mainlabel = $('#mainlabel');
						mainlabel.removeClass('search');
						mainlabel.removeClass('point');
						mainlabel.removeClass('expand');
						mainlabel.removeClass('list');
						$('#visibleform').find('input[type=text], textarea').val('');
						return;	

					});
					$('#visibleform').hide();
					//location.reload(true);
					//$('#apikey').val('');
					//e.preventDefault();
					return false;

					//return;
				});
				$('#formtitle').remove();
				$('#visibleform').prepend('<h6 id="formtitle" style="color: #555">database content for <b>'+name+'</b></h6>');
				
			});
			
			var sql_init = new cartodb.SQL({ user: ''+user_id+'' });
			//pixel distance from selected feature sql query
			var bounds_select = "select cartodb_id, label, image, phone, address, state, type, website, zip, hours_monday, hours_tuesday, hours_wednesday, hours_thursday, hours_friday, hours_saturday, hours_sunday ,available_clothing, available_computer_access, available_day_room, available_dental_services, available_food_pantry, available_housing_assistance, available_meals, available_medical_services, available_personal_care_items, available_showers, available_shelter, available_transportation_assistance from "+table_name+" where st_distance( the_geom, st_GeomFromText('POINT("+lon+" "+lat+")', 4326), true ) < (SELECT CDB_XYZ_Resolution("+zoom+")*(("+zoom+")*1.15)) ";
			//query for euclidian nearby features
			sql_init.execute(bounds_select).done(function(ret) {

				var list = ret.rows;
				i = 0;

				if (list.length > 0) {

					$('rightlist').prepend('<a href="#" id="listlength"><h6>'+list.length+' services nearby:</h6></a>');
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
						$('rightlist > list').css('display', 'inline-block');
						$('#services').hide();
						$('.cartodb_id').click(function(e, latlon, pxPos, data, layer) {

							var cdbid = [$(this).attr('id')];
							$('lightbox').remove();
							$('images').remove();
							$('text').remove();
							$('mast').remove();
							$('here').remove();
							$('there').remove();

							var sql_get = 'select cartodb_id, label, image, phone, address, state, type, website, zip, hours_monday, hours_tuesday, hours_wednesday, hours_thursday, hours_friday, hours_saturday, hours_sunday ,available_clothing, available_computer_access, available_day_room, available_dental_services, available_food_pantry, available_housing_assistance, available_meals, available_medical_services, available_personal_care_items, available_showers, available_shelter, available_transportation_assistance, ST_X(the_geom) lon, ST_Y(the_geom) lat FROM '+table_name+' WHERE cartodb_id='+cdbid+'';
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
					var height = $('lightbox > img').css('height');
					console.log(height);
					$('lightbox').css('height', height);
					var width = $('lightbox > img').css('width');
					$('#mainlabel').css('width', width+'%');
					$('mast').css('height', height);
					$('#escape').remove();
					$('topbar').prepend('<a href="#" id="escape"></a>');

					$('#escape').click(function(){

						var mainlabel = $('#mainlabel');
						mainlabel.removeClass('search');
						mainlabel.removeClass('point');
						mainlabel.removeClass('expand');
						mainlabel.removeClass('list');
						mainlabel.addClass('point');
						$('lightbox').html('');
						$('mast').css('height', 'auto');
						var height = $('mast').css('height');
						$('lightbox').css('height', height);
						
					});
				});
				e.preventDefault();
				return false;
			});
			

		});
		//return false;
	};
	//search///////////////////////////////////////////////////////////////////////////////////////
	$( "#input" ).autocomplete({

		source: function(request, response) { 

			var sql_search = new cartodb.SQL({ user: ''+user_id+'' });
			//ilike sql
			sql_search.execute("select cartodb_id, label, image, phone, address, state, type, website, zip, hours_monday, hours_tuesday, hours_wednesday, hours_thursday, hours_friday, hours_saturday, hours_sunday ,available_clothing, available_computer_access, available_day_room, available_dental_services, available_food_pantry, available_housing_assistance, available_meals, available_medical_services, available_personal_care_items, available_showers, available_shelter, available_transportation_assistance from "+table_name+" where label ilike '%" + request.term + "%' ORDER BY label ", function(ret) { 

				var list = ret.rows;

				var helplabel = $('#helplabel');
				helplabel.removeClass('one');
				helplabel.removeClass('two');
				helplabel.removeClass('three');
				helplabel.html('');
				var mainlabel = $('#mainlabel');
				$('lightbox').remove();
				$('images').remove();
				$('text').remove();
				$('mast').remove();
				$('here').remove();
				$('there').remove();
				
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

					var sql_get = 'select cartodb_id, label, image, phone, address, state, type, website, zip, hours_monday, hours_tuesday, hours_wednesday, hours_thursday, hours_friday, hours_saturday, hours_sunday ,available_clothing, available_computer_access, available_day_room, available_dental_services, available_food_pantry, available_housing_assistance, available_meals, available_medical_services, available_personal_care_items, available_showers, available_shelter, available_transportation_assistance, ST_X(the_geom) lon, ST_Y(the_geom) lat FROM '+table_name+' WHERE cartodb_id='+cdbid+'';
					$('lightbox').remove();
					$('images').remove();
					$('text').remove();
					$('mast').remove();
					$('here').remove();
					$('there').remove();
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
			var sql_select = 'select cartodb_id, label, image, phone, address, state, type, website, zip, hours_monday, hours_tuesday, hours_wednesday, hours_thursday, hours_friday, hours_saturday, hours_sunday ,available_clothing, available_computer_access, available_day_room, available_dental_services, available_food_pantry, available_housing_assistance, available_meals, available_medical_services, available_personal_care_items, available_showers, available_shelter, available_transportation_assistance, ST_X(the_geom) lon, ST_Y(the_geom) lat FROM '+table_name+' WHERE cartodb_id='+ data.cartodb_id ;
			sql_init.execute(sql_select).done(function(ret){

				$('lightbox').remove();
				$('images').remove();
				$('text').remove();
				$('mast').remove();
				$('here').remove();
				$('there').remove();
				
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
				var bounds_select = "select cartodb_id, label, image, phone, address, state, type, website, zip, hours_monday, hours_tuesday, hours_wednesday, hours_thursday, hours_friday, hours_saturday, hours_sunday, available_clothing, available_computer_access, available_day_room, available_dental_services, available_food_pantry, available_housing_assistance, available_meals, available_medical_services, available_personal_care_items, available_showers, available_shelter, available_transportation_assistance from "+table_name+" where st_distance( the_geom, st_GeomFromText('POINT("+lon+" "+lat+")', 4326), true ) < (SELECT CDB_XYZ_Resolution("+zoom+")*(("+zoom+")*1.15)) ";
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

								$('lightbox').remove();
								$('images').remove();
								$('text').remove();
								$('mast').remove();
								$('here').remove();
								$('there').remove();
								
								mainlabel.removeClass('search');
								mainlabel.removeClass('point');
								mainlabel.removeClass('expand');
								mainlabel.removeClass('list');
								mainlabel.addClass('point');
								var cdbid = [$(this).attr('id')];
								var sql_get = 'select cartodb_id, label, image, phone, address, state, type, website, zip, hours_monday, hours_tuesday, hours_wednesday, hours_thursday, hours_friday, hours_saturday, hours_sunday ,available_clothing, available_computer_access, available_day_room, available_dental_services, available_food_pantry, available_housing_assistance, available_meals, available_medical_services, available_personal_care_items, available_showers, available_shelter, available_transportation_assistance, ST_X(the_geom) lon, ST_Y(the_geom) lat FROM '+table_name+' WHERE cartodb_id='+cdbid+'';
								uiActions(sql_get);

								e.preventDefault();
							});
						}
					}
					else 
					{
						$('lightbox').remove();
						$('images').remove();
						$('text').remove();
						$('mast').remove();
						$('here').remove();
						$('there').remove();
						
						mainlabel.removeClass('search');
						mainlabel.removeClass('point');
						mainlabel.removeClass('expand');
						mainlabel.removeClass('list');
						mainlabel.addClass('point');
						//single feature cartodb_id query
						$.get("http://"+user_id+".cartodb.com/api/v2/sql?q=select cartodb_id, label, image, phone, address, state, type, website, zip, hours_monday, hours_tuesday, hours_wednesday, hours_thursday, hours_friday, hours_saturday, hours_sunday ,available_clothing, available_computer_access, available_day_room, available_dental_services, available_food_pantry, available_housing_assistance, available_meals, available_medical_services, available_personal_care_items, available_showers, available_shelter, available_transportation_assistance, ST_X(the_geom) lon, ST_Y(the_geom) lat FROM "+table_name+" WHERE cartodb_id="+data.cartodb_id, function(ret) {	

							var cdbid = ret.rows[0].cartodb_id;
							var sql_get = 'select cartodb_id, label, image, phone, address, state, type, website, zip, hours_monday, hours_tuesday, hours_wednesday, hours_thursday, hours_friday, hours_saturday, hours_sunday ,available_clothing, available_computer_access, available_day_room, available_dental_services, available_food_pantry, available_housing_assistance, available_meals, available_medical_services, available_personal_care_items, available_showers, available_shelter, available_transportation_assistance, ST_X(the_geom) lon, ST_Y(the_geom) lat FROM '+table_name+' WHERE cartodb_id='+cdbid+'';
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
window.onload = main;
