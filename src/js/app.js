(function($) {

    // Helper Function for animations
    function isScrolledIntoView($el, offset) {

        offest = offset || 0;
      var $window = $(window);

      var docViewTop = $window.scrollTop();
      var docViewBottom = docViewTop + $window.height();

      var elemTop = $el.offset().top;
      var elemBottom = elemTop + $el.height() + offset;

      return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    }

    // animate elements in hero
    $(function (cb) {

        var $heroEl, $heroLock, $heroImg, classUp, classDown, $window;

        $window = $(window);
        $heroEl = $('#hero-module');
        $heroLock = $('.left-col img', $heroEl);
        $heroImg = $('.heroes', $heroEl);

        classUp = 'animated fadeInUp';
        classDown = 'animated fadeInDown';

        function checkScroll($el, namespace, classes) {
            if (cb($el, 0)) {
                $el.css('visibility', 'visible').addClass(classes);
                $window.off('scroll[' + namespace + ']');
            }
        }

        $window.on('scroll.up', function (e) {
            checkScroll($heroImg, 'up', classUp);
        });

        $window.on('scroll.down', function (e) {
            checkScroll($heroLock, 'down', classDown);
        });

        $window.on('load', function (e) {
            checkScroll($heroLock, 'down', classDown);
            checkScroll($heroImg, 'up', classUp);
        });

    }(isScrolledIntoView));

    // Counter App
    $(function(cb) {
        var isIE9 = (navigator.userAgent.indexOf("MSIE 9") > -1) ? true : false;

        var clock, opts, $el, classLeft, $window;

        opts = {
            targetEls: [".counter"],
            network: "sales.fyre.co",
            siteId: "371327",
            articleIds: ["CURATE"]
        };
        $window = $(window);
        classLeft = 'animated fadeInLeft';

        if (!isIE9) {
            clock = window.clock = new FlipCounter(opts);
            $el = $('#cars');


            $(window).on('scroll.cars', function (e) {
                if (cb($el.parent(), 200)) {
                    $el.css('visibility', 'visible').addClass(classLeft);
                    $(window).off('scroll.cars');
                }
            });

            $window.on('load', function (e) {
                if (cb($el.parent(), 200)) {
                    $el.css('visibility', 'visible').addClass(classLeft);
                    $(window).off('scroll.cars');
                }
            });

        }

    }(isScrolledIntoView));

    // More Mediawall App
    $(function() {

        Livefyre.require(['streamhub-wall#3.3.2'], function(MediaWall) {
            var wall = window.wall = new MediaWall({
                el: document.getElementById("wall"),
                collection: {
                    "network": "indycar.fyre.co",
                    "siteId": "369833",
                    "articleId": "custom-1434402399842"
                },
                initial: 9,
                showMore: 12
            });

            wall._collection.on('data', function() {
                clock._clockInstances[0].increment();
            });

            wall._wallView.$el.on('removeContentView.hub', function(e) {
                clock._clockInstances[0].decrement();
            });

        });

        $('#wallShowMore').click(function(e) {
            e.preventDefault();
            wall._wallView.showMore();
        });

    });

    // Top Mediawall App
    $(function() {
        Livefyre.require(['streamhub-wall#3.3.2'], function(MediaWall) {
            var walltop = window.walltop = new MediaWall({
                el: document.getElementById("top-wall"),
                collection: {
                    "network": "indycar.fyre.co",
                    "siteId": "369833",
                    "articleId": "custom-1434401721002"
                },
                initial: 3
            }).pause();
        });
    }());

    // Poll App
    $(function() {
        Livefyre.require(["poll#0"], function(a) {
            (new a({
                networkId: "indycar.fyre.co",
                siteId: "369833",
                pollId: "e6cd815213af11e5b62e12b19652bf83",
                env: "prod"
            })).render(document.getElementById("lf-poll-e6cd815213af11e5b62e12b19652bf83"));
        });
    }());

    // Trending App
    $(function() {
        Livefyre.require(['//cdn.livefyre.com/libs/app-embed/v0.6.4/app-embed.min.js'], function(appEmbed) {
            appEmbed.loadAll().done(function(embed) {
                embed = embed[0];
                embed.el.onload(embed.getConfig());
            });
        });
    }());

    // Video Player
    $(function() {
        videojs.options.flash.swf = "/js/videojs/video-js.swf";

        videojs('vid1', {
            "techOrder": ["youtube"],
            "src": "http://www.youtube.com/watch?v=L0s63Jdbwk0"
        }).ready(function() {

            this.one('ended', function() {
                this.src('http://www.youtube.com/watch?v=jofNR_WkoCE');
                this.play();
            });
        });
    }());

    //  FB Share
    $(function() {
        $('.btn-fb a').click(function(e) {
            e.preventDefault();
            FB.ui({
                method: 'share',
                href: 'https://developers.facebook.com/docs/',
            }, function(response) {});

        });
    }());

}(jQuery));
