/**
 * Created by Ivan on 2015/3/24.
 */
(function(win, undefined) {
  var
    $ = (function() {
      function isArrayLike(obj) {
        if (obj && typeof obj === "object" && !$.isWindow(obj)) {
          var n = obj.length
          if (+n === n && !(n % 1) && n >= 0) { //检测length属性是否为非负整数
            try {
              if ({}.propertyIsEnumerable.call(obj, "length") === false) { //如果是原生对象
                return Array.isArray(obj) || /^\s?function/.test(obj.item || obj.callee)
              }
              return true
            } catch (e) { //IE的NodeList直接抛错
              return true
            }
          }
        }
        return false
      }

      var class2type = {
          "[object Boolean]": "Boolean",
          "[object Number]": "Number",
          "[object String]": "String",
          "[object Function]": "Function",
          "[object Array]": "Array",
          "[object Date]": "Date",
          "[object RegExp]": "RegExp",
          "[object Window]": "Window",
          "[object Document]": "Document",
          "[object Arguments]": "Arguments",
          "[object NodeList]": "NodeList",
          "[object HTMLDocument]": "Document",
          "[object HTMLCollection]": "NodeList",
          "[object StaticNodeList]": "NodeList",
          "[object DOMWindow]": "Window",
          "[object global]": "Window",
          "null": "Null",
          "NaN": "NaN",
          "undefined": "Undefined"
        },
        serialize = class2type.toString,
        slice = [].slice,
        hasOwnProperty = {}.hasOwnProperty,
        toString = {}.toString,
        $ = {
          each: function(obj,fn,args) {
            if(obj){
              //Array object arguments
              var ol=obj.length,i,val,fnHasOwnProperty={}.hasOwnProperty;
              if(args){
                if(isArrayLike(obj))
                  for(i=0;i<ol;i++)
                    if(fn.apply(obj,args)===false) break;
                    else
                      for(i in obj)
                        if(fnHasOwnProperty.call(obj,i))
                          fn.apply(obj,args);
              }else{
                if(isArrayLike(obj))
                  for(i=0;i<ol;i++){
                    val=obj[i];
                    if(fn.call(val,i,val)===false) break;
                  }
                else
                  for(i in obj) if(fnHasOwnProperty.call(obj,i)) fn.call(obj,i,obj[i]); //default fn.call(obj,i,obj);
              }
            }
          },
          extend: function() {
            var
              arg = arguments,
              argLen = arg.length,
              obj,
              i = 1,
              isDeep,
              mixin = function(obj1, obj, isDeep){
                obj = obj || {};
                $.each(obj1, function(p, v) {
                  obj[p] = obj[p] || {};
                  if (isDeep && $.type(v) === 'object') {
                    mixin(v, obj[p], isDeep);
                  } else {
                    obj[p] = v;
                  }
                });
                return obj;
              };
            if (arg[0] === true) {
              i = 2;
              isDeep = 1;
              obj = arg[1];
            } else {
              obj = argLen === 1 ? this : arg[0];
            }
            for(; i < argLen; i ++) {
              mixin(arg[i], obj, isDeep);
            }
            return obj;
          },
          grep: function(arr, callback, invert) {
            if ($.type(arr) === 'array') {
              var a = [], b = [];
              $.each(arr, function(i, n) {
                callback.call(n, n, i) ? a.push(n) : b.push(n);
              });
              return invert ? b : a;
            }
          },
          makeArray: function(object) {
            var ret = [];
            if (object !== null) {
              var i = object.length;
              if (i === null || object.split || object.setInterval || object.call) {
                ret[0] = object;
              } else {
                while (i)ret[--i] = object[i];
              }
            }
            return ret;
          },
          map: function(arr, callback) {
            if($.type(arr) === 'array'){
              var rtv = [];
              $.each(arr, function(i, n) {
                var arrRtv = callback.call(n, n);
                if (arrRtv) {
                  rtv = Array.prototype.concat.call(rtv, arrRtv);
                }
              });
              return rtv;
            }
          },
          inArray: function(val, arr, index) {
            for(var i = index || 0, len = arr.length; i < len; i ++) {
              if (val === arr[i]) {
                return i;
              }
            }
            return -1;
          },
          // toArray: function() {},
          merge: function(first, second) {},
          unique: function(arr) {
            var rtv = [],
              obj = {};
            $.each(arr, function(i, n) {
              if (!obj[n]) {
                obj[n] = true;
                rtv.push(n);
              }
            });
            return rtv;
          },
          //parseJSON: function(json) {},
          noop: function() {},
          //proxy: function(fn, context) {},
          isArray: function(obj) {
            return $.type(obj) === 'array';
          },
          isFunction: function(obj) {
            return $.type(obj) === 'function';
          },
          isEmptyObject: function(obj) {
            for (var p in obj) {
              if (p) {
                return false;
              }
            }
            return true;
          },
          isPlainObject: function(obj) {
            //!obj ---一定要是对象
            // toString.call(obj) !== "[object Object]"----因为IE，检测constructor
            //obj.nodeType ----避免不是DOM nodes
            //obj.setInterval ---排除window
            if(!obj || toString.call(obj) !== "[object Object]" ||obj.nodeType ||obj.setInterval){
              return false;
            }
            //是否是new fun()自定义对象
            //constructor是否是继承原型链
            //原型链是否有isPrototypeOf
            if(obj.constructor && !hasOwnProperty.call(obj,"constructor")
              && !hasOwnProperty.call(obj.constructor.prototype,"isPrototypeOf")){
              return false;
            }
            //判断是否有继承关系
            //自己的属性会被首先遍历
            var key;
            for(key in obj){}
            //直接看最后一项是未了加速遍历的过程
            return key === undefined || hasOwnProperty.call(obj,key);
          },
          isWindow: function(obj) {
            return obj.window && obj.window === obj.window.window;
          },
          isNullOrUndefined: function(obj) {
            return obj == undefined;
          },
          isNumeric: function(obj) {
            return !isNaN(parseFloat(obj)) && isFinite(obj);
          },
          type: function(obj) {
            var result = class2type[( $.isNullOrUndefined(obj) || obj !== obj) ? obj : serialize.call(obj)] || obj.nodeName || "#";
            if (result.charAt(0) === "#") { //兼容旧式浏览器与处理个别情况,如window.opera
              //利用IE678 window == document为true,document == window竟然为false的神奇特性
              if (obj == obj.document && obj.document != obj) {
                result = "Window"; //返回构造器名字
              } else if (obj.nodeType === 9) {
                result = "Document"; //返回构造器名字
              } else if (obj.callee) {
                result = "Arguments"; //返回构造器名字
              } else if (isFinite(obj.length) && obj.item) {
                result = "NodeList"; //处理节点集合
              } else {
                result = serialize.call(obj).slice(8, -1);
              }
            }
            return result.toLowerCase();
          },
          trim: function(str) {
            if ($.type(str) === 'string') {
              return String.prototype.trim ? str.trim() : str.replace(/^s+|s+$/g, '');
            }
          } /*,
           //param: function(obj) {},
           //error: function(message) {},
           */

        };

      $.extend($, {
        isJSON: function(text) {
          if (/^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').
              replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
              replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
            return true;
          } else {
            return false;
          }
        },
        log: function() {
          try {
            if (console && console.log) {
              return console.log.apply(console, arguments);
            }
          } catch (ex) {

          }
        },
        Ajaxs: (function() {
          return function() {
            var ajaxs = [],
              ends = [],
              loadIndex = 0,
              fnEnd = function() {
                if (ajaxs.end && $.type(ajaxs.end) === 'function') {
                  ajaxs.end();
                  $.each(ends, function(i, fn) {
                    fn();
                  });
                  ajaxs.isEnd = true;
                }
              };
            /**
             * [add 添加ajax]
             * @param {Function} fn [description]
             */
            ajaxs.add = function(fn) {
              ajaxs.push(fn);
            };
            /**
             * [fire 执行ajax]
             * @param  {[type]} star [开始事件]
             * @param  {[type]} end  [结束事件]
             * @return {[type]}      [description]
             */
            ajaxs.fire = function(star, end) {
              if (star && $.type(star) === 'function') {
                star();
              }
              ajaxs.end = end;

              if (ajaxs.length) {
                $.each(ajaxs, function(i, fn) {
                  if (fn && $.type(fn) === 'function') {
                    fn();
                  }
                });
              } else {
                fnEnd();
              }
            };
            ajaxs.onEnd = function(fn) {
              if (ajaxs.isEnd) {
                fn();
              } else {
                ends.push(fn);
              }
            };
            /**
             * [ok 添加数据并且执行结束事件]
             * @return {[type]} [description]
             */
            ajaxs.ok = function(obj, key, val) {
              if (obj && key) {
                if ($.type(key) === 'object') {
                  obj = $.extend(obj, key);
                } else if (val) {
                  obj[key] = val;
                }
              }
              loadIndex += 1;
              if (ajaxs.length === loadIndex) {
                fnEnd();
              }
            };

            return ajaxs;
          };
        }()),
        ready: (function() {
          var dom = [];
          //用于判定页面是否加载完毕
          dom.isReady  = false;
          //用于添加要执行的函数
          dom.ready = function(fn){
            if ( dom.isReady ) {
              fn();
            } else {
              dom.push( fn );
            }
          };
          //执行所有在window.onload之前放入的函数
          dom.fireReady = function() {
            if ( !dom.isReady ) {
              if ( !document.body ) {
                return setTimeout( dom.fireReady, 16 );
              }
              dom.isReady = 1;
              if ( dom.length ) {
                for(var i = 0, fn;fn = dom[i];i++)
                  fn();
              }
            }
          };
          //开始初始化domReady函数，判定页面的加载情况
          if ( document.readyState === "complete" ) {
            dom.fireReady();
          }else if(-[1,] ){
            document.addEventListener( "DOMContentLoaded", function() {
              document.removeEventListener( "DOMContentLoaded",  arguments.callee , false );
              dom.fireReady();
            }, false );
          }else {
            //当页面包含图片时，onreadystatechange事件会触发在window.onload之后，
            //换言之，它只能正确地执行于页面不包含二进制资源或非常少或者被缓存时
            document.attachEvent("onreadystatechange", function() {
              if ( document.readyState == "complete" ) {
                document.detachEvent("onreadystatechange", arguments.callee );
                dom.fireReady();
              }
            });
            (function(){
              if ( dom.isReady ) {
                return;
              }
              //doScroll存在于所有标签而不管其是否支持滚动条
              //这里如果用document.documentElement.doScroll()，我们需要判定其是否位于顶层document
              var node = new Image();
              try {
                node.doScroll();
                node = null;//防止IE内存泄漏
              } catch( e ) {
                //javascrpt最短时钟间隔为16ms，这里取其倍数
                //http://blog.csdn.net/aimingoo/archive/2006/12/21/1451556.aspx
                setTimeout( arguments.callee, 64 );
                return;
              }
              dom.fireReady();
            })();
          }

          return dom.ready;
        }())
      });

      return $;
    }()),
    _ = (function() {
      var
        defineMap = {},
        defineEventMap = {},
        REQUIRE_RE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g,
        SLASH_RE = /\\\\/g,
        head = document.head || document.getElementsByTagName('head')[0],
        parseDeps = function(code) {
          var ret = [];
          code.replace(SLASH_RE, "").replace(REQUIRE_RE, function(m, m1, m2) {
            if (m2) {
              ret.push(m2);
            }
          });
          return ret;
        },
        canGetCurrentScript = true,
        fnCurrentScript = function(all, isLast) {
          var stack,
            url,
            nodes = (all ? document : head).getElementsByTagName('script');

          if (canGetCurrentScript) {
            if (document.currentScript) {
              return (document.currentScript);
            }
            try {
              throw new Error();
            } catch (e) { //safari的错误对象只有line,sourceId,sourceURL
              stack = e.stack;
              if (!stack && window.opera) {
                //opera 9没有e.stack,但有e.Backtrace,但不能直接取得,需要对e对象转字符串进行抽取
                stack = (String(e).match(/of linked script \S+/g) || []).join(" ");
              }
            }
            if (stack) {
              /**e.stack最后一行在所有支持的浏览器大致如下:
               *chrome23:
               * at http://113.93.50.63/data.js:4:1
               *firefox17:
               *@http://113.93.50.63/query.js:4
               *opera12:
               *@http://113.93.50.63/data.js:4
               *IE10:
               *  at Global code (http://113.93.50.63/data.js:4:1)
               */
              stack = stack.split(/[@ ]/g).pop(); //取得最后一行,最后一个空格或@之后的部分
              stack = stack[0] == "(" ? stack.slice(1, -1) : stack;
              url = stack.replace(/(:\d+)?:\d+$/i, ""); //去掉行号与或许存在的出错字符起始位置
            }
            if (nodes.length) {
              if (typeof url === "string" && url) {
                for (var i = 0, node; node = nodes[i++];) {
                  if (node.src === url) {
                    return (node);
                  }
                }
              }
              for (var i = 0, node; node = nodes[i++];) {
                if (node.readyState === "interactive") {
                  return (node);
                }
              }
              canGetCurrentScript = false;
              // console.log(nodes[nodes.length -1]);
              return nodes[nodes.length -1];
            }
          } else {
            return nodes[nodes.length - 1];
            //if (isLast) {
            //  return nodes[nodes.length - 1];
            //} else {
            //  for (var j = nodes.length - 1; j >= 0; j --) {
            //    var script = nodes[j];
            //    if (script && script.src) {
            //      return script;
            //    }
            //  }
            //}
          }
        },
        reUrl = /^\w+:\/\/.+/,
        getCurrentScriptSrc = function(all, isLast) {
          var script = fnCurrentScript(all, isLast);
          if (script && script.src) {
            var src = script.src;
            return reUrl.test(src) ? src : script.getAttribute("src", 4);
          }
        },
        fnAbsolutePath = function(relativePath, base) {
          if ($.isNullOrUndefined(relativePath)) return;
          var absolutePath;
          var DOT_RE = /\/\.\//g;
          var DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//;
          var DOUBLE_SLASH_RE = /([^:/])\/\//g;
          if (reUrl.test(relativePath)) {
            return relativePath;
          }
          if ($.isNullOrUndefined(base)) {
            base = location.href;
          }
          base = base.split('#')[0].split('/').slice(0, -1).join('/') + '/';
          // a/./b ==> a/b
          absolutePath = (base + relativePath).replace(DOT_RE, '/');
          // a/b/c/../../d  ==>  a/b/../d  ==>  a/d
          while (absolutePath.match(DOUBLE_DOT_RE)) {
            absolutePath = absolutePath.replace(DOUBLE_DOT_RE, "/");
          }
          // a//b/c  ==>  a/b/c
          absolutePath = absolutePath.replace(DOUBLE_SLASH_RE, "$1/");

          if (!/\.(css|js)$/.test(absolutePath)) {
            absolutePath += ".js";
          }

          return absolutePath;
        },
        fnLoadScript = function (src, callback) {
          if (!reUrl.test(src)) return;
          var script = document.createElement('script');
          script.type = 'text/javascript';
          if (callback)
            script.onload = script.onreadystatechange = function() {
              if (script.readyState && script.readyState != 'loaded' && script.readyState != 'complete')
                return;
              script.onreadystatechange = script.onload = null;
              callback.call(script);
            };
          $.log('load script: ' + src);
          script.src = src;
          document.body.appendChild(script);
        },
        fnLoadCss = function (src, callback) {
          if (!reUrl.test(src)) return;
          var link = document.createElement("link");
          link.setAttribute("rel", "stylesheet");
          link.setAttribute("type", "text/css");
          link.setAttribute("href", src);
          head.appendChild(link);
          function styleOnload(node, callback) {
            if (!callback) return;
            // for IE6-9 and Opera
            if (node.attachEvent) {
              node.attachEvent('onload', callback);
              // NOTICE:
              // 1. "onload" will be fired in IE6-9 when the file is 404, but in
              // this situation, Opera does nothing, so fallback to timeout.
              // 2. "onerror" doesn't fire in any browsers!
            }
            // polling for Firefox, Chrome, Safari
            else {
              setTimeout(function() {
                poll(node, callback);
              }, 0); // for cache
            }
          }

          function poll(node, callback) {

            if (callback.isCalled) {
              return;
            }

            var isLoaded = false;

            if (/webkit/i.test(navigator.userAgent)) {//webkit
              if (node['sheet']) {
                isLoaded = true;
              }
            }
            // for Firefox
            else if (node['sheet']) {
              try {
                if (node['sheet'].cssRules) {
                  isLoaded = true;
                }
              } catch (ex) {
                // NS_ERROR_DOM_SECURITY_ERR
                if (ex.code === 1000) {
                  isLoaded = true;
                }
              }
            }

            if (isLoaded) {
              // give time to render.
              setTimeout(function() {
                callback.call(node);
              }, 1);
            } else {
              setTimeout(function() {
                poll(node, callback);
              }, 1);
            }
          }

          styleOnload(link, callback);
        },
        fnLoad = function(src, callback) {
          if (!reUrl.test(src)) return;
          var ext;
          if (/\.(css|js)$/.test(src)) { //
            ext = RegExp.$1;
          }

          switch (ext) {
            case 'css':
              fnLoadCss(src, function() {
                if ($.type(callback) === 'function') {
                  callback();
                }
              });
              break;
            case 'js':
              // console.log('load script:', src);
              fnLoadScript(src, callback);
              break;
          }
        },
        fnLoads = function(urls, isOrder) {
          var len = urls.length,
            i = 0;
          function fnInnerLoad() {
            if (aLoads.length) {
              fnLoad(aLoads[0], function() {
                aLoads.shift();
                fnInnerLoad();
              });
            }
          }

          if (isOrder) {
            $.ready(function() {
              if (aLoads.length) {
                aLoads = aLoads.concat(urls);
              } else {
                aLoads = urls;
                fnInnerLoad();
              }
              // fnInnerLoad(urls, 0, callback);
            });
          } else {
            for (; i < len; i ++ ) {
              fnLoad(urls[i]);
            }
          }
        },
        aLoads = [],
        commonConfig = {
          alias: {}
        },
        _ = {
          init: function() {
            var requireScript = fnCurrentScript(true),
              requireSrc = getCurrentScriptSrc(true),
              requireMain;

            $.extend(win, {
              require: $.extend(_.require, {
                version: '0.0.4',
                config: function(obj) {
                  obj.base = fnAbsolutePath(obj.base);
                  $.extend(commonConfig, obj);
                }
              }),
              define: $.extend(_.define, {
                defineMap: defineMap
              })
            });

            requireMain = requireScript.getAttribute('data-main');

            if (requireMain) {
              $.each(requireMain.split(','), function(i, n) {
                _.require(fnAbsolutePath(n, requireSrc));
              });
            }
          },
          require: function(deps, factory) {
            //debugger;
            if (arguments.length === 1 && $.type(deps) === 'function') {
              $.ready(deps);
              return ;
            }

            var newLoad = new $.Ajaxs(),
              requireList = [],
              id;


            id = commonConfig.base || getCurrentScriptSrc(true, true);
            console.log(getCurrentScriptSrc());
            deps = $.makeArray(deps);

            if ($.type(factory) === 'function') {
              deps = deps.concat(parseDeps(factory.toString()));
            }

            $.each($.unique(deps), function(i, dep) {
              dep = fnAbsolutePath(dep, id);
              if (!defineEventMap[dep]) {
                defineEventMap[dep] = new $.Ajaxs();
                requireList.push(dep);
              }

              newLoad.add(function() {
                defineEventMap[dep].onEnd(function() {
                  newLoad.ok();
                });
              });
            });

            //console.log('require:', deps, requireList);
            if (requireList && requireList.length) {
              fnLoads(requireList, !canGetCurrentScript);
            }


            newLoad.fire(function() {}, function() {
              var params = [];
              $.each(deps, function(i, dep) {
                dep = fnAbsolutePath(dep, id);
                params.push(defineMap[dep].exports);
              });

              factory.apply(null, params);
            });
          },
          define: function(id, deps, factory) {
            //debugger;
            var defineList = [],
              currentScriptSrc = getCurrentScriptSrc(true);

            switch (arguments.length) {
              case 1:
                factory = id;
                id = currentScriptSrc;
                deps = [];
                break;
              case 2:
                if ($.type(id) === 'string') {
                  factory = deps;
                  deps = [];
                  id = fnAbsolutePath(id, currentScriptSrc);
                } else {
                  factory = deps;
                  deps = id;
                  id = currentScriptSrc;
                }
                break;
            }

            if ($.type(factory) === 'function') {
              deps = deps.concat(parseDeps(factory.toString()));
            }


            defineMap[id] = {
              id: id,
              deps: deps,
              factory: factory
            };


            if (!defineEventMap[id]) {
              defineEventMap[id] = new $.Ajaxs();
            }

            $.each($.unique(deps), function(i, dep) {
              dep = fnAbsolutePath(dep, id);
              if (!defineEventMap[dep]) {
                defineEventMap[dep] = new $.Ajaxs();
                defineList.push(dep);
              }

              defineEventMap[id].add(function() {
                defineEventMap[dep].onEnd(function() {
                  defineEventMap[id].ok();
                });
              });
            });

            // $.log('define:', id, deps, defineList);
            if (defineList && defineList.length) {
              fnLoads(defineList, !canGetCurrentScript);
            }

            defineEventMap[id].fire(function() {}, function() {
              var module = defineMap[id];
              module.exports = {};
              var localRequire = function(dep) {
                dep = fnAbsolutePath(dep, id);
                return defineMap[dep].exports;
              };
              module.exports = $.type(factory) === 'function' ? (factory(localRequire, module.exports, module)  || module.exports) : factory;
            });

          }
        };
      return _;
    } ());

  _.init();

}(window));
