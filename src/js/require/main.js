/**
 * Created by Ivan on 2014/7/1.
 */
//require.config({
//  base: 'js/require/'
//})
require('c', function(c) {
  var pre = document.createElement('pre');
  pre.innerHTML = c.test().replace(/\n/g, '<br/>').replace(/\s/g, '&nbsp;');
  document.body.appendChild(pre);
});