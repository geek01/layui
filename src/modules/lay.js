
/** lay 基礎模塊 | MIT Licensed */

;!function(window){ // gulp build: lay-header
  "use strict";

  var MOD_NAME = 'lay'; // 模塊名
  var document = window.document;

  // 元素查找
  var lay = function(selector){
    return new Class(selector);
  };

  // 構造器
  var Class = function(selector){
    var that = this;
    var elem = typeof selector === 'object' ? function(){
      // 僅適配簡單元素對象
      return layui.isArray(selector) ? selector : [selector];
    }() : (
      this.selector = selector,
      document.querySelectorAll(selector || null)
    );

    lay.each(elem, function(index, item){
      that.push(elem[index]);
    });
  };

  /*
   * API 兼容
   */
  Array.prototype.indexOf = Array.prototype.indexOf || function(searchElement, fromIndex) {
    var rst = -1;
    fromIndex = fromIndex || 0;
    layui.each(this, function(index, val){
      if (searchElement === val && index >= fromIndex) {
        rst = index;
        return !0;
      }
    });
    return rst;
  };

  /*
    lay 對象操作
  */

  Class.fn = Class.prototype = [];
  Class.fn.constructor = Class;

  // 普通對象深度擴展
  lay.extend = function(){
    var ai = 1;
    var length;
    var args = arguments;
    var clone = function(target, obj){
      target = target || (layui.type(obj) === 'array' ? [] : {}); // 目標對象
      for(var i in obj){
        // 若值為普通對象，則進入遞歸，繼續深度合併
        target[i] = (obj[i] && obj[i].constructor === Object)
          ? clone(target[i], obj[i])
        : obj[i];
      }
      return target;
    };

    args[0] = typeof args[0] === 'object' ? args[0] : {};
    length = args.length

    for(; ai < length; ai++){
      if(typeof args[ai] === 'object'){
        clone(args[0], args[ai]);
      }
    }
    return args[0];
  };

  // ie 版本
  lay.ie = function(){
    var agent = navigator.userAgent.toLowerCase();
    return (!!window.ActiveXObject || "ActiveXObject" in window) ? (
      (agent.match(/msie\s(\d+)/) || [])[1] || '11' // 由於 ie11 並沒有 msie 的標識
    ) : false;
  }();


  /**
   * 獲取 layui 常見方法，以便用於組件單獨版
   */

  lay.layui = layui || {};
  lay.getPath = layui.cache.dir; // 獲取當前 JS 所在目錄
  lay.stope = layui.stope; // 中止冒泡
  lay.each = function(){ // 遍歷
    layui.each.apply(layui, arguments);
    return this;
  };


  // 數字前置補零
  lay.digit = function(num, length){
    if(!(typeof num === 'string' || typeof num === 'number')) return '';

    var str = '';
    num = String(num);
    length = length || 2;
    for(var i = num.length; i < length; i++){
      str += '0';
    }
    return num < Math.pow(10, length) ? str + num : num;
  };

  // 創建元素
  lay.elem = function(elemName, attr){
    var elem = document.createElement(elemName);
    lay.each(attr || {}, function(key, value){
      elem.setAttribute(key, value);
    });
    return elem;
  };

  // 當前頁面是否存在滾動條
  lay.hasScrollbar = function(){
    return document.body.scrollHeight > (window.innerHeight || document.documentElement.clientHeight);
  };

  // 獲取 style rules
  lay.getStyleRules = function(style, callback) {
    if (!style) return;

    var sheet = style.sheet || style.styleSheet || {};
    var rules = sheet.cssRules || sheet.rules;

    if (typeof callback === 'function') {
      layui.each(rules, function(i, item){
        if (callback(item, i)) return true;
      });
    }

    return rules;
  };

  // 創建 style 樣式
  lay.style = function(options){
    options = options || {};

    var style = lay.elem('style');
    var styleText = options.text || '';
    var target = options.target;

    if (!styleText) return;

    // 添加樣式
    if ('styleSheet' in style) {
      style.setAttribute('type', 'text/css');
      style.styleSheet.cssText = styleText;
    } else {
      style.innerHTML = styleText;
    }

    // ID
    style.id = 'LAY-STYLE-'+ (options.id || function(index) {
      lay.style.index++;
      return 'DF-'+ index;
    }(lay.style.index || 0));

    // 是否向目標容器中追加 style 元素
    if (target) {
      var styleElem = lay(target).find('#'+ style.id);
      styleElem[0] && styleElem.remove();
      lay(target).append(style);
    }

    return style;
  };

  // 元素定位
  lay.position = function(target, elem, opts){
    if(!elem) return;
    opts = opts || {};

    // 如果綁定的是 document 或 body 元素，則直接獲取鼠標座標
    if(target === document || target === lay('body')[0]){
      opts.clickType = 'right';
    }

    // 綁定綁定元素的座標
    var rect = opts.clickType === 'right' ? function(){
      var e = opts.e || window.event || {};
      return {
        left: e.clientX,
        top: e.clientY,
        right: e.clientX,
        bottom: e.clientY
      }
    }() : target.getBoundingClientRect();
    var elemWidth = elem.offsetWidth; // 控件的寬度
    var elemHeight = elem.offsetHeight; // 控件的高度

    // 滾動條高度
    var scrollArea = function(type){
      type = type ? 'scrollLeft' : 'scrollTop';
      return document.body[type] | document.documentElement[type];
    };

    // 窗口寬高
    var winArea = function(type){
      return document.documentElement[type ? 'clientWidth' : 'clientHeight']
    };
    var margin = 'margin' in opts ? opts.margin : 5;
    var left = rect.left;
    var top = rect.bottom;

    // 相對元素居中
    if(opts.align === 'center'){
      left = left - (elemWidth - target.offsetWidth) / 2;
    } else if(opts.align === 'right'){
      left = left - elemWidth + target.offsetWidth;
    }

    // 判斷右側是否超出邊界
    if(left + elemWidth + margin > winArea('width')){
      left = winArea('width') - elemWidth - margin; // 如果超出右側，則將面板向右靠齊
    }
    // 左側是否超出邊界
    if(left < margin) left = margin;


    // 判斷底部和頂部是否超出邊界
    if(rect.bottom + elemHeight + margin > winArea()){ // 底部超出邊界
      // 優先判斷頂部是否有足夠區域顯示完全，且底部不能超出邊界
      if(rect.top > elemHeight + margin && rect.top <= winArea() ){
        top = rect.top - elemHeight - margin*2; // 頂部有足夠的區域顯示
      } else if(!opts.allowBottomOut){ // 頂部沒有足夠區域顯示時，是否允許底部溢出
        top = winArea() - elemHeight - margin*2; // 面板向底部靠齊
        if(top < 0) top = 0; // 如果面板底部靠齊時，又溢出窗口頂部，則只能將頂部靠齊
      }
    }
    /*
    if(top + elemHeight + margin > winArea()){
      // 優先頂部是否有足夠區域顯示完全
      if(rect.top > elemHeight + margin){
        top = rect.top - elemHeight - margin*2; // 頂部有足夠的區域顯示
      } else {
        // 如果面板是鼠標右鍵彈出，且頂部沒有足夠區域顯示，則將面板向底部靠齊
        if(obj.clickType === 'right'){
          top = winArea() - elemHeight - margin*2;
          if(top < 0) top = 0; // 不能溢出窗口頂部
        } else {
          top = margin; // 位置計算邏輯完備性處理
        }
      }
    }
    */

    // 定位類型
    var position = opts.position;
    if(position) elem.style.position = position;

    // 設置座標
    elem.style.left = left + (position === 'fixed' ? 0 : scrollArea(1)) + 'px';
    elem.style.top = top + (position === 'fixed' ? 0 : scrollArea()) + 'px';

    // 防止頁面無滾動條時，又因為彈出面板而出現滾動條導致的座標計算偏差
    if(!lay.hasScrollbar()){
      var rect1 = elem.getBoundingClientRect();
      // 如果彈出面板的溢出窗口底部，則表示將出現滾動條，此時需要重新計算座標
      if(!opts.SYSTEM_RELOAD && (rect1.bottom + margin) > winArea()){
        opts.SYSTEM_RELOAD = true;
        setTimeout(function(){
          lay.position(target, elem, opts);
        }, 50);
      }
    }
  };

  // 獲取元素上的屬性配置項
  lay.options = function(elem, opts){
    opts = typeof opts === 'object' ? opts : {attr: opts};

    if(elem === document) return {};

    var othis = lay(elem);
    var attrName = opts.attr || 'lay-options';
    var attrValue = othis.attr(attrName);

    try {
      return new Function('return '+ (attrValue || '{}'))();
    } catch(ev) {
      layui.hint().error(opts.errorText || [
        attrName + '="'+ attrValue + '"',
        '\n parseerror: '+ ev
      ].join('\n'), 'error');
      return {};
    }
  };

  // 元素是否屬於頂級元素（document 或 body）
  lay.isTopElem = function(elem){
    var topElems = [document, lay('body')[0]]
    ,matched = false;
    lay.each(topElems, function(index, item){
      if(item === elem){
        return matched = true
      }
    });
    return matched;
  };

  // 剪切板
  lay.clipboard = {
    // 寫入文本
    writeText: function(options) {
      var text = String(options.text);

      try {
        navigator.clipboard.writeText(text).then(
          options.done
        )['catch'](options.error);
      } catch(e) {
        var elem = document.createElement('textarea');

        elem.value = text;
        elem.style.position = 'fixed';
        elem.style.opacity = '0';
        elem.style.top = '0px';
        elem.style.left = '0px';

        document.body.appendChild(elem);
        elem.select();

        try {
          document.execCommand('copy');
          typeof options.done === 'function' && options.done();
        } catch(err) {
          typeof options.error === 'function' && options.error(err);
        } finally {
          elem.remove ? elem.remove() : document.body.removeChild(elem);
        }
      }
    }
  };


  /*
   * lay 元素操作
   */


  // 追加字符
  Class.addStr = function(str, new_str){
    str = str.replace(/\s+/, ' ');
    new_str = new_str.replace(/\s+/, ' ').split(' ');
    lay.each(new_str, function(ii, item){
      if(!new RegExp('\\b'+ item + '\\b').test(str)){
        str = str + ' ' + item;
      }
    });
    return str.replace(/^\s|\s$/, '');
  };

  // 移除值
  Class.removeStr = function(str, new_str){
    str = str.replace(/\s+/, ' ');
    new_str = new_str.replace(/\s+/, ' ').split(' ');
    lay.each(new_str, function(ii, item){
      var exp = new RegExp('\\b'+ item + '\\b')
      if(exp.test(str)){
        str = str.replace(exp, '');
      }
    });
    return str.replace(/\s+/, ' ').replace(/^\s|\s$/, '');
  };

  // 查找子元素
  Class.fn.find = function(selector){
    var that = this;
    var elem = [];
    var isObject = typeof selector === 'object';

    this.each(function(i, item){
      var children = isObject && item.contains(selector)
        ? selector
      : item.querySelectorAll(selector || null);

      lay.each(children, function(index, child){
        elem.push(child);
      });
    });

    return lay(elem);
  };

  // 元素遍歷
  Class.fn.each = function(fn){
    return lay.each.call(this, this, fn);
  };

  // 添加 className
  Class.fn.addClass = function(className, type){
    return this.each(function(index, item){
      item.className = Class[type ? 'removeStr' : 'addStr'](item.className, className)
    });
  };

  // 移除 className
  Class.fn.removeClass = function(className){
    return this.addClass(className, true);
  };

  // 是否包含 css 類
  Class.fn.hasClass = function(className){
    var has = false;
    this.each(function(index, item){
      if(new RegExp('\\b'+ className +'\\b').test(item.className)){
        has = true;
      }
    });
    return has;
  };

  // 添加或獲取 css style
  Class.fn.css = function(key, value){
    var that = this;
    var parseValue = function(v){
      return isNaN(v) ? v : (v +'px');
    };
    return (typeof key === 'string' && value === undefined) ? function(){
      if(that.length > 0) return that[0].style[key];
    }() : that.each(function(index, item){
      typeof key === 'object' ? lay.each(key, function(thisKey, thisValue){
        item.style[thisKey] = parseValue(thisValue);
      }) : item.style[key] = parseValue(value);
    });
  };

  // 添加或獲取寬度
  Class.fn.width = function(value){
    var that = this;
    return value === undefined ? function(){
      if(that.length > 0) return that[0].offsetWidth; // 此處還需做兼容
    }() : that.each(function(index, item){
      that.css('width', value);
    });
  };

  // 添加或獲取高度
  Class.fn.height = function(value){
    var that = this;
    return value === undefined ? function(){
      if(that.length > 0) return that[0].offsetHeight; // 此處還需做兼容
    }() : that.each(function(index, item){
      that.css('height', value);
    });
  };

  // 添加或獲取屬性
  Class.fn.attr = function(key, value){
    var that = this;
    return value === undefined ? function(){
      if(that.length > 0) return that[0].getAttribute(key);
    }() : that.each(function(index, item){
      item.setAttribute(key, value);
    });
  };

  // 移除屬性
  Class.fn.removeAttr = function(key){
    return this.each(function(index, item){
      item.removeAttribute(key);
    });
  };

  // 設置或獲取 HTML 內容
  Class.fn.html = function(html){
    var that = this;
    return html === undefined ? function(){
      if(that.length > 0) return that[0].innerHTML;
    }() : this.each(function(index, item){
      item.innerHTML = html;
    });
  };

  // 設置或獲取值
  Class.fn.val = function(value){
    var that = this;
    return value === undefined ? function(){
      if(that.length > 0) return that[0].value;
    }() : this.each(function(index, item){
        item.value = value;
    });
  };

  // 追加內容
  Class.fn.append = function(elem){
    return this.each(function(index, item){
      typeof elem === 'object'
        ? item.appendChild(elem)
      :  item.innerHTML = item.innerHTML + elem;
    });
  };

  // 移除內容
  Class.fn.remove = function(elem){
    return this.each(function(index, item){
      elem ? item.removeChild(elem) : item.parentNode.removeChild(item);
    });
  };

  // 事件綁定
  Class.fn.on = function(eventName, fn){
    return this.each(function(index, item){
      item.attachEvent ? item.attachEvent('on' + eventName, function(e){
        e.target = e.srcElement;
        fn.call(item, e);
      }) : item.addEventListener(eventName, fn, false);
    });
  };

  // 解除事件
  Class.fn.off = function(eventName, fn){
    return this.each(function(index, item){
      item.detachEvent
        ? item.detachEvent('on'+ eventName, fn)
      : item.removeEventListener(eventName, fn, false);
    });
  };

  // export
  window.lay = lay;

  // 輸出為 layui 模塊
  if(window.layui && layui.define){
    layui.define(function(exports){
      exports(MOD_NAME, lay);
    });
  }

}(window, window.document); // gulp build: lay-footer
