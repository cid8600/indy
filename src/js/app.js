(function($) {

    function checkScrollPos($el, namespace, classes, offset) {

        var $window = $(window);
        var offest = this.offset || 0;

        if (_isScrolledIntoView($el, offset)) {
            $el.css('visibility', 'visible').addClass(classes);
            $window.off('scroll[' + namespace + ']');
            $window.off('load[' + namespace + ']');
        }

        // Helper Function for animations
        function _isScrolledIntoView($el, offset) {

            var docViewTop = $window.scrollTop();
            var docViewBottom = docViewTop + $window.height();

            var elemTop = $el.offset().top;
            var elemBottom = elemTop + $el.height() - offset;

            return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
        }
    }

    // animate elements
    $(function (cb) {

        var $heroEl, $heroLock, $heroImg, $carsEl, classUp, classDown, classLeft, $window;
        var isIE9 = (navigator.userAgent.indexOf("MSIE 9") > -1) ? true : false;

        $window = $(window);
        $heroEl = $('#hero-module');
        $heroLock = $('.left-col img', $heroEl);
        $heroImg = $('.heroes', $heroEl);
        $carsEl = $('#cars');
        $dudeEl = $('#buy-module .right-col').children('img');

        classUp = 'animated fadeInUp';
        classDown = 'animated fadeInDown';
        classLeft = 'animated fadeInLeft';

        var heroOffset = 0;
        var menOffset = 0;
        var carsOffset = 200;
        var dudeOffset = 0;

        if (!isIE9) {

            $window.on('scroll.down', $.throttle(20, function (e) {
                cb($heroLock, 'down', classDown, heroOffset);
            }));

            $window.on('scroll.up', $.throttle(20, function (e) {
                cb($heroImg, 'up', classUp, menOffset);
            }));

            $window.on('scroll.cars', $.throttle(20, function () {
                cb($carsEl, 'cars', classLeft, carsOffset);
            }));

            $window.on('scroll.dude', $.throttle(20, function (e) {
                cb($dudeEl, 'up', classUp, dudeOffset);
            }));

            $window.on('load.hero', function (e) {
                cb($heroLock, 'down', classDown, heroOffset);
                cb($heroImg, 'up', classUp, menOffset);
            });

            $window.on('load.cars', function (e) {
                cb($carsEl, 'cars', classLeft, carsOffset);
            });

            $window.on('load.dude', function (e) {
                cb($dudeEl, 'up', classUp, dudeOffset);
            });

        } else {
            $carsEl.css('visibility', 'visible');
            $heroLock.css('visibility', 'visible');
            $heroImg.css('visibility', 'visible');
        }


    }(checkScrollPos));

    // Counter App
    $(function(cb) {
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

    }(checkScrollPos));

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
