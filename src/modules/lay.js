/** lay 基礎 DOM 操作 */

;!function(){
  "use strict";

  var MOD_NAME = 'lay' //模塊名
  ,document = window.document

  //DOM查找
  ,lay = function(selector){
    return new LAY(selector);
  }

  //DOM構造器
  ,LAY = function(selector){
    var index = 0
    ,nativeDOM = typeof selector === 'object' ? [selector] : (
      this.selector = selector
      ,document.querySelectorAll(selector || null)
    );
    for(; index < nativeDOM.length; index++){
      this.push(nativeDOM[index]);
    }
  };

  /*
    lay 對象操作
  */

  LAY.prototype = [];
  LAY.prototype.constructor = LAY;

  //普通對象深度擴展
  lay.extend = function(){
    var ai = 1, args = arguments
    ,clone = function(target, obj){
      target = target || (obj.constructor === Array ? [] : {});
      for(var i in obj){
        //如果值為對象，則進入遞歸，繼續深度合併
        target[i] = (obj[i] && (obj[i].constructor === Object))
          ? clone(target[i], obj[i])
        : obj[i];
      }
      return target;
    }

    args[0] = typeof args[0] === 'object' ? args[0] : {};

    for(; ai < args.length; ai++){
      if(typeof args[ai] === 'object'){
        clone(args[0], args[ai])
      }
    }
    return args[0];
  };

  //lay 模塊版本
  lay.v = '1.0.0';

  //ie版本
  lay.ie = function(){
    var agent = navigator.userAgent.toLowerCase();
    return (!!window.ActiveXObject || "ActiveXObject" in window) ? (
      (agent.match(/msie\s(\d+)/) || [])[1] || '11' //由於ie11並沒有msie的標識
    ) : false;
  }();

  //獲取當前 JS 所在目錄
  lay.getPath = function(){
    var jsPath = document.currentScript ? document.currentScript.src : function(){
      var js = document.scripts
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
  }

  //中止冒泡
  lay.stope = function(e){
    e = e || window.event;
    e.stopPropagation
      ? e.stopPropagation()
    : e.cancelBubble = true;
  };

  //對象遍歷
  lay.each = function(obj, fn){
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

  //數字前置補零
  lay.digit = function(num, length, end){
    var str = '';
    num = String(num);
    length = length || 2;
    for(var i = num.length; i < length; i++){
      str += '0';
    }
    return num < Math.pow(10, length) ? str + (num|0) : num;
  };

  //創建元素
  lay.elem = function(elemName, attr){
    var elem = document.createElement(elemName);
    lay.each(attr || {}, function(key, value){
      elem.setAttribute(key, value);
    });
    return elem;
  };

  //獲取節點的 style 屬性值
  lay.getStyle = function(node, name){
    var style = node.currentStyle ? node.currentStyle : window.getComputedStyle(node, null);
    return style[style.getPropertyValue ? 'getPropertyValue' : 'getAttribute'](name);
  };

  //載入 CSS 依賴
  lay.link = function(href, fn, cssname){
    var head = document.getElementsByTagName("head")[0], link = document.createElement('link');
    if(typeof fn === 'string') cssname = fn;
    var app = (cssname || href).replace(/\.|\//g, '');
    var id = 'layuicss-'+ app, timeout = 0;

    link.rel = 'stylesheet';
    link.href = href;
    link.id = id;

    if(!document.getElementById(id)){
      head.appendChild(link);
    }

    if(typeof fn !== 'function') return;

    //輪詢css是否加載完畢
    (function poll() {
      if(++timeout > 8 * 1000 / 100){
        return window.console && console.error(app + '.css: Invalid');
      };
      parseInt(lay.getStyle(document.getElementById(id), 'width')) === 1989 ? fn() : setTimeout(poll, 100);
    }());
  };

  //當前頁面是否存在滾動條
  lay.hasScrollbar = function(){
    return document.body.scrollHeight > (window.innerHeight || document.documentElement.clientHeight);
  };

  //元素定位
  lay.position = function(elem, elemView, obj){
    if(!elemView) return;
    obj = obj || {};

    //如果綁定的是 document 或 body 元素，則直接獲取鼠標座標
    if(elem === document || elem === lay('body')[0]){
      obj.clickType = 'right';
    }

    //綁定綁定元素的座標
    var rect = obj.clickType === 'right' ? function(){
      var e = obj.e || window.event || {};
      return {
        left: e.clientX
        ,top: e.clientY
        ,right: e.clientX
        ,bottom: e.clientY
      }
    }() : elem.getBoundingClientRect()
    ,elemWidth = elemView.offsetWidth //控件的寬度
    ,elemHeight = elemView.offsetHeight //控件的高度

    //滾動條高度
    ,scrollArea = function(type){
      type = type ? 'scrollLeft' : 'scrollTop';
      return document.body[type] | document.documentElement[type];
    }

    //窗口寬高
    ,winArea = function(type){
      return document.documentElement[type ? 'clientWidth' : 'clientHeight']
    }, margin = 5, left = rect.left, top = rect.bottom;

    //判斷右側是否超出邊界
    if(left + elemWidth + margin > winArea('width')){
      left = winArea('width') - elemWidth - margin; //如果超出右側，則將面板向右靠齊
    }

    //判斷底部和頂部是否超出邊界
    if(top + elemHeight + margin > winArea()){
      //優先頂部是否有足夠區域顯示完全
      if(rect.top > elemHeight + margin){
        top = rect.top - elemHeight - margin*2; //頂部有足夠的區域顯示
      } else {
        //如果面板是鼠標右鍵彈出，且頂部沒有足夠區域顯示，則將面板向底部靠齊
        if(obj.clickType === 'right'){
          top = winArea() - elemHeight - margin*2;
          if(top < 0) top = 0; //不能溢出窗口頂部
        }
      }
    }

    //定位類型
    var position = obj.position;
    if(position) elemView.style.position = position;

    //設置座標
    elemView.style.left = left + (position === 'fixed' ? 0 : scrollArea(1)) + 'px';
    elemView.style.top = top + (position === 'fixed' ? 0 : scrollArea()) + 'px';

    //防止頁面無滾動條時，又因為彈出面板而出現滾動條導致的座標計算偏差
    if(!lay.hasScrollbar()){
      var rect1 = elemView.getBoundingClientRect();
      //如果彈出面板的溢出窗口底部，則表示將出現滾動條，此時需要重新計算座標
      if(!obj.SYSTEM_RELOAD && (rect1.bottom + margin) > winArea()){
        obj.SYSTEM_RELOAD = true;
        setTimeout(function(){
          lay.position(elem, elemView, obj);
        }, 50);
      }
    }
  };

  //獲取元素上的參數配置上
  lay.options = function(elem, attr){
    var othis = lay(elem)
    ,attrName = attr || 'lay-options';
    try {
      return new Function('return '+ (othis.attr(attrName) || '{}'))();
    } catch(ev) {
      hint.error('parseerror：'+ ev, 'error');
      return {};
    }
  };

  //元素是否屬於頂級元素（document 或 body）
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

  //追加字符
  LAY.addStr = function(str, new_str){
    str = str.replace(/\s+/, ' ');
    new_str = new_str.replace(/\s+/, ' ').split(' ');
    lay.each(new_str, function(ii, item){
      if(!new RegExp('\\b'+ item + '\\b').test(str)){
        str = str + ' ' + item;
      }
    });
    return str.replace(/^\s|\s$/, '');
  };

  //移除值
  LAY.removeStr = function(str, new_str){
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

  //查找子元素
  LAY.prototype.find = function(selector){
    var that = this;
    var index = 0, arr = []
    ,isObject = typeof selector === 'object';

    this.each(function(i, item){
      var nativeDOM = isObject ? [selector] : item.querySelectorAll(selector || null);
      for(; index < nativeDOM.length; index++){
        arr.push(nativeDOM[index]);
      }
      that.shift();
    });

    if(!isObject){
      that.selector =  (that.selector ? that.selector + ' ' : '') + selector
    }

    lay.each(arr, function(i, item){
      that.push(item);
    });

    return that;
  };

  //DOM遍歷
  LAY.prototype.each = function(fn){
    return lay.each.call(this, this, fn);
  };

  //添加css類
  LAY.prototype.addClass = function(className, type){
    return this.each(function(index, item){
      item.className = LAY[type ? 'removeStr' : 'addStr'](item.className, className)
    });
  };

  //移除 css 類
  LAY.prototype.removeClass = function(className){
    return this.addClass(className, true);
  };

  //是否包含 css 類
  LAY.prototype.hasClass = function(className){
    var has = false;
    this.each(function(index, item){
      if(new RegExp('\\b'+ className +'\\b').test(item.className)){
        has = true;
      }
    });
    return has;
  };

  //添加或獲取 css style
  LAY.prototype.css = function(key, value){
    var that = this
    ,parseValue = function(v){
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

  //添加或獲取寬度
  LAY.prototype.width = function(value){
    var that = this;
    return value === undefined ? function(){
      if(that.length > 0) return that[0].offsetWidth; //此處還需做兼容
    }() : that.each(function(index, item){
      that.css('width', value);
    });
  };

  //添加或獲取高度
  LAY.prototype.height = function(value){
    var that = this;
    return value === undefined ? function(){
      if(that.length > 0) return that[0].offsetHeight; //此處還需做兼容
    }() : that.each(function(index, item){
      that.css('height', value);
    });
  };

  //添加或獲取屬性
  LAY.prototype.attr = function(key, value){
    var that = this;
    return value === undefined ? function(){
      if(that.length > 0) return that[0].getAttribute(key);
    }() : that.each(function(index, item){
      item.setAttribute(key, value);
    });
  };

  //移除屬性
  LAY.prototype.removeAttr = function(key){
    return this.each(function(index, item){
      item.removeAttribute(key);
    });
  };

  //設置或獲取 HTML 內容
  LAY.prototype.html = function(html){
    var that = this;
    return html === undefined ? function(){
      if(that.length > 0) return that[0].innerHTML;
    }() : this.each(function(index, item){
      item.innerHTML = html;
    });
  };

  //設置或獲取值
  LAY.prototype.val = function(value){
    return value === undefined ? function(){
      if(that.length > 0) return that[0].value;
    }() : this.each(function(index, item){
        item.value = value;
    });
  };

  //追加內容
  LAY.prototype.append = function(elem){
    return this.each(function(index, item){
      typeof elem === 'object'
        ? item.appendChild(elem)
      :  item.innerHTML = item.innerHTML + elem;
    });
  };

  //移除內容
  LAY.prototype.remove = function(elem){
    return this.each(function(index, item){
      elem ? item.removeChild(elem) : item.parentNode.removeChild(item);
    });
  };

  //事件綁定
  LAY.prototype.on = function(eventName, fn){
    return this.each(function(index, item){
      item.attachEvent ? item.attachEvent('on' + eventName, function(e){
        e.target = e.srcElement;
        fn.call(item, e);
      }) : item.addEventListener(eventName, fn, false);
    });
  };

  //解除事件
  LAY.prototype.off = function(eventName, fn){
    return this.each(function(index, item){
      item.detachEvent
        ? item.detachEvent('on'+ eventName, fn)
      : item.removeEventListener(eventName, fn, false);
    });
  };

  //暴露 lay 到全局作用域
  window.lay = lay;

  //如果在 layui 體系中
  if(window.layui && layui.define){
    layui.define(function(exports){ //layui 加載
      exports(MOD_NAME, lay);
    });
  }

}();

