/**
 * Created by Ivan on 2015/3/24.
 * Version: 0.0.1
 *//**
 * Created by Ivan on 2014/5/19.
 */
define(function(require, exports, module) {
  var ab = require('./ab');
  exports.test = function() {
    return '├ba \n' + ab.test().replace(/^(.)/gm, function($0, $1) {
      return '  ' + $1;
    });
  };

});