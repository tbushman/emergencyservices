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
		self.dPath = self.dPathAttr()
		self.wWidth = window.innerWidth;
		self.wHeight = window.innerHeight;
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
	processImage: function() {
		
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
					checkImage(can, w, h, maxWidth, maxHeight)
						}
			}
				reader.readAsDataURL(file);
		}
	},
	

	reSize: function(can, w, h, maxWidth, maxHeight){
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
		checkImage(can, w, h, maxWidth, maxHeight)
	},

	checkImage: function(can, w, h, maxWidth, maxHeight) {
		
		
		if (h > maxHeight) {
			console.log('half')
			reSize(can, w, h, maxWidth, maxHeight)
		} else {
			if (maxHeight === 200) {
				drawThumb(can, w, h)
			} else {
				drawImage(can, w, h)
			}						
		}						
	},

	drawImage: function(can, w, h) {
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
						checkImage(can, w, h, maxWidth, maxHeight)
							}
				}
			})
		}, 'image/jpeg', 0.95);
	},

	drawThumb: function(can, w, h) {
		can.height = h;
		can.width = w;
		var ctx = can.getContext('2d');
		ctx.drawImage(img, 0, 0, w, h);
		dataurl = can.toDataURL("image/jpeg", 0.8);
		setTimeout(function(){
			
			$('#inputthumb').val(dataurl.replace(/data:image\/jpeg;base64,/, ''))
							
		}, 100)
	}

}