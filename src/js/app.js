// will fix your ajax in ie9
(function ($) {
    'use strict';

  if (window.XDomainRequest) {
    $.ajaxTransport(function(s) {
      if (s.crossDomain && s.async) {
        if (s.timeout) {
          s.xdrTimeout = s.timeout;
          delete s.timeout;
        }
        var xdr;
        return {
          send: function(_, complete) {
            function callback(status, statusText, responses, responseHeaders) {
              xdr.onload = xdr.onerror = xdr.ontimeout = $.noop;
              xdr = undefined;
              complete(status, statusText, responses, responseHeaders);
            }
            xdr = new XDomainRequest();
            xdr.onload = function() {
              callback(200, "OK", {
                text: xdr.responseText
              }, "Content-Type: " + xdr.contentType);
            };
            xdr.onerror = function() {
              callback(404, "Not Found");
            };
            xdr.onprogress = $.noop;
            xdr.ontimeout = function() {
              callback(0, "timeout");
            };
            xdr.timeout = s.xdrTimeout || Number.MAX_VALUE;
            xdr.open(s.type, s.url);
            xdr.send((s.hasContent && s.data) || null);
          },
          abort: function() {
            if (xdr) {
              xdr.onerror = $.noop;
              xdr.abort();
            }
          }
        };
      }
    });
  }
}(jQuery));

(function($) {
    'use strict';
    /**
     * Small client wrapper around nComments endpoint
     **/
    var LfCommentCounts = window.LfCommentCounts = function (opts, callback) {
        opts = opts || {};
        this.network = opts.network;
        this.siteId = opts.siteId;
        this.articleIds = opts.articleIds;
        this.callback = callback;

        this.getCounts();
    };
    LfCommentCounts.prototype.getCounts = function () {
        var url = "http://bootstrap." +
                  this.network +
                  "/api/v1.1/public/comments/ncomments/" +
                  base64.btoa(this._createSiteArticlePairing()) +
                  ".json";
        $.get(url, this.callback);
    };
    LfCommentCounts.prototype._createSiteArticlePairing = function () {
        var retStr = this.siteId + ":";
        for (var i = 0, len = this.articleIds.length; i < len; i++) {
            retStr +=  this.articleIds[i];
            if (i < len - 1) {
                retStr += ",";
            }
        }

        return retStr;
    };

    LfCommentCounts.prototype.toModel = function (requestData) {
        return {
            feed: requestData.feed,
            instagram: requestData.instagram,
            livefyre: requestData.livefyre,
            facebook: requestData.facebook,
            total: requestData.total,
            twitter: requestData.twitter,
        };
    };

}(jQuery));


(function($) {
    'use strict';
/**
 * Wrapper around the FlipClock library that
 * marries it with the ncomments endpoint. Emits a
 * global "increment.counter" event on the document
 * body per tick.
 **/
var FlipCounter = window.FlipCounter = function (opts) {
    opts = opts || {};
    this.opts = opts;
    this.targetEls = opts.targetEls;
    this.network = opts.network;
    this.siteId = opts.siteId;
    this.articleIds = opts.articleIds;
    this.defaultInterval = opts.defaultInterval || 30000;
    this.pollFrequency = opts.pollFrequency || 120000;

    this._clockInstances = [];
    // this._dataAdapter;

    $("body").on("increment.counter", this.update.bind(this));
    this.init();
};
FlipCounter.prototype.init = function () {
    var clk;

    for (var i = 0, len = this.targetEls.length; i < len; i++) {
        clk = $(this.targetEls[i]).FlipClock(0, {
            clockFace: 'Counter'
        });
        this._clockInstances.push(clk);
    }
    this._dataAdapter = new LfCommentCounts(this.opts, this.callback.bind(this));
};
FlipCounter.prototype.callback = function (data) {
    var counts = this._dataAdapter.toModel(data.data[this.siteId][this.articleIds[0]]);
    var clock = this._clockInstances[0];

    if (clock.getTime().time === 0) {
        for (var i = 0, len = this._clockInstances.length; i < len; i++) {
            this._clockInstances[i].setTime(counts.total);
            this._addCommas(this._clockInstances[i]);
        }
        this.tick(1, this.defaultInterval);
    }
    else {
        var timeDiff = counts.total - clock.getTime().time;
        var interval = timeDiff > 1 ? Math.floor(this.pollFrequency / timeDiff) : this.defaultInterval;
        this.tick(1, interval);
    }
};
FlipCounter.prototype.tick = function (step, interval) {
    if (step == -1) {
        this._dataAdapter.getCounts();
        return;
    }
    if (step * interval < this.pollFrequency) {
        step++;
    }
    else {
        step = -1;
    }

    $("body").trigger("increment.counter");
    setTimeout(this.tick.bind(this, step, interval), interval);
};
FlipCounter.prototype.update = function () {
    for (var i = 0, len = this._clockInstances.length; i < len; i++) {
        this._clockInstances[i].increment();
        this._addCommas(this._clockInstances[i]);
    }
};
FlipCounter.prototype._addCommas = function (clockInstance) {
    var numDigits = clockInstance.face.lists.length;

    if (numDigits > 3) {
        for (var i = numDigits, step = 3; i > step; i -= step) {
            $(clockInstance.face.lists[i - step])[0].$obj.addClass("comma");
        }
    }
};

}(jQuery));

