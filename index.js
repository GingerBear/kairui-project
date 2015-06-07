var getSinglePage = require('./getSinglePage');
var async   = require('async');
var gbk = require('gbk');
var cheerio = require('cheerio');
var _       = require('lodash');

var host = 'http://www.womai.com';

cheerio.prototype.map = function(cb) {
  return _.map(this, function(value, index) {
    var elem = this._make(value);
    return cb.call(elem, index, elem);
  }, this);
};

function getGridPage(gridUrl) {
  gbk.fetch(gridUrl).to('string', function(err, body) {
    if (!err) {
      var $ = cheerio.load(body);
      var productUrls = $('.product_item_img a[href]').map(function() {
        return host + $(this).attr('href');
      });
      var getPages = [];
      var pages = [];

      for (var i = 0; i < productUrls.length; i++) {
        (function(i) {
          getPages.push(function(cb) {
            getSinglePage(productUrls[i], function(err, result) {

              console.log(productUrls[i])
              console.log(result)

              pages.push({
                productUrl: productUrls[i],
                comments: result
              });

              cb(err);

            });
          });
        })(i);
      }

      async.waterfall(getPages, function(err, results) {
        console.log(getPages)
        console.log('DONE!')
      });

    }
  });

}


getGridPage('http://www.womai.com/Sort-0-970624.htm');