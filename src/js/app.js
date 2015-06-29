(function($) {

    // Counter App
    $(function() {
        var isIE9 = (navigator.userAgent.indexOf("MSIE 9") > -1) ? true : false;

        var clock, opts;

        opts = {
            targetEls: [".counter"],
            network: "sales.fyre.co",
            siteId: "371327",
            articleIds: ["CURATE"]
        };

        if (!isIE9) {
            clock = window.clock = new FlipCounter(opts);
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