(function($) {
    'use strict';

    var INDY = {

        init: function() {

            var self = this;
            var fnArr = [self.evHandlers, self.animate, self.videoModule, self.socialCounter, self.walls, self.pollModule, self.trendingModule];
            $.each(fnArr, function(i, v) {
                v(self);
            });
        },

        isIE9: function() {
            return (navigator.userAgent.indexOf("MSIE 9") > -1) ? true : false;
        },

        animate: function(self) {
            // animate elements
            var $heroEl,
                $heroLock,
                $heroImg,
                $dudeEl,
                $carsEl,
                classUp,
                classDown,
                classLeft,
                $window,
                $windowH,
                heroOffset,
                menOffset,
                carsOffset,
                dudeOffset,
                orientation,
                cssVisible,
                cssHidden;

            $window = $(window);
            $windowH = $window.height();

            $heroEl = $('#hero-module');
            $heroLock = $('.left-col img', $heroEl);
            $heroImg = $('.heroes', $heroEl);
            $carsEl = $('#cars');
            $dudeEl = $('#buy-module .right-col').find('img');

            classUp = 'animate-up';
            classDown = 'animate-down';
            classLeft = 'animate-right';
            cssVisible = "'visibility', 'visible'";
            cssHidden = "'visibility', 'hidden'";

            heroOffset = 200;
            menOffset = 400;
            carsOffset = 400;
            dudeOffset = ($windowH > 1000) ? $windowH : 300;


            if (!self.isIE9()) {
                window.onorientationchange = readDeviceOrientation;
                readDeviceOrientation();
                loadEvents();
                scrollEvents();
            } else {
                animElsVisible();
            }

            function loadEvents() {

                $window.on('load.herolock', function(e) {
                    checkScrollPos($heroLock, 'herolock', classDown, heroOffset, orientation);
                    checkScrollPos($heroImg, 'men', classUp, menOffset, orientation);
                });

                $window.on('load.cars', function(e) {
                    checkScrollPos($carsEl, 'cars', classLeft, carsOffset, orientation);
                });

                $window.on('load.dude', function(e) {
                    checkScrollPos($dudeEl, 'dude', classUp, dudeOffset, orientation);
                });
            }

            function scrollEvents() {
                $window.on('scroll.herolock', $.throttle(50, function(e) {
                    checkScrollPos($heroLock, 'herolock', classDown, heroOffset, orientation);
                }));

                $window.on('scroll.men', $.throttle(50, function(e) {
                    checkScrollPos($heroImg, 'men', classUp, menOffset, orientation);
                }));

                $window.on('scroll.cars', $.throttle(50, function() {
                    checkScrollPos($carsEl, 'cars', classLeft, carsOffset, orientation);
                }));

                $window.on('scroll.dude', $.throttle(50, function(e) {
                    checkScrollPos($dudeEl, 'dude', classUp, dudeOffset, orientation);
                }));
            }

            function animElsVisible() {
                $carsEl.css(cssVisible);
                $heroLock.css(cssVisible);
                $heroImg.css(cssVisible);
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
                function _isScrolledIntoView($el, offset) {

                    var docViewTop = $window.scrollTop();
                    var elemTop = ($el.offset().top - offset);

                    return (elemTop <= docViewTop);
                }
            }

            function readDeviceOrientation() {
                orientation = (Math.abs(window.orientation) === 90) ? 'Landscape' : 'Portrait';
                return orientation;
            }
        },

        videoModule: function() {

            var html = '';
            html += '<video id="vid1" class="video-js vjs-default-skin" controls ';
            html += 'preload="auto" width="510" height="286" src="https://www.youtube.com/watch?v=2xOtB_wm7ac"';
            html += 'data-setup="{}">';
            html += '<p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that ';
            html += '<a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>';
            html += '</p></video>';

            $('#video').append(html);
            videojs('vid1', {
                "techOrder": ["youtube"]
            }).ready(function() {});

        },

        socialCounter: function(self) {

            var clock, opts, counter;

            opts = {
                targetEls: [".counter"],
                network: "sales.fyre.co",
                siteId: "371327",
                articleIds: ["CURATE"]
            };

            if (!self.isIE9()) {
                clock = window.clock = new FlipCounter(opts);

            } else {
                counter = new LfCommentCounts(opts, createClock);
            }

            function createClock(data) {

                var contentCount = data.data[opts.siteId][opts.articleIds[0]].total; // presumes only the first articleId is important
                var string = '<ul class="flip nocomma"><li class="flip-clock-before"><a href="#"><div class="up"><div class="shadow"></div><div class="inn">{{n}}</div></div><div class="down"><div class="shadow"></div><div class="inn">{{n}}</div></div></a></li><li class="flip-clock-active"><a href="#"><div class="up"><div class="shadow"></div><div class="inn">{{n}}</div></div><div class="down"><div class="shadow"></div><div class="inn">{{n}}</div></div></a></li></ul>';
                contentCount = ("" + contentCount).split("");
                var markup = "";

                for (var i = 0; contentCount.length > 0; ++i) {
                    var digit = string.replace(/{{n}}/g, contentCount.pop());
                    if (i % 2 === 0 && i > 0) {
                        digit = digit.replace(/nocomma/g, 'comma');
                        i = -1;
                    }
                    markup = digit + markup;
                }

                $(opts.targetEls[0]).addClass('flip-clock-wrapper').append(markup);

            }
        },

        walls: function(self) {
            (function() {
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
                        window.clock._clockInstances[0].increment();
                    });

                    wall._wallView.$el.on('removeContentView.hub', function(e) {
                        window.clock._clockInstances[0].decrement();
                    });

                });
            }());
        },

        pollModule: function(self) {

            Livefyre.require(["poll#0"], function(A) {
                var indyPoll = new A({
                    networkId: "indycar.fyre.co",
                    siteId: "369833",
                    pollId: "e6cd815213af11e5b62e12b19652bf83",
                    env: "prod"
                }).render(document.getElementById("lf-poll-e6cd815213af11e5b62e12b19652bf83"));
            });
        },

        trendingModule: function(self) {
            Livefyre.require(['//cdn.livefyre.com/libs/app-embed/v0.6.4/app-embed.min.js'], function(appEmbed) {
                appEmbed.loadAll().done(function(appEmbed) {});
            });
        },

        evHandlers: function(self) {

            $('body').on('click', '.wallShowMore', function(e) {
                e.preventDefault();
                try {
                    window.wall._wallView.showMore();
                } catch (err) {}
            });

            //  FB Share
            $('.btn-fb a').click(function(e) {
                e.preventDefault();
                var fbWindow = window.open(e.target.href, "", "width=500, height=200");
            });
        }
    };

    $(function() {
        INDY.init();
    });

}(jQuery));
