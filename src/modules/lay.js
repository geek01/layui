
/** lay 基礎模塊 | MIT Licensed */

;!function(window){ // gulp build: lay-header
  "use strict";

  var MOD_NAME = 'lay'; // 模塊名
  var document = window.document;

  /**
   * 元素查找
   * @param {string | HTMLElement | JQuery} selector
   */
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

  /**
   * 將兩個或多個對象的內容深度合併到第一個對象中
   * @callback ExtendFunc
   * @param {*} target - 一個對象
   * @param {...*} objectN - 包含額外的屬性合併到第一個參數
   * @returns {*} 返回合併後的對象
   */
  /** @type ExtendFunc*/
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

  /**
   * IE 版本
   * @type {string | boolean} - 如果是 IE 返回版本字符串，否則返回 false
   */
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


  /**
   * 數字前置補零
   * @param {number | string} num - 原始數字
   * @param {number} [length=2] - 數字長度，如果原始數字長度小於 length，則前面補零
   * @returns {string} 返回補 0 後的數字
   * @example
   * ```js
   * lay.digit(6, 2); // "06"
   * lay.digit('7', 3); // "007"
   * ```
   */
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

  /**
   * 創建元素
   * @param {string} elemName - 元素的標籤名
   * @param {Object.<string, string>} [attr] - 添加到元素上的屬性
   * @returns {HTMLElement} 返回創建的 HTML 元素
   * @example
   * ```js
   * lay.elem('div', {id: 'test'}) // <div id="test"></div>
   * ```
   */
  lay.elem = function(elemName, attr){
    var elem = document.createElement(elemName);
    lay.each(attr || {}, function(key, value){
      elem.setAttribute(key, value);
    });
    return elem;
  };

  /**
   * 當前頁面是否存在滾動條
   * @returns {boolean} 是否存在滾動條
   * @example
   * ```
   * lay.hasScrollbar() // true 或 false
   * ```
   */
  lay.hasScrollbar = function(){
    return document.body.scrollHeight > (window.innerHeight || document.documentElement.clientHeight);
  };

  /**
   * 獲取 style rules
   * @param {HTMLStyleElement} style - HTMLStyle 元素
   * @param {(ruleItem: CSSStyleRule, index: number) => boolean} [callback] - 用來返回 style 元素中的每個 `style rule` 的函數，返回 true 終止遍歷
   * @returns {CSSRuleList } 返回 `style rules`
   * @example
   * ```
   * <style id="test">
   *   .lay-card{
   *     color: #000;
   *   }
   *   .lay-btn-success{
   *     color: green;
   *   }
   * </style>
   *
   * lay.getStyleRules($('#test')[0], function(rule, index){
   *   if(rule.selectorText === '.lay-card'){
   *     console.log(index, rule.cssText) // 0 '.lay-card{color: #000}'
   *     rule.style.color = '#EEE';
   *     return true; // 終止遍歷
   *   }
   * }) // RuleList
   * ```
   */
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

  /**
   * 創建 style 樣式
   * @param {Object} options - 可配置的選項
   * @param {string | HTMLElement | JQuery} [options.target] - 目標容器，指定後會將樣式追加到目標容器
   * @param {string} [options.id] - 樣式元素的 id，默認自增
   * @param {string} options.text - 樣式內容
   * @returns {HTMLStyleElement} 返回創建的樣式元素
   * @example
   * ```html
   * <div id="targetEl">
   *   <!-- 樣式追加到目標容器 -->
   *   <style id="LAY-STYLE-DF-0">.card{color: #000}</style>
   * </div>
   *
   * lay.style({
   *   target: '#targetEl',
   *   text: '.card{color: #000}'
   * }) // <style id="LAY-STYLE-DF-0">.card{color: #000}</style>
   * ```
   */
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

  /**
   * 將元素定位到指定目標元素附近
   * @param {HTMLElement} target - 目標元素
   * @param {HTMLElement} elem - 定位元素
   * @param {Object} [opts] - 可配置的選項
   * @param {'absolute' | 'fixed'} [opts.position] - 元素的定位類型
   * @param {'left' | 'right'} [opts.clickType="left"] - 點擊類型，默認為 'left'，如果 {@link target} 是 document 或 body 元素，則為 'right'
   * @param {'left' | 'right' | 'center'} [opts.align="left"] - 對齊方式
   * @param {boolean} [opts.allowBottomOut=false] - 頂部沒有足夠區域顯示時，是否允許底部溢出
   * @param {string | number} [opts.margin=5] - 邊距
   * @param {Event} [opts.e] - 事件對象，僅右鍵生效
   * @param {boolean} [opts.SYSTEM_RELOAD] - 是否重載，用於出現滾動條時重新計算位置
   * @param {[offsetX:number, offsetY:number]} [opts.offset] - 相對於觸發元素的額外偏移量[x,y]
   * @example
   * ```js
   * <button id="targetEl">dropdown</button>
   * <ul id="contentEl" class="dropdown-menu">
   *   <li>菜單1</li>
   *   <li>菜單2</li>
   * </ul>
   *
   * // 下拉菜單將被定位到按鈕附近
   * lay.position(
   *   $('#targetEl')[0],
   *   $('#contentEl')[0],
   *   {
   *     position: 'fixed',
   *     align: 'center'
   *   }
   * )
   * ```
   */
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
    var offsetX = opts.offset ? opts.offset[0] : 0;
    var offsetY = opts.offset ? opts.offset[1] : 0;

    // 設置座標
    elem.style.left = left + (position === 'fixed' ? 0 : scrollArea(1)) + offsetX + 'px';
    elem.style.top = top + (position === 'fixed' ? 0 : scrollArea()) + offsetY + 'px';

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

  /**
   * 獲取元素上的屬性配置項
   * @param {string | HTMLElement | JQuery} elem - HTML 元素
   * @param {{attr: string} | string} [opts="lay-options"] - 可配置的選項，string 類型指定屬性名
   * @returns {Object.<string, any>} 返回元素上的屬性配置項
   * @example
   * ```js
   * <div id="testEl" lay-options="{color:red}" lay-toc="{hot: true}"></div>
   *
   * var elem = $('#testEl')
   * lay.options(elem) // {color:red}
   * lay.options(elem[0]) // {color:red}
   * lay.options('#testEl') // {color:red}
   * lay.options('#testEl', {attr: 'lay-toc'}) // {hot: true}
   * lay.options('#testEl', 'lay-toc') // {hot: true}
   *
   * $('#testEl').attr('lay-toc') // '{hot: true}'
   * ```
   */
  lay.options = function(elem, opts){
    opts = typeof opts === 'object' ? opts : {attr: opts};

    if(elem === document) return {};

    var othis = lay(elem);
    var attrName = opts.attr || 'lay-options';
    var attrValue = othis.attr(attrName);

    try {
      /**
       * 請注意: 開發者在使用 lay-options="{}" 配置組件選項時，需確保屬性值不來自於網頁用戶,
       * 即屬性值必須在網頁開發者自身的可控範圍內，否則請勿在 HTML 標籤屬性中獲取組件選項。
       */
      return new Function('return '+ (attrValue || '{}'))();
    } catch(ev) {
      layui.hint().error(opts.errorText || [
        attrName + '="'+ attrValue + '"',
        '\n parseerror: '+ ev
      ].join('\n'), 'error');
      return {};
    }
  };


  /**
   * 元素是否屬於頂級元素（document 或 body）
   * @param {HTMLElement} elem - HTML 元素
   * @returns {boolean} 是否屬於頂級元素
   * @example
   * ```js
   * lay.isTopElem(document) // true
   * ```
   */
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
    /**
     * 寫入文本
     * @param {Object} options - 可配置的選項
     * @param {string} options.text - 寫入剪貼板的文本
     * @param {() => void} [options.done] - 寫入成功/完成回調
     * @param {(err?: any) => void} [options.error] - 寫入失敗回調
     * @example
     * ```js
     * lay.clipboard.writeText({
     *   text: '測試文本',
     *   done: function(){ layer.msg('copied')},
     *   error: function(){ layer.msg('error')}
     * })
     * ```
     */
    writeText: function(options) {
      var text = String(options.text);

      if(navigator && 'clipboard' in navigator){
        navigator.clipboard.writeText(text)
          .then(options.done, function(){
            legacyCopy();
        });
      }else{
        legacyCopy();
      }

      function legacyCopy(){
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

  /**
   * 檢測是否支持 Passive Event Listeners
   * 引用自 https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
   * @type {boolean}
   */
  lay.passiveSupported = function(){
    var passiveSupported = false;
    try {
      var opts = Object.defineProperty({}, 'passive', {
        get: function() {
          passiveSupported = true;
        }
      });
      window.addEventListener('test', null, opts);
      window.removeEventListener('test', null, opts);
    } catch (err) {}
    return passiveSupported;
  }();

  /**
   * 是否支持 touch 事件
   */
  lay.touchEventsSupported = function(){
    return 'ontouchstart' in window;
  };

  /**
   * @typedef touchSwipeState
   * @prop {{x: number,y: number}} pointerStart - 初始座標
   * @prop {{x: number,y: number}} pointerEnd - 結束座標
   * @prop {number} distanceX - X 軸移動距離
   * @prop {number} distanceY - Y 軸移動距離
   * @prop {'none'|'right'|'left'|'up'|'down'} direction - 滑動方向
   * @prop {Date} timeStart 開始時間
   */
  /**
   * @callback touchSwipeCallback
   * @param {TouchEvent} e 滑動事件
   * @param {touchSwipeState} state 滑動相關的狀態
   */
  /**
   * 基於 touch 事件的觸摸滑動
   * @param {string | HTMLElement | JQuery} elem - HTML 元素
   * @param {{onTouchStart?: touchSwipeCallback, onTouchMove?: touchSwipeCallback, onTouchEnd?: touchSwipeCallback}} opts - 配置項
   */
  lay.touchSwipe = function(elem, opts){
    var options = opts
    var targetElem = lay(elem)[0];

    if(!targetElem || !lay.touchEventsSupported()) return;

    var state = {
      pointerStart: {x:0, y:0},
      pointerEnd: {x:0, y:0},
      distanceX: 0,
      distanceY: 0,
      direction:'none', // 'up','down','left','right','none
      timeStart: null
    }

    var onStart = function(e){
      if(e.touches.length !== 1) return;
      bindEvents();
      // 重置狀態
      state.timeStart = Date.now();
      state.pointerStart.x = state.pointerEnd.x = e.touches[0].clientX;
      state.pointerStart.y = state.pointerEnd.y = e.touches[0].clientY;
      state.distanceX = state.distanceY = 0;
      state.direction = 'none'

      options.onTouchStart && options.onTouchStart(e, state);
    }

    var onMove = function(e){
      e.preventDefault();
      state.pointerEnd.x = e.touches[0].clientX;
      state.pointerEnd.y = e.touches[0].clientY;
      state.distanceX = state.pointerStart.x - state.pointerEnd.x;
      state.distanceY = state.pointerStart.y - state.pointerEnd.y;
      if(Math.abs(state.distanceX) > Math.abs(state.distanceY)){
        state.direction = state.distanceX > 0 ? 'left' : 'right';
      }else{
        state.direction = state.distanceY > 0 ? 'up' : 'down';
      }
      options.onTouchMove && options.onTouchMove(e, state);
    }

    var onEnd = function(e){
      options.onTouchEnd && options.onTouchEnd(e, state);
      unbindEvents();
    }

    var bindEvents = function(){
      targetElem.addEventListener('touchmove', onMove, lay.passiveSupported ? { passive: false} : false);
      targetElem.addEventListener('touchend', onEnd);
      targetElem.addEventListener('touchcancel', onEnd);
    }

    var unbindEvents = function(){
      targetElem.removeEventListener('touchmove', onMove);
      targetElem.removeEventListener('touchend', onEnd, lay.passiveSupported ? { passive: false} : false);
      targetElem.removeEventListener('touchcancel', onEnd);
    }

    // 防止事件重複綁定
    if(targetElem.__lay_touchswipe_cb_){
      targetElem.removeEventListener('touchstart', targetElem.__lay_touchswipe_cb_);
    }
    targetElem.__lay_touchswipe_cb_ = onStart;
    targetElem.addEventListener('touchstart', onStart);
  }

  /** @type {(elem: Element|Document|Window,eventName: string,fn:EventListenerOrEventListenerObject,options: boolean | AddEventListenerOptions) => any}*/
  lay.addEvent = function(){
    if(document.addEventListener){
      return function(elem, eventName, fn, options){
        elem.addEventListener(eventName, fn, options);
      }
    }else{
      return function(elem, eventName, fn){
        var prefix = '_lay_on_';
        var eventsCacheName = prefix + eventName;
        var listener = function(e){
          e.target = e.srcElement;
          fn.call(elem, e);
        }
        listener._rawFn = fn;
        if(!elem[eventsCacheName]){
          elem[eventsCacheName] = [];
        }
        var include = false;
        lay.each(elem[eventsCacheName], function(_, listener){
          if(listener._rawFn === fn){
            include = true;
            return true;
          }
        })
        if(!include){
          elem[eventsCacheName].push(listener);
          elem.attachEvent('on' + eventName, listener);
        }
      }
    }
  }();

 /** @type {(elem: Element|Document|Window,eventName: string,fn:EventListenerOrEventListenerObject,options: boolean | EventListenerOptions) => any}*/
  lay.removeEvent = function(){
    if(document.removeEventListener){
      return function(elem, eventName, fn, options){
        elem.removeEventListener(eventName, fn, options);
      }
    }else{
      return function(elem, eventName, fn){
        var prefix = '_lay_on_';
        var eventsCacheName = prefix + eventName;
        var events = elem[eventsCacheName];
        if(layui.isArray(events)){
          var newEvents = [];
          lay.each(events, function(_, listener){
            if(listener._rawFn === fn){
              elem.detachEvent('on'+ eventName, listener);
            }else{
              newEvents.push(listener);
            }
          })
          elem[eventsCacheName] = newEvents;
        }
      }
    }
  }();

  /**
   * 監聽指定元素外部的點擊
   * @param {HTMLElement} target - 被監聽的元素
   * @param {(e: Event) => void} handler - 事件觸發時執行的函數
   * @param {object} [options] - 選項
   * @param {string} [options.event="pointerdown"] - 監聽的事件類型
   * @param {HTMLElement | Window} [options.scope=document] - 監聽範圍
   * @param {Array<HTMLElement | string>} [options.ignore] - 忽略監聽的元素或選擇器字符串
   * @param {boolean} [options.capture=true] - 對內部事件偵聽器使用捕獲階段
   * @returns {() => void} - 返回一個停止事件監聽的函數
   */
  lay.onClickOutside = function(target, handler, options){
    options = options || {};
    var eventType = options.event || ('onpointerdown' in window ? 'pointerdown' : 'mousedown');
    var scopeTarget = options.scope || document;
    var ignore = options.ignore || [];
    var useCapture = 'capture' in options ? options.capture : true;

    var listener = function(event){
      var el = target;
      var eventTarget = event.target || event.srcElement;
      var eventPath = getEventPath(event);

      if (!el || el === eventTarget || eventPath.indexOf(el) !== -1){
        return;
      }
      if(shouldIgnore(event, eventPath)){
        return;
      }

      handler(event);
    };

    function shouldIgnore(event, eventPath){
      var eventTarget = event.target || event.srcElement;
      for(var i = 0; i < ignore.length; i++){
        var target = ignore[i];
        if(typeof target === 'string'){
          var targetElements = document.querySelectorAll(target);
          for(var j = 0; j < targetElements.length; j++){
            var targetEl = targetElements[i];
            if(targetEl === eventTarget || eventPath.indexOf(targetEl) !== -1){
              return true;
            }
          }
        }else{
          if(target && (target === eventTarget || eventPath.indexOf(target) !== -1)){
            return true;
          }
        }
      }
    }

    function getEventPath(event){
      var path = (event.composedPath && event.composedPath()) || event.path;
      var eventTarget = event.target || event.srcElement;

      if (path !== null && path !== undefined){
        return path;
      }

      function getParents(node, memo){
        memo = memo || [];
        var parentNode = node.parentNode;

        return parentNode
          ? getParents(parentNode, memo.concat([parentNode]))
          : memo;
      }

      return [eventTarget].concat(getParents(eventTarget));
    }

    function bindEventListener(elem, eventName, handler, opts){
      elem.addEventListener
        ? elem.addEventListener(eventName, handler, opts)
        : elem.attachEvent('on' + eventName, handler);

      return function(){
        elem.removeEventListener
          ? elem.removeEventListener(eventName, handler, opts)
          : elem.detachEvent('on' + eventName, handler);
      }
    }

    return bindEventListener(
      scopeTarget,
      eventType,
      listener,
      lay.passiveSupported ? { passive: true, capture: useCapture } : useCapture
    );
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
  Class.fn.on = function(eventName, fn, options){
    return this.each(function(index, item){
      lay.addEvent(item, eventName, fn, options)
    });
  };

  // 解除事件
  Class.fn.off = function(eventName, fn, options){
    return this.each(function(index, item){
      lay.removeEvent(item, eventName, fn, options)
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
