/**
 * Created by kerr on 2014/5/20.
 */
define(function(require, exports, module) {
  var h = require('../h');
  exports.test = function() {
    return '├h \n' + h.test().replace(/^(.)/gm, function($0, $1) {
      return '  ' + $1;
    });
  };
});
