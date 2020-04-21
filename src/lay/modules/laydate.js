/**

 @Name : layDate 5.0.9 日期時間控件
 @Author: 賢心
 @Site：http://www.layui.com/laydate/
 @License：MIT

 */

;!function(){
  "use strict";

  var isLayui = window.layui && layui.define, ready = {
    getPath: function(){
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
    }()

    //獲取節點的style屬性值
    ,getStyle: function(node, name){
      var style = node.currentStyle ? node.currentStyle : window.getComputedStyle(node, null);
      return style[style.getPropertyValue ? 'getPropertyValue' : 'getAttribute'](name);
    }

    //載入CSS配件
    ,link: function(href, fn, cssname){

      //未設置路徑，則不主動加載css
      if(!laydate.path) return;

      var head = document.getElementsByTagName("head")[0], link = document.createElement('link');
      if(typeof fn === 'string') cssname = fn;
      var app = (cssname || href).replace(/\.|\//g, '');
      var id = 'layuicss-'+ app, timeout = 0;

      link.rel = 'stylesheet';
      link.href = laydate.path + href;
      link.id = id;

      if(!document.getElementById(id)){
        head.appendChild(link);
      }

      if(typeof fn !== 'function') return;

      //輪詢css是否加載完畢
      (function poll() {
        if(++timeout > 8 * 1000 / 100){
          return window.console && console.error('laydate.css: Invalid');
        };
        parseInt(ready.getStyle(document.getElementById(id), 'width')) === 1989 ? fn() : setTimeout(poll, 100);
      }());
    }
  }

  ,laydate = {
    v: '5.0.9'
    ,config: {} //全局配置項
    ,index: (window.laydate && window.laydate.v) ? 100000 : 0
    ,path: ready.getPath

    //設置全局項
    ,set: function(options){
      var that = this;
      that.config = lay.extend({}, that.config, options);
      return that;
    }

    //主體CSS等待事件
    ,ready: function(fn){
      var cssname = 'laydate', ver = ''
      ,path = (isLayui ? 'modules/laydate/' : 'theme/') + 'default/laydate.css?v='+ laydate.v + ver;
      isLayui ? layui.addcss(path, fn, cssname) : ready.link(path, fn, cssname);
      return this;
    }
  }

  //操作當前實例
  ,thisDate = function(){
    var that = this;
    return {
      //提示框
      hint: function(content){
        that.hint.call(that, content);
      }
      ,config: that.config
    };
  }

  //字符常量
  ,MOD_NAME = 'laydate', ELEM = '.layui-laydate', THIS = 'layui-this', SHOW = 'layui-show', HIDE = 'layui-hide', DISABLED = 'laydate-disabled', TIPS_OUT = '開始日期超出了結束日期<br>建議重新選擇', LIMIT_YEAR = [100, 200000]

  ,ELEM_STATIC = 'layui-laydate-static', ELEM_LIST = 'layui-laydate-list', ELEM_SELECTED = 'laydate-selected', ELEM_HINT = 'layui-laydate-hint', ELEM_PREV = 'laydate-day-prev', ELEM_NEXT = 'laydate-day-next', ELEM_FOOTER = 'layui-laydate-footer', ELEM_CONFIRM = '.laydate-btns-confirm', ELEM_TIME_TEXT = 'laydate-time-text', ELEM_TIME_BTN = '.laydate-btns-time'

  //組件構造器
  ,Class = function(options){
    var that = this;
    that.index = ++laydate.index;
    that.config = lay.extend({}, that.config, laydate.config, options);
    laydate.ready(function(){
      that.init();
    });
  }

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
    lay對象操作
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

  //ie版本
  lay.ie = function(){
    var agent = navigator.userAgent.toLowerCase();
    return (!!window.ActiveXObject || "ActiveXObject" in window) ? (
      (agent.match(/msie\s(\d+)/) || [])[1] || '11' //由於ie11並沒有msie的標識
    ) : false;
  }();

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

  //移除css類
  LAY.prototype.removeClass = function(className){
    return this.addClass(className, true);
  };

  //是否包含css類
  LAY.prototype.hasClass = function(className){
    var has = false;
    this.each(function(index, item){
      if(new RegExp('\\b'+ className +'\\b').test(item.className)){
        has = true;
      }
    });
    return has;
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

  //設置HTML內容
  LAY.prototype.html = function(html){
    return this.each(function(index, item){
      item.innerHTML = html;
    });
  };

  //設置值
  LAY.prototype.val = function(value){
    return this.each(function(index, item){
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


  /*
    組件操作
  */


  //是否閏年
  Class.isLeapYear = function(year){
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  };

  //默認配置
  Class.prototype.config = {
    type: 'date' //控件類型，支持：year/month/date/time/datetime
    ,range: false //是否開啟範圍選擇，即雙控件
    ,format: 'yyyy-MM-dd' //默認日期格式
    ,value: null //默認日期，支持傳入new Date()，或者符合format參數設定的日期格式字符
    ,isInitValue: true //用於控制是否自動向元素填充初始值（需配合 value 參數使用）
    ,min: '1900-1-1' //有效最小日期，年月日必須用“-”分割，時分秒必須用“:”分割。注意：它並不是遵循 format 設定的格式。
    ,max: '2099-12-31' //有效最大日期，同上
    ,trigger: 'focus' //呼出控件的事件
    ,show: false //是否直接顯示，如果設置true，則默認直接顯示控件
    ,showBottom: true //是否顯示底部欄
    ,btns: ['clear', 'now', 'confirm'] //右下角顯示的按鈕，會按照數組順序排列
    ,lang: 'cn' //語言，只支持cn/en，即中文和英文
    ,theme: 'default' //主題
    ,position: null //控件定位方式定位, 默認absolute，支持：fixed/absolute/static
    ,calendar: false //是否開啟公曆重要節日，僅支持中文版
    ,mark: {} //日期備註，如重要事件或活動標記
    ,zIndex: null //控件層疊順序
    ,done: null //控件選擇完畢後的回調，點擊清空/現在/確定也均會觸發
    ,change: null //日期時間改變後的回調
  };

  //多語言
  Class.prototype.lang = function(){
    var that = this
    ,options = that.config
    ,text = {
      cn: {
        weeks: ['日', '一', '二', '三', '四', '五', '六']
        ,time: ['時', '分', '秒']
        ,timeTips: '選擇時間'
        ,startTime: '開始時間'
        ,endTime: '結束時間'
        ,dateTips: '返回日期'
        ,month: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二']
        ,tools: {
          confirm: '確定'
          ,clear: '清空'
          ,now: '現在'
        }
      }
      ,en: {
        weeks: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
        ,time: ['Hours', 'Minutes', 'Seconds']
        ,timeTips: 'Select Time'
        ,startTime: 'Start Time'
        ,endTime: 'End Time'
        ,dateTips: 'Select Date'
        ,month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        ,tools: {
          confirm: 'Confirm'
          ,clear: 'Clear'
          ,now: 'Now'
        }
      }
    };
    return text[options.lang] || text['cn'];
  };

  //初始準備
  Class.prototype.init = function(){
    var that = this
    ,options = that.config
    ,dateType = 'yyyy|y|MM|M|dd|d|HH|H|mm|m|ss|s'
    ,isStatic = options.position === 'static'
    ,format = {
      year: 'yyyy'
      ,month: 'yyyy-MM'
      ,date: 'yyyy-MM-dd'
      ,time: 'HH:mm:ss'
      ,datetime: 'yyyy-MM-dd HH:mm:ss'
    };

    options.elem = lay(options.elem);
    options.eventElem = lay(options.eventElem);

    if(!options.elem[0]) return;

    //日期範圍分隔符
    if(options.range === true) options.range = '-';

    //根據不同type，初始化默認format
    if(options.format === format.date){
      options.format = format[options.type];
    }

    //將日期格式轉化成數組
    that.format = options.format.match(new RegExp(dateType + '|.', 'g')) || [];

    //生成正則表達式
    that.EXP_IF = '';
    that.EXP_SPLIT = '';
    lay.each(that.format, function(i, item){
      var EXP =  new RegExp(dateType).test(item)
        ? '\\d{'+ function(){
          if(new RegExp(dateType).test(that.format[i === 0 ? i + 1 : i - 1]||'')){
            if(/^yyyy|y$/.test(item)) return 4;
            return item.length;
          }
          if(/^yyyy$/.test(item)) return '1,4';
          if(/^y$/.test(item)) return '1,308';
          return '1,2';
        }() +'}'
      : '\\' + item;
      that.EXP_IF = that.EXP_IF + EXP;
      that.EXP_SPLIT = that.EXP_SPLIT + '(' + EXP + ')';
    });
    that.EXP_IF = new RegExp('^'+ (
      options.range ?
        that.EXP_IF + '\\s\\'+ options.range + '\\s' + that.EXP_IF
      : that.EXP_IF
    ) +'$');
    that.EXP_SPLIT = new RegExp('^'+ that.EXP_SPLIT +'$', '');

    //如果不是input|textarea元素，則默認採用click事件
    if(!that.isInput(options.elem[0])){
      if(options.trigger === 'focus'){
        options.trigger = 'click';
      }
    }

    //設置唯一KEY
    if(!options.elem.attr('lay-key')){
      options.elem.attr('lay-key', that.index);
      options.eventElem.attr('lay-key', that.index);
    }

    //記錄重要日期
    options.mark = lay.extend({}, (options.calendar && options.lang === 'cn') ? {
      '0-1-1': '元旦'
      ,'0-2-14': '情人'
      ,'0-3-8': '婦女'
      ,'0-3-12': '植樹'
      ,'0-4-1': '愚人'
      ,'0-5-1': '勞動'
      ,'0-5-4': '青年'
      ,'0-6-1': '兒童'
      ,'0-9-10': '教師'
      ,'0-9-18': '國恥'
      ,'0-10-1': '國慶'
      ,'0-12-25': '聖誕'
    } : {}, options.mark);

    //獲取限制內日期
    lay.each(['min', 'max'], function(i, item){
      var ymd = [], hms = [];
      if(typeof options[item] === 'number'){ //如果為數字
        var day = options[item]
        ,time = new Date().getTime()
        ,STAMP = 86400000 //代表一天的時間戳
        ,thisDate = new Date(
          day ? (
            day < STAMP ? time + day*STAMP : day //如果數字小於一天的時間戳，則數字為天數，否則為時間戳
          ) : time
        );
        ymd = [thisDate.getFullYear(), thisDate.getMonth() + 1, thisDate.getDate()];
        day < STAMP || (hms = [thisDate.getHours(), thisDate.getMinutes(), thisDate.getSeconds()]);
      } else {
        ymd = (options[item].match(/\d+-\d+-\d+/) || [''])[0].split('-');
        hms = (options[item].match(/\d+:\d+:\d+/) || [''])[0].split(':');
      }
      options[item] = {
        year: ymd[0] | 0 || new Date().getFullYear()
        ,month: ymd[1] ? (ymd[1] | 0) - 1 : new Date().getMonth()
        ,date: ymd[2] | 0 || new Date().getDate()
        ,hours: hms[0] | 0
        ,minutes: hms[1] | 0
        ,seconds: hms[2] | 0
      };
    });

    that.elemID = 'layui-laydate'+ options.elem.attr('lay-key');

    if(options.show || isStatic) that.render();
    isStatic || that.events();

    //默認賦值
    if(options.value && options.isInitValue){
      if(options.value.constructor === Date){
        that.setValue(that.parse(0, that.systemDate(options.value)));
      } else {
        that.setValue(options.value);
      }
    }
  };

  //控件主體渲染
  Class.prototype.render = function(){
    var that = this
    ,options = that.config
    ,lang = that.lang()
    ,isStatic = options.position === 'static'

    //主面板
    ,elem = that.elem = lay.elem('div', {
      id: that.elemID
      ,'class': [
        'layui-laydate'
        ,options.range ? ' layui-laydate-range' : ''
        ,isStatic ? (' '+ ELEM_STATIC) : ''
        ,options.theme && options.theme !== 'default' && !/^#/.test(options.theme) ? (' laydate-theme-' + options.theme) : ''
      ].join('')
    })

    //主區域
    ,elemMain = that.elemMain = []
    ,elemHeader = that.elemHeader = []
    ,elemCont = that.elemCont = []
    ,elemTable = that.table = []

    //底部區域
    ,divFooter = that.footer = lay.elem('div', {
      'class': ELEM_FOOTER
    });

    if(options.zIndex) elem.style.zIndex = options.zIndex;

    //單雙日曆區域
    lay.each(new Array(2), function(i){
      if(!options.range && i > 0){
        return true;
      }

      //頭部區域
      var divHeader = lay.elem('div', {
        'class': 'layui-laydate-header'
      })

      //左右切換
      ,headerChild = [function(){ //上一年
        var elem = lay.elem('i', {
          'class': 'layui-icon laydate-icon laydate-prev-y'
        });
        elem.innerHTML = '&#xe65a;';
        return elem;
      }(), function(){ //上一月
        var elem = lay.elem('i', {
          'class': 'layui-icon laydate-icon laydate-prev-m'
        });
        elem.innerHTML = '&#xe603;';
        return elem;
      }(), function(){ //年月選擇
        var elem = lay.elem('div', {
          'class': 'laydate-set-ym'
        }), spanY = lay.elem('span'), spanM = lay.elem('span');
        elem.appendChild(spanY);
        elem.appendChild(spanM);
        return elem;
      }(), function(){ //下一月
        var elem = lay.elem('i', {
          'class': 'layui-icon laydate-icon laydate-next-m'
        });
        elem.innerHTML = '&#xe602;';
        return elem;
      }(), function(){ //下一年
        var elem = lay.elem('i', {
          'class': 'layui-icon laydate-icon laydate-next-y'
        });
        elem.innerHTML = '&#xe65b;';
        return elem;
      }()]

      //日曆內容區域
      ,divContent = lay.elem('div', {
        'class': 'layui-laydate-content'
      })
      ,table = lay.elem('table')
      ,thead = lay.elem('thead'), theadTr = lay.elem('tr');

      //生成年月選擇
      lay.each(headerChild, function(i, item){
        divHeader.appendChild(item);
      });

       //生成表格
      thead.appendChild(theadTr);
      lay.each(new Array(6), function(i){ //表體
        var tr = table.insertRow(0);
        lay.each(new Array(7), function(j){
          if(i === 0){
            var th = lay.elem('th');
            th.innerHTML = lang.weeks[j];
            theadTr.appendChild(th);
          }
          tr.insertCell(j);
        });
      });
      table.insertBefore(thead, table.children[0]); //表頭
      divContent.appendChild(table);

      elemMain[i] = lay.elem('div', {
        'class': 'layui-laydate-main laydate-main-list-'+ i
      });

      elemMain[i].appendChild(divHeader);
      elemMain[i].appendChild(divContent);

      elemHeader.push(headerChild);
      elemCont.push(divContent);
      elemTable.push(table);
    });

    //生成底部欄
    lay(divFooter).html(function(){
      var html = [], btns = [];
      if(options.type === 'datetime'){
        html.push('<span lay-type="datetime" class="laydate-btns-time">'+ lang.timeTips +'</span>');
      }
      lay.each(options.btns, function(i, item){
        var title = lang.tools[item] || 'btn';
        if(options.range && item === 'now') return;
        if(isStatic && item === 'clear') title = options.lang === 'cn' ? '重置' : 'Reset';
        btns.push('<span lay-type="'+ item +'" class="laydate-btns-'+ item +'">'+ title +'</span>');
      });
      html.push('<div class="laydate-footer-btns">'+ btns.join('') +'</div>');
      return html.join('');
    }());

    //插入到主區域
    lay.each(elemMain, function(i, main){
      elem.appendChild(main);
    });
    options.showBottom && elem.appendChild(divFooter);

    //生成自定義主題
    if(/^#/.test(options.theme)){
      var style = lay.elem('style')
      ,styleText = [
        '#{{id}} .layui-laydate-header{background-color:{{theme}};}'
        ,'#{{id}} .layui-this{background-color:{{theme}} !important;}'
      ].join('').replace(/{{id}}/g, that.elemID).replace(/{{theme}}/g, options.theme);

      if('styleSheet' in style){
        style.setAttribute('type', 'text/css');
        style.styleSheet.cssText = styleText;
      } else {
        style.innerHTML = styleText;
      }

      lay(elem).addClass('laydate-theme-molv');
      elem.appendChild(style);
    }

    //移除上一個控件
    that.remove(Class.thisElemDate);

    //如果是靜態定位，則插入到指定的容器中，否則，插入到body
    isStatic ? options.elem.append(elem) : (
      document.body.appendChild(elem)
      ,that.position() //定位
    );

    that.checkDate().calendar(); //初始校驗
    that.changeEvent(); //日期切換

    Class.thisElemDate = that.elemID;

    typeof options.ready === 'function' && options.ready(lay.extend({}, options.dateTime, {
      month: options.dateTime.month + 1
    }));
  };

  //控件移除
  Class.prototype.remove = function(prev){
    var that = this
    ,options = that.config
    ,elem = lay('#'+ (prev || that.elemID));
    if(!elem.hasClass(ELEM_STATIC)){
      that.checkDate(function(){
        elem.remove();
      });
    }
    return that;
  };

  //定位算法
  Class.prototype.position = function(){
    var that = this
    ,options = that.config
    ,elem = that.bindElem || options.elem[0]
    ,rect = elem.getBoundingClientRect() //綁定元素的座標
    ,elemWidth = that.elem.offsetWidth //控件的寬度
    ,elemHeight = that.elem.offsetHeight //控件的高度

    //滾動條高度
    ,scrollArea = function(type){
      type = type ? 'scrollLeft' : 'scrollTop';
      return document.body[type] | document.documentElement[type];
    }
    ,winArea = function(type){
      return document.documentElement[type ? 'clientWidth' : 'clientHeight']
    }, margin = 5, left = rect.left, top = rect.bottom;

    //如果右側超出邊界
    if(left + elemWidth + margin > winArea('width')){
      left = winArea('width') - elemWidth - margin;
    }

    //如果底部超出邊界
    if(top + elemHeight + margin > winArea()){
      top = rect.top > elemHeight //頂部是否有足夠區域顯示完全
        ? rect.top - elemHeight
      : winArea() - elemHeight;
      top = top - margin*2;
    }

    if(options.position){
      that.elem.style.position = options.position;
    }
    that.elem.style.left = left + (options.position === 'fixed' ? 0 : scrollArea(1)) + 'px';
    that.elem.style.top = top + (options.position === 'fixed' ? 0 : scrollArea()) + 'px';
  };

  //提示
  Class.prototype.hint = function(content){
    var that = this
    ,options = that.config
    ,div = lay.elem('div', {
      'class': ELEM_HINT
    });

    if(!that.elem) return;

    div.innerHTML = content || '';
    lay(that.elem).find('.'+ ELEM_HINT).remove();
    that.elem.appendChild(div);

    clearTimeout(that.hinTimer);
    that.hinTimer = setTimeout(function(){
      lay(that.elem).find('.'+ ELEM_HINT).remove();
    }, 3000);
  };

  //獲取遞增/減後的年月
  Class.prototype.getAsYM = function(Y, M, type){
    type ? M-- : M++;
    if(M < 0){
      M = 11;
      Y--;
    }
    if(M > 11){
      M = 0;
      Y++;
    }
    return [Y, M];
  };

  //系統消息
  Class.prototype.systemDate = function(newDate){
    var thisDate = newDate || new Date();
    return {
      year: thisDate.getFullYear() //年
      ,month: thisDate.getMonth() //月
      ,date: thisDate.getDate() //日
      ,hours: newDate ? newDate.getHours() : 0 //時
      ,minutes: newDate ? newDate.getMinutes() : 0 //分
      ,seconds: newDate ? newDate.getSeconds() : 0 //秒
    }
  };

  //日期校驗
  Class.prototype.checkDate = function(fn){
    var that = this
    ,thisDate = new Date()
    ,options = that.config
    ,dateTime = options.dateTime = options.dateTime || that.systemDate()
    ,thisMaxDate, error

    ,elem = that.bindElem || options.elem[0]
    ,valType = that.isInput(elem) ? 'val' : 'html'
    ,value = that.isInput(elem) ? elem.value : (options.position === 'static' ? '' : elem.innerHTML)

    //校驗日期有效數字
    ,checkValid = function(dateTime){
      if(dateTime.year > LIMIT_YEAR[1]) dateTime.year = LIMIT_YEAR[1], error = true; //不能超過20萬年
      if(dateTime.month > 11) dateTime.month = 11, error = true;
      if(dateTime.hours > 23) dateTime.hours = 0, error = true;
      if(dateTime.minutes > 59) dateTime.minutes = 0, dateTime.hours++, error = true;
      if(dateTime.seconds > 59) dateTime.seconds = 0, dateTime.minutes++, error = true;

      //計算當前月的最後一天
      thisMaxDate = laydate.getEndDate(dateTime.month + 1, dateTime.year);
      if(dateTime.date > thisMaxDate) dateTime.date = thisMaxDate, error = true;
    }

    //獲得初始化日期值
    ,initDate = function(dateTime, value, index){
      var startEnd = ['startTime', 'endTime'];
      value = (value.match(that.EXP_SPLIT) || []).slice(1);
      index = index || 0;
      if(options.range){
        that[startEnd[index]] = that[startEnd[index]] || {};
      }
      lay.each(that.format, function(i, item){
        var thisv = parseFloat(value[i]);
        if(value[i].length < item.length) error = true;
        if(/yyyy|y/.test(item)){ //年
          if(thisv < LIMIT_YEAR[0]) thisv = LIMIT_YEAR[0], error = true; //年不能低於100年
          dateTime.year = thisv;
        } else if(/MM|M/.test(item)){ //月
          if(thisv < 1) thisv = 1, error = true;
          dateTime.month = thisv - 1;
        } else if(/dd|d/.test(item)){ //日
          if(thisv < 1) thisv = 1, error = true;
          dateTime.date = thisv;
        } else if(/HH|H/.test(item)){ //時
          if(thisv < 1) thisv = 0, error = true;
          dateTime.hours = thisv;
          options.range && (that[startEnd[index]].hours = thisv);
        } else if(/mm|m/.test(item)){ //分
          if(thisv < 1) thisv = 0, error = true;
          dateTime.minutes = thisv;
          options.range && (that[startEnd[index]].minutes = thisv);
        } else if(/ss|s/.test(item)){ //秒
          if(thisv < 1) thisv = 0, error = true;
          dateTime.seconds = thisv;
          options.range && (that[startEnd[index]].seconds = thisv);
        }
      });
      checkValid(dateTime)
    };

    if(fn === 'limit') return checkValid(dateTime), that;

    value = value || options.value;
    if(typeof value === 'string'){
      value = value.replace(/\s+/g, ' ').replace(/^\s|\s$/g, '');
    }

    //如果點擊了開始，單未選擇結束就關閉，則重新選擇開始
    if(that.startState && !that.endState){
      delete that.startState;
      that.endState = true;
    };

    if(typeof value === 'string' && value){
      if(that.EXP_IF.test(value)){ //校驗日期格式
        if(options.range){
          value = value.split(' '+ options.range +' ');
          that.startDate = that.startDate || that.systemDate();
          that.endDate = that.endDate || that.systemDate();
          options.dateTime = lay.extend({}, that.startDate);
          lay.each([that.startDate, that.endDate], function(i, item){
            initDate(item, value[i], i);
          });
        } else {
          initDate(dateTime, value)
        }
      } else {
        that.hint('日期格式不合法<br>必須遵循下述格式：<br>'+ (
          options.range ? (options.format + ' '+ options.range +' ' + options.format) : options.format
        ) + '<br>已為你重置');
        error = true;
      }
    } else if(value && value.constructor === Date){ //如果值為日期對象時
      options.dateTime = that.systemDate(value);
    } else {
      options.dateTime = that.systemDate();
      delete that.startState;
      delete that.endState;
      delete that.startDate;
      delete that.endDate;
      delete that.startTime;
      delete that.endTime;
    }

    checkValid(dateTime);

    if(error && value){
      that.setValue(
        options.range ? (that.endDate ? that.parse() : '') : that.parse()
      );
    }
    fn && fn();
    return that;
  };

  //公曆重要日期與自定義備註
  Class.prototype.mark = function(td, YMD){
    var that = this
    ,mark, options = that.config;
    lay.each(options.mark, function(key, title){
      var keys = key.split('-');
      if((keys[0] == YMD[0] || keys[0] == 0) //每年的每月
      && (keys[1] == YMD[1] || keys[1] == 0) //每月的每日
      && keys[2] == YMD[2]){ //特定日
        mark = title || YMD[2];
      }
    });
    mark && td.html('<span class="laydate-day-mark">'+ mark +'</span>');

    return that;
  };

  //無效日期範圍的標記
  Class.prototype.limit = function(elem, date, index, time){
    var that = this
    ,options = that.config, timestrap = {}
    ,dateTime = options[index > 41 ? 'endDate' : 'dateTime']
    ,isOut, thisDateTime = lay.extend({}, dateTime, date || {});
    lay.each({
      now: thisDateTime
      ,min: options.min
      ,max: options.max
    }, function(key, item){
      timestrap[key] = that.newDate(lay.extend({
        year: item.year
        ,month: item.month
        ,date: item.date
      }, function(){
        var hms = {};
        lay.each(time, function(i, keys){
          hms[keys] = item[keys];
        });
        return hms;
      }())).getTime();  //time：是否比較時分秒
    });

    isOut = timestrap.now < timestrap.min || timestrap.now > timestrap.max;
    elem && elem[isOut ? 'addClass' : 'removeClass'](DISABLED);
    return isOut;
  };

  //日曆表
  Class.prototype.calendar = function(value){
    var that = this
    ,options = that.config
    ,dateTime = value || options.dateTime
    ,thisDate = new Date(), startWeek, prevMaxDate, thisMaxDate
    ,lang = that.lang()

    ,isAlone = options.type !== 'date' && options.type !== 'datetime'
    ,index = value ? 1 : 0
    ,tds = lay(that.table[index]).find('td')
    ,elemYM = lay(that.elemHeader[index][2]).find('span');

    if(dateTime.year < LIMIT_YEAR[0]) dateTime.year = LIMIT_YEAR[0], that.hint('最低只能支持到公元'+ LIMIT_YEAR[0] +'年');
    if(dateTime.year > LIMIT_YEAR[1]) dateTime.year = LIMIT_YEAR[1], that.hint('最高只能支持到公元'+ LIMIT_YEAR[1] +'年');

    //記錄初始值
    if(!that.firstDate){
      that.firstDate = lay.extend({}, dateTime);
    }

    //計算當前月第一天的星期
    thisDate.setFullYear(dateTime.year, dateTime.month, 1);
    startWeek = thisDate.getDay();

    prevMaxDate = laydate.getEndDate(dateTime.month || 12, dateTime.year); //計算上個月的最後一天
    thisMaxDate = laydate.getEndDate(dateTime.month + 1, dateTime.year); //計算當前月的最後一天

    //賦值日
    lay.each(tds, function(index, item){
      var YMD = [dateTime.year, dateTime.month], st = 0;
      item = lay(item);
      item.removeAttr('class');
      if(index < startWeek){
        st = prevMaxDate - startWeek + index;
        item.addClass('laydate-day-prev');
        YMD = that.getAsYM(dateTime.year, dateTime.month, 'sub');
      } else if(index >= startWeek && index < thisMaxDate + startWeek){
        st = index - startWeek;
        if(!options.range){
          st + 1 === dateTime.date && item.addClass(THIS);
        }
      } else {
        st = index - thisMaxDate - startWeek;
        item.addClass('laydate-day-next');
        YMD = that.getAsYM(dateTime.year, dateTime.month);
      }
      YMD[1]++;
      YMD[2] = st + 1;
      item.attr('lay-ymd', YMD.join('-')).html(YMD[2]);
      that.mark(item, YMD).limit(item, {
        year: YMD[0]
        ,month: YMD[1] - 1
        ,date: YMD[2]
      }, index);
    });

    //同步頭部年月
    lay(elemYM[0]).attr('lay-ym', dateTime.year + '-' + (dateTime.month + 1));
    lay(elemYM[1]).attr('lay-ym', dateTime.year + '-' + (dateTime.month + 1));

    if(options.lang === 'cn'){
      lay(elemYM[0]).attr('lay-type', 'year').html(dateTime.year + '年')
      lay(elemYM[1]).attr('lay-type', 'month').html((dateTime.month + 1) + '月');
    } else {
      lay(elemYM[0]).attr('lay-type', 'month').html(lang.month[dateTime.month]);
      lay(elemYM[1]).attr('lay-type', 'year').html(dateTime.year);
    }

    //初始默認選擇器
    if(isAlone){
      if(options.range){
        value ? that.endDate = (that.endDate || {
          year: dateTime.year + (options.type === 'year' ? 1 : 0)
          ,month: dateTime.month + (options.type === 'month' ? 0 : -1)
        }) : (that.startDate = that.startDate || {
          year: dateTime.year
          ,month: dateTime.month
        });
        if(value){
          that.listYM = [
            [that.startDate.year, that.startDate.month + 1]
            ,[that.endDate.year, that.endDate.month + 1]
          ];
          that.list(options.type, 0).list(options.type, 1);
          //同步按鈕可點狀態
          options.type === 'time' ? that.setBtnStatus('時間'
            ,lay.extend({}, that.systemDate(), that.startTime)
            ,lay.extend({}, that.systemDate(), that.endTime)
          ) : that.setBtnStatus(true);
        }
      }
      if(!options.range){
        that.listYM = [[dateTime.year, dateTime.month + 1]];
        that.list(options.type, 0);
      }
    }

    //賦值雙日曆
    if(options.range && !value){
      var EYM = that.getAsYM(dateTime.year, dateTime.month)
      that.calendar(lay.extend({}, dateTime, {
        year: EYM[0]
        ,month: EYM[1]
      }));
    }

    //通過檢測當前有效日期，來設定確定按鈕是否可點
    if(!options.range) that.limit(lay(that.footer).find(ELEM_CONFIRM), null, 0, ['hours', 'minutes', 'seconds']);

    //標記選擇範圍
    if(options.range && value && !isAlone) that.stampRange();
    return that;
  };

  //生成年月時分秒列表
  Class.prototype.list = function(type, index){
    var that = this
    ,options = that.config
    ,dateTime = options.dateTime
    ,lang = that.lang()
    ,isAlone = options.range && options.type !== 'date' && options.type !== 'datetime' //獨立範圍選擇器

    ,ul = lay.elem('ul', {
      'class': ELEM_LIST + ' ' + ({
        year: 'laydate-year-list'
        ,month: 'laydate-month-list'
        ,time: 'laydate-time-list'
      })[type]
    })
    ,elemHeader = that.elemHeader[index]
    ,elemYM = lay(elemHeader[2]).find('span')
    ,elemCont = that.elemCont[index || 0]
    ,haveList = lay(elemCont).find('.'+ ELEM_LIST)[0]
    ,isCN = options.lang === 'cn'
    ,text = isCN ? '年' : ''

    ,listYM = that.listYM[index] || {}
    ,hms = ['hours', 'minutes', 'seconds']
    ,startEnd = ['startTime', 'endTime'][index];

    if(listYM[0] < 1) listYM[0] = 1;

    if(type === 'year'){ //年列表
      var yearNum, startY = yearNum = listYM[0] - 7;
      if(startY < 1) startY = yearNum = 1;
      lay.each(new Array(15), function(i){
        var li = lay.elem('li', {
          'lay-ym': yearNum
        }), ymd = {year: yearNum};
        yearNum == listYM[0] && lay(li).addClass(THIS);
        li.innerHTML = yearNum + text;
        ul.appendChild(li);
        if(yearNum < that.firstDate.year){
          ymd.month = options.min.month;
          ymd.date = options.min.date;
        } else if(yearNum >= that.firstDate.year){
          ymd.month = options.max.month;
          ymd.date = options.max.date;
        }
        that.limit(lay(li), ymd, index);
        yearNum++;
      });
      lay(elemYM[isCN ? 0 : 1]).attr('lay-ym', (yearNum - 8) + '-' + listYM[1])
      .html((startY + text) + ' - ' + (yearNum - 1 + text));
    } else if(type === 'month'){ //月列表
      lay.each(new Array(12), function(i){
        var li = lay.elem('li', {
          'lay-ym': i
        }), ymd = {year: listYM[0], month: i};
        i + 1 == listYM[1] && lay(li).addClass(THIS);
        li.innerHTML = lang.month[i] + (isCN ? '月' : '');
        ul.appendChild(li);
        if(listYM[0] < that.firstDate.year){
          ymd.date = options.min.date;
        } else if(listYM[0] >= that.firstDate.year){
          ymd.date = options.max.date;
        }
        that.limit(lay(li), ymd, index);
      });
      lay(elemYM[isCN ? 0 : 1]).attr('lay-ym', listYM[0] + '-' + listYM[1])
      .html(listYM[0] + text);
    } else if(type === 'time'){ //時間列表
      //檢測時分秒狀態是否在有效日期時間範圍內
      var setTimeStatus = function(){
        lay(ul).find('ol').each(function(i, ol){
          lay(ol).find('li').each(function(ii, li){
            that.limit(lay(li), [{
              hours: ii
            }, {
              hours: that[startEnd].hours
              ,minutes: ii
            }, {
              hours: that[startEnd].hours
              ,minutes: that[startEnd].minutes
              ,seconds: ii
            }][i], index, [['hours'], ['hours', 'minutes'], ['hours', 'minutes', 'seconds']][i]);
          });
        });
        if(!options.range) that.limit(lay(that.footer).find(ELEM_CONFIRM), that[startEnd], 0, ['hours', 'minutes', 'seconds']);
      };
      if(options.range){
        if(!that[startEnd]) that[startEnd] = {
          hours: 0
          ,minutes: 0
          ,seconds: 0
        };
      } else {
        that[startEnd] = dateTime;
      }
      lay.each([24, 60, 60], function(i, item){
        var li = lay.elem('li'), childUL = ['<p>'+ lang.time[i] +'</p><ol>'];
        lay.each(new Array(item), function(ii){
          childUL.push('<li'+ (that[startEnd][hms[i]] === ii ? ' class="'+ THIS +'"' : '') +'>'+ lay.digit(ii, 2) +'</li>');
        });
        li.innerHTML = childUL.join('') + '</ol>';
        ul.appendChild(li);
      });
      setTimeStatus();
    }

    //插入容器
    if(haveList) elemCont.removeChild(haveList);
    elemCont.appendChild(ul);

    //年月
    if(type === 'year' || type === 'month'){
      //顯示切換箭頭
      lay(that.elemMain[index]).addClass('laydate-ym-show');

      //選中
      lay(ul).find('li').on('click', function(){
        var ym = lay(this).attr('lay-ym') | 0;
        if(lay(this).hasClass(DISABLED)) return;

        if(index === 0){
          dateTime[type] = ym;
          if(isAlone) that.startDate[type] = ym;
          that.limit(lay(that.footer).find(ELEM_CONFIRM), null, 0);
        } else { //範圍選擇
          if(isAlone){ //非date/datetime類型
            that.endDate[type] = ym;
          } else { //date/datetime類型
            var YM = type === 'year'
              ? that.getAsYM(ym, listYM[1] - 1, 'sub')
            : that.getAsYM(listYM[0], ym, 'sub');
            lay.extend(dateTime, {
              year: YM[0]
              ,month: YM[1]
            });
          }
        }

        if(options.type === 'year' || options.type === 'month'){
          lay(ul).find('.'+ THIS).removeClass(THIS);
          lay(this).addClass(THIS);

          //如果為年月選擇器，點擊了年列表，則切換到月選擇器
          if(options.type === 'month' && type === 'year'){
            that.listYM[index][0] = ym;
            isAlone && (that[['startDate', 'endDate'][index]].year = ym);
            that.list('month', index);
          }
        } else {
          that.checkDate('limit').calendar();
          that.closeList();
        }

        that.setBtnStatus(); //同步按鈕可點狀態
        options.range || that.done(null, 'change');
        lay(that.footer).find(ELEM_TIME_BTN).removeClass(DISABLED);
      });
    } else {
      var span = lay.elem('span', {
        'class': ELEM_TIME_TEXT
      }), scroll = function(){ //滾動條定位
        lay(ul).find('ol').each(function(i){
          var ol = this
          ,li = lay(ol).find('li')
          ol.scrollTop = 30*(that[startEnd][hms[i]] - 2);
          if(ol.scrollTop <= 0){
            li.each(function(ii, item){
              if(!lay(this).hasClass(DISABLED)){
                ol.scrollTop = 30*(ii - 2);
                return true;
              }
            });
          }
        });
      }, haveSpan = lay(elemHeader[2]).find('.'+ ELEM_TIME_TEXT);
      scroll()
      span.innerHTML = options.range ? [lang.startTime,lang.endTime][index] : lang.timeTips
      lay(that.elemMain[index]).addClass('laydate-time-show');
      if(haveSpan[0]) haveSpan.remove();
      elemHeader[2].appendChild(span);

      lay(ul).find('ol').each(function(i){
        var ol = this;
        //選擇時分秒
        lay(ol).find('li').on('click', function(){
          var value = this.innerHTML | 0;
          if(lay(this).hasClass(DISABLED)) return;
          if(options.range){
            that[startEnd][hms[i]]  = value;
          } else {
            dateTime[hms[i]] = value;
          }
          lay(ol).find('.'+ THIS).removeClass(THIS);
          lay(this).addClass(THIS);

          setTimeStatus();
          scroll();
          (that.endDate || options.type === 'time') && that.done(null, 'change');

          //同步按鈕可點狀態
          that.setBtnStatus();
        });
      });
    }

    return that;
  };

  //記錄列表切換後的年月
  Class.prototype.listYM = [];

  //關閉列表
  Class.prototype.closeList = function(){
    var that = this
    ,options = that.config;

    lay.each(that.elemCont, function(index, item){
      lay(this).find('.'+ ELEM_LIST).remove();
      lay(that.elemMain[index]).removeClass('laydate-ym-show laydate-time-show');
    });
    lay(that.elem).find('.'+ ELEM_TIME_TEXT).remove();
  };

  //檢測結束日期是否超出開始日期
  Class.prototype.setBtnStatus = function(tips, start, end){
    var that = this
    ,options = that.config
    ,isOut, elemBtn = lay(that.footer).find(ELEM_CONFIRM)
    ,isAlone = options.range && options.type !== 'date' && options.type !== 'time';
    if(isAlone){
      start = start || that.startDate;
      end = end || that.endDate;
      isOut = that.newDate(start).getTime() > that.newDate(end).getTime();

      //如果不在有效日期內，直接禁用按鈕，否則比較開始和結束日期
      (that.limit(null, start) || that.limit(null, end))
        ? elemBtn.addClass(DISABLED)
      : elemBtn[isOut ? 'addClass' : 'removeClass'](DISABLED);

      //是否異常提示
      if(tips && isOut) that.hint(
        typeof tips === 'string' ? TIPS_OUT.replace(/日期/g, tips) : TIPS_OUT
      );
    }
  };

  //轉義為規定格式的日期字符
  Class.prototype.parse = function(state, date){
    var that = this
    ,options = that.config
    ,dateTime = date || (state
      ? lay.extend({}, that.endDate, that.endTime)
    : (options.range ? lay.extend({}, that.startDate, that.startTime) : options.dateTime))
    ,format = that.format.concat();

    //轉義為規定格式
    lay.each(format, function(i, item){
      if(/yyyy|y/.test(item)){ //年
        format[i] = lay.digit(dateTime.year, item.length);
      } else if(/MM|M/.test(item)){ //月
        format[i] = lay.digit(dateTime.month + 1, item.length);
      } else if(/dd|d/.test(item)){ //日
        format[i] = lay.digit(dateTime.date, item.length);
      } else if(/HH|H/.test(item)){ //時
        format[i] = lay.digit(dateTime.hours, item.length);
      } else if(/mm|m/.test(item)){ //分
        format[i] = lay.digit(dateTime.minutes, item.length);
      } else if(/ss|s/.test(item)){ //秒
        format[i] = lay.digit(dateTime.seconds, item.length);
      }
    });

    //返回日期範圍字符
    if(options.range && !state){
      return format.join('') + ' '+ options.range +' ' + that.parse(1);
    }

    return format.join('');
  };

  //創建指定日期時間對象
  Class.prototype.newDate = function(dateTime){
    dateTime = dateTime || {};
    return new Date(
      dateTime.year || 1
      ,dateTime.month || 0
      ,dateTime.date || 1
      ,dateTime.hours || 0
      ,dateTime.minutes || 0
      ,dateTime.seconds || 0
    );
  };

  //賦值
  Class.prototype.setValue = function(value){
    var that = this
    ,options = that.config
    ,elem = that.bindElem || options.elem[0]
    ,valType = that.isInput(elem) ? 'val' : 'html'

    options.position === 'static' || lay(elem)[valType](value || '');
    return this;
  };

  //標記範圍內的日期
  Class.prototype.stampRange = function(){
    var that = this
    ,options = that.config
    ,startTime, endTime
    ,tds = lay(that.elem).find('td');

    if(options.range && !that.endDate) lay(that.footer).find(ELEM_CONFIRM).addClass(DISABLED);
    if(!that.endDate) return;

    startTime = that.newDate({
      year: that.startDate.year
      ,month: that.startDate.month
      ,date: that.startDate.date
    }).getTime();

    endTime = that.newDate({
      year: that.endDate.year
      ,month: that.endDate.month
      ,date: that.endDate.date
    }).getTime();

    if(startTime > endTime) return that.hint(TIPS_OUT);

    lay.each(tds, function(i, item){
      var ymd = lay(item).attr('lay-ymd').split('-')
      ,thisTime = that.newDate({
        year: ymd[0]
        ,month: ymd[1] - 1
        ,date: ymd[2]
      }).getTime();
      lay(item).removeClass(ELEM_SELECTED + ' ' + THIS);
      if(thisTime === startTime || thisTime === endTime){
        lay(item).addClass(
          lay(item).hasClass(ELEM_PREV) || lay(item).hasClass(ELEM_NEXT)
            ? ELEM_SELECTED
          : THIS
        );
      }
      if(thisTime > startTime && thisTime < endTime){
        lay(item).addClass(ELEM_SELECTED);
      }
    });
  };

  //執行done/change回調
  Class.prototype.done = function(param, type){
    var that = this
    ,options = that.config
    ,start = lay.extend({}, that.startDate ? lay.extend(that.startDate, that.startTime) : options.dateTime)
    ,end = lay.extend({}, lay.extend(that.endDate, that.endTime))

    lay.each([start, end], function(i, item){
      if(!('month' in item)) return;
      lay.extend(item, {
        month: item.month + 1
      });
    });

    param = param || [that.parse(), start, end];
    typeof options[type || 'done'] === 'function' && options[type || 'done'].apply(options, param);

    return that;
  };

  //選擇日期
  Class.prototype.choose = function(td){
    var that = this
    ,options = that.config
    ,dateTime = options.dateTime

    ,tds = lay(that.elem).find('td')
    ,YMD = td.attr('lay-ymd').split('-')

    ,setDateTime = function(one){
      var thisDate = new Date();

      //同步dateTime
      one && lay.extend(dateTime, YMD);

      //記錄開始日期
      if(options.range){
        that.startDate ? lay.extend(that.startDate, YMD) : (
          that.startDate = lay.extend({}, YMD, that.startTime)
        );
        that.startYMD = YMD;
      }
    };

    YMD = {
      year: YMD[0] | 0
      ,month: (YMD[1] | 0) - 1
      ,date: YMD[2] | 0
    };

    if(td.hasClass(DISABLED)) return;

    //範圍選擇
    if(options.range){

      lay.each(['startTime', 'endTime'], function(i, item){
        that[item] = that[item] || {
          hours: 0
          ,minutes: 0
          ,seconds: 0
        };
      });

      if(that.endState){ //重新選擇
        setDateTime();
        delete that.endState;
        delete that.endDate;
        that.startState = true;
        tds.removeClass(THIS + ' ' + ELEM_SELECTED);
        td.addClass(THIS);
      } else if(that.startState){ //選中截止
        td.addClass(THIS);

        that.endDate ? lay.extend(that.endDate, YMD) : (
          that.endDate = lay.extend({}, YMD, that.endTime)
        );

        //判斷是否順時或逆時選擇
        if(that.newDate(YMD).getTime() < that.newDate(that.startYMD).getTime()){
          var startDate = lay.extend({}, that.endDate, {
            hours: that.startDate.hours
            ,minutes: that.startDate.minutes
            ,seconds: that.startDate.seconds
          });
          lay.extend(that.endDate, that.startDate, {
            hours: that.endDate.hours
            ,minutes: that.endDate.minutes
            ,seconds: that.endDate.seconds
          });
          that.startDate = startDate;
        }

        options.showBottom || that.done();
        that.stampRange(); //標記範圍內的日期
        that.endState = true;
        that.done(null, 'change');
      } else { //選中開始
        td.addClass(THIS);
        setDateTime();
        that.startState = true;
      }
      lay(that.footer).find(ELEM_CONFIRM)[that.endDate ? 'removeClass' : 'addClass'](DISABLED);
    } else if(options.position === 'static'){ //直接嵌套的選中
      setDateTime(true);
      that.calendar().done().done(null, 'change');
    } else if(options.type === 'date'){
      setDateTime(true);
      that.setValue(that.parse()).remove().done();
    } else if(options.type === 'datetime'){
      setDateTime(true);
      that.calendar().done(null, 'change');
    }
  };

  //底部按鈕
  Class.prototype.tool = function(btn, type){
    var that = this
    ,options = that.config
    ,dateTime = options.dateTime
    ,isStatic = options.position === 'static'
    ,active = {
      //選擇時間
      datetime: function(){
        if(lay(btn).hasClass(DISABLED)) return;
        that.list('time', 0);
        options.range && that.list('time', 1);
        lay(btn).attr('lay-type', 'date').html(that.lang().dateTips);
      }

      //選擇日期
      ,date: function(){
        that.closeList();
        lay(btn).attr('lay-type', 'datetime').html(that.lang().timeTips);
      }

      //清空、重置
      ,clear: function(){
        that.setValue('').remove();
        isStatic && (
          lay.extend(dateTime, that.firstDate)
          ,that.calendar()
        )
        options.range && (
          delete that.startState
          ,delete that.endState
          ,delete that.endDate
          ,delete that.startTime
          ,delete that.endTime
        );
        that.done(['', {}, {}]);
      }

      //現在
      ,now: function(){
        var thisDate = new Date();
        lay.extend(dateTime, that.systemDate(), {
          hours: thisDate.getHours()
          ,minutes: thisDate.getMinutes()
          ,seconds: thisDate.getSeconds()
        });
        that.setValue(that.parse()).remove();
        isStatic && that.calendar();
        that.done();
      }

      //確定
      ,confirm: function(){
        if(options.range){
          if(!that.endDate) return that.hint('請先選擇日期範圍');
          if(lay(btn).hasClass(DISABLED)) return that.hint(
            options.type === 'time' ? TIPS_OUT.replace(/日期/g, '時間') : TIPS_OUT
          );
        } else {
          if(lay(btn).hasClass(DISABLED)) return that.hint('不在有效日期或時間範圍內');
        }
        that.done();
        that.setValue(that.parse()).remove()
      }
    };
    active[type] && active[type]();
  };

  //統一切換處理
  Class.prototype.change = function(index){
    var that = this
    ,options = that.config
    ,dateTime = options.dateTime
    ,isAlone = options.range && (options.type === 'year' || options.type === 'month')

    ,elemCont = that.elemCont[index || 0]
    ,listYM = that.listYM[index]
    ,addSubYeay = function(type){
      var startEnd = ['startDate', 'endDate'][index]
      ,isYear = lay(elemCont).find('.laydate-year-list')[0]
      ,isMonth = lay(elemCont).find('.laydate-month-list')[0];

      //切換年列表
      if(isYear){
        listYM[0] = type ? listYM[0] - 15 : listYM[0] + 15;
        that.list('year', index);
      }

      if(isMonth){ //切換月面板中的年
        type ? listYM[0]-- : listYM[0]++;
        that.list('month', index);
      }

      if(isYear || isMonth){
        lay.extend(dateTime, {
          year: listYM[0]
        });
        if(isAlone) that[startEnd].year = listYM[0];
        options.range || that.done(null, 'change');
        that.setBtnStatus();
        options.range || that.limit(lay(that.footer).find(ELEM_CONFIRM), {
          year: listYM[0]
        });
      }
      return isYear || isMonth;
    };

    return {
      prevYear: function(){
        if(addSubYeay('sub')) return;
        dateTime.year--;
        that.checkDate('limit').calendar();
        options.range || that.done(null, 'change');
      }
      ,prevMonth: function(){
        var YM = that.getAsYM(dateTime.year, dateTime.month, 'sub');
        lay.extend(dateTime, {
          year: YM[0]
          ,month: YM[1]
        });
        that.checkDate('limit').calendar();
        options.range || that.done(null, 'change');
      }
      ,nextMonth: function(){
        var YM = that.getAsYM(dateTime.year, dateTime.month);
        lay.extend(dateTime, {
          year: YM[0]
          ,month: YM[1]
        });
        that.checkDate('limit').calendar();
        options.range || that.done(null, 'change');
      }
      ,nextYear: function(){
        if(addSubYeay()) return;
        dateTime.year++
        that.checkDate('limit').calendar();
        options.range || that.done(null, 'change');
      }
    };
  };

  //日期切換事件
  Class.prototype.changeEvent = function(){
    var that = this
    ,options = that.config;

    //日期選擇事件
    lay(that.elem).on('click', function(e){
      lay.stope(e);
    });

    //年月切換
    lay.each(that.elemHeader, function(i, header){
      //上一年
      lay(header[0]).on('click', function(e){
        that.change(i).prevYear();
      });

      //上一月
      lay(header[1]).on('click', function(e){
        that.change(i).prevMonth();
      });

      //選擇年月
      lay(header[2]).find('span').on('click', function(e){
        var othis = lay(this)
        ,layYM = othis.attr('lay-ym')
        ,layType = othis.attr('lay-type');

        if(!layYM) return;

        layYM = layYM.split('-');

        that.listYM[i] = [layYM[0] | 0, layYM[1] | 0];
        that.list(layType, i);
        lay(that.footer).find(ELEM_TIME_BTN).addClass(DISABLED);
      });

      //下一月
      lay(header[3]).on('click', function(e){
        that.change(i).nextMonth();
      });

      //下一年
      lay(header[4]).on('click', function(e){
        that.change(i).nextYear();
      });
    });

    //點擊日期
    lay.each(that.table, function(i, table){
      var tds = lay(table).find('td');
      tds.on('click', function(){
        that.choose(lay(this));
      });
    });

    //點擊底部按鈕
    lay(that.footer).find('span').on('click', function(){
      var type = lay(this).attr('lay-type');
      that.tool(this, type);
    });
  };

  //是否輸入框
  Class.prototype.isInput = function(elem){
    return /input|textarea/.test(elem.tagName.toLocaleLowerCase());
  };

  //綁定的元素事件處理
  Class.prototype.events = function(){
    var that = this
    ,options = that.config

    //綁定呼出控件事件
    ,showEvent = function(elem, bind){
      elem.on(options.trigger, function(){
        bind && (that.bindElem = this);
        that.render();
      });
    };

    if(!options.elem[0] || options.elem[0].eventHandler) return;

    showEvent(options.elem, 'bind');
    showEvent(options.eventElem);

    //綁定關閉控件事件
    lay(document).on('click', function(e){
      if(e.target === options.elem[0]
      || e.target === options.eventElem[0]
      || e.target === lay(options.closeStop)[0]){
        return;
      }
      that.remove();
    }).on('keydown', function(e){
      if(e.keyCode === 13){
        if(lay('#'+ that.elemID)[0] && that.elemID === Class.thisElem){
          e.preventDefault();
          lay(that.footer).find(ELEM_CONFIRM)[0].click();
        }
      }
    });

    //自適應定位
    lay(window).on('resize', function(){
      if(!that.elem || !lay(ELEM)[0]){
        return false;
      }
      that.position();
    });

    options.elem[0].eventHandler = true;
  };


  //核心接口
  laydate.render = function(options){
    var inst = new Class(options);
    return thisDate.call(inst);
  };

  //得到某月的最後一天
  laydate.getEndDate = function(month, year){
    var thisDate = new Date();
    //設置日期為下個月的第一天
    thisDate.setFullYear(
      year || thisDate.getFullYear()
      ,month || (thisDate.getMonth() + 1)
    ,1);
    //減去一天，得到當前月最後一天
    return new Date(thisDate.getTime() - 1000*60*60*24).getDate();
  };

  //暴露lay
  window.lay = window.lay || lay;

  //加載方式
  isLayui ? (
    laydate.ready()
    ,layui.define(function(exports){ //layui加載
      laydate.path = layui.cache.dir;
      exports(MOD_NAME, laydate);
    })
  ) : (
    (typeof define === 'function' && define.amd) ? define(function(){ //requirejs加載
      return laydate;
    }) : function(){ //普通script標籤加載
      laydate.ready();
      window.laydate = laydate
    }()
  );

}();