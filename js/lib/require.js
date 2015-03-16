/**
 * Created by Ivan on 2014/5/20.
 */
(function(window) {
  var obj = {},
    moduleMap = {},
    requireMap = {},
    requireList = [],
    toString = obj.toString,
    hasOwn = obj.hasOwnProperty,
    doc = document,
    head = doc.head || doc.getElementsByTagName('head')[0],
    reUrl = /^\w+:\/\/.+/,
  // body = doc.body,
    commonConfig = {
      alias: {}
    },
    /**
     * 读取 factory中的require
     * 来源 seajs.js
     */
    fnParseDeps = (function () {
      var REQUIRE_RE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g,
        SLASH_RE = /\\\\/g;
      return function(code) {
        var ret = [];
        code.replace(SLASH_RE, "").replace(REQUIRE_RE, function(m, m1, m2) {
          if (m2) {
            ret.push(m2);
          }
        });
        return ret;
      };
    }()),
    /**
     * 去除2端空格
     * @param str
     * @param tryStr
     * @returns {boolean}
     */
    fnTrim = function(str, tryStr) {
      if (fnType(str, 'String')) {
        var strTrim = str.trim();
        return !fnIsNullOrUndefined(tryStr) && fnType(tryStr, 'String') ? strTrim === tryStr : strTrim;
      }
    },
    currentlyAddingScript,
    requireScript,
    requireSrc,
    requireMain,
    needOrder = false,
    aLoads = [];

  /**
   * 修复原生trim，让所有的都支持
   * @type {Function|*|trim}
   */
  String.prototype.trim = String.prototype.trim || function(){
    return this.replace(/^s+|s+$/g, '');
  };



  /**
   * 高效判断 null undefined void(0)
   * @param obj
   * @returns {boolean}
   */
  function fnIsNullOrUndefined(obj) {
    return obj == void(0);
  }

  /**
   * 判断对象类型
   * @param obj
   * @param tryType
   * @returns {boolean}
   */
  /*function fnType(obj, tryType) {
   var tp = function(obj) {
   return String(toString.call(obj).slice(8, -1));
   },
   getType = tp(obj);
   return !fnIsNullOrUndefined(tryType) && tp(tryType) === 'String' ? getType === tryType : getType;
   }*/
  var fnType = (function() {
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
      serialize = class2type.toString;
    return function(obj, str) {
      var result = class2type[( fnIsNullOrUndefined(obj) || obj !== obj) ? obj : serialize.call(obj)] || obj.nodeName || "#";
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
      if (str) {
        return str === result;
      }
      return result;
    };
  }());

  /**
   * 获取typeOf
   * @param obj
   * @param tryTypeOf
   * @returns {boolean}
   */
  function fnTypeOf(obj, tryTypeOf){
    var getTypeOf = typeof(obj);
    return !fnIsNullOrUndefined(tryTypeOf) && fnType(tryTypeOf, 'String')? getTypeOf === tryTypeOf : getTypeOf;
  }

  /**
   * 判断是否拥有属性
   * @param obj
   * @param prop
   * @returns {boolean}
   */
  function fnHasOwn(obj, prop) {
    if (!fnIsNullOrUndefined(obj) && fnType(prop, 'String')) return hasOwn.call(obj, prop);
    return false;
  }

  /**
   * 循环类数组
   * @param arr
   * @param fn
   * @param args
   */
  function fnEachArray(arr, fn, args) {
    var i = 0,
      item,
      len = arr.length;
    if (!fnType(fn, 'Function')) return;
    if (!fnIsNullOrUndefined(len)) {
      if (fnIsNullOrUndefined(args)) {
        for (; i < len; i ++ ) {
          item = arr[i];
          if (fn.call(item, i, item) === false) {
            break;
          }
        }
      } else {
        for (; i < len; i ++ ) {
          item = arr[i];
          if (fn.apply(item, args) === false) {
            break;
          }
        }
      }
    }
  }

  /**
   * 循环类数组-倒序
   * @param obj
   * @param fn
   * @param args
   */
  function fnEachArrayReverse(arr, fn, args) {
    var item,
      len = arr.length;
    if (!fnType(fn, 'Function')) return ;
    if (!fnIsNullOrUndefined(len)) {
      if (fnIsNullOrUndefined(args)) {
        while (len -- ) {
          item = arr[len];
          if (fn.call(item, len, item) === false) {
            break;
          }
        }
      } else {
        while (len -- ) {
          item = arr[len];
          if (fn.apply(item, args) === false) {
            break;
          }
        }
      }
    }
  }

  /**
   * 循环对象
   * @param obj
   * @param fn
   * @param args
   */
  function fnEachObject(obj, fn, args) {
    var prop,
      val;
    if (!(typeof(obj) === 'object' && fnType(fn, 'Function'))) return;
    if (fnIsNullOrUndefined(args)) {
      for (prop in obj) {
        if (fnHasOwn(obj, prop)) {
          val = obj[prop];
          if (fn.call(obj, prop, val) === false) {
            break;
          }
        }
      }
    } else {
      for (prop in obj) {
        if (fnHasOwn(obj, prop)) {
          val = obj[prop];
          if (fn.apply(val, args) === false) {
            break;
          }
        }
      }
    }

  }

  /**
   * 循环对象和array
   * @param obj
   * @param fn
   * @param args
   */
  function fnEach(obj, fn, args) {
    if (!(fnTypeOf(obj, 'object') && fnType(fn, 'Function'))) return;
    var len = obj.length;
    if (fnIsNullOrUndefined(len)) {
      fnEachObject(obj, fn, args);
    } else {
      fnEachArray(obj, fn, args);
    }
  }

  /**
   * 扩展对象
   * @returns {*}
   */
  function fnExtend() {
    var arg = arguments,
      argLen = arg.length,
      obj,
      i = 1,
      isDeep;
    function mixin(obj1, obj, isDeep) {
      obj = obj || {};
      fnEachObject(obj1, function(p, v) {
        obj[p] = obj[p] || {};
        if (isDeep && fnType(v, 'Object')) {
          mixin(v, obj[p], isDeep);
        } else {
          obj[p] = v;
        }
      });
      return obj;
    }
    if (arg[0] === true) {
      i = 2;
      isDeep = true;
      obj = arg[1];
    } else {
      obj = argLen === 1 ? this : arg[0];
    }

    for (; i < argLen; i ++ ) {
      mixin(arg[i], obj, isDeep);
    }
    return obj;
  }

  /**
   * 抛出错误
   * @param str
   */
  function fnError(str) {
    throw new Error(str);
  }

  /**
   *
   * @param str
   * @returns {boolean}
   */
  function fnEmpty(obj) {
    if (fnIsNullOrUndefined(obj) || fnTrim(obj, '')) return true;
    return false;
  }

  /**
   * 重新调用log方法
   */
  function fnLog() {
    try {
      console.log.apply(console, arguments);
    } catch (e) {

    }
  }

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

  /**
   * 判断是绝对路径
   * @param src
   * @returns {boolean}
   */
  function fnIsUrl(src) {
    if (!fnEmpty(src) && reUrl.test(src)) return true;
    return false;
  }

  /**
   * 加载script
   * @param src
   */
  function fnLoadScript(src, callback) {
    if (!fnIsUrl(src)) return;
    var script = document.createElement('script');
    script.type = 'text/javascript';
    if (callback)
      script.onload = script.onreadystatechange = function() {
        if (script.readyState && script.readyState != 'loaded' && script.readyState != 'complete')
          return;
        script.onreadystatechange = script.onload = null;
        callback.call(script);
      };
    script.src = src;
    currentlyAddingScript = script;
    head.appendChild(script);
    currentlyAddingScript = null;
  }

  /**
   * 加载css，和加载完毕事件
   * 来源于seajs
   * @param src
   */
  function fnLoadCss(src, callback) {
    if (!fnIsUrl(src)) return;
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
  }

  /**
   * 加载
   * @param src
   */
  function fnLoad(src, callback) {
    if (!fnIsUrl(src)) return;
    var ext;
    if (/\.(css|js)$/.test(src)) { //
      ext = RegExp.$1;
    }
    moduleMap[src] = {
      status: 2
    };
    switch (ext) {
      case 'css':
        fnLoadCss(src, function() {
          moduleMap[src] = {
            status: 5
          };
          if (fnType(callback, 'Function')) {
            callback();
          }
        });
        break;
      case 'js':
        fnLoadScript(src, callback);
        break;
    }
  }

  /**
   * 如果获取不到currentScript，只能一个一个加载urls
   * @param urls
   * @param isOrder
   */
  function fnLoads(urls, isOrder) {
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
      if (aLoads.length) {
        aLoads = aLoads.concat(urls);
      } else {
        aLoads = urls;
        fnInnerLoad();
      }
      // fnInnerLoad(urls, 0, callback);
    } else {
      for (; i < len; i ++ ) {
        fnLoad(urls[i]);
      }
    }
  }

  /**
   * 相对路径转换绝对路径
   * @param relativePath
   * @param base
   * @returns {*}
   */
  function fnAbsolutePath(relativePath, base) {
    if (fnEmpty(relativePath)) return;
    var absolutePath;
    var DOT_RE = /\/\.\//g;
    var DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//;
    var DOUBLE_SLASH_RE = /([^:/])\/\//g;
    if (reUrl.test(relativePath)) {
      return relativePath;
    }
    if (fnEmpty(base)) {
      base = commonConfig.base || location.href;
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
  }

  /**
   * 获取当前正在运行的js
   * 来源于 mass.js
   * @returns {*}
   */
  function fnCurrentScript(all) {
    var stack,
      url,
      nodes = (all ? document : head).getElementsByTagName('script');
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
      needOrder = true;
      // console.log(nodes[nodes.length -1]);
      return nodes[nodes.length -1];
    }
  }

  /**
   * 获取script的src, 对应ie9- 获取到相对路径
   * @param script
   * @returns {string|*|src}
   */
  function fnScriptSrc(script) {
    if (script) {
      var src = script.src;
      return fnIsUrl(src) ? src : script.getAttribute("src", 4);
    }
  }

  /**
   * 加载函数
   * @param deps
   * @param factory
   */
  function fnRequire(deps, factory) {
    //alert(fnScriptSrc(fnCurrentScript()));
    //debugger;
    var args = arguments,
      exports = [],
      depsType = fnType(deps),
      hasCreated = false,
      newDeps = [],
      depsMap = {},
      alias,
      currentScriptSrc = fnScriptSrc(fnCurrentScript()),
      loadDeps = [];

    if (args.length == 1 &&  depsType == "Function") {
      var temp = deps;
      deps = [];
      factory = temp;
    }
    if (depsType == 'String') {
      deps = [deps];
    }
    if (factory) {
      deps = deps.concat(fnParseDeps(factory.toString()));
    }
    fnEachArray(deps, function(i, dep) {
      if (!depsMap[dep]) {
        depsMap[dep] = true;
        alias = commonConfig.alias[dep];
        newDeps.push(fnAbsolutePath(alias || dep, commonConfig.base || currentScriptSrc));
      }
    });
    (function doLoopDeps(newDeps) {
      if (newDeps.length) {
        fnEachArray(newDeps, function(i, dep) {
          var module = moduleMap[dep];

          if (module && module.exports) {
            exports.push(module.exports);
          } else {
            hasCreated = true;
            if (module && module.status == 4) {
              doLoopDeps(module.deps);
            } else {
              requireMap[dep] = true;
              module = {
                id: dep,
                status: 1
              };
              loadDeps.push(dep);
            }
          }
        });
      }
    } (newDeps));

    if (requireMain) {
      fnLoads(loadDeps, needOrder);
    }


    if (!hasCreated && fnType(factory, 'Function')) {
      dom.ready(function() {
        factory.apply(null, exports);
      });
    } else {
      requireList.push({
        deps: newDeps,
        loadDeps: loadDeps,
        factory: factory
      });
    }
    return exports.length && exports[0];
  }

  /**
   * 检查是否 有依赖？
   * @param id
   * @param dep
   * @returns {boolean}
   */
  function fnCheckDeps(id, dep) {
    var chains = [],
      rtv = false;

    (function inner(arr) {
      var id = arr[arr.length - 1],
        hasP = false;
      fnEachObject(moduleMap, function(p, module) {
        if (id != p  && fnHasOwn(module.objDeps, id)) {
          hasP = true;
          inner(arr.concat(p));
        }
      });
      if (!hasP) {
        chains.push(arr);
      }
    }([id]));
    fnEachArray(chains, function(i, arr) {
      var obj = {};
      fnEachArray(arr, function(j, item) {
        obj[item] = j;
      });
      if (fnHasOwn(obj, dep)) {
        rtv = arr.reverse();
        return false;
      }
    });
    return rtv;
  }

  /**
   * 定义函数
   * @param id
   * @param deps
   * @param factory
   */
  function fnDefine(id, deps, factory) {
    var args = arguments,
      idType = fnType(id),
      objDeps = {},
      newDeps = [],
      depsMap = {},
      currentScriptSrc = fnScriptSrc(fnCurrentScript()),
      module = {},
      loadDeps = [],
      hasCreated;

    switch (args.length) {
      case 1:
        factory = id;
        deps = [];
        id = currentScriptSrc;
        break;
      case 2:
        if (idType == 'String') {
          factory = deps;
          deps = [];
          id = fnAbsolutePath(id, currentScriptSrc);
          currentScriptSrc = id;
        } else if (idType == 'Array') {
          factory = deps;
          deps = id;
          id = currentScriptSrc;
        }
        break;
      case 3:
        id = fnAbsolutePath(id, currentScriptSrc);
        currentScriptSrc = id;
        break;
    }

    if (fnType(deps, 'String')) {
      deps = [deps];
    }
    if (!fnType(factory, 'Function')) {
      factory = function() {
        return factory;
      };
    }

    module.factory = factory;
    if (deps.length) {
      module.hasDeps = true;
    }
    deps = deps.concat(fnParseDeps(factory.toString()));

    fnEachArray(deps, function(i, dep) {
      if (!depsMap[dep]) {
        depsMap[dep] = true;
        newDeps.push(fnAbsolutePath(dep, currentScriptSrc));
      }
    });
    //id = fnAbsolutePath(id, currentScriptSrc);
    module.id = id;
    module.deps = newDeps;

    if (newDeps.length) {
      fnEachArray(newDeps, function(i, dep) {
        var chains = fnCheckDeps(id, dep);
        if (chains) {
          fnError("Cycle in require graph: " + chains.join('->') + '->' + dep);
        }
        objDeps[dep] = true;
        if (!(moduleMap[dep] && moduleMap[dep].status == 5)) {
          hasCreated = true;
          if (!moduleMap[dep]) {
            moduleMap[dep] = {
              id: dep,
              status: 1
            };
            loadDeps.push(dep);
          }
        }
      });

      if ( requireMap[id] ) {
        fnEach(loadDeps, function(i, dep) {
          requireMap[dep] = true;
        });
        fnLoads(loadDeps, needOrder);
      }

      //

      module.objDeps = objDeps;
    }

    if (moduleMap[id] && moduleMap[id].status == 5) {
      //fnError ("module " + id + " already defined");
    } else {
      moduleMap[id] = fnExtend({
        status: 4
      }, module);
    }

    if (!hasCreated) {
      fnRun(id);
    }
  }

  /**
   * 运行module
   * @param id
   */
  function fnRun(id) {
    function buildModule(module) {
      if (module.status != 5) {
        var factory = module.factory,
          buildId = module.id,
          exprots = [],
          localRequire = function(id) {
            var alias = commonConfig.alias[id];
            if (alias) {
              id = fnAbsolutePath(alias);
            } else {
              id = fnAbsolutePath(id, buildId);
            }

            if (!fnHasOwn(moduleMap, id)) {
              fnError("module " + id + " not found");
            }
            return fnRequire(id);
          };
        localRequire.async = localRequire;
        if (module.hasDeps) {
          fnEachArray(module.deps, function(i, dep) {
            exprots.push(moduleMap[dep].exports);
          });
          module.exports = fnType(factory, 'Function') && factory(localRequire, module.exports, module) || module.exports;
          // module.exports = fnType(factory, 'Function') && factory.apply(module, exprots);
        } else {
          module.exports = {};
          delete module.factory;
          module.exports = fnType(factory, 'Function') && factory(localRequire, module.exports, module) || module.exports;
        }
        module.status = 5;
      }
    }
    (function updateModuleMap(id) {
      buildModule(moduleMap[id]);
      var allStatus;
      fnEachObject(moduleMap, function(p, module) {
        var deps = module.deps,
          objDeps = module.objDeps;
        if (id != p && fnHasOwn(objDeps, id)) {
          fnEachArray(deps, function(i, dep) {
            if (moduleMap && moduleMap[dep] && moduleMap[dep].status == 5) {
              allStatus = true;
            } else {
              allStatus = false;
              return false;
            }
          });
          if (allStatus) {
            updateModuleMap(p);
          }
        }
      });
    }(id));

    fnEachArray(requireList, function(i, task) {
      var deps = task.deps,
        exports = [],
        allStatus = true;
      if (!task.ok) {
        fnEachArray(deps, function(i, dep) {
          var module = moduleMap[dep];
          if (module) {
            if (module.status == 5) {
              var moduleExports = module.exports;
              if (moduleExports) {
                exports.push(moduleExports);
              }
              allStatus = true;
            } else {
              allStatus = false;
              return false;
            }
          } else {
            allStatus = false;
            return false;
          }
        });
        if (allStatus) {
          task.ok = true;
          var factory = task.factory;
          if (fnType(factory, 'Function')) {
            factory.apply(null, exports);
          }
        }
      }
    });
  }

  /**
   * 配置基本信息
   * base     -----  基本路径  ----  string
   * alias    -----  别名      ----  object
   * @param obj
   */
  function fnConfig(obj) {
    obj.base = fnAbsolutePath(obj.base);
    fnExtend(commonConfig, obj);
  }

  requireScript = fnCurrentScript(true);
  requireSrc = fnScriptSrc(requireScript);
  requireMain = requireScript.getAttribute('data-main');
  if (requireMain) {
    fnEachArray(requireMain.split(','), function(i, n) {
      fnRequire(fnAbsolutePath(n, requireSrc));
    });
  } else {
    dom.ready(function() {
      fnEachArray(requireList, function(i, require) {
        fnLoads(require.loadDeps, needOrder);
      });
    });
  }
  /**
   * 返回window.define 和 window.require 函数 方便调用
   */
  fnExtend(window, {
    define: fnExtend(fnDefine, {
      amd: moduleMap
    }),
    require: fnExtend(fnRequire, {
      config: fnConfig,
      version: '0.0.3',
      async: fnRequire,
      requireList: requireList
    })
  });

}(window));