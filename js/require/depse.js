/**
 * Created by Ivan on 2014/5/26.
 */
define(function(require, exports, module) {
  var c = require('./c'),
    d = require('./d');

  return {
    test: function() {
      return '├depse <br/>' + c.test().replace(/^(.)/gm, function($0, $1) {
        return '  ' + $1;
      }) + '\n' + d.test().replace(/^(.)/gm, function($0, $1) {
        return '  ' + $1;
      });
    }
  };
});