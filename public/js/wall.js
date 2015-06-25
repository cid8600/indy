Livefyre.require([ 'streamhub-wall#3' ], function(MediaWall) {
  var wall = window.wall = new MediaWall({
    el : document.getElementById("wall"),
    collection : {
      "network" : "sales.fyre.co",
      "siteId" : "371327",
      "articleId" : "CURATE"
    },
    initial : 50,
    showMore : 50,
    columns: 3
  });

  wall._collection.on('data', function() {
    clock.increment();
  });

  wall._wallView.$el.on('removeContentView.hub', function(e) {
    clock.decrement();
  });
});