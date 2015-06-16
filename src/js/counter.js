/**
 * Clock file. Calculate how many items in the media wall
 * @todo abstract the article ID
 */

var clock;
    
$(document).ready(function() {
  clock = new FlipClock($('.counter'), 0, {
      clockFace : 'Counter'
    });
  
  var contentCount = {
      ajaxURL : "https://sales.bootstrap.fyre.co/api/v1.1/public/comments/ncomments/MzcxMzI3OkNVUkFURQ==.json",
      siteId : 371327,
      articleId : "CURATE",
      interval : null,

      get : function() {
        var self = this;
        $.get(self.ajaxURL, function(data) {
          clock.setValue(data.data[self.siteId][self.articleId].total);
        });
      }
    }.get();
});