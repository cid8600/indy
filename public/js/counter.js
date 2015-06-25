/**
 * Clock file. Calculate how many items in the media wall
 * @todo abstract the article ID
 */

var clock;
    
$(document).ready(function() {
  
  var opts = {
      targetEls: [".counter"],
      network: "sales.fyre.co",
      siteId: "371327",
      articleIds: ["CURATE"]
  };
  
  clock = new FlipCounter(opts);
});