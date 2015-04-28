/**
 * Created by Ivan on 2014/7/11.
 */
/**
 * 测试多个define没有定义名称
 */
seajs.use(['./js/require/a', './js/require/file/a'], function(a, fileA) {
  var pre = document.createElement('pre');
  pre.innerHTML = (a.test() + '\n' + fileA.test()).replace(/\n/g, '<br/>').replace(/\s/g, '&nbsp;');
  document.body.appendChild(pre);
});
/**
 * 测试2次定义不同的require
 */
seajs.use('./js/require/a', function(a) {
  var pre = document.createElement('pre');
  pre.innerHTML = (a.test()).replace(/\n/g, '<br/>').replace(/\s/g, '&nbsp;');
  document.body.appendChild(pre);
});
seajs.use('./js/require/file/a', function(a) {
  var pre = document.createElement('pre');
  pre.innerHTML = (a.test()).replace(/\n/g, '<br/>').replace(/\s/g, '&nbsp;');
  document.body.appendChild(pre);
});
