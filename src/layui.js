/**
 * Layui
 * Classic modular front-end UI library
 * MIT Licensed
 */
 
;!function(win){
  "use strict";

  var doc = win.document;
  var config = {
    modules: {}, // 模塊物理路徑
    status: {}, // 模塊加載狀態
    timeout: 10, // 符合規範的模塊請求最長等待秒數
    event: {} // 模塊自定義事件
  };

  var Layui = function(){
    this.v = '2.8.17'; // Layui 版本號
  };

  // 識別預先可能定義的指定全局對象
  var GLOBAL = win.LAYUI_GLOBAL || {};

  // 獲取 layui 所在目錄
  var getPath = function(){
    var jsPath = doc.currentScript ? doc.currentScript.src : function(){
      var js = doc.scripts;
      var last = js.length - 1;
      var src;
      for(var i = last; i > 0; i--){
        if(js[i].readyState === 'interactive'){
          src = js[i].src;
          break;
        }
      }
      return src || js[last].src;
    }();

    return config.dir = GLOBAL.dir || jsPath.substring(0, jsPath.lastIndexOf('/') + 1);
  }();

  // 異常提示
  var error = function(msg, type){
    type = type || 'log';
    win.console && console[type] && console[type]('layui error hint: ' + msg);
  };

  var isOpera = typeof opera !== 'undefined' && opera.toString() === '[object Opera]';

  // 內置模塊
  var modules = config.builtin = {
    lay: 'lay', // 基礎 DOM 操作
    layer: 'layer', // 彈層
    laydate: 'laydate', // 日期
    laypage: 'laypage', // 分頁
    laytpl: 'laytpl', // 模板引擎
    form: 'form', // 表單集
    upload: 'upload', // 上傳
    dropdown: 'dropdown', // 下拉菜單
    transfer: 'transfer', // 穿梭框
    tree: 'tree', // 樹結構
    table: 'table', // 表格
    treeTable: 'treeTable', // 樹表
    element: 'element', // 常用元素操作
    rate: 'rate',  // 評分組件
    colorpicker: 'colorpicker', // 顏色選擇器
    slider: 'slider', // 滑塊
    carousel: 'carousel', // 輪播
    flow: 'flow', // 流加載
    util: 'util', // 工具塊
    code: 'code', // 代碼修飾器
    jquery: 'jquery', // DOM 庫（第三方）

    all: 'all',
    'layui.all': 'layui.all' // 聚合標識（功能性的，非真實模塊）
  };

  // 記錄基礎數據
  Layui.prototype.cache = config;

  // 定義模塊
  Layui.prototype.define = function(deps, factory){
    var that = this;
    var type = typeof deps === 'function';
    var callback = function(){
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

  // 使用特定模塊
  Layui.prototype.use = function(apps, callback, exports, from){
    var that = this;
    var dir = config.dir = config.dir ? config.dir : getPath;
    var head = doc.getElementsByTagName('head')[0];

    apps = function(){
      if(typeof apps === 'string'){
        return [apps];
      }
      // 當第一個參數為 function 時，則自動加載所有內置模塊，且執行的回調即為該 function 參數；
      else if(typeof apps === 'function'){
        callback = apps;
        return ['all'];
      }
      return apps;
    }();

    // 如果頁面已經存在 jQuery 1.7+ 庫且所定義的模塊依賴 jQuery，則不加載內部 jquery 模塊
    if(win.jQuery && jQuery.fn.on){
      that.each(apps, function(index, item){
        if(item === 'jquery'){
          apps.splice(index, 1);
        }
      });
      layui.jquery = layui.$ = jQuery;
    }

    var item = apps[0];
    var timeout = 0;

    exports = exports || [];

    // 靜態資源host
    config.host = config.host || (dir.match(/\/\/([\s\S]+?)\//)||['//'+ location.host +'/'])[0];

    // 加載完畢
    function onScriptLoad(e, url){
      var readyRegExp = navigator.platform === 'PLaySTATION 3' ? /^complete$/ : /^(complete|loaded)$/
      if (e.type === 'load' || (readyRegExp.test((e.currentTarget || e.srcElement).readyState))) {
        config.modules[item] = url;
        head.removeChild(node);
        (function poll() {
          if(++timeout > config.timeout * 1000 / 4){
            return error(item + ' is not a valid module', 'error');
          }
          config.status[item] ? onCallback() : setTimeout(poll, 4);
        }());
      }
    }

    // 回調
    function onCallback(){
      exports.push(layui[item]);
      apps.length > 1 ?
        that.use(apps.slice(1), callback, exports, from)
      : ( typeof callback === 'function' && function(){
        // 保證文檔加載完畢再執行回調
        if(layui.jquery && typeof layui.jquery === 'function' && from !== 'define'){
          return layui.jquery(function(){
            callback.apply(layui, exports);
          });
        }
        callback.apply(layui, exports);
      }() );
    }

    // 如果引入了聚合板，內置的模塊則不必重複加載
    if( apps.length === 0 || (layui['layui.all'] && modules[item]) ){
      return onCallback(), that;
    }

    /*
     * 獲取加載的模塊 URL
     * 如果是內置模塊，則按照 dir 參數拼接模塊路徑
     * 如果是擴展模塊，則判斷模塊路徑值是否為 {/} 開頭，
     * 如果路徑值是 {/} 開頭，則模塊路徑即為後面緊跟的字符。
     * 否則，則按照 base 參數拼接模塊路徑
    */

    var url = ( modules[item] ? (dir + 'modules/')
      : (/^\{\/\}/.test(that.modules[item]) ? '' : (config.base || ''))
    ) + (that.modules[item] || item) + '.js';
    url = url.replace(/^\{\/\}/, '');

    // 如果擴展模塊（即：非內置模塊）對象已經存在，則不必再加載
    if(!config.modules[item] && layui[item]){
      config.modules[item] = url; // 並記錄起該擴展模塊的 url
    }

    // 首次加載模塊
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
    } else { // 緩存
      (function poll() {
        if(++timeout > config.timeout * 1000 / 4){
          return error(item + ' is not a valid module', 'error');
        }
        (typeof config.modules[item] === 'string' && config.status[item])
        ? onCallback()
        : setTimeout(poll, 4);
      }());
    }

    return that;
  };

  // 棄用原有的指定模塊，以便重新擴展新的同名模塊
  Layui.prototype.disuse = function(apps){
    var that = this;
    apps = that.isArray(apps) ? apps : [apps];
    that.each(apps, function (index, item) {
      if (!config.status[item]) {
        // return error('module ' + item + ' is not exist');
      }
      delete that[item];
      delete modules[item];
      delete that.modules[item];
      delete config.status[item];
      delete config.modules[item];
    });
    return that;
  };

  // 獲取節點的 style 屬性值
  Layui.prototype.getStyle = function(node, name){
    var style = node.currentStyle ? node.currentStyle : win.getComputedStyle(node, null);
    return style[style.getPropertyValue ? 'getPropertyValue' : 'getAttribute'](name);
  };

  // css 外部加載器
  Layui.prototype.link = function(href, fn, cssname){
    var that = this;
    var head = doc.getElementsByTagName('head')[0];
    var link = doc.createElement('link');

    if(typeof fn === 'string') cssname = fn;

    var app = (cssname || href).replace(/\.|\//g, '');
    var id = 'layuicss-'+ app;
    var STAUTS_NAME = 'creating';
    var timeout = 0;

    link.href = href + (config.debug ? '?v='+new Date().getTime() : '');
    link.rel = 'stylesheet';
    link.id = id;
    link.media = 'all';

    if(!doc.getElementById(id)){
      head.appendChild(link);
    }

    if(typeof fn !== 'function') return that;

    // 輪詢 css 是否加載完畢
    (function poll(status) {
      var delay = 100;
      var getLinkElem = doc.getElementById(id); // 獲取動態插入的 link 元素

      // 如果輪詢超過指定秒數，則視為請求文件失敗或 css 文件不符合規範
      if(++timeout > config.timeout * 1000 / delay){
        return error(href + ' timeout');
      }

      // css 加載就緒
      if(parseInt(that.getStyle(getLinkElem, 'width')) === 1989){
        // 如果參數來自於初始輪詢（即未加載就緒時的），則移除 link 標籤狀態
        if(status === STAUTS_NAME) getLinkElem.removeAttribute('lay-status');
        // 如果 link 標籤的狀態仍為「創建中」，則繼續進入輪詢，直到狀態改變，則執行回調
        getLinkElem.getAttribute('lay-status') === STAUTS_NAME ? setTimeout(poll, delay) : fn();
      } else {
        getLinkElem.setAttribute('lay-status', STAUTS_NAME);
        setTimeout(function(){
          poll(STAUTS_NAME);
        }, delay);
      }
    }());

    // 輪詢css是否加載完畢
    /*
    (function poll() {
      if(++timeout > config.timeout * 1000 / 100){
        return error(href + ' timeout');
      };
      parseInt(that.getStyle(doc.getElementById(id), 'width')) === 1989 ? function(){
        fn();
      }() : setTimeout(poll, 100);
    }());
    */

    return that;
  };

  // css 內部加載器
  Layui.prototype.addcss = function(firename, fn, cssname){
    return layui.link(config.dir + 'css/' + firename, fn, cssname);
  };

  // 存儲模塊的回調
  config.callback = {};

  // 重新執行模塊的工廠函數
  Layui.prototype.factory = function(modName){
    if(layui[modName]){
      return typeof config.callback[modName] === 'function'
        ? config.callback[modName]
      : null;
    }
  };

  // 圖片預加載
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

  // 全局配置
  Layui.prototype.config = function(options){
    options = options || {};
    for(var key in options){
      config[key] = options[key];
    }
    return this;
  };

  // 記錄全部模塊
  Layui.prototype.modules = function(){
    var clone = {};
    for(var o in modules){
      clone[o] = modules[o];
    }
    return clone;
  }();

  // 拓展模塊
  Layui.prototype.extend = function(options){
    var that = this;

    // 驗證模塊是否被佔用
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
  Layui.prototype.router = Layui.prototype.hash = function(hash){
    var that = this;
    var hash = hash || location.hash;
    var data = {
      path: [],
      search: {},
      hash: (hash.match(/[^#](#.*$)/) || [])[1] || ''
    };

    if(!/^#\//.test(hash)) return data; // 禁止非路由規範

    hash = hash.replace(/^#\//, '');
    data.href = '/' + hash;
    hash = hash.replace(/([^#])(#.*$)/, '$1').split('/') || [];

    // 提取 Hash 結構
    that.each(hash, function(index, item){
      /^\w+=/.test(item) ? function(){
        item = item.split('=');
        data.search[item[0]] = item[1];
      }() : data.path.push(item);
    });

    return data;
  };

  // URL 解析
  Layui.prototype.url = function(href){
    var that = this;
    var data = {
      // 提取 url 路徑
      pathname: function(){
        var pathname = href
          ? function(){
            var str = (href.match(/\.[^.]+?\/.+/) || [])[0] || '';
            return str.replace(/^[^\/]+/, '').replace(/\?.+/, '');
          }()
        : location.pathname;
        return pathname.replace(/^\//, '').split('/');
      }(),

      // 提取 url 參數
      search: function(){
        var obj = {};
        var search = (href
          ? function(){
            var str = (href.match(/\?.+/) || [])[0] || '';
            return str.replace(/\#.+/, '');
          }()
          : location.search
        ).replace(/^\?+/, '').split('&'); // 去除 ?，按 & 分割參數

        // 遍歷分割後的參數
        that.each(search, function(index, item){
          var _index = item.indexOf('=')
          ,key = function(){ // 提取 key
            if(_index < 0){
              return item.substr(0, item.length);
            } else if(_index === 0){
              return false;
            } else {
              return item.substr(0, _index);
            }
          }();
          // 提取 value
          if(key){
            obj[key] = _index > 0 ? item.substr(_index + 1) : null;
          }
        });

        return obj;
      }(),

      // 提取 Hash
      hash: that.router(function(){
        return href
          ? ((href.match(/#.+/) || [])[0] || '/')
        : location.hash;
      }())
    };

    return data;
  };

  // 本地持久存儲
  Layui.prototype.data = function(table, settings, storage){
    table = table || 'layui';
    storage = storage || localStorage;

    if(!win.JSON || !win.JSON.parse) return;

    // 如果 settings 為 null，則刪除表
    if(settings === null){
      return delete storage[table];
    }

    settings = typeof settings === 'object'
      ? settings
    : {key: settings};

    try {
      var data = JSON.parse(storage[table]);
    } catch(e) {
      var data = {};
    }

    if('value' in settings) data[settings.key] = settings.value;
    if(settings.remove) delete data[settings.key];
    storage[table] = JSON.stringify(data);

    return settings.key ? data[settings.key] : data;
  };

  // 本地臨時存儲
  Layui.prototype.sessionData = function(table, settings){
    return this.data(table, settings, sessionStorage);
  }

  // 設備信息
  Layui.prototype.device = function(key){
    var agent = navigator.userAgent.toLowerCase();

    // 獲取版本號
    var getVersion = function(label){
      var exp = new RegExp(label + '/([^\\s\\_\\-]+)');
      label = (agent.match(exp)||[])[1];
      return label || false;
    };

    // 返回結果集
    var result = {
      os: function(){ // 底層操作系統
        if(/windows/.test(agent)){
          return 'windows';
        } else if(/linux/.test(agent)){
          return 'linux';
        } else if(/iphone|ipod|ipad|ios/.test(agent)){
          return 'ios';
        } else if(/mac/.test(agent)){
          return 'mac';
        }
      }(),
      ie: function(){ // ie 版本
        return (!!win.ActiveXObject || "ActiveXObject" in win) ? (
          (agent.match(/msie\s(\d+)/) || [])[1] || '11' // 由於 ie11 並沒有 msie 的標識
        ) : false;
      }(),
      weixin: getVersion('micromessenger')  // 是否微信
    };

    // 任意的 key
    if(key && !result[key]){
      result[key] = getVersion(key);
    }

    // 移動設備
    result.android = /android/.test(agent);
    result.ios = result.os === 'ios';
    result.mobile = (result.android || result.ios);

    return result;
  };

  // 提示
  Layui.prototype.hint = function(){
    return {
      error: error
    };
  };

  // typeof 類型細分 -> string/number/boolean/undefined/null、object/array/function/…
  Layui.prototype._typeof = Layui.prototype.type = function(operand){
    if(operand === null) return String(operand);

    // 細分引用類型
    return (typeof operand === 'object' || typeof operand === 'function') ? function(){
      var type = Object.prototype.toString.call(operand).match(/\s(.+)\]$/) || []; // 匹配類型字符
      var classType = 'Function|Array|Date|RegExp|Object|Error|Symbol'; // 常見類型字符

      type = type[1] || 'Object';

      // 除匹配到的類型外，其他對象均返回 object
      return new RegExp('\\b('+ classType + ')\\b').test(type)
        ? type.toLowerCase()
      : 'object';
    }() : typeof operand;
  };

  // 對象是否具備數組結構（此處為兼容 jQuery 對象）
  Layui.prototype._isArray = Layui.prototype.isArray = function(obj){
    var that = this;
    var len;
    var type = that.type(obj);

    if(!obj || (typeof obj !== 'object') || obj === win) return false;

    len = 'length' in obj && obj.length; // 兼容 ie
    return type === 'array' || len === 0 || (
      typeof len === 'number' && len > 0 && (len - 1) in obj // 兼容 jQuery 對象
    );
  };

  // 遍歷
  Layui.prototype.each = function(obj, fn){
    var key;
    var that = this;
    var callFn = function(key, obj){ // 回調
      return fn.call(obj[key], key, obj[key])
    };

    if(typeof fn !== 'function') return that;
    obj = obj || [];

    // 優先處理數組結構
    if(that.isArray(obj)){
      for(key = 0; key < obj.length; key++){
        if(callFn(key, obj)) break;
      }
    } else {
      for(key in obj){
        if(callFn(key, obj)) break;
      }
    }

    return that;
  };

  // 將數組中的成員對象按照某個 key 的 value 值進行排序
  Layui.prototype.sort = function(arr, key, desc, notClone){
    var that = this;
    var clone = notClone ? (arr || []) : JSON.parse(
      JSON.stringify(arr || [])
    );

    // 若未傳入 key，則直接返回原對象
    if(that.type(arr) === 'object' && !key){
      return clone;
    } else if(typeof arr !== 'object'){ // 若 arr 非對象
      return [clone];
    }

    // 開始排序
    clone.sort(function(o1, o2){
      var v1 = o1[key];
      var v2 = o2[key];

      /*
       * 特殊數據
       * 若比較的成員均非對象
       */

      // 若比較的成員均為數字
      if(!isNaN(o1) && !isNaN(o2)) return o1 - o2;
      // 若比較的成員只存在某一個非對象
      if(!isNaN(o1) && isNaN(o2)){
        if(key && typeof o2 === 'object'){
          v1 = o1;
        } else {
          return -1;
        }
      } else if (isNaN(o1) && !isNaN(o2)){
        if(key && typeof o1 === 'object'){
          v2 = o2;
        } else {
          return 1;
        }
      }

      /*
       * 正常數據
       * 即成員均為對象，也傳入了對比依據： key
       * 若 value 為數字，按「大小」排序；若 value 非數字，則按「字典序」排序
       */

      // value 是否為數字
      var isNum = [!isNaN(v1), !isNaN(v2)];

      // 若為數字比較
      if(isNum[0] && isNum[1]){
        if(v1 && (!v2 && v2 !== 0)){ // 數字 vs 空
          return 1;
        } else if((!v1 && v1 !== 0) && v2){ // 空 vs 數字
          return -1;
        } else { // 數字 vs 數字
          return v1 - v2;
        }
      }

      /**
       * 字典序排序
       */

      // 若為非數字比較
      if(!isNum[0] && !isNum[1]){
        // 字典序比較
        if(v1 > v2){
          return 1;
        } else if (v1 < v2) {
          return -1;
        } else {
          return 0;
        }
      }

      // 若為混合比較
      if(isNum[0] || !isNum[1]){ // 數字 vs 非數字
        return -1;
      } else if(!isNum[0] || isNum[1]) { // 非數字 vs 數字
        return 1;
      }

    });

    desc && clone.reverse(); // 倒序
    return clone;
  };

  // 阻止事件冒泡
  Layui.prototype.stope = function(thisEvent){
    thisEvent = thisEvent || win.event;
    try { thisEvent.stopPropagation() } catch(e){
      thisEvent.cancelBubble = true;
    }
  };

  // 字符常理
  var EV_REMOVE = 'LAYUI-EVENT-REMOVE';

  // 自定義模塊事件
  Layui.prototype.onevent = function(modName, events, callback){
    if(typeof modName !== 'string'
    || typeof callback !== 'function') return this;

    return Layui.event(modName, events, null, callback);
  };

  // 執行自定義模塊事件
  Layui.prototype.event = Layui.event = function(modName, events, params, fn){
    var that = this;
    var result = null;
    var filter = (events || '').match(/\((.*)\)$/)||[]; // 提取事件過濾器字符結構，如：select(xxx)
    var eventName = (modName + '.'+ events).replace(filter[0], ''); // 獲取事件名稱，如：form.select
    var filterName = filter[1] || ''; // 獲取過濾器名稱,，如：xxx
    var callback = function(_, item){
      var res = item && item.call(that, params);
      res === false && result === null && (result = false);
    };

    // 如果參數傳入特定字符，則執行移除事件
    if(params === EV_REMOVE){
      delete (that.cache.event[eventName] || {})[filterName];
      return that;
    }

    // 添加事件
    if(fn){
      config.event[eventName] = config.event[eventName] || {};

      if (filterName) {
        // 帶filter不支持重複事件
        config.event[eventName][filterName] = [fn];
      } else {
        // 不帶filter處理的是所有的同類事件，應該支持重複事件
        config.event[eventName][filterName] = config.event[eventName][filterName] || [];
        config.event[eventName][filterName].push(fn);
      }
      return this;
    }

    // 執行事件回調
    layui.each(config.event[eventName], function(key, item){
      // 執行當前模塊的全部事件
      if(filterName === '{*}'){
        layui.each(item, callback);
        return;
      }

      // 執行指定事件
      key === '' && layui.each(item, callback);
      (filterName && key === filterName) && layui.each(item, callback);
    });

    return result;
  };

  // 新增模塊事件
  Layui.prototype.on = function(events, modName, callback){
    var that = this;
    return that.onevent.call(that, modName, events, callback);
  }

  // 移除模塊事件
  Layui.prototype.off = function(events, modName){
    var that = this;
    return that.event.call(that, modName, events, EV_REMOVE);
  };

  // 防抖
  Layui.prototype.debounce = function (func, wait) {
    var timeout;
    return function () {
      var context = this;
      var args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        func.apply(context, args);
      }, wait);
    }
  };

  // 節流
  Layui.prototype.throttle = function (func, wait) {
    var cooldown = false;
    return function () {
      var context = this;
      var args = arguments;
      if (!cooldown) {
        func.apply(context, args);
        cooldown = true;
        setTimeout(function () {
          cooldown = false;
        }, wait);
      }
    }
  };

  // exports layui
  win.layui = new Layui();

}(window); // gulp build: layui-footer

