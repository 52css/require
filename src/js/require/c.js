/**
 * Created by Ivan on 2014/5/19.
 */
define(function(require, exports, module) {
	var b = require('b');
	exports.test = function() {
		return '├c \n' + b.test().replace(/^(.)/gm, function($0, $1) {
			return '  ' + $1;
		});
	};

});