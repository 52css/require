/**
 * Created by Ivan on 2015/3/24.
 * Version: 0.0.1
 *//**
 * Created by Ivan on 2014/5/26.
 */
define(function(require, exports, module) {
  var a = require('./a');
  return {
    test: function() {
      return '├depsb \n' + a.test().replace(/^(.)/gm, function($0, $1) {
        return '  ' + $1;
      });
    }
  }
});