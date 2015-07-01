(function($) {

    // animate elements
    $(function () {

        var $heroEl,
            $heroLock,
            $heroImg,
            $dudeEl,
            $carsEl,
            classUp,
            classDown,
            classLeft,
            $window,
            isIE9,
            mobiUA,
            heroOffset,
            menOffset,
            carsOffset,
            dudeOffset,
            orientation;

        isIE9 = (navigator.userAgent.indexOf("MSIE 9") > -1) ? true : false;
        mobiUA = (navigator.userAgent.indexOf("Mobi") > -1) ? true : false;

        $window = $(window);
        $heroEl = $('#hero-module');
        $heroLock = $('.left-col img', $heroEl);
        $heroImg = $('.heroes', $heroEl);
        $carsEl = $('#cars');
        $dudeEl = $('#buy-module .right-col').children('img');

        classUp = 'animated fadeInUp';
        classDown = 'animated fadeInDown';
        classLeft = 'animated fadeInLeft';

        heroOffset = 200;
        menOffset = 300;
        carsOffset = 300;
        dudeOffset = 500;


        if (!isIE9) {
            window.onorientationchange = readDeviceOrientation;
            readDeviceOrientation();
            loadEvents();
            scrollEvents();
        } else {
            animElsVisible();
        }

        function loadEvents() {

            $window.on('load.herolock', function (e) {
                checkScrollPos($heroLock, 'herolock', classDown, heroOffset, orientation);
                checkScrollPos($heroImg, 'men', classUp, menOffset, orientation);
            });

            $window.on('load.cars', function (e) {
                checkScrollPos($carsEl, 'cars', classLeft, carsOffset, orientation);
            });

            $window.on('load.dude', function (e) {
                checkScrollPos($dudeEl, 'dude', classUp, dudeOffset, orientation);
            });
        }

        function scrollEvents () {
            $window.on('scroll.herolock', $.throttle(20, function (e) {
                checkScrollPos($heroLock, 'herolock', classDown, heroOffset, orientation);
            }));

            $window.on('scroll.men', $.throttle(20, function (e) {
                checkScrollPos($heroImg, 'men', classUp, menOffset, orientation);
            }));

            $window.on('scroll.cars', $.throttle(20, function () {
                checkScrollPos($carsEl, 'cars', classLeft, carsOffset, orientation);
            }));

            $window.on('scroll.dude', $.throttle(20, function (e) {
                checkScrollPos($dudeEl, 'dude', classUp, dudeOffset, orientation);
            }));
        }

        function animElsVisible() {
            $carsEl.css('visibility', 'visible');
            $heroLock.css('visibility', 'visible');
            $heroImg.css('visibility', 'visible');
        }

        function animElsHidden() {
            $carsEl.css('visibility', 'hidden');
            $heroLock.css('visibility', 'hidden');
            $heroImg.css('visibility', 'hidden');
        }

        function checkScrollPos($el, namespace, classes, offset, orientation) {

            var $window = $(window);
            var o = offset || 0;

            if (_isScrolledIntoView($el, o, orientation)) {
                $el.css('visibility', 'visible').addClass(classes);
                $window.off('scroll[' + namespace + ']');
                $window.off('load[' + namespace + ']');
            }

            // Helper Function for animations
            function _isScrolledIntoView($el, offset, orientation) {

                var docViewTop = $window.scrollTop();
                var elemTop = ($el.offset().top - offset);

                return (elemTop <= docViewTop);
            }
        }

        function readDeviceOrientation() {
             orientation = (Math.abs(window.orientation) === 90) ? 'Landscape' : 'Portrait';
            return orientation;
        }

    }());

    // Counter App
    $(function() {
        var isIE9 = (navigator.userAgent.indexOf("MSIE 9") > -1) ? true : false;

        var clock, opts, counter;

        opts = {
            targetEls: [".counter"],
            network: "sales.fyre.co",
            siteId: "371327",
            articleIds: ["CURATE"]
        };

        if (!isIE9) {
            clock = window.clock = new FlipCounter(opts);

        } else {
            counter = new LfCommentCounts(opts, createClock);
        }

        function createClock (data) {

            var contentCount = data.data[opts.siteId][opts.articleIds[0]].total; // presumes only the first articleId is important
            var string = '<ul class="flip nocomma"><li class="flip-clock-before"><a href="#"><div class="up"><div class="shadow"></div><div class="inn">{{n}}</div></div><div class="down"><div class="shadow"></div><div class="inn">{{n}}</div></div></a></li><li class="flip-clock-active"><a href="#"><div class="up"><div class="shadow"></div><div class="inn">{{n}}</div></div><div class="down"><div class="shadow"></div><div class="inn">{{n}}</div></div></a></li></ul>';
            contentCount = (""+contentCount).split("");
            var markup = "";

            for (var i = 0; contentCount.length > 0; ++i) {
              var digit = string.replace(/{{n}}/g, contentCount.pop());
              if ( i % 2 === 0 && i > 0) {
                digit = digit.replace(/nocomma/g, 'comma');
                i = -1;
              }
              markup = digit + markup;
            }

            $(opts.targetEls[0]).addClass('flip-clock-wrapper').append(markup);

        }

    }());

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
            appEmbed.loadAll().done(function(appEmbed) {});
        });
    }());

    // Video Player
    $(function() {
      var player = '<video id="vid1" class="video-js vjs-default-skin" controls \
        preload="auto" width="510" height="286" src="https://www.youtube.com/watch?v=2xOtB_wm7ac" \
          data-setup="{}"> \
           <p class="vjs-no-js"> \
             To view this video please enable JavaScript, and consider upgrading to a web browser \
             that <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a> \
           </p> \
         </video>';
      
      $('#video').append(player);
      
      
      
        videojs('vid1', {
            "techOrder": ["youtube"]
        }).ready(function() {
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
