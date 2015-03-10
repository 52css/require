/**
 * Created by Ivan on 2014/5/19.
 */
define(function(require, exports, module) {
	var a = require('../a');
	exports.test = function() {
		return '├file/b \n' + a.test().replace(/^(.)/gm, function($0, $1) {
			return '  ' + $1;
		});
	};
});
