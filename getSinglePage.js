var gbk = require('gbk');
var cheerio = require('cheerio'); 
var async   = require('async');
var _       = require('lodash');

cheerio.prototype.map = function(cb) {
  return _.map(this, function(value, index) {
    var elem = this._make(value);
    return cb.call(elem, index, elem);
  }, this);
};

function getComments(productUrl, callback) {

  var productId = (productUrl.match(/-(\d+)\.htm/) || []).pop();
  var commentUrl = 'http://www.womai.com/green2014/product/remarkpraiselist.do?id=' + productId + '&mid=0&starlevel=0&page='
  var resetUrl = '&isremark=1';

  gbk.fetch(commentUrl+1+resetUrl).to('string', function(err, body) {
      if (!err) {
        var firstPageComments = parseComments(body);
        var commentRequests = [];

        for (var i = 2; i <= firstPageComments.pages; i++) {
          (function(i) {
            commentRequests.push(function(cb) {
              gbk.fetch(commentUrl+i+resetUrl).to('string', function(err, body) {
                cb(err, {
                  page: i,
                  comments: parseComments(body).comments
                });
              })
            });
          })(i);
        }

        async.parallel(commentRequests, function(err, totalResult) {
          totalResult.unshift({
            page: 1,
            comments: firstPageComments.comments
          });
          // console.log(totalResult)
          callback(err, totalResult);
        });
      }
  });
}

function parseComments(body) {
  if (!body) {
    return {
      pages: null,
      comments: []
    }; 
  }
  var $ = cheerio.load(body);
  var pages = parseInt($('.page .page_m span').text().trim(), 10);
  var comments = $('#remarkListDiv > li').map(function() {
    var comment = $(this).find('.show_praise').prev().find('a').text();
    return comment;
  });

  return {
    pages: pages,
    comments: comments
  }; 
}

// getComments('http://www.womai.com/Product-0-505629.htm', function(){})

module.exports = getComments;