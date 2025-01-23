/** laydate 日期與時間控件 | MIT Licensed */
// @ts-expect-error
;!function(window, document){ // gulp build: laydate-header
  "use strict";

  var isLayui = window.layui && layui.define;
  var ready = {
    getPath: window.lay && lay.getPath ? lay.getPath : '',

    // 載入 CSS 依賴
    link: function (href, fn, cssname) {
      // 未設置路徑，則不主動加載 css
      if (!laydate.path) return;

      // 加載 css
      if (window.lay && lay.layui) {
        lay.layui.link(laydate.path + href, fn, cssname);
      }
    }
  };

  // 識別預先可能定義的指定全局對象
  var GLOBAL = window.LAYUI_GLOBAL || {};

  // 模塊名
  var MOD_NAME = 'laydate';
  var MOD_ID = 'lay-' + MOD_NAME + '-id'; // 已渲染過的索引標記名

  // 外部調用
  var laydate = {
    v: '5.6.0', // layDate 版本號
    config: {
      weekStart: 0 // 默認週日一週的開始
    }, // 全局配置項
    index: window.laydate && window.laydate.v ? 100000 : 0,
    path: GLOBAL.laydate_dir || ready.getPath,

    // 設置全局項
    set: function (options) {
      var that = this;
      that.config = lay.extend({}, that.config, options);
      return that;
    },

    // 主體 CSS 等待事件
    ready: function (callback) {
      var cssname = 'laydate';
      var ver = '';
      var path = (isLayui ? 'modules/' : '') + 'laydate.css?v=' + laydate.v + ver;

      isLayui ? (
        layui['layui.all'] ?
          (typeof callback === 'function' && callback()) :
        layui.addcss(path, callback, cssname)
      ) : ready.link(path, callback, cssname);

      return this;
    }
  };

  // 操作當前實例
  var thisModule = function(){
    var that = this;
    var options = that.config;
    var id = options.id;

    thisModule.that[id] = that; // 記錄當前實例對象

    return that.inst = {
      // 提示框
      hint: function(content){
        that.hint.call(that, content);
      },
      // 重載實例
      reload: function(options){
        that.reload.call(that, options);
      },
      config: that.config
    };
  };

  // 字符常量
  var ELEM = '.layui-laydate';
  var THIS = 'layui-this';
  var SHOW = 'layui-show';
  var HIDE = 'layui-hide';
  var DISABLED = 'laydate-disabled';
  var LIMIT_YEAR = [100, 200000];

  var ELEM_STATIC = 'layui-laydate-static';
  var ELEM_LIST = 'layui-laydate-list';
  var ELEM_SELECTED = 'laydate-selected';
  var ELEM_HINT = 'layui-laydate-hint';
  var ELEM_DAY_NOW = 'laydate-day-now';
  var ELEM_PREV = 'laydate-day-prev';
  var ELEM_NEXT = 'laydate-day-next';
  var ELEM_FOOTER = 'layui-laydate-footer';
  var ELEM_SHORTCUT = 'layui-laydate-shortcut';
  var ELEM_NOW = '.laydate-btns-now'
  var ELEM_CONFIRM = '.laydate-btns-confirm';
  var ELEM_TIME_TEXT = 'laydate-time-text';
  var ELEM_TIME_BTN = 'laydate-btns-time';
  var ELEM_PREVIEW = 'layui-laydate-preview';
  var ELEM_MAIN = 'layui-laydate-main';
  var ELEM_SHADE = 'layui-laydate-shade';

  // 組件構造器
  var Class = function(options){
    var that = this;
    that.index = ++laydate.index;
    that.config = lay.extend({}, that.config, laydate.config, options);

    // 若 elem 非唯一，則拆分為多個實例
    var elem = lay(options.elem || that.config.elem);
    if(elem.length > 1){
      lay.each(elem, function(){
        laydate.render(lay.extend({}, that.config, {
          elem: this
        }));
      });
      return that;
    }

    // 初始化屬性
    options = lay.extend(that.config, lay.options(elem[0])); // 繼承節點上的屬性

    // 若重複執行 render，則視為 reload 處理
    if(elem[0] && elem.attr(MOD_ID)){
      var newThat = thisModule.getThis(elem.attr(MOD_ID));
      if(!newThat) return;
      return newThat.reload(options);
    }

    // 初始化 id 屬性 - 優先取 options > 元素 id > 自增索引
    options.id = 'id' in options ? options.id : (
      elem.attr('id') || that.index
    );

    // 自增索引
    options.index = that.index;

    // 初始化
    laydate.ready(function(){
      that.init();
    });
  };

  // 日期格式字符
  var dateType = 'yyyy|y|MM|M|dd|d|HH|H|mm|m|ss|s';

  // 將日期格式字符轉換為數組
  thisModule.formatArr = function(format){
    return (format || '').match(new RegExp(dateType + '|.', 'g')) || []
  };

  /*
    組件操作
  */

  // 是否閏年
  Class.isLeapYear = function(year){
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  };

  // 默認配置
  Class.prototype.config = {
    type: 'date' //控件類型，支持：year/month/date/time/datetime
    ,range: false //是否開啟範圍選擇，即雙控件
    ,format: 'yyyy-MM-dd' //默認日期格式
    ,value: null //默認日期，支持傳入new Date()，或者符合format參數設定的日期格式字符
    ,isInitValue: true //用於控制是否自動向元素填充初始值（需配合 value 參數使用）
    ,min: '1900-1-1' //有效最小日期，年月日必須用“-”分割，時分秒必須用“:”分割。注意：它並不是遵循 format 設定的格式。
    ,max: '2099-12-31' //有效最大日期，同上
    ,trigger: 'click' //呼出控件的事件
    ,show: false //是否直接顯示，如果設置 true，則默認直接顯示控件
    ,showBottom: true //是否顯示底部欄
    ,isPreview: true //是否顯示值預覽
    ,btns: ['clear', 'now', 'confirm'] //右下角顯示的按鈕，會按照數組順序排列
    ,lang: 'cn' //語言，只支持cn/en，即中文和英文
    ,theme: 'default' //主題
    ,position: null //控件定位方式定位, 默認absolute，支持：fixed/absolute/static
    ,calendar: false //是否開啟公曆重要節日，僅支持中文版
    ,mark: {} //日期備註，如重要事件或活動標記
    ,holidays: null // 標註法定節假日或補假上班
    ,zIndex: null //控件層疊順序
    ,done: null //控件選擇完畢後的回調，點擊清空/現在/確定也均會觸發
    ,change: null //日期時間改變後的回調
    ,autoConfirm: true //是否自動確認（日期|年份|月份選擇器非range下是否自動確認）
    ,shade: 0
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
        ,timeout: '結束時間不能早於開始時間<br>請重新選擇'
        ,invalidDate: '不在有效日期或時間範圍內'
        ,formatError: ['日期格式不合法<br>必須遵循下述格式：<br>', '<br>已為你重置']
        ,preview: '當前選中的結果'
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
        ,timeout: 'End time cannot be less than start Time<br>Please re-select'
        ,invalidDate: 'Invalid date'
        ,formatError: ['The date format error<br>Must be followed：<br>', '<br>It has been reset']
        ,preview: 'The selected result'
      }
    };
    return text[options.lang] || text['cn'];
  };

  Class.prototype.markerOfChineseFestivals = {
    '0-1-1': '元旦',
    '0-2-14': '情人' ,
    '0-3-8': '婦女',
    '0-3-12': '植樹',
    '0-4-1': '愚人',
    '0-5-1': '勞動',
    '0-5-4': '青年',
    '0-6-1': '兒童',
    '0-9-10': '教師',
    '0-10-1': '國慶',
    '0-12-25': '聖誕'
  }

  // 重載實例
  Class.prototype.reload = function(options){
    var that = this;
    that.config = lay.extend({}, that.config, options);
    that.init();
  };

  //初始準備
  Class.prototype.init = function(){
    var that = this
    ,options = that.config
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

    layui.type(options.theme) !== 'array' && (options.theme = [options.theme]);
    // 設置了全面版模式
    if (options.fullPanel) {
      if (options.type !== 'datetime' || options.range) {
        // 目前只支持datetime的全面版
        delete options.fullPanel;
      }
    }

    //日期範圍分隔符
    that.rangeStr =  options.range ? (
      typeof options.range === 'string' ? options.range : '-'
    ) : '';

    //日期範圍的日曆面板是否聯動
    that.rangeLinked = !!(options.range && options.rangeLinked && (options.type === 'date' || options.type === 'datetime'))

    //切換日曆聯動方式
    that.autoCalendarModel = function () {
      var state = that.rangeLinked;
      that.rangeLinked = (options.range && (options.type === 'date' || options.type === 'datetime'))
        && ((!that.startDate || !that.endDate) || (that.startDate && that.endDate && that.startDate.year === that.endDate.year && that.startDate.month === that.endDate.month));
      lay(that.elem)[that.rangeLinked ? 'addClass' : 'removeClass']('layui-laydate-linkage');
      return that.rangeLinked != state; // 返回發生了變化
    };

    //是否自動切換
    that.autoCalendarModel.auto = that.rangeLinked && options.rangeLinked === 'auto';

    //若 range 參數為數組，則表示為開始日期和結束日期的 input 對象
    if(layui.type(options.range) === 'array'){
      that.rangeElem = [
        lay(options.range[0]),
        lay(options.range[1])
      ];
    }

    //若 type 設置非法，則初始化為 date 類型
    if(!format[options.type]){
      window.console && console.error && console.error('laydate type error:\''+ options.type + '\' is not supported')
      options.type = 'date';
    }

    //根據不同 type，初始化默認 format
    if(options.format === format.date){
      options.format = format[options.type] || format.date;
    }

    //將日期格式轉化成數組
    that.format = thisModule.formatArr(options.format);

    // 設置了一週的開始是周幾，此處做一個控制
    if (options.weekStart) {
      if (!/^[0-6]$/.test(options.weekStart)) {
        var lang = that.lang();
        options.weekStart = lang.weeks.indexOf(options.weekStart);
        if (options.weekStart === -1) options.weekStart = 0;
      }
    }

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
    //驗證日期格式正則
    that.EXP_IF_ONE = new RegExp('^'+ that.EXP_IF +'$'); //驗證單個日期格式
    that.EXP_IF = new RegExp('^'+ (
      options.range ?
        that.EXP_IF + '\\s\\'+ that.rangeStr + '\\s' + that.EXP_IF
      : that.EXP_IF
    ) +'$');
    that.EXP_SPLIT = new RegExp('^'+ that.EXP_SPLIT +'$', '');

    //如果不是 input|textarea 元素，則默認採用 click 事件
    if(!that.isInput(options.elem[0])){
      if(options.trigger === 'focus'){
        options.trigger = 'click';
      }
    }

    // 設置唯一 KEY
    options.elem.attr('lay-key', that.index);
    options.eventElem.attr('lay-key', that.index);
    options.elem.attr(MOD_ID, options.id); // 渲染過的標記


    //獲取限制內日期
    lay.each(['min', 'max'], function(i, item){
      var ymd = [];
      var hms = [];
      if(typeof options[item] === 'number'){ //如果為數字
        var day = options[item]
        ,tDate = new Date()
        ,time = that.newDate({ //今天的最大毫秒數
          year: tDate.getFullYear()
          ,month: tDate.getMonth()
          ,date: tDate.getDate()
          ,hours: i ? 23 : 0
          ,minutes: i ? 59 : 0
          ,seconds: i ? 59 : 0
        }).getTime()
        ,STAMP = 86400000 //代表一天的毫秒數
        ,thisDate = new Date(
          day ? (
            day < STAMP ? time + day*STAMP : day //如果數字小於一天的毫秒數，則數字為天數，否則為毫秒數
          ) : time
        );
        ymd = [thisDate.getFullYear(), thisDate.getMonth() + 1, thisDate.getDate()];
        hms = [thisDate.getHours(), thisDate.getMinutes(), thisDate.getSeconds()];
      } else if(typeof options[item] === 'string') {
        ymd = (options[item].match(/\d+-\d+-\d+/) || [''])[0].split('-');
        hms = (options[item].match(/\d+:\d+:\d+/) || [''])[0].split(':');
      } else if(typeof options[item] === 'object'){
        return options[item];
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

    // 重定義 input 元素的 get set
    if(typeof options.formatToDisplay === 'function'){
      if(that.isInput(options.elem[0])){
        that.formatToDisplay(options.elem[0], options.formatToDisplay);
      } else {
        var rangeElem = that.rangeElem;
        if(rangeElem){
          that.formatToDisplay(rangeElem[0][0], options.formatToDisplay);
          that.formatToDisplay(rangeElem[1][0], options.formatToDisplay);
        }
      }
    }

    //默認賦值
    if(options.value && options.isInitValue){
      if(layui.type(options.value) === 'date'){
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
      ,"class": [
        'layui-laydate'
        ,options.range ? ' layui-laydate-range' : ''
        ,that.rangeLinked ? ' layui-laydate-linkage' : ''
        ,isStatic ? (' '+ ELEM_STATIC) : ''
        ,options.fullPanel ? ' laydate-theme-fullpanel' : '' // 全面版
        // ,options.theme && options.theme !== 'default' && !/^#/.test(options.theme) ? (' laydate-theme-' + options.theme) : ''
        ,(function () {
          var themeStr = '';
          lay.each(options.theme, function (index, theme) {
            if (theme !== 'default' && !/^#/.test(theme)) {
              themeStr += ' laydate-theme-' + theme;
            }
          })
          return themeStr;
        })()
      ].join('')
    })

    //主區域
    ,elemMain = that.elemMain = []
    ,elemHeader = that.elemHeader = []
    ,elemCont = that.elemCont = []
    ,elemTable = that.table = []

    //底部區域
    ,divFooter = that.footer = lay.elem('div', {
      "class": ELEM_FOOTER
    })

    //快捷欄
    ,divShortcut = that.shortcut = lay.elem('ul', {
      "class": ELEM_SHORTCUT
    });

    if(options.zIndex) elem.style.zIndex = options.zIndex;

    //單雙日曆區域
    lay.each(new Array(2), function(i){
      if(!options.range && i > 0){
        return true;
      }

      //頭部區域
      var divHeader = lay.elem('div', {
        "class": 'layui-laydate-header'
      })

      //左右切換
      ,headerChild = [function(){ //上一年
        var elem = lay.elem('i', {
          "class": 'layui-icon laydate-icon laydate-prev-y'
        });
        elem.innerHTML = '&#xe65a;';
        return elem;
      }(), function(){ //上一月
        var elem = lay.elem('i', {
          "class": 'layui-icon laydate-icon laydate-prev-m'
        });
        elem.innerHTML = '&#xe603;';
        return elem;
      }(), function(){ //年月選擇
        var elem = lay.elem('div', {
          "class": 'laydate-set-ym'
        });
        elem.appendChild(lay.elem('span'));
        elem.appendChild(lay.elem('span'));
        return elem;
      }(), function(){ //下一月
        var elem = lay.elem('i', {
          "class": 'layui-icon laydate-icon laydate-next-m'
        });
        elem.innerHTML = '&#xe602;';
        return elem;
      }(), function(){ //下一年
        var elem = lay.elem('i', {
          "class": 'layui-icon laydate-icon laydate-next-y'
        });
        elem.innerHTML = '&#xe65b;';
        return elem;
      }()]

      //日曆內容區域
      ,divContent = lay.elem('div', {
        "class": 'layui-laydate-content'
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
            th.innerHTML = lang.weeks[(j + options.weekStart) % 7];
            theadTr.appendChild(th);
          }
          tr.insertCell(j);
        });
      });
      table.insertBefore(thead, table.children[0]); //表頭
      divContent.appendChild(table);

      elemMain[i] = lay.elem('div', {
        "class": ELEM_MAIN + ' laydate-main-list-'+ i
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
        html.push('<span lay-type="datetime" class="'+ ELEM_TIME_BTN +'">'+ lang.timeTips +'</span>');
      }
      if(!(!options.range && options.type === 'datetime') || options.fullPanel){
        html.push('<span class="'+ ELEM_PREVIEW +'" title="'+ lang.preview +'"></span>')
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

    // 生成快捷鍵欄
    if (options.shortcuts) {
      elem.appendChild(divShortcut);
      lay(divShortcut).html(function () {
        var shortcutBtns = [];
        lay.each(options.shortcuts, function (i, item) {
          shortcutBtns.push('<li data-index="' + i + '">'+item.text+'</li>')
        })
        return shortcutBtns.join('');
      }()).find('li').on('click', function (event) {
        var btnSetting = options.shortcuts[this.dataset['index']] || {};
        var value = (typeof btnSetting.value === 'function'
          ? btnSetting.value()
          : btnSetting.value) || [];
        if (!layui.isArray(value)) {
          value = [value];
        }
        var type = options.type;
        lay.each(value, function (i, item) {
          var dateTime = [options.dateTime, that.endDate][i];
          if (type === 'time' && layui.type(item) !== 'date') {
            if (that.EXP_IF.test(item)) {
              item = (item.match(that.EXP_SPLIT) || []).slice(1);
              lay.extend(dateTime, {hours: item[0] | 0, minutes: item[2] | 0, seconds: item[4] | 0})
            }
          } else {
            lay.extend(dateTime, that.systemDate(layui.type(item) === 'date' ? item : new Date(item)))
          }

          if (type === 'time' || type === 'datetime') {
            that[['startTime', 'endTime'][i]] = {
              hours: dateTime.hours,
              minutes: dateTime.minutes,
              seconds: dateTime.seconds,
            }
          }
          if (i === 0) { // 第一個值作為startDate
            that.startDate = lay.extend({}, dateTime);
          } else {
            that.endState = true;
          }
          if (type === 'year' || type === 'month' || type === 'time') {
            that.listYM[i] = [dateTime.year, dateTime.month + 1];
          } else if (i) {
            that.autoCalendarModel.auto && that.autoCalendarModel();
          }
        });
        that.checkDate('limit').calendar(null, null, 'init');

        var timeBtn = lay(that.footer).find('.'+ ELEM_TIME_BTN).removeClass(DISABLED);
        timeBtn && timeBtn.attr('lay-type') === 'date' && timeBtn[0].click();
        that.done(null, 'change');

        lay(this).addClass(THIS);

        // 自動確認
        if(options.position !== 'static'){
          that.setValue(that.parse()).done().remove();
        }
        /*
        if (options.position !== 'static' && !options.range && options.autoConfirm) {
          if (type === 'date') {
            that.choose(lay(elem).find('td.layui-this'))
          } else if (type === 'year' || type === 'month') {
            if(lay(elemMain[0]).find('.' + ELEM_MAIN + ' li.' + THIS + ':not(.laydate-disabled)')[0]) {
              that.setValue(that.parse()).done().remove();
            }
          }
        }
        */
      })
    }

    //插入到主區域
    lay.each(elemMain, function(i, main){
      elem.appendChild(main);
    });
    options.showBottom && elem.appendChild(divFooter);

    // 生成自定義主題
    var style = lay.elem('style');
    var styleText = [];
    var colorTheme;
    var isPrimaryColor = true;
    lay.each(options.theme, function (index, theme) {
      // 主色
      if(isPrimaryColor && /^#/.test(theme)){
        colorTheme = true;
        isPrimaryColor = false;
        styleText.push([
          '#{{id}} .layui-laydate-header{background-color:{{theme}};}',
          '#{{id}} li.layui-this,#{{id}} td.layui-this>div{background-color:{{theme}} !important;}',
          options.theme.indexOf('circle') !== -1 ? '' : '#{{id}} .layui-this{background-color:{{theme}} !important;}',
          '#{{id}} .laydate-day-now{color:{{theme}} !important;}',
          '#{{id}} .laydate-day-now:after{border-color:{{theme}} !important;}'
        ].join('').replace(/{{id}}/g, that.elemID).replace(/{{theme}}/g, theme));
        return;
      }
      // 第二個自定義顏色作為輔色
      if(!isPrimaryColor && /^#/.test(theme)){
        styleText.push([
          '#{{id}} .laydate-selected>div{background-color:{{theme}} !important;}',
          '#{{id}} .laydate-selected:hover>div{background-color:{{theme}} !important;}'
        ].join('').replace(/{{id}}/g, that.elemID).replace(/{{theme}}/g, theme));
      }
    });
    //快捷欄樣式
    if (options.shortcuts && options.range) {
      styleText.push('#{{id}}.layui-laydate-range{width: 628px;}'.replace(/{{id}}/g, that.elemID))
    }
    if (styleText.length) {
      styleText = styleText.join('');
      if('styleSheet' in style){
        style.setAttribute('type', 'text/css');
        style.styleSheet.cssText = styleText;
      } else {
        style.innerHTML = styleText;
      }

      colorTheme && lay(elem).addClass('laydate-theme-molv');
      elem.appendChild(style);
    }

    //移除上一個控件
    that.remove(Class.thisElemDate);

    //記錄當前執行的實例索引
    laydate.thisId = options.id;

    //如果是靜態定位，則插入到指定的容器中，否則，插入到body
    isStatic ? options.elem.append(elem) : (
      document.body.appendChild(elem)
      ,that.position() //定位
    );

    var shade = options.shade ? ('<div class="'+ ELEM_SHADE +'" style="'+ ('z-index:'+ (parseInt(layui.getStyle(elem, 'z-index'))-1) +'; background-color: ' + (options.shade[1] || '#000') + '; opacity: ' + (options.shade[0] || options.shade)) +'"></div>') : '';
    elem.insertAdjacentHTML('beforebegin', shade);

    that.checkDate().calendar(null, 0, 'init'); //初始校驗
    that.changeEvent(); //日期切換

    Class.thisElemDate = that.elemID;

    that.renderAdditional()
    typeof options.ready === 'function' && options.ready(lay.extend({}, options.dateTime, {
      month: options.dateTime.month + 1
    }));

    that.preview();
  };

  //控件移除
  Class.prototype.remove = function(prev){
    var that = this
    ,options = that.config
    ,elem = lay('#'+ (prev || that.elemID));
    if(!elem[0]) return that;

    if(!elem.hasClass(ELEM_STATIC)){
      that.checkDate(function(){
        elem.remove();
        //delete options.dateTime;
        delete that.startDate;
        delete that.endDate;
        delete that.endState;
        delete that.startTime;
        delete that.endTime;
        delete laydate.thisId;
        typeof options.close === 'function' && options.close(that);
      });
    }
    lay('.' + ELEM_SHADE).remove();
    return that;
  };

  //定位算法
  Class.prototype.position = function(){
    var that = this
    ,options = that.config;
    lay.position(options.elem[0], that.elem, {
      position: options.position
    });
    return that;
  };

  // 提示
  Class.prototype.hint = function(opts){
    var that = this;
    var options = that.config;
    var div = lay.elem('div', {
      "class": ELEM_HINT
    });

    if(!that.elem) return;

    // 兼容舊版參數
    if(typeof opts === 'object'){
      opts = opts || {};
    } else {
      opts = {
        content: opts
      }
    }

    div.innerHTML = opts.content || '';
    lay(that.elem).find('.'+ ELEM_HINT).remove();
    that.elem.appendChild(div);

    clearTimeout(that.hinTimer);
    that.hinTimer = setTimeout(function(){
      lay(that.elem).find('.'+ ELEM_HINT).remove();
    }, 'ms' in opts ? opts.ms : 3000);
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

  //系統日期
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
    ,lang = that.lang()
    ,dateTime = options.dateTime = options.dateTime || that.systemDate()
    ,thisMaxDate, error

    ,elem = options.elem[0]
    ,valType = that.isInput(elem) ? 'val' : 'html'
    ,value = function(){
      //如果傳入了開始和結束日期的 input 對象，則將其拼接為日期範圍字符
      if(that.rangeElem){
        var vals = [that.rangeElem[0].val(), that.rangeElem[1].val()];

        if(vals[0] && vals[1]){
          return vals.join(' ' + that.rangeStr + ' ');
        }
      }
      return that.isInput(elem)
        ? elem.value
      : (options.position === 'static' ? '' : lay(elem).attr('lay-date'));
    }()

    //校驗日期有效數字
    ,checkValid = function(dateTime){
      if (!dateTime) {
        return;
      }
      if(dateTime.year > LIMIT_YEAR[1]) dateTime.year = LIMIT_YEAR[1], error = true; //不能超過20萬年
      if(dateTime.month > 11) dateTime.month = 11, error = true;
      if(dateTime.seconds > 59) dateTime.seconds = 0, dateTime.minutes++, error = true;
      if(dateTime.minutes > 59) dateTime.minutes = 0, dateTime.hours++, error = true;
      if(dateTime.hours > 23) dateTime.hours = 0, error = true;

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
          if (thisv < 0) thisv = 0, error = true;
          if (thisv > 23) thisv = 23, error = true;
          dateTime.hours = thisv;
          options.range && (that[startEnd[index]].hours = thisv);
        } else if(/mm|m/.test(item)){ //分
          if (thisv < 0) thisv = 0, error = true;
          if (thisv > 59) thisv = 59, error = true;
          dateTime.minutes = thisv;
          options.range && (that[startEnd[index]].minutes = thisv);
        } else if(/ss|s/.test(item)){ //秒
          if (thisv < 0) thisv = 0, error = true;
          if (thisv > 59) thisv = 59, error = true;
          dateTime.seconds = thisv;
          options.range && (that[startEnd[index]].seconds = thisv);
        }
      });
      checkValid(dateTime);
    };

    if(fn === 'limit') {
      if (options.range) {
        checkValid(that.rangeLinked ? that.startDate : dateTime); // 校驗開始時間
        that.endDate && checkValid(that.endDate); // 校驗結束時間
      } else {
        checkValid(dateTime);
      }
      return that;
    }

    value = value || options.value;
    if(typeof value === 'string'){
      value = value.replace(/\s+/g, ' ').replace(/^\s|\s$/g, '');
    }

    //如果開啟範圍，則計算結束日期
    var getEndDate = function(){
      if(options.range){
        that.endDate = that.endDate || lay.extend({}, options.dateTime, function(){
          var obj = {}
          ,dateTime = options.dateTime
          ,EYM = that.getAsYM(dateTime.year, dateTime.month);

          //初始右側面板的年月
          if(options.type === 'year'){
            obj.year = dateTime.year + 1;
          } else if(options.type !== 'time'){
            obj.year = EYM[0];
            obj.month = EYM[1];
          }

          //初始右側面板的時間
          if(options.type === 'datetime' || options.type === 'time'){
            obj.hours = 23;
            obj.minutes = obj.seconds = 59;
          }

          return obj;
        }());
      }
    };
    getEndDate();

    if(typeof value === 'string' && value){
      if(that.EXP_IF.test(value)){ //校驗日期格式
        if(options.range){
          value = value.split(' '+ that.rangeStr +' ');
          lay.each([options.dateTime, that.endDate], function(i, item){
            initDate(item, value[i], i);
          });
        } else {
          initDate(dateTime, value);
        }
      } else {
        //格式不合法
        that.hint(lang.formatError[0] + (
          options.range ? (options.format + ' '+ that.rangeStr +' ' + options.format) : options.format
        ) + lang.formatError[1]);
        error = true;
      }
    } else if(value && layui.type(value) === 'date'){ //若值為日期對象
      options.dateTime = that.systemDate(value);
    } else {
      //重置開始日期
      options.dateTime = that.systemDate();
      delete that.startTime;

      //重置結束日期
      delete that.endDate; //刪除原有的結束日期
      getEndDate(); //並重新獲得新的結束日期
      delete that.endTime;
    }

    //從日期範圍表單中獲取初始值
    (function(){
      if(that.rangeElem){
        var vals = [that.rangeElem[0].val(), that.rangeElem[1].val()]
        ,arrDate = [options.dateTime, that.endDate];
        lay.each(vals, function(_i, _v){
          if(that.EXP_IF_ONE.test(_v)){ //校驗日期格式
            initDate(arrDate[_i], _v, _i);
          }
        });
      }
    })();

    // 校驗日期有效數字
    checkValid(dateTime);
    if(options.range) checkValid(that.endDate);

    // 如果初始值格式錯誤，則糾正初始值
    if(error && value){
      that.setValue(
        options.range ? (that.endDate ? that.parse() : '') : that.parse()
      );
    }

    //如果當前日期不在設定的最大小日期區間，則自動糾正在可選區域
    //校驗主面板是否在可選日期區間
    var minMaxError;
    if(that.getDateTime(dateTime) > that.getDateTime(options.max)){ //若超出最大日期
      dateTime = options.dateTime = lay.extend({}, options.max);
      minMaxError = true;
    } else if(that.getDateTime(dateTime) < that.getDateTime(options.min)){ //若少於最小日期
      dateTime = options.dateTime = lay.extend({}, options.min);
      minMaxError = true;
    }

    //校驗右側面板是否在可選日期區間
    if(options.range){
      if(that.getDateTime(that.endDate) < that.getDateTime(options.min) || that.getDateTime(that.endDate) > that.getDateTime(options.max)){
        that.endDate = lay.extend({}, options.max);
        minMaxError = true;
      }
      // 有時間範圍的情況下初始化startTime和endTime
      that.startTime = {
        hours: options.dateTime.hours,
        minutes: options.dateTime.minutes,
        seconds: options.dateTime.seconds,
      }
      that.endTime = {
        hours: that.endDate.hours,
        minutes: that.endDate.minutes,
        seconds: that.endDate.seconds,
      }
      // 如果是年月範圍，將對應的日期統一成當月的1日進行比較，避免出現同一個月但是開始日期大於結束日期的情況
      if (options.type === 'month') {
        options.dateTime.date = 1;
        that.endDate.date = 1;
      }
    }

    // 初始值不在最大最小範圍內
    if(minMaxError && value){
      that.setValue(that.parse());
      that.hint('value ' + lang.invalidDate + lang.formatError[1]);
    }

    // 初始賦值 startDate,endState
    that.startDate = that.startDate || value && lay.extend({}, options.dateTime); // 有默認值才初始化startDate
    that.autoCalendarModel.auto && that.autoCalendarModel();
    that.endState = !options.range || !that.rangeLinked || !!(that.startDate && that.endDate); // 初始化選中範圍狀態

    fn && fn();
    return that;
  };

  /**
   * 渲染備註
   * @param {JQuery} tdElem td 元素
   * @param {[number, number, number]} YMD 年月日
   * @param {object | string} markers 備註信息
   */
  Class.prototype.markRender = function(tdElem, YMD, markers){
    var markText;

    if(typeof markers === 'object'){
      lay.each(markers || {}, function(key, title){
        var keys = key.split('-');
        if((keys[0] == YMD[0] || keys[0] == 0) //每年的每月
        && (keys[1] == YMD[1] || keys[1] == 0) //每月的每日
        && keys[2] == YMD[2]){ //特定日
          markText = title || YMD[2];
        }
      });
    }else if(typeof markers === 'string'){
      markText = markers ||  YMD[2];
    }

    markText && tdElem.find('div').html('<span class="laydate-day-mark">'+ markText +'</span>');
  }

  /**
   * 公曆重要日期與自定義備註
   * @param {JQuery} td
   * @param {[number, number, number]} YMD
   * @returns Class
   */
  Class.prototype.mark = function(td, YMD){
    var that = this;
    var options = that.config;

    var render = function(markers){
      that.markRender(td, YMD, markers);
    }

    if(options.calendar && options.lang === 'cn'){
      render(that.markerOfChineseFestivals);
    }

    if(typeof options.mark === 'function'){
      options.mark({year: YMD[0], month: YMD[1], date: YMD[2]}, render);
    }else if(typeof options.mark === 'object'){
      render(options.mark);
    }

    return that;
  };

  /**
   * 渲染法定節假日或補假上班標記
   * @param {JQuery} tdElem td 元素
   * @param {[number, number, number]} YMD 年月日
   * @param {[Array<string>, Array<string>] | string} markers 標記信息
   */
  Class.prototype.holidaysRender = function(tdElem, YMD, markers){
    var type = ['holidays', 'workdays'];

    var isEquals = function(ymdStr1, ymdStr2){
      var ymd1 = ymdStr1.split('-');
      var ymd2 = ymdStr2.split('-');

      lay.each(ymd1, function(i,v){
        ymd1[i] = parseInt(v, 10);
      })
      lay.each(ymd2, function(i,v){
        ymd2[i] = parseInt(v, 10);
      })

      return ymd1.join('-') === ymd2.join('-');
    }

    var insertHtml = function(el, type, text){
      el.find('div').html([
        '<span',
        ' class="laydate-day-holidays"',
        ' type="'+ type +'"',
        '>',
          text,
        '</span>'
      ].join(''));
    }

    if(layui.type(markers) === 'array'){
      lay.each(markers, function(idx, item) {
        lay.each(item, function(i, dayStr) {
          if(isEquals(dayStr, tdElem.attr('lay-ymd'))){
            insertHtml(tdElem, type[idx], YMD[2])
          }
        });
      });
    }else if(typeof markers === 'string'){
      if(type.indexOf(markers) !== -1){
        insertHtml(tdElem, markers, YMD[2])
      }
    }
  }

  /**
   * 標註法定節假日或補假上班
   * @param {JQuery} td
   * @param {[number, number, number]} YMD
   * @returns Class
   */
  Class.prototype.holidays = function(td, YMD) {
    var that = this;
    var options = that.config;

    var render = function(markers){
      that.holidaysRender(td, YMD, markers);
    }

    if(typeof options.holidays === 'function'){
      options.holidays({year: YMD[0], month: YMD[1], date: YMD[2]}, render);
    }else if(layui.type(options.holidays) === 'array'){
      render(options.holidays);
    }

    return that;
  };

  /**
   * 自定義單元格
   * @param {HTMLElement|Array<HTMLElement>} el - 單元格元素
   * @param {{year:number, month:number, date:number}} dateObj - 當前單元格對應的日期信息
   * @param {'year' | 'month' | 'date'} panelMode - 面板模式
   * @returns
   */
  Class.prototype.cellRender = function(el, dateObj, panelMode){
    var that = this;
    var options = that.config;

    if(typeof options.cellRender === 'function'){
      var render = function(content){
        if(typeof content === 'string'){
          lay(el).html(content);
        }else if(typeof content === 'object'){
          lay(el).html('').append(lay(content)[0]);
        }
      }
      options.cellRender(dateObj, render, {originElem: el, type: panelMode})
    }

    return that;
  }

  /**
   * 給定年份的開始日期
   * @param {Date} date
   */
  Class.prototype.startOfYear = function(date){
    var newDate = new Date(date);
    newDate.setFullYear(newDate.getFullYear(), 0, 1);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }

  /**
   * 給定年份的結束日期
   * @param {Date} date
   */
  Class.prototype.endOfYear = function(date){
    var newDate = new Date(date);
    var year = newDate.getFullYear();
    newDate.setFullYear(year + 1, 0, 0);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
  }

  /**
   * 給定月份的開始日期
   * @param {Date} date
   */
  Class.prototype.startOfMonth = function(date){
    var newDate =  new Date(date);
    newDate.setDate(1);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }

  /**
   * 給定月份的結束日期
   * @param {Date} date
   */
  Class.prototype.endOfMonth = function(date){
    var newDate = new Date(date);
    var month = newDate.getMonth();
    newDate.setFullYear(newDate.getFullYear(), month + 1, 0);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
  }

  /**
   * 將指定的天數添加到給定日期
   * @param {Date} date 要更改的日期
   * @param {number} amount 天數
   */
  Class.prototype.addDays = function(date, amount){
    var newDate = new Date(date);
    if(!amount) return newDate;
    newDate.setDate(newDate.getDate() + amount);
    return newDate;
  }

  /**
   * 不可選取的年或月。年或月中的所有日期都禁用時，才判定為不可選取。
   * @param {Date} date 要檢測的年或月
   * @param {'year' | 'month'} type 面板類型
   * @param {'start' | 'end'} position 面板位置
   */
  Class.prototype.isDisabledYearOrMonth = function(date, type, position){
    var that = this;
    var options = that.config;
    var millisecondsInDay = 24 * 60 * 60 * 1000;

    var startDay = type === 'year' ? that.startOfYear(date) : that.startOfMonth(date);
    var endDay = type === 'year' ? that.endOfYear(date) : that.endOfMonth(date);
    var numOfDays = Math.floor((endDay.getTime() - startDay.getTime()) / millisecondsInDay) + 1;
    var disabledCount = 0;

    for(var i = 0; i < numOfDays; i++){
      var day = that.addDays(startDay, i);
      if(options.disabledDate.call(options, day, position)){
        disabledCount++;
      }
    }

    return disabledCount === numOfDays;
  }

  /**
   * @typedef limitOptions
   * @prop {JQuery} [elem] - 檢測的元素, 例如面板中年月日時分秒元素，“現在”，“確認” 按鈕等
   * @prop {number} [index] - 元素集合中，當前檢測元素的索引，years:0,month:0,date:0-41,hms:0
   * @prop {['hours', 'minutes', 'seconds'] | ['hours', 'minutes'] | ['hours']} [time] - 是否比較時分秒
   * @prop {'year'|'month'|string} [type] - 面板類型?
   * @prop {0 | 1} [rangeType] - 面板索引, 0 表示 start, 1 表示 end
   * @prop {Partial<{year:number,month: number,date:number,hours:number,minutes:number,seconds:number}>} [date] - 檢測的日期時間對象
   * @prop {'date' | 'time' | 'datetime'} disabledType - 禁用類型，按鈕應使用 datetime
   */
  /**
   * 不可選取的日期
   * @param {number} date 當前檢測的日期的時間戳
   * @param {limitOptions} opts
   * @returns {boolean}
   */
  Class.prototype.isDisabledDate = function(date, opts){
    opts = opts || {};

    var that = this;
    var options = that.config;
    var position = options.range ? (opts.rangeType === 0 ? 'start' : 'end') : 'start';

    if(!options.disabledDate) return false;
    if(options.type === 'time') return false;
    if(!(opts.disabledType === 'date' || opts.disabledType === 'datetime')) return false;

    // 不需要時分秒
    var normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    return opts.type === 'year' || opts.type === 'month'
      ? that.isDisabledYearOrMonth(normalizedDate, opts.type, position)
      : options.disabledDate.call(options, normalizedDate, position);
  }

  /**
   * 不可選取的時間
   * @param {number} date 當前檢測的日期的時間戳
   * @param {limitOptions} opts
   * @returns {boolean}
   */
  Class.prototype.isDisabledTime = function(date, opts){
    opts = opts || {};

    var that = this;
    var options = that.config;
    var position = options.range ? (opts.rangeType === 0 ? 'start' : 'end') : 'start';

    if(!options.disabledTime) return false;
    if(!(options.type === "time" || options.type === "datetime")) return false;
    if(!(opts.disabledType === 'time' || opts.disabledType === 'datetime')) return false;

    var isDisabledItem = function(compareVal, rangeFn, rangeFnParam){
      return function(){
        return (typeof rangeFn === 'function' && rangeFn.apply(options, rangeFnParam) || []).indexOf(compareVal) !== -1;
      }
    }

    var dateObj = that.systemDate(new Date(date));
    var disabledTime = options.disabledTime.call(options, that.newDate(dateObj), position) || {};

    // 面板中的時分秒 HTML 元素需要分別檢測是否禁用
    // 按鈕檢測任意一項是否禁用即可
    return opts.disabledType === 'datetime'
      ? isDisabledItem(dateObj.hours, disabledTime.hours)()
          || isDisabledItem(dateObj.minutes, disabledTime.minutes, [dateObj.hours])()
          || isDisabledItem(dateObj.seconds, disabledTime.seconds, [dateObj.hours, dateObj.minutes])()
      : [isDisabledItem(dateObj.hours, disabledTime.hours),
          isDisabledItem(dateObj.minutes, disabledTime.minutes, [dateObj.hours]),
          isDisabledItem(dateObj.seconds, disabledTime.seconds, [dateObj.hours, dateObj.minutes])][opts.time.length - 1]();
  }

  /**
   * 不可選取的日期時間
   * @param {number} timestamp 當前檢測的日期的時間戳
   * @param {limitOptions} opts
   * @returns
   */
  Class.prototype.isDisabledDateTime = function(timestamp, opts){
    opts = opts || {};

    var that = this;
    var options = that.config;

    return that.isDisabledDate(timestamp, opts) || that.isDisabledTime(timestamp, opts);
  }


  /**
   * 無效日期範圍的標記
   * @param {limitOptions} opts
   *
   */
  Class.prototype.limit = function(opts){
    opts = opts || {};

    var that = this;
    var options = that.config;
    var timestamp = {}
    var dateTime = opts.index > (opts.time ? 0 : 41) ? that.endDate : options.dateTime;
    var isOut;

    lay.each({
      now: lay.extend({}, dateTime, opts.date || {})
      ,min: options.min
      ,max: options.max
    }, function(key, item){
      timestamp[key] = that.newDate(lay.extend({
        year: item.year
        ,month: opts.type === 'year' ? 0 : item.month // 年份的時候只比較年
        ,date: (opts.type === 'year' || opts.type === 'month') ? 1 : item.date // 年月只比較年月不與最大最小比日期
      }, function(){
        var hms = {};
        lay.each(opts.time, function(i, keys){
          hms[keys] = item[keys];
        });
        return hms;
      }())).getTime();  //time：是否比較時分秒
    });

    isOut = timestamp.now < timestamp.min || timestamp.now > timestamp.max || that.isDisabledDateTime(timestamp.now, opts);
    opts.elem && opts.elem[isOut ? 'addClass' : 'removeClass'](DISABLED);

    return isOut;
  };

  //當前日期對象
  Class.prototype.thisDateTime = function(index){
    var that = this
    ,options = that.config;
    return index ? that.endDate: options.dateTime;
  };

  //日曆表
  Class.prototype.calendar = function(value, index, type){
    index = index ? 1 : 0;
    var that = this
    ,options = that.config
    ,dateTime = value || that.thisDateTime(index)
    ,thisDate = new Date(), startWeek, prevMaxDate, thisMaxDate
    ,lang = that.lang()

    ,isAlone = options.type !== 'date' && options.type !== 'datetime'
    ,tds = lay(that.table[index]).find('td')
    ,elemYM = lay(that.elemHeader[index][2]).find('span');

    if(dateTime.year < LIMIT_YEAR[0]) dateTime.year = LIMIT_YEAR[0], that.hint(lang.invalidDate);
    if(dateTime.year > LIMIT_YEAR[1]) dateTime.year = LIMIT_YEAR[1], that.hint(lang.invalidDate);

    //記錄初始值
    if(!that.firstDate){
      that.firstDate = lay.extend({}, dateTime);
    }

    //計算當前月第一天的星期
    thisDate.setFullYear(dateTime.year, dateTime.month, 1);
    startWeek = (thisDate.getDay() + (7 - options.weekStart)) % 7;

    prevMaxDate = laydate.getEndDate(dateTime.month || 12, dateTime.year); //計算上個月的最後一天
    thisMaxDate = laydate.getEndDate(dateTime.month + 1, dateTime.year); //計算當前月的最後一天

    //賦值日
    lay.each(tds, function(index_, item){
      var YMD = [dateTime.year, dateTime.month], st;
      item = lay(item);
      item.removeAttr("class");
      if(index_ < startWeek){
        st = prevMaxDate - startWeek + index_;
        item.addClass('laydate-day-prev');
        YMD = that.getAsYM(dateTime.year, dateTime.month, 'sub');
      } else if(index_ >= startWeek && index_ < thisMaxDate + startWeek){
        st = index_ - startWeek;
        if (!that.rangeLinked) {
          st + 1 === dateTime.date && item.addClass(THIS);
        }
      } else {
        st = index_ - thisMaxDate - startWeek;
        item.addClass('laydate-day-next');
        YMD = that.getAsYM(dateTime.year, dateTime.month);
      }
      YMD[1]++;
      YMD[2] = st + 1;
      item.attr('lay-ymd', YMD.join('-')).html('<div>' + YMD[2] + '</div>');
      that.mark(item, YMD).holidays(item, YMD).limit({
        elem: item,
        date: {
          year: YMD[0],
          month: YMD[1] - 1,
          date: YMD[2]
        },
        index: index_,
        rangeType: index,
        disabledType: 'date' // 日面板，檢測當前日期是否禁用
      });
      that.cellRender(item, {year: YMD[0], month: YMD[1], date: YMD[2]}, 'date');
    });

    //同步頭部年月
    lay(elemYM[0]).attr('lay-ym', dateTime.year + '-' + (dateTime.month + 1));
    lay(elemYM[1]).attr('lay-ym', dateTime.year + '-' + (dateTime.month + 1));
    if(!that.panelYM) that.panelYM = {};
    that.panelYM[index] = {year: dateTime.year, month: dateTime.month};

    if(options.lang === 'cn'){
      lay(elemYM[0]).attr('lay-type', 'year').html(dateTime.year + ' 年')
      lay(elemYM[1]).attr('lay-type', 'month').html((dateTime.month + 1) + ' 月');
    } else {
      lay(elemYM[0]).attr('lay-type', 'month').html(lang.month[dateTime.month]);
      lay(elemYM[1]).attr('lay-type', 'year').html(dateTime.year);
    }

    //初始默認選擇器
    if(isAlone){ //年、月等獨立選擇器
      if(options.range){
        if(value || type !== 'init'){ // 判斷是否需要顯示年月時間列表
          that.listYM = [
            [(that.startDate || options.dateTime).year, (that.startDate || options.dateTime).month + 1]
            ,[that.endDate.year, that.endDate.month + 1]
          ];
          that.list(options.type, 0).list(options.type, 1);

          //同步按鈕可點狀態
          options.type === 'time' ? that.setBtnStatus('時間'
            ,lay.extend({}, that.systemDate(), that.startTime)
            ,lay.extend({}, that.systemDate(), that.endTime)
          ) : that.setBtnStatus(true);
        }
      } else {
        that.listYM = [[dateTime.year, dateTime.month + 1]];
        that.list(options.type, 0);
      }
    }

    //初始賦值雙日曆
    if(options.range && type === 'init'){
      //執行渲染第二個日曆
      if (that.rangeLinked) {
        var EYM = that.getAsYM(dateTime.year, dateTime.month, index ? 'sub' : null)
        that.calendar(lay.extend({}, dateTime, {
          year: EYM[0]
          ,month: EYM[1]
        }), 1 - index); // 渲染另外一個
      } else {
        that.calendar(null, 1 - index);
      }
    }

    // 通過檢測當前有效日期，來設定底部按鈕狀態
    if(!options.range){
      var timeParams = ['hours', 'minutes', 'seconds'];

      // 現在按鈕
      that.limit({
        elem: lay(that.footer).find(ELEM_NOW),
        date: that.systemDate(/^(datetime|time)$/.test(options.type) ? new Date() : null),
        index: 0,
        time: timeParams,
        disabledType: 'datetime' // 按鈕，檢測日期和時間
      });
      // 確認按鈕
      that.limit({
        elem: lay(that.footer).find(ELEM_CONFIRM),
        index: 0,
        time: timeParams,
        disabledType: 'datetime' // 按鈕，檢測日期和時間
      });
    }

    //同步按鈕可點狀態
    that.setBtnStatus();

    // 重置快捷欄選中狀態
    lay(that.shortcut).find('li.' + THIS).removeClass(THIS);

    //標記選擇範圍
    if(options.range && !isAlone && type !== 'init') that.stampRange();

    return that;
  };

  //生成年月時分秒列表
  Class.prototype.list = function(type, index){
    var that = this
    ,options = that.config
    ,dateTime = that.rangeLinked ? options.dateTime : [options.dateTime, that.endDate][index]
    ,lang = that.lang()
    ,isAlone = options.range && options.type !== 'date' && options.type !== 'datetime' //獨立範圍選擇器

    ,ul = lay.elem('ul', {
      "class": ELEM_LIST + ' ' + ({
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

    //生成年列表
    if(type === 'year'){
      var yearNum, startY = yearNum = listYM[0] - 7;
      if(startY < 1) startY = yearNum = 1;
      lay.each(new Array(15), function(i){
        var li = lay.elem('li', {
          'lay-ym': yearNum
        })
        ,ymd = {
          year: yearNum
          ,month: 0
          ,date: 1
        };

        yearNum == listYM[0] && lay(li).addClass(THIS);
        li.innerHTML = yearNum + text;
        ul.appendChild(li);

        /*
        if(yearNum < that.firstDate.year){
          ymd.month = options.min.month;
          ymd.date = options.min.date;
        } else if(yearNum >= that.firstDate.year){
          ymd.month = options.max.month;
          ymd.date = options.max.date;
        }
        */

        that.limit({
          elem: lay(li),
          date: ymd,
          index: index,
          type: type,
          rangeType: index,
          disabledType: 'date' // 年面板，檢測當前年份中的所有日期是否禁用
        });
        that.cellRender(li, {year: yearNum, month: 1, date: 1}, 'year');
        yearNum++;
      });

      lay(elemYM[isCN ? 0 : 1]).attr('lay-ym', (yearNum - 8) + '-' + listYM[1])
      .html((startY + text) + ' - ' + (yearNum - 1 + text));
    }

    //生成月列表
    else if(type === 'month'){
      lay.each(new Array(12), function(i){
        var li = lay.elem('li', {
          'lay-ym': i
        })
        ,ymd = {
          year: listYM[0]
          ,month: i
          ,date: 1
        };

        i + 1 == listYM[1] && lay(li).addClass(THIS);
        li.innerHTML = lang.month[i] + (isCN ? '月' : '');
        ul.appendChild(li);

        /*
        if(listYM[0] < that.firstDate.year){
          ymd.date = options.min.date;
        } else if(listYM[0] >= that.firstDate.year){
          ymd.date = options.max.date;
        }
        */

        that.limit({
          elem: lay(li),
          date: ymd,
          index: index,
          type: type,
          rangeType: index,
          disabledType: 'date' // 月面板，檢測當前月份中的所有日期是否禁用
        });
        that.cellRender(li, {year: listYM[0], month: i + 1, date: 1}, 'month');
      });

      lay(elemYM[isCN ? 0 : 1]).attr('lay-ym', listYM[0] + '-' + listYM[1])
      .html(listYM[0] + text);
    }

    //生成時間列表
    else if(type === 'time'){
      //檢測時分秒狀態是否在有效日期時間範圍內
      var setTimeStatus = function(){
        lay(ul).find('ol').each(function(i, ol){
          lay(ol).find('li').each(function(ii, li){
            that.limit({
              elem: lay(li),
              date: [{
                hours: ii
              }, {
                hours: that[startEnd].hours
                ,minutes: ii
              }, {
                hours: that[startEnd].hours
                ,minutes: that[startEnd].minutes
                ,seconds: ii
              }][i],
              index: index,
              rangeType: index,
              disabledType: 'time', // 時間面板，分別檢測時分秒列表是否禁用
              time: [
                ['hours'],
                ['hours', 'minutes'],
                ['hours', 'minutes', 'seconds']
              ][i]
            });
          });
        });
        if(!options.range){
          that.limit({
            elem: lay(that.footer).find(ELEM_CONFIRM),
            date: that[startEnd],
            index: 0,
            time: ['hours', 'minutes', 'seconds'],
            disabledType: 'datetime' // 確認按鈕，檢測時分秒列表任意一項是否禁用
          });
        }
      };

      var setTimeListVisibility = function(){
        var showHour = options.format.indexOf('H') !== -1;
        var showMinute = options.format.indexOf('m') !== -1;
        var showSecond = options.format.indexOf('s') !== -1;
        var liElem = ul.children;
        var hideCount = 0;

        lay.each([showHour, showMinute, showSecond], function(i, isShow){
          if(!isShow){
            liElem[i].className += ' layui-hide';
            hideCount++;
          }
        })
        ul.className += (' laydate-time-list-hide-' + hideCount);
      }

      //初始化時間對象
      if(options.range){
        if(!that[startEnd]){
          that[startEnd] = startEnd === 'startTime' ? dateTime : that.endDate;
        }
      } else {
        that[startEnd] = dateTime;
      }

      //生成時分秒
      lay.each([24, 60, 60], function(i, item){
        var li = lay.elem('li'), childUL = ['<p>'+ lang.time[i] +'</p><ol>'];
        lay.each(new Array(item), function(ii){
          childUL.push('<li'+ (that[startEnd][hms[i]] === ii ? ' class="'+ THIS +'"' : '') +'>'+ lay.digit(ii, 2) +'</li>');
        });
        li.innerHTML = childUL.join('') + '</ol>';
        ul.appendChild(li);
      });
      setTimeStatus();
      setTimeListVisibility();
    }

    //插入容器
    if(haveList) elemCont.removeChild(haveList);
    elemCont.appendChild(ul);

    //年月面板 - 選擇事件
    if(type === 'year' || type === 'month'){
      //顯示切換箭頭
      lay(that.elemMain[index]).addClass('laydate-ym-show');

      //選中
      lay(ul).find('li').on('click', function(){
        var ym = lay(this).attr('lay-ym') | 0;
        if(lay(this).hasClass(DISABLED)) return;
        if (that.rangeLinked) {
          lay.extend(dateTime, {
            year: type === 'year' ? ym : listYM[0]
            ,month: type === 'year' ? listYM[1] - 1 : ym
          });
        } else {
          dateTime[type] = ym;
        }

        //當為年選擇器或者年月選擇器
        var isYearOrMonth = ['year', 'month'].indexOf(options.type) !== -1;
        var isChangeMonth = type === 'year' && ['date', 'datetime'].indexOf(options.type) !== -1;
        if (isYearOrMonth || isChangeMonth) {
          lay(ul).find('.'+ THIS).removeClass(THIS);
          lay(this).addClass(THIS);

          //如果為年月選擇器，點擊了年列表，則切換到月選擇器
          if ((options.type === 'month' && type === 'year') || isChangeMonth) {
            that.listYM[index][0] = ym;
            isAlone && ((index ? that.endDate : dateTime).year = ym);
            that.list('month', index);
          }
        } else {
          that.checkDate('limit').calendar(dateTime, index, 'init'); // 重新渲染一下兩個面板
          that.closeList();
        }

        that.setBtnStatus(); //同步按鈕可點狀態

        //若為月選擇器，只有當選擇月份時才自動關閉；
        //若為年選擇器，選擇年份即自動關閉
        //且在範圍未開啟時
        if(!options.range && options.autoConfirm){
          if((options.type === 'month' && type === 'month') || (options.type === 'year' && type === 'year')){
            that.setValue(that.parse()).done().remove();
          }
        }

        (that.autoCalendarModel.auto && !that.rangeLinked) ? that.choose(lay(elemCont).find('td.layui-this'), index) : (that.endState && that.done(null, 'change'));
        lay(that.footer).find('.'+ ELEM_TIME_BTN).removeClass(DISABLED);
      });
    } else { //時間選擇面板 - 選擇事件
      var span = lay.elem('span', {
        "class": ELEM_TIME_TEXT
      })

      //滾動條定位
      ,scroll = function(){
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
      }
      ,haveSpan = lay(elemHeader[2]).find('.'+ ELEM_TIME_TEXT);

      scroll();
      span.innerHTML = options.range ? [lang.startTime,lang.endTime][index] : lang.timeTips;
      lay(that.elemMain[index]).addClass('laydate-time-show');

      if(haveSpan[0]) haveSpan.remove();
      elemHeader[2].appendChild(span);

      var olElem = lay(ul).find('ol');
      olElem.each(function(i){
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
          (that.endDate || options.type === 'time' || options.type === 'datetime') && that.done(null, 'change');

          //同步按鈕可點狀態
          that.setBtnStatus();
        });
      });

      if(layui.device().mobile){
        olElem.css({
          overflowY: 'auto',
          touchAction: 'pan-y'
        })
      }
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
    ,lang = that.lang()
    ,isOut
    ,elemBtn = lay(that.footer).find(ELEM_CONFIRM)
    ,timeParams = options.type === 'datetime' || options.type === 'time' ? ['hours', 'minutes', 'seconds'] : undefined;
    if(options.range){
      start = start || (that.rangeLinked ? that.startDate : options.dateTime);
      end = end || that.endDate;
      isOut = !that.endState || that.newDate(start).getTime() > that.newDate(end).getTime();

      //如果不在有效日期內，直接禁用按鈕，否則比較開始和結束日期
      (that.limit({
        date: start,
        disabledType: 'datetime', // 按鈕，檢測日期和時間
        time: timeParams,
        rangeType: 0
      }) || that.limit({
        date: end,
        disabledType: 'datetime', // 按鈕，檢測日期和時間
        time: timeParams,
        rangeType: 1
      }))
        ? elemBtn.addClass(DISABLED)
      : elemBtn[isOut ? 'addClass' : 'removeClass'](DISABLED);

      //是否異常提示
      if(tips && isOut) that.hint(
        typeof tips === 'string' ? lang.timeout.replace(/日期/g, tips) : lang.timeout
      );
    }
  };

  // 轉義為規定格式的日期字符
  Class.prototype.parse = function(state, date) {
    var that = this;
    var options = that.config;
    var startDate = (that.rangeLinked ? that.startDate : options.dateTime)
    var dateTime = date || (
      state == 'end' ? lay.extend({}, that.endDate, that.endTime) : (
        options.range
          ? lay.extend({}, startDate || options.dateTime, that.startTime)
        : options.dateTime
      )
    );
    var format = laydate.parse(dateTime, that.format, 1);

    // 返回日期範圍字符
    if (options.range && state === undefined) {
      return format + ' '+ that.rangeStr +' ' + that.parse('end');
    }

    return format;
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

  // 獲得指定日期時間對象的毫秒數
  Class.prototype.getDateTime = function(obj){
    return this.newDate(obj).getTime();
  }

  /**
   * 格式化輸入框顯示值
   * @param {HTMLInputElement} elem HTML input 元素
   * @param {(value: string) => string} displayValueCallback
   */
  Class.prototype.formatToDisplay = function (elem, displayValueCallback) {
    var that = this;
    var props = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');

    Object.defineProperty(
      elem,
      'value',
      lay.extend({}, props, {
        get: function () {
          return this.getAttribute('lay-date');
        },
        set: function (value) {
          props.set.call(this, displayValueCallback.call(that, value));
          this.setAttribute('lay-date', value);
        },
      })
    );
  };

  //賦值
  Class.prototype.setValue = function(value){
    var that = this
    ,options = that.config
    ,elem = options.elem[0];

    //靜態展現則不作默認賦值
    if(options.position === 'static') return that;

    value = value || '';

    //綁定的元素是否為 input
    if(that.isInput(elem)){
      lay(elem).val(value);
    } else {
      //如果 range 傳入了開始和結束的 input 對象，則分別對其賦值
      var rangeElem = that.rangeElem;
      if(rangeElem){
        if(layui.type(value) !== 'array'){
          value = value.split(' '+ that.rangeStr +' ');
        }
        rangeElem[0].val(value[0] || '');
        rangeElem[1].val(value[1] || '');
      } else {
        if(lay(elem).find('*').length === 0){
          var displayValue = typeof options.formatToDisplay === 'function' ? options.formatToDisplay(value) : value;
          lay(elem).html(displayValue);
        }
        lay(elem).attr('lay-date', value);
      }
    }

    return that;
  };

  //預覽
  Class.prototype.preview = function(){
    var that = this
    ,options = that.config;

    if(!options.isPreview) return;

    var elemPreview =  lay(that.elem).find('.'+ ELEM_PREVIEW)
    ,value = options.range ? ((that.rangeLinked ? that.endState : that.endDate) ? that.parse() : '') : that.parse();

    // 顯示預覽
    elemPreview.html(value);

    // 預覽顏色漸變
    var oldValue = elemPreview.html();
    oldValue && (elemPreview.css({
      'color': '#16b777'
    }),
    setTimeout(function(){
      elemPreview.css({
        'color': '#777'
      });
    }, 300));
  };

  // 附加的渲染處理，在 ready 和 change 的時候調用
  Class.prototype.renderAdditional = function(){
    var that = this;
    var options = that.config;

    // 處理全面板
    if (options.fullPanel) {
      that.list('time', 0);
    }
  };

  // 標記範圍內的日期
  Class.prototype.stampRange = function(){
    var that = this
      ,options = that.config
      ,startTime = that.rangeLinked ? that.startDate : options.dateTime, endTime
      ,tds = lay(that.elem).find('td');

    if(options.range && !that.endState) lay(that.footer).find(ELEM_CONFIRM).addClass(DISABLED);
    // if(!that.endState) return;

    startTime = startTime && that.newDate({
      year: startTime.year
      ,month: startTime.month
      ,date: startTime.date
    }).getTime();

    endTime = that.endState && that.endDate && that.newDate({
      year: that.endDate.year
      ,month: that.endDate.month
      ,date: that.endDate.date
    }).getTime();

    // if(startTime > endTime) return that.hint(TIPS_OUT);

    lay.each(tds, function(i, item){
      var ymd = lay(item).attr('lay-ymd').split('-');
      var thisTime = that.newDate({
        year: ymd[0]
        ,month: ymd[1] - 1
        ,date: ymd[2]
      }).getTime();

      // 標記當天
      if(options.rangeLinked && !that.startDate){
        if(thisTime === that.newDate(that.systemDate()).getTime()){
          lay(item).addClass(
            lay(item).hasClass(ELEM_PREV) || lay(item).hasClass(ELEM_NEXT)
              ? ''
            : ELEM_DAY_NOW
          );
        }
      }

      /*
       * 標註區間
       */

      lay(item).removeClass(ELEM_SELECTED + ' ' + THIS);

      if(thisTime === startTime || thisTime === endTime){
        (that.rangeLinked || (!that.rangeLinked && (i < 42 ? thisTime === startTime : thisTime === endTime))) &&
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

  // 執行 done/change 回調
  Class.prototype.done = function(param, type){
    var that = this;
    var options = that.config;
    var start = lay.extend({},
      lay.extend(that.rangeLinked ? that.startDate : options.dateTime, that.startTime)
    );
    var end = lay.extend({}, lay.extend(that.endDate, that.endTime));

    lay.each([start, end], function(i, item){
      if(!('month' in item)) return;
      lay.extend(item, {
        month: item.month + 1
      });
    });

    that.preview();

    param = param || [that.parse(), start, end];
    type === 'change' && that.renderAdditional();
    typeof options[type || 'done'] === 'function' && options[type || 'done'].apply(options, param);

    return that;
  };

  /**
   * 判斷日期是否存在面板，用於處理日期範圍選擇的一些邊緣情況
   * @param {object} datetime 日期時間對象
   * @param {number} index - 面板索引
   * @returns
   */
  Class.prototype.checkPanelDate = function(datetime, index){
    var that = this;
    var options = that.config;
    // 年月範圍選擇不需要處理
    if(options.type !== 'date' && options.type !== 'datetime') return;

    var startPanel = index === 0;
    var month = datetime.month + 1; // 點擊的日期所在月份
    var panelMonth = that.panelYM[index].month + 1; // 當前面板頭部月份

    // 邊緣日期的處理
    var firstRenderIndex = that.endState
      // 二次點擊（一般為結束日期）任意一側面板時：
      // 1. 左側面板中，點擊的月份屬於下一個月時，應渲染右側面板而不是左側面板;
      // 2. 左側面板中，點擊的月份屬於上一個月時，應將兩個面板都重新渲染(等效點擊 prevMonth);
      // 3. 右側面板同理。
      ? function() {
        return (startPanel && month > panelMonth) || (!startPanel && month < panelMonth)
          ? 1 - index
          : index;
      }()
      // 初次點擊（一般為開始日期）任意一側面板時：
      // 1. 讓該面板自行切換，以保持日期的「選中狀態」在該側；
      // 2. 另一側面板則根據點擊的面板進行響應式切換，以保持左右面板始終為連續月份。
      : index;

    // 為簡化實現，只要點擊的月份不等於當前面板頂部顯示的月份時，就重新渲染兩側面板
    return {
      needFullRender: month !== panelMonth,
      index: firstRenderIndex
    }
  }

  //選擇日期
  Class.prototype.choose = function(td, index){
    if(td.hasClass(DISABLED)) return;

    var that = this
    ,options = that.config
    ,panelIndex = index; // 記錄點擊的是哪一個面板的

    if (that.rangeLinked) {
      if (that.endState || !that.startDate) {
        // 重新選擇或者第一次選擇
        index = 0;
        that.endState = false;
      } else {
        index = 1;
        that.endState = true;
      }
    }

    var dateTime = that.thisDateTime(index)

    ,tds = lay(that.elem).find('td')
    ,YMD = td.attr('lay-ymd').split('-');

    YMD = {
      year: YMD[0] | 0
      ,month: (YMD[1] | 0) - 1
      ,date: YMD[2] | 0
    };

    lay.extend(dateTime, YMD); //同步 dateTime

    //範圍選擇
    if(options.range){
      //補充時分秒
      lay.each(['startTime', 'endTime'], function(i, item){
        that[item] = that[item] || {
          hours: i ? 23: 0
          ,minutes: i ? 59: 0
          ,seconds: i ? 59: 0
        };
        if (index === i) {
          // 判斷選擇之後的是否在範圍內，超出則需要調整時分秒
          if (that.getDateTime(lay.extend({}, dateTime, that[item])) < that.getDateTime(options.min)) {
            that[item] = {
              hours: options.min.hours
              ,minutes: options.min.minutes
              ,seconds: options.min.seconds
            };
            lay.extend(dateTime, that[item]);
          } else if (that.getDateTime(lay.extend({}, dateTime, that[item])) > that.getDateTime(options.max)) {
            that[item] = {
              hours: options.max.hours
              ,minutes: options.max.minutes
              ,seconds: options.max.seconds
            };
            lay.extend(dateTime, that[item]);
          }
        }
      });
      if (!index) {
        that.startDate = lay.extend({}, dateTime); // 同步startDate
      }
      // 校驗另外一個日期是否在有效的範圍內
      // 此處為範圍選擇的日期面板點擊選中處理，所以 disabledType 為 date
      if (that.endState && !that.limit({date: that.rangeLinked ? that.startDate : that.thisDateTime(1 - index), disabledType:'date'})) {
        // 根據選擇之後判斷是否需要切換模式
        var isChange;
        if (that.endState && that.autoCalendarModel.auto) {
          isChange = that.autoCalendarModel();
        }
        // 判斷是否反選
        var needSwapDate = (isChange || that.rangeLinked && that.endState) && that.newDate(that.startDate) > that.newDate(that.endDate);
        if (needSwapDate){
          var isSameDate = that.startDate.year === that.endDate.year && that.startDate.month === that.endDate.month && that.startDate.date === that.endDate.date;
          var startDate;
          // 如果是同一天並且出現了反選證明是時分秒出現開始時間大於結束時間的現象
          if(isSameDate){
            startDate = that.startTime;
            that.startTime = that.endTime;
            that.endTime = startDate;
          }
          // 當出現反向選擇時（即“後點擊”的日期比“先點擊”的日期小），重新提取區間
          startDate = that.startDate;
          that.startDate = lay.extend({}, that.endDate, that.startTime);
          options.dateTime = lay.extend({}, that.startDate);
          that.endDate = lay.extend({}, startDate, that.endTime);
        }
        isChange && (options.dateTime = lay.extend({}, that.startDate));
      }
      if (that.rangeLinked) {
        // 處理日期範圍選擇的一些邊緣情況
        var checkState = that.checkPanelDate(dateTime, panelIndex);
        var dateTimeTemp = lay.extend({}, dateTime);
        var renderMode = (isChange || (checkState && checkState.needFullRender)) ? 'init' : null;
        var panelIdx =  checkState ? checkState.index : panelIndex;
        that.calendar(dateTimeTemp, panelIdx, renderMode);
      } else {
        that.calendar(null, index, isChange ? 'init' : null);
      }
      that.endState && that.done(null, 'change');
    } else if(options.position === 'static'){ //直接嵌套的選中
      that.calendar().done().done(null, 'change'); //同時執行 done 和 change 回調
    } else if(options.type === 'date'){
      options.autoConfirm ? that.setValue(that.parse()).done().remove() : that.calendar().done(null, 'change');
    } else if(options.type === 'datetime'){
      that.calendar().done(null, 'change');
    }
  };

  //底部按鈕
  Class.prototype.tool = function(btn, type){
    var that = this
    ,options = that.config
    ,lang = that.lang()
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
        isStatic && (
          lay.extend(dateTime, that.firstDate)
          ,that.calendar()
        )
        options.range && (
          delete options.dateTime
          ,delete that.endDate
          ,delete that.startTime
          ,delete that.endTime
        );
        that.setValue('');
        that.done(null, 'onClear').done(['', {}, {}]).remove();
      }

      // 現在
      ,now: function(){
        var thisDate = new Date();

        // 當前系統時間未在 min/max 範圍內，則不可點擊
        if(lay(btn).hasClass(DISABLED)){
          return that.hint(lang.tools.now +', '+ lang.invalidDate);
        }

        lay.extend(dateTime, that.systemDate(), {
          hours: thisDate.getHours()
          ,minutes: thisDate.getMinutes()
          ,seconds: thisDate.getSeconds()
        });

        that.setValue(that.parse());
        isStatic && that.calendar();
        that.done(null, 'onNow').done().remove();
      }

      //確定
      ,confirm: function(){
        if(options.range){
          if(lay(btn).hasClass(DISABLED)){
            var isTimeout = options.type === 'time'
              ? that.startTime && that.endTime && that.newDate(that.startTime) > that.newDate(that.endTime)
              : that.startDate && that.endDate && that.newDate(lay.extend({},that.startDate, that.startTime || {})) > that.newDate(lay.extend({},that.endDate, that.endTime || {}));

            return isTimeout
              ? that.hint(options.type === 'time' ? lang.timeout.replace(/日期/g, '時間') : lang.timeout)
              : that.hint(lang.invalidDate);
          }
        } else {
          if(lay(btn).hasClass(DISABLED)) return that.hint(lang.invalidDate);
        }

        that.setValue(that.parse());
        that.done(null, 'onConfirm').done().remove();
      }
    };
    active[type] && active[type]();
  };

  //統一切換處理
  Class.prototype.change = function(index){
    var that = this
    ,options = that.config
    ,dateTime = that.thisDateTime(index)
    ,isAlone = options.range && (options.type === 'year' || options.type === 'month')

    ,elemCont = that.elemCont[index || 0]
    ,listYM = that.listYM[index]
    ,addSubYear = function(type){
      var isYear = lay(elemCont).find('.laydate-year-list')[0]
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
        if(isAlone) dateTime.year = listYM[0];
        options.range || that.done(null, 'change');
        options.range || that.limit({
          elem: lay(that.footer).find(ELEM_CONFIRM),
          date: {
            year: listYM[0]
          },
          disabledType: 'datetime' // 按鈕，檢測日期和時間
        });
      }

      that.setBtnStatus();
      return isYear || isMonth;
    };

    return {
      prevYear: function(){
        if(addSubYear('sub')) return;
        if (that.rangeLinked) {
          options.dateTime.year--;
          that.checkDate('limit').calendar(null, null, 'init');
        } else {
          dateTime.year--;
          that.checkDate('limit').calendar(null, index);
          // 面板自動切換的模式下重新判定是否發生模式轉換等細節處理
          that.autoCalendarModel.auto ? that.choose(lay(elemCont).find('td.layui-this'), index) : that.done(null, 'change');
        }
      }
      ,prevMonth: function(){
        // rangeLinked 模式非實時選擇日期，不需要同步 options.dateTime，應根據面板顯示日期切換
        if(that.rangeLinked){
          var panelYM = that.panelYM[0];
          var YM = that.getAsYM(panelYM.year, panelYM.month, 'sub');
          var dateTimeTemp = lay.extend({}, options.dateTime, that.panelYM[0], {year: YM[0], month: YM[1]});
          that.checkDate('limit').calendar(dateTimeTemp, null, 'init');
        }else{
          var YM = that.getAsYM(dateTime.year, dateTime.month, 'sub');
          lay.extend(dateTime, {
            year: YM[0]
            ,month: YM[1]
          });

          that.checkDate('limit').calendar(null, null, 'init');
          that.autoCalendarModel.auto ? that.choose(lay(elemCont).find('td.layui-this'), index) : that.done(null, 'change');
        }
      }
      ,nextMonth: function(){
        if(that.rangeLinked){
          var panelYM = that.panelYM[0];
          var YM = that.getAsYM(panelYM.year, panelYM.month);
          var dateTimeTemp = lay.extend({}, options.dateTime, that.panelYM[0], {year: YM[0],month: YM[1]});
          that.checkDate('limit').calendar(dateTimeTemp, null, 'init');
        }else{
          var YM = that.getAsYM(dateTime.year, dateTime.month);
          lay.extend(dateTime, {
            year: YM[0]
            ,month: YM[1]
          });

          that.checkDate('limit').calendar(null, null, 'init');
          that.autoCalendarModel.auto ? that.choose(lay(elemCont).find('td.layui-this'), index) : that.done(null, 'change');
        }
      }
      ,nextYear: function(){
        if(addSubYear()) return;
        if (that.rangeLinked) {
          options.dateTime.year++;
          that.checkDate('limit').calendar(null, 0, 'init');
        } else {
          dateTime.year++;
          that.checkDate('limit').calendar(null, index);
          that.autoCalendarModel.auto ? that.choose(lay(elemCont).find('td.layui-this'), index) : that.done(null, 'change');
        }
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
    }).on('mousedown', function(e){
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
        lay(that.footer).find('.'+ ELEM_TIME_BTN).addClass(DISABLED);
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
        that.choose(lay(this), i);
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
    return /input|textarea/.test(elem.tagName.toLocaleLowerCase()) || /INPUT|TEXTAREA/.test(elem.tagName);
  };

  //綁定的元素事件處理
  Class.prototype.events = function(){
    var that = this
    var options = that.config

    if(!options.elem[0] || options.elem[0].eventHandler) return;

    var showEvent = function(){
      // 已經打開的面板避免重新渲染
      if(laydate.thisId === options.id) return;
      that.render();
    };

    //綁定呼出控件事件
    options.elem.on(options.trigger, showEvent);
    options.elem[0].eventHandler = true;
    options.eventElem.on(options.trigger, showEvent);

    // 元素解綁
    that.unbind = function () {
      that.remove();
      options.elem.off(options.trigger, showEvent);
      options.elem.removeAttr('lay-key');
      options.elem.removeAttr(MOD_ID);
      options.elem[0].eventHandler = false;
      options.eventElem.off(options.trigger, showEvent);
      options.eventElem.removeAttr('lay-key');
      delete thisModule.that[options.id];
    };
  };

  //記錄所有實例
  thisModule.that = {}; //記錄所有實例對象

  //獲取當前實例對象
  thisModule.getThis = function(id){
    var that = thisModule.that[id];
    if(!that && isLayui) layui.hint().error(id ? (MOD_NAME +' instance with ID \''+ id +'\' not found') : 'ID argument required');
    return that;
  };

  // 初始執行
  ready.run = function(lay){
    // 綁定關閉控件事件
    lay(document).on('mousedown', function(e){
      if(!laydate.thisId) return;
      var that = thisModule.getThis(laydate.thisId);
      if(!that) return;

      var options = that.config;

      if(
        e.target === options.elem[0] ||
        e.target === options.eventElem[0] ||
        e.target === lay(options.closeStop)[0] ||
        (options.elem[0] && options.elem[0].contains(e.target))
      ) return;

      that.remove();

    }).on('keydown', function(e){
      if(!laydate.thisId) return;
      var that = thisModule.getThis(laydate.thisId);
      if(!that) return;

      // 回車觸發確認
      if(that.config.position === 'static') return;
      if(e.keyCode === 13){
        if(lay('#'+ that.elemID)[0] && that.elemID === Class.thisElemDate){
          e.preventDefault();
          lay(that.footer).find(ELEM_CONFIRM)[0].click();
        }
      }
    });

    //自適應定位
    lay(window).on('resize', function(){
      if(!laydate.thisId) return;
      var that = thisModule.getThis(laydate.thisId);
      if(!that) return;

      if(!that.elem || !lay(ELEM)[0]){
        return false;
      }

      that.position();
    });
  };

  // 渲染 - 核心接口
  laydate.render = function(options){
    var inst = new Class(options);
    return thisModule.call(inst);
  };

  // 重載
  laydate.reload = function (id, options) {
    var that = thisModule.getThis(id);
    if(!that) return;
    return that.reload(options);
  };

  // 獲取對應 ID 的實例
  laydate.getInst = function (id) {
    var that = thisModule.getThis(id);
    if(that){
      return that.inst;
    }
  };

  // 面板提示
  laydate.hint = function(id, opts){
    var that = thisModule.getThis(id);
    if(!that) return;
    return that.hint(opts);
  };

  // 解綁實例
  laydate.unbind = function(id){
    var that = thisModule.getThis(id);
    if(!that) return;
    return that.unbind();
  };

  // 關閉日期面板
  laydate.close = function(id){
    var that = thisModule.getThis(id || laydate.thisId);
    if(!that) return;
    return that.remove();
  };

  // 將指定對象轉化為日期值
  laydate.parse = function(dateTime, format, one){
    dateTime = dateTime || {};

    //如果 format 是字符型，則轉換為數組格式
    if(typeof format === 'string'){
      format = thisModule.formatArr(format);
    }

    format = (format || []).concat();

    //轉義為規定格式
    lay.each(format, function(i, item){
      if(/yyyy|y/.test(item)){ //年
        format[i] = lay.digit(dateTime.year, item.length);
      } else if(/MM|M/.test(item)){ //月
        format[i] = lay.digit(dateTime.month + (one || 0), item.length);
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

    return format.join('');
  };

  // 得到某月的最後一天
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

  //加載方式
  isLayui ? (
    laydate.ready()
    ,layui.define('lay', function(exports){ //layui 加載
      laydate.path = layui.cache.dir;
      ready.run(lay);
      exports(MOD_NAME, laydate);
    })
  ) : (
    (typeof define === 'function' && define.amd) ? define(function(){ //requirejs 加載
      ready.run(lay);
      return laydate;
    }) : function(){ //普通 script 標籤加載
      laydate.ready();
      ready.run(window.lay);
      window.laydate = laydate;
    }()
  );

}(window, window.document);
