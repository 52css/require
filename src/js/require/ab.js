/**
 * Created by Ivan on 2014/5/19.
 */
define(function(require, exports, module) {
  var ba = require('./ba');
  exports.test = function() {
    return '├ab \n' + ba.test().replace(/^(.)/gm, function($0, $1) {
      return '  ' + $1;
    });
  };

});