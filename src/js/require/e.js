/**
 * Created by Ivan on 2014/5/19.
 */
define(function(require, exports, module) {
	var c = require('c'),
		d = require('d');
	exports.test = function() {
		return '├e \n' + c.test().replace(/^(.)/gm, function($0, $1) {
			return '  ' + $1;
		}) + '\n' + d.test().replace(/^(.)/gm, function($0, $1) {
			return '  ' + $1;
		});
	};

});