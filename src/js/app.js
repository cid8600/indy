(function ($, videojs) {
	$(document).ready(function() {
	  $('.btn-fb a').click(function(e) {
	    e.preventDefault();
	    FB.ui({
	    method: 'share',
	    href: 'https://developers.facebook.com/docs/',
	  }, function(response){});

	  });

    videojs.options.flash.swf = "/js/videojs/video-js.swf";

    videojs('vid1', { "techOrder": ["youtube"], "src": "http://www.youtube.com/watch?v=L0s63Jdbwk0" }).ready(function() {

      this.one('ended', function() {
        this.src('http://www.youtube.com/watch?v=jofNR_WkoCE');
      this.play();
      });
    });
	});
}(jQuery, videojs));