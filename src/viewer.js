/*
Viewer object
	get: function to retrieve the media parms based on a url
	store: array of pairs consisting of:
		regexp string - matches the url
		parms (function|object) - parms for the OBJECT (flash) or IFRAME
*/
!function(){

this.Viewer = {

	LIB: [],

	match: function(url, options){

		var result = {};

		if( typeOf(url)=='element' ) url = url.src || url.href;

		this.LIB.some( function(item){

			return url.test( item[0], 'i' )
				//item[1] can be a value or a function(url,options)
				&& (result = Function.from(item[1])(url, options) );

		});

		return result;
	},


	preload: function(url, options, callback ){

		var match = this.match(url, options),
			preload;

		function done(){
			if( callback ) callback( preload, preload.width, preload.height );
		}

		options = {id: 'VIEW.' + String.uniqueID(), width:options.width, height:options.height };

		if( match.img ){

			preload = new Image();
			preload.onload = done;  //delayed onload to know height&width of the image
			preload.src = match.img;
			return;

		} else if( match.url ){

			//ffs: add check for html5 enabled browsers & html5 enabled video sources
			preload = $(new Swiff( match.url, Object.merge(options, {
    			params: {
					wmode: 'transparent',//'opaque', //'direct',
					//bgcolor: '#FFFFFF',
					allowfullscreen: 'true',
					allowscriptaccess: 'always'
				}
			}, match ) ) );

		} else if( match.src ){

			preload = new IFrame( Object.merge( options, match, { frameborder:0 } ) );
			//The iframe loading actually starts only the iframe is added to the dom
			document.body.adopt(preload);

		} else {

			preload = new Element('p.error[html="Error"]');

		}

		done.delay(1); //sniff
		//console.log("PRELOAD ", typeOf( preload ), preload );

	},
		preloads:function(elements, options, callback){

		var countdown = elements.length,
			preloads = [],
			w=0,
			h=0;

		if( !countdown ) return this.preload(elements, options, callback);

		while( elements[0] ){

			this.preload(elements.shift(), options, function(preload, width, height){

				preloads.push( preload );
				w = w.max(width);
				h = h.max(height);
				console.log( preloads.length,w,width,h,height, countdown==1?'done':'');

				if( !--countdown && callback ) callback( preloads, w, h );

			});

		}

	}

}

var AdobeFlashPlayer = 'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000';

Viewer.LIB.append([

	['.(bmp|gif|png|jpg|jpeg|tiff)$', function(url){
		return { img:url }
	}],

	//google viewer for common formats
	['.(tiff|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar)$',function(url){
		return {
  			src:'http://docs.google.com/viewer?embedded=true&url=' + encodeURIComponent(url), //url,
			width:850,
			height:500
		}
	}],

	//google maps
	['^https?://maps.google.com/maps',function(url){

		//href="https://maps.google.com/maps?q=Atomium,%20City%20of%20Brussels,%20Belgium&amp;output=embed"
		return {
  			src: url + '&output=embed',
			width:850,
			height:500
		}

	}],


	//add some mp3/audio player here


	['facebook.com', function(url){
  		url = 'http://www.facebook.com/v/' + url.split('v=')[1].split('&')[0];
  		return {
  			url:url,
			movie:url,
			classid: AdobeFlashPlayer,
			width:756, //320,
			height:424 //240
		}
	}],

	['flickr.com', function(url){
		return {
			url: 'http://www.flickr.com/apps/video/stewart.swf',
			classid: AdobeFlashPlayer,
			width:500,
			height:375,
			params: {flashvars: 'photo_id=' + url.split('/')[5] + '&amp;show_info_box=true' }
		};
	}],

	['youtube.com/watch', function(url){
		return {
			//src: 'http://www.youtube.com/embed/'+url.split('v=')[1],
			url:'http://www.youtube.com/v/'+url.split('v=')[1],
			width:480, //640
			height:385  //385
		}
	}],

	//youtube playlist
	['youtube.com/view', function(url){
		return{
			url:'http://www.youtube.com/p/'+url.split('p=')[1],
			width:480,
			height:385
		};
	}],

	['dailymotion.com',function(url){
		return {
			src:'http://www.dailymotion.com/embed/video/'+url.split('/')[4].split('_')[0],
			//url:url,
			width:480,
			height:270 //381
		}
	}],

	['metacafe.com/watch', function(url){
		//http://www.metacafe.com/watch/<id>/<title>/ => http://www.metacafe.com/fplayer/<id>/<title>.swf
		return {
			url:'http://www.metacafe.com/fplayer/' + url.split('/')[4] +'/.swf?playerVars=autoPlay=no',
			//url:'http://www.metacafe.com/fplayer/' + url.split('watch/')[1].slice(0,-1) +'.swf?playerVars=autoPlay=no',
			width:400,		//540	600
			height:350		//304	338
		}
	}],

	['vids.myspace.com', function(url){
		return {
			url:url,
			width:425,		//540	600
			height:360		//304	338
		}
	}],

	['veoh.com/watch/', function(url){
		//url: 'http://www.veoh.com/static/swf/webplayer/WebPlayer.swf?version=AFrontend.5.5.2.1001&permalinkId='+url.split('watch/')[1]+'&player=videodetailsembedded&videoAutoPlay=false&id=anonymous',
		return {
			url:'http://www.veoh.com/veohplayer.swf?permalinkId='+url.split('watch/')[1]+'&player=videodetailsembedded&videoAutoPlay=false&id=anonymous',
			width:410,
			height:341
		}
	}],


	['https?://www.ted.com/talks/', function(url){
	//http://www.ted.com/talks/doris_kim_sung_metal_that_breathes.html
	//<iframe src="http://embed.ted.com/talks/doris_kim_sung_metal_that_breathes.html" width="560" height="315" frameborder="0" scrolling="no" webkitallowfullscreen="" mozallowfullscreen="" allowfullscreen=""></iframe>
		return {
			src:'http://embed.ted.com/talks/'+url.split('/')[4],
			width:853, //640, //560,
			height:480, //360, //315
		}
	}],

	['viddler.com/', function(url){
		return {
			url: url,
			classid: AdobeFlashPlayer,
			width: 545, //437,
			height: 451, //370,
			params: {id:'viddler_'+url.split('/')[4], movie:url }
		}
	}],

	['http://vimeo.com/', function(url){
		return {
			//html5 compatible --- use iframe
			//src: 'http://player.vimeo.com/video/' + url.split('/')[3],
			url:'http://www.vimeo.com/moogaloop.swf?server=www.vimeo.com&amp;clip_id='+url.split('/')[3],
			width:640,
			height:360
		}
	}],

	['https?://', function(url){
		return {
			//default : catch iframe urls.
			src:url
		}
	}]

]);

}();
