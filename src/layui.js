/*!

 @Name: layui
 @Description：Classic modular front-end UI framework
 @License：MIT

 */

;!function(win){
  "use strict";

  var doc = document, config = {
    modules: {} //記錄模塊物理路徑
    ,status: {} //記錄模塊加載狀態
    ,timeout: 10 //符合規範的模塊請求最長等待秒數
    ,event: {} //記錄模塊自定義事件
  }

  ,Layui = function(){
    this.v = '2.6.4'; //版本號
  }

  //獲取layui所在目錄
  ,getPath = function(){
    var jsPath = doc.currentScript ? doc.currentScript.src : function(){
      var js = doc.scripts
      ,last = js.length - 1
      ,src;
      for(var i = last; i > 0; i--){
        if(js[i].readyState === 'interactive'){
          src = js[i].src;
          break;
        }
      }
      return src || js[last].src;
    }();
    return jsPath.substring(0, jsPath.lastIndexOf('/') + 1);
  }()

  //異常提示
  ,error = function(msg, type){
    type = type || 'log';
    win.console && console[type] && console[type]('layui error hint: ' + msg);
  }

  ,isOpera = typeof opera !== 'undefined' && opera.toString() === '[object Opera]'

  //內置模塊
  ,modules = config.builtin = {
    lay: 'lay' //基礎 DOM 操作
    ,layer: 'layer' //彈層
    ,laydate: 'laydate' //日期
    ,laypage: 'laypage' //分頁
    ,laytpl: 'laytpl' //模板引擎
    ,layedit: 'layedit' //富文本編輯器
    ,form: 'form' //表單集
    ,upload: 'upload' //上傳
    ,dropdown: 'dropdown' //下拉菜單
    ,transfer: 'transfer' //穿梭框
    ,tree: 'tree' //樹結構
    ,table: 'table' //表格
    ,element: 'element' //常用元素操作
    ,rate: 'rate'  //評分組件
    ,colorpicker: 'colorpicker' //顏色選擇器
    ,slider: 'slider' //滑塊
    ,carousel: 'carousel' //輪播
    ,flow: 'flow' //流加載
    ,util: 'util' //工具塊
    ,code: 'code' //代碼修飾器
    ,jquery: 'jquery' //DOM 庫（第三方）

    ,all: 'all'
    ,'layui.all': 'layui.all' //聚合標識（功能性的，非真實模塊）
  };

  //記錄基礎數據
  Layui.prototype.cache = config;

  //定義模塊
  Layui.prototype.define = function(deps, factory){
    var that = this
    ,type = typeof deps === 'function'
    ,callback = function(){
      var setApp = function(app, exports){
        layui[app] = exports;
        config.status[app] = true;
      };
      typeof factory === 'function' && factory(function(app, exports){
        setApp(app, exports);
        config.callback[app] = function(){
          factory(setApp);
        }
      });
      return this;
    };

    type && (
      factory = deps,
      deps = []
    );

    that.use(deps, callback, null, 'define');
    return that;
  };

  //使用特定模塊
  Layui.prototype.use = function(apps, callback, exports, from){
    var that = this
    ,dir = config.dir = config.dir ? config.dir : getPath
    ,head = doc.getElementsByTagName('head')[0];

    apps = function(){
      if(typeof apps === 'string'){
        return [apps];
      }
      //當第一個參數為 function 時，則自動加載所有內置模塊，且執行的回調即為該 function 參數；
      else if(typeof apps === 'function'){
        callback = apps;
        return ['all'];
      }
      return apps;
    }();

    //如果頁面已經存在 jQuery 1.7+ 庫且所定義的模塊依賴 jQuery，則不加載內部 jquery 模塊
    if(window.jQuery && jQuery.fn.on){
      that.each(apps, function(index, item){
        if(item === 'jquery'){
          apps.splice(index, 1);
        }
      });
      layui.jquery = layui.$ = jQuery;
    }

    var item = apps[0]
    ,timeout = 0;
    exports = exports || [];

    //靜態資源host
    config.host = config.host || (dir.match(/\/\/([\s\S]+?)\//)||['//'+ location.host +'/'])[0];

    //加載完畢
    function onScriptLoad(e, url){
      var readyRegExp = navigator.platform === 'PLaySTATION 3' ? /^complete$/ : /^(complete|loaded)$/
      if (e.type === 'load' || (readyRegExp.test((e.currentTarget || e.srcElement).readyState))) {
        config.modules[item] = url;
        head.removeChild(node);
        (function poll() {
          if(++timeout > config.timeout * 1000 / 4){
            return error(item + ' is not a valid module', 'error');
          };
          config.status[item] ? onCallback() : setTimeout(poll, 4);
        }());
      }
    }

    //回調
    function onCallback(){
      exports.push(layui[item]);
      apps.length > 1 ?
        that.use(apps.slice(1), callback, exports, from)
      : ( typeof callback === 'function' && function(){
        //保證文檔加載完畢再執行回調
        if(layui.jquery && typeof layui.jquery === 'function' && from !== 'define'){
          return layui.jquery(function(){
            callback.apply(layui, exports);
          });
        }
        callback.apply(layui, exports);
      }() );
    }

    //如果引入了聚合板，內置的模塊則不必重複加載
    if( apps.length === 0 || (layui['layui.all'] && modules[item]) ){
      return onCallback(), that;
    }

    //獲取加載的模塊 URL
    //如果是內置模塊，則按照 dir 參數拼接模塊路徑
    //如果是擴展模塊，則判斷模塊路徑值是否為 {/} 開頭，
    //如果路徑值是 {/} 開頭，則模塊路徑即為後面緊跟的字符。
    //否則，則按照 base 參數拼接模塊路徑

    var url = ( modules[item] ? (dir + 'modules/')
      : (/^\{\/\}/.test(that.modules[item]) ? '' : (config.base || ''))
    ) + (that.modules[item] || item) + '.js';
    url = url.replace(/^\{\/\}/, '');

    //如果擴展模塊（即：非內置模塊）對象已經存在，則不必再加載
    if(!config.modules[item] && layui[item]){
      config.modules[item] = url; //並記錄起該擴展模塊的 url
    }

    //首次加載模塊
    if(!config.modules[item]){
      var node = doc.createElement('script');

      node.async = true;
      node.charset = 'utf-8';
      node.src = url + function(){
        var version = config.version === true
        ? (config.v || (new Date()).getTime())
        : (config.version||'');
        return version ? ('?v=' + version) : '';
      }();

      head.appendChild(node);

      if(node.attachEvent && !(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) && !isOpera){
        node.attachEvent('onreadystatechange', function(e){
          onScriptLoad(e, url);
        });
      } else {
        node.addEventListener('load', function(e){
          onScriptLoad(e, url);
        }, false);
      }

      config.modules[item] = url;
    } else { //緩存
      (function poll() {
        if(++timeout > config.timeout * 1000 / 4){
          return error(item + ' is not a valid module', 'error');
        };
        (typeof config.modules[item] === 'string' && config.status[item])
        ? onCallback()
        : setTimeout(poll, 4);
      }());
    }

    return that;
  };

  //獲取節點的 style 屬性值
  Layui.prototype.getStyle = function(node, name){
    var style = node.currentStyle ? node.currentStyle : win.getComputedStyle(node, null);
    return style[style.getPropertyValue ? 'getPropertyValue' : 'getAttribute'](name);
  };

  //css外部加載器
  Layui.prototype.link = function(href, fn, cssname){
    var that = this
    ,link = doc.createElement('link')
    ,head = doc.getElementsByTagName('head')[0];

    if(typeof fn === 'string') cssname = fn;

    var app = (cssname || href).replace(/\.|\//g, '')
    ,id = link.id = 'layuicss-'+ app
    ,timeout = 0;

    link.rel = 'stylesheet';
    link.href = href + (config.debug ? '?v='+new Date().getTime() : '');
    link.media = 'all';

    if(!doc.getElementById(id)){
      head.appendChild(link);
    }

    if(typeof fn !== 'function') return that;

    //輪詢css是否加載完畢
    (function poll() {
      if(++timeout > config.timeout * 1000 / 100){
        return error(href + ' timeout');
      };
      parseInt(that.getStyle(doc.getElementById(id), 'width')) === 1989 ? function(){
        fn();
      }() : setTimeout(poll, 100);
    }());

    return that;
  };

  //存儲模塊的回調
  config.callback = {};

  //重新執行模塊的工廠函數
  Layui.prototype.factory = function(modName){
    if(layui[modName]){
      return typeof config.callback[modName] === 'function'
        ? config.callback[modName]
      : null;
    }
  };

  //css內部加載器
  Layui.prototype.addcss = function(firename, fn, cssname){
    return layui.link(config.dir + 'css/' + firename, fn, cssname);
  };

  //圖片預加載
  Layui.prototype.img = function(url, callback, error) {
    var img = new Image();
    img.src = url;
    if(img.complete){
      return callback(img);
    }
    img.onload = function(){
      img.onload = null;
      typeof callback === 'function' && callback(img);
    };
    img.onerror = function(e){
      img.onerror = null;
      typeof error === 'function' && error(e);
    };
  };

  //全局配置
  Layui.prototype.config = function(options){
    options = options || {};
    for(var key in options){
      config[key] = options[key];
    }
    return this;
  };

  //記錄全部模塊
  Layui.prototype.modules = function(){
    var clone = {};
    for(var o in modules){
      clone[o] = modules[o];
    }
    return clone;
  }();

  //拓展模塊
  Layui.prototype.extend = function(options){
    var that = this;

    //驗證模塊是否被佔用
    options = options || {};
    for(var o in options){
      if(that[o] || that.modules[o]){
        error(o+ ' Module already exists', 'error');
      } else {
        that.modules[o] = options[o];
      }
    }

    return that;
  };

  // location.hash 路由解析
  Layui.prototype.router = function(hash){
    var that = this
    ,hash = hash || location.hash
    ,data = {
      path: []
      ,search: {}
      ,hash: (hash.match(/[^#](#.*$)/) || [])[1] || ''
    };

    if(!/^#\//.test(hash)) return data; //禁止非路由規範
    hash = hash.replace(/^#\//, '');
    data.href = '/' + hash;
    hash = hash.replace(/([^#])(#.*$)/, '$1').split('/') || [];

    //提取 Hash 結構
    that.each(hash, function(index, item){
      /^\w+=/.test(item) ? function(){
        item = item.split('=');
        data.search[item[0]] = item[1];
      }() : data.path.push(item);
    });

    return data;
  };

  //URL 解析
  Layui.prototype.url = function(href){
    var that = this
    ,data = {
      //提取 url 路徑
      pathname: function(){
        var pathname = href
          ? function(){
            var str = (href.match(/\.[^.]+?\/.+/) || [])[0] || '';
            return str.replace(/^[^\/]+/, '').replace(/\?.+/, '');
          }()
        : location.pathname;
        return pathname.replace(/^\//, '').split('/');
      }()

      //提取 url 參數
      ,search: function(){
        var obj = {}
        ,search = (href
          ? function(){
            var str = (href.match(/\?.+/) || [])[0] || '';
            return str.replace(/\#.+/, '');
          }()
          : location.search
        ).replace(/^\?+/, '').split('&'); //去除 ?，按 & 分割參數

        //遍歷分割後的參數
        that.each(search, function(index, item){
          var _index = item.indexOf('=')
          ,key = function(){ //提取 key
            if(_index < 0){
              return item.substr(0, item.length);
            } else if(_index === 0){
              return false;
            } else {
              return item.substr(0, _index);
            }
          }();
          //提取 value
          if(key){
            obj[key] = _index > 0 ? item.substr(_index + 1) : null;
          }
        });

        return obj;
      }()

      //提取 Hash
      ,hash: that.router(function(){
        return href
          ? ((href.match(/#.+/) || [])[0] || '')
        : location.hash;
      }())
    };

    return data;
  };

  //本地持久性存儲
  Layui.prototype.data = function(table, settings, storage){
    table = table || 'layui';
    storage = storage || localStorage;

    if(!win.JSON || !win.JSON.parse) return;

    //如果settings為null，則刪除表
    if(settings === null){
      return delete storage[table];
    }

    settings = typeof settings === 'object'
      ? settings
    : {key: settings};

    try{
      var data = JSON.parse(storage[table]);
    } catch(e){
      var data = {};
    }

    if('value' in settings) data[settings.key] = settings.value;
    if(settings.remove) delete data[settings.key];
    storage[table] = JSON.stringify(data);

    return settings.key ? data[settings.key] : data;
  };

  //本地會話性存儲
  Layui.prototype.sessionData = function(table, settings){
    return this.data(table, settings, sessionStorage);
  }

  //設備信息
  Layui.prototype.device = function(key){
    var agent = navigator.userAgent.toLowerCase()

    //獲取版本號
    ,getVersion = function(label){
      var exp = new RegExp(label + '/([^\\s\\_\\-]+)');
      label = (agent.match(exp)||[])[1];
      return label || false;
    }

    //返回結果集
    ,result = {
      os: function(){ //底層操作系統
        if(/windows/.test(agent)){
          return 'windows';
        } else if(/linux/.test(agent)){
          return 'linux';
        } else if(/iphone|ipod|ipad|ios/.test(agent)){
          return 'ios';
        } else if(/mac/.test(agent)){
          return 'mac';
        }
      }()
      ,ie: function(){ //ie版本
        return (!!win.ActiveXObject || "ActiveXObject" in win) ? (
          (agent.match(/msie\s(\d+)/) || [])[1] || '11' //由於ie11並沒有msie的標識
        ) : false;
      }()
      ,weixin: getVersion('micromessenger')  //是否微信
    };

    //任意的key
    if(key && !result[key]){
      result[key] = getVersion(key);
    }

    //移動設備
    result.android = /android/.test(agent);
    result.ios = result.os === 'ios';
    result.mobile = (result.android || result.ios) ? true : false;

    return result;
  };

  //提示
  Layui.prototype.hint = function(){
    return {
      error: error
    }
  };

  //遍歷
  Layui.prototype.each = function(obj, fn){
    var key
    ,that = this;
    if(typeof fn !== 'function') return that;
    obj = obj || [];
    if(obj.constructor === Object){
      for(key in obj){
        if(fn.call(obj[key], key, obj[key])) break;
      }
    } else {
      for(key = 0; key < obj.length; key++){
        if(fn.call(obj[key], key, obj[key])) break;
      }
    }
    return that;
  };

  //將數組中的對象按其某個成員排序
  Layui.prototype.sort = function(obj, key, desc){
    var clone = JSON.parse(
      JSON.stringify(obj || [])
    );

    if(!key) return clone;

    //如果是數字，按大小排序，如果是非數字，按字典序排序
    clone.sort(function(o1, o2){
      var isNum = /^-?\d+$/
      ,v1 = o1[key]
      ,v2 = o2[key];

      if(isNum.test(v1)) v1 = parseFloat(v1);
      if(isNum.test(v2)) v2 = parseFloat(v2);

      if(v1 && !v2){
        return 1;
      } else if(!v1 && v2){
        return -1;
      }

      if(v1 > v2){
        return 1;
      } else if (v1 < v2) {
        return -1;
      } else {
        return 0;
      }
    });

    desc && clone.reverse(); //倒序
    return clone;
  };

  //阻止事件冒泡
  Layui.prototype.stope = function(thisEvent){
    thisEvent = thisEvent || win.event;
    try { thisEvent.stopPropagation() } catch(e){
      thisEvent.cancelBubble = true;
    }
  };

  //自定義模塊事件
  Layui.prototype.onevent = function(modName, events, callback){
    if(typeof modName !== 'string'
    || typeof callback !== 'function') return this;

    return Layui.event(modName, events, null, callback);
  };

  //執行自定義模塊事件
  Layui.prototype.event = Layui.event = function(modName, events, params, fn){
    var that = this
    ,result = null
    ,filter = (events || '').match(/\((.*)\)$/)||[] //提取事件過濾器字符結構，如：select(xxx)
    ,eventName = (modName + '.'+ events).replace(filter[0], '') //獲取事件名稱，如：form.select
    ,filterName = filter[1] || '' //獲取過濾器名稱,，如：xxx
    ,callback = function(_, item){
      var res = item && item.call(that, params);
      res === false && result === null && (result = false);
    };

    //如果參數傳入特定字符，則執行移除事件
    if(params === 'LAYUI-EVENT-REMOVE'){
      delete (that.cache.event[eventName] || {})[filterName];
      return that;
    }

    //添加事件
    if(fn){
      config.event[eventName] = config.event[eventName] || {};

      //這裡不再對多次事件監聽做支持，避免更多麻煩
      //config.event[eventName][filterName] ? config.event[eventName][filterName].push(fn) :
      config.event[eventName][filterName] = [fn];
      return this;
    }

    //執行事件回調
    layui.each(config.event[eventName], function(key, item){
      //執行當前模塊的全部事件
      if(filterName === '{*}'){
        layui.each(item, callback);
        return;
      }

      //執行指定事件
      key === '' && layui.each(item, callback);
      (filterName && key === filterName) && layui.each(item, callback);
    });

    return result;
  };

  //新增模塊事件
  Layui.prototype.on = function(events, modName, callback){
    var that = this;
    return that.onevent.call(that, modName, events, callback);
  }

  //移除模塊事件
  Layui.prototype.off = function(events, modName){
    var that = this;
    return that.event.call(that, modName, events, 'LAYUI-EVENT-REMOVE');
  };

  win.layui = new Layui();

}(window);

