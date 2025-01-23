/**
 * util 工具組件
 */

layui.define('jquery', function(exports){
  "use strict";

  var $ = layui.$;
  var hint = layui.hint();

  // 外部接口
  var util = {
    // 固定塊
    fixbar: function(options){
      var ELEM = 'layui-fixbar';
      var $doc = $(document);

      // 默認可選項
      options = $.extend(true, {
        target: 'body', // fixbar 的插入目標選擇器
        bars: [], //  bar 信息
        "default": true, // 是否顯示默認 bar
        margin: 160, // 出現 top bar 的滾動條高度臨界值
        duration: 320 // top bar 等動畫時長（毫秒）
      }, options);

      // 目標元素對象
      var $target = $(options.target);

      // 滾動條所在元素對象
      var $scroll = options.scroll
        ? $(options.scroll)
      : $(options.target === 'body' ? $doc : $target)

      // 是否提供默認圖標
      if(options['default']){
        // 兼容舊版本的一些屬性
        if(options.bar1){
          options.bars.push({
            type: 'bar1',
            icon: 'layui-icon-chat'
          });
        }
        if(options.bar2){
          options.bars.push({
            type: 'bar2',
            icon: 'layui-icon-help'
          });
        }
        // 默認 top bar
        options.bars.push({
          type: 'top',
          icon: 'layui-icon-top'
        });
      }

      var elem = $('<ul>').addClass(ELEM);
      var elemTopBar;

      // 遍歷生成 bars 節點
      layui.each(options.bars, function(i, item){
        var elemBar = $('<li class="layui-icon">');

        // 設置 bar 相關屬性
        elemBar.addClass(item.icon).attr({
          'lay-type': item.type,
          'style': item.style || (options.bgcolor ? 'background-color: '+ options.bgcolor : '')
        }).html(item.content);

        // bar 點擊事件
        elemBar.on('click', function(){
          var type = $(this).attr('lay-type');
          if(type === 'top'){
            (
              options.target === 'body'
                ? $('html,body')
              : $scroll
            ).animate({
              scrollTop : 0
            }, options.duration);
          }
          typeof options.click === 'function' && options.click.call(this, type);
        });

        // 自定義任意事件
        if(layui.type(options.on) === 'object'){
          layui.each(options.on, function(eventName, callback){
            elemBar.on(eventName, function(){
              var type = $(this).attr('lay-type');
              typeof callback === 'function' && callback.call(this, type);
            });
          })
        }

        // 獲得 top bar 節點
        if(item.type === 'top'){
          elemBar.addClass('layui-fixbar-top');
          elemTopBar = elemBar;
        }

        elem.append(elemBar); // 插入 bar 節點
      });

      // 若目標元素已存在 fixbar，則移除舊的節點
      $target.find('.'+ ELEM).remove();

      // 向目標元素插入 fixbar 節點
      typeof options.css === 'object' && elem.css(options.css);
      $target.append(elem);

      // top bar 的顯示隱藏
      if(elemTopBar){
        var lock;
        var setTopBar = (function setTopBar(){
          var top = $scroll.scrollTop();
          if(top >= options.margin){
            lock || (elemTopBar.show(), lock = 1);
          } else {
            lock && (elemTopBar.hide(), lock = 0);
          }
          return setTopBar;
        })();
      }

      // 根據 scrollbar 設置 fixbar 相關狀態
      var timer;
      $scroll.on('scroll', function(){
        if(!setTopBar) return;
        clearTimeout(timer);
        timer = setTimeout(function(){
          setTopBar();
        }, 100);
      });
    },

    // 倒計時
    countdown: function(options){
      var that = this;

      // 默認可選項
      options = $.extend(true, {
        date: new Date(),
        now: new Date()
      }, options);

      // 兼容舊版參數
      var args = arguments;
      if(args.length > 1){
        options.date = new Date(args[0]);
        options.now = new Date(args[1]);
        options.clock = args[2];
      }

      // 實例對象
      var inst = {
        options: options,
        clear: function(){ // 清除計時器
          clearTimeout(inst.timer);
        },
        reload: function(opts){ // 重置倒計時
          this.clear();
          $.extend(true, this.options, {
            now: new Date()
          }, opts);
          count();
        }
      };

      typeof options.ready === 'function' && options.ready();

      // 計算倒計時
      var count = (function fn(){
        var date = new Date(options.date);
        var now = new Date(options.now);
        var countTime = function(time){
          return time > 0 ? time : 0;
        }(date.getTime() - now.getTime());
        var result = {
          d: Math.floor(countTime/(1000*60*60*24)), // 天
          h: Math.floor(countTime/(1000*60*60)) % 24, // 時
          m: Math.floor(countTime/(1000*60)) % 60, // 分
          s: Math.floor(countTime/1000) % 60 // 秒
        };
        var next = function(){
          now.setTime(now.getTime() + 1000);
          options.now = now;
          count();
        };

        // 兼容舊版返回值
        if(args.length > 1) result = [result.d,result.h,result.m,result.s]

        // 計時 - 以秒間隔
        inst.timer = setTimeout(next, 1000);
        typeof options.clock === 'function' && options.clock(result, inst);

        // 計時完成
        if(countTime <= 0){
          clearTimeout(inst.timer);
          typeof options.done === 'function' && options.done(result, inst);
        }

        return fn;
      })();

      return inst;
    },

    // 某個時間在當前時間的多久前
    timeAgo: function(time, onlyDate){
      var that = this;
      var arr = [[], []];
      var stamp = new Date().getTime() - new Date(time).getTime();

      // 返回具體日期
      if(stamp > 1000*60*60*24*31){
        stamp =  new Date(time);
        arr[0][0] = that.digit(stamp.getFullYear(), 4);
        arr[0][1] = that.digit(stamp.getMonth() + 1);
        arr[0][2] = that.digit(stamp.getDate());

        // 是否輸出時間
        if(!onlyDate){
          arr[1][0] = that.digit(stamp.getHours());
          arr[1][1] = that.digit(stamp.getMinutes());
          arr[1][2] = that.digit(stamp.getSeconds());
        }
        return arr[0].join('-') + ' ' + arr[1].join(':');
      }

      // 30 天以內，返回「多久前」
      if(stamp >= 1000*60*60*24){
        return ((stamp/1000/60/60/24)|0) + ' 天前';
      } else if(stamp >= 1000*60*60){
        return ((stamp/1000/60/60)|0) + ' 小時前';
      } else if(stamp >= 1000*60*3){ // 3 分鐘以內為：剛剛
        return ((stamp/1000/60)|0) + ' 分鐘前';
      } else if(stamp < 0){
        return '未來';
      } else {
        return '剛剛';
      }
    },

    // 數字前置補零
    digit: function(num, length){
      var str = '';
      num = String(num);
      length = length || 2;
      for(var i = num.length; i < length; i++){
        str += '0';
      }
      return num < Math.pow(10, length) ? str + (num|0) : num;
    },

    // 轉化為日期格式字符
    toDateString: function(time, format, options){
      // 若 null 或空字符，則返回空字符
      if(time === null || time === '') return '';

      // 引用自 dayjs
      // https://github.com/iamkun/dayjs/blob/v1.11.9/src/constant.js#L30
      var REGEX_FORMAT = /\[([^\]]+)]|y{1,4}|M{1,2}|d{1,2}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|SSS/g;
      var that = this;
      var date = new Date(function(){
        if(!time) return;
        return isNaN(time) ? time : (typeof time === 'string' ? parseInt(time) : time)
      }() || new Date())

      if(!date.getDate()) return hint.error('Invalid millisecond for "util.toDateString(millisecond)"'), '';

      var years = date.getFullYear();
      var month = date.getMonth();
      var days = date.getDate();
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var seconds = date.getSeconds();
      var milliseconds = date.getMilliseconds();

      var defaultMeridiem = function(hours, minutes){
          var hm = hours * 100 + minutes;
          if (hm < 600) {
            return '凌晨';
          } else if (hm < 900) {
            return '早上';
          } else if (hm < 1100) {
            return '上午';
          } else if (hm < 1300) {
            return '中午';
          } else if (hm < 1800) {
            return '下午';
          }
          return '晚上';
      };

      var meridiem = (options && options.customMeridiem) || defaultMeridiem;

      var matches = {
        yy: function(){return String(years).slice(-2);},
        yyyy: function(){return that.digit(years, 4);},
        M: function(){return String(month + 1);},
        MM: function(){return that.digit(month + 1);},
        d: function(){return String(days);},
        dd: function(){return that.digit(days);},
        H: function(){return String(hours);},
        HH: function(){return that.digit(hours);},
        h: function(){return String(hours % 12 || 12);},
        hh: function(){return that.digit(hours % 12 || 12);},
        A: function(){return meridiem(hours, minutes);},
        m: function(){return String(minutes);},
        mm: function(){return that.digit(minutes);},
        s: function(){return String(seconds);},
        ss: function(){return that.digit(seconds);},
        SSS: function(){return that.digit(milliseconds, 3);}
      }

      format = format || 'yyyy-MM-dd HH:mm:ss';

      return format.replace(REGEX_FORMAT, function(match, $1) {
        return $1 || (matches[match] && matches[match]()) || match;
      });
    },

    // 轉義 html
    escape: function(html){
      var exp = /[<"'>]|&(?=#[a-zA-Z0-9]+)/g;
      if(html === undefined || html === null) return '';

      html += '';
      if(!exp.test(html)) return html;

      return html.replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/'/g, '&#39;').replace(/"/g, '&quot;');
    },

    // 還原轉義的 html
    unescape: function(html){
      if(html === undefined || html === null) html = '';
      html += '';

      return html.replace(/\&amp;/g, '&')
      .replace(/\&lt;/g, '<').replace(/\&gt;/g, '>')
      .replace(/\&#39;/g, '\'').replace(/\&quot;/g, '"');
    },

    // 打開新窗口
    openWin: function(options){
      var win;
      options = options || {};
      win = options.window || window.open((options.url || ''), options.target, options.specs);
      if(options.url) return;
      win.document.open('text/html', 'replace');
      win.document.write(options.content || '');
      win.document.close();
    },

    // 讓指定的元素保持在可視區域
    toVisibleArea: function(options){
      options = $.extend({
        margin: 160, // 觸發動作的邊界值
        duration: 200, // 動畫持續毫秒數
        type: 'y' // 觸發方向，x 水平、y 垂直
      }, options);

      if(!options.scrollElem[0] || !options.thisElem[0]) return;

      var scrollElem = options.scrollElem // 滾動元素
      var thisElem = options.thisElem // 目標元素
      var vertical = options.type === 'y' // 是否垂直方向
      var SCROLL_NAME = vertical ? 'scrollTop' : 'scrollLeft' // 滾動方法
      var OFFSET_NAME = vertical ? 'top' : 'left' // 座標方式
      var scrollValue = scrollElem[SCROLL_NAME]() // 當前滾動距離
      var size = scrollElem[vertical ? 'height' : 'width']() // 滾動元素的尺寸
      var scrollOffset = scrollElem.offset()[OFFSET_NAME] // 滾動元素所處位置
      var thisOffset = thisElem.offset()[OFFSET_NAME] - scrollOffset // 目標元素當前的所在位置
      var obj = {};

      // 邊界滿足條件
      if(thisOffset > size - options.margin || thisOffset < options.margin){
        obj[SCROLL_NAME] = thisOffset - size/2 + scrollValue
        scrollElem.animate(obj, options.duration);
      }
    },

    /**
     * 批量事件
     * @param {string} [attr="lay-on"] - 觸發事件的元素屬性名
     * @param {Object.<string, Function>} events - 事件集合
     * @param {Object} [options] - 參數的更多選項
     * @param {(string|HTMLElement|JQuery)} [options.elem="body"] - 觸發事件的委託元素
     * @param {string} [options.trigger="click"] - 事件觸發的方式
     * @returns {Object} 返回當前 events 參數設置的事件集合
     */
    on: function(attr, events, options) {
      // 若參數一為 object 類型，則為事件集，且省略 attr
      if (typeof attr === 'object') {
        options = events || {};
        events = attr;
        attr = options.attr || 'lay-on'; // 默認屬性名
      }

      // 更多選項
      options = $.extend({
        elem: 'body',
        trigger: 'click'
      }, typeof options === 'object' ? options : {
        trigger: options // 兼容舊版
      });

      var elem = options.elem = $(options.elem);
      var attrSelector = '['+ attr +']';
      var DATANAME = 'UTIL_ON_DATA'; // 緩存在委託元素上的 data-* 屬性名

      if (!elem[0]) return; // 若委託元素不存在

      // 初始化 data 默認值，以委託元素為存儲單元
      if (!elem.data(DATANAME)) {
        elem.data(DATANAME, {
          events: {}
        });
      }

      // 讀取 data 緩存
      var dataCache = elem.data(DATANAME);

      // 根據 attr 和 trigger 的組合作為 key
      var key = attr + '_' + options.trigger;

      // 根據 key 記錄事件集合
      events = dataCache.events[key] = $.extend(true, dataCache.events[key], events);


      // 清除事件委託，避免重複綁定
      var trigger = options.trigger + '.lay_util_on';
      elem.off(trigger, attrSelector);

      // 綁定事件委託
      elem.on(trigger, attrSelector, function(e) {
        var othis = $(this);
        var attrValue = othis.attr(attr);
        typeof events[attrValue] === 'function' && events[attrValue].call(this, othis, e);
      });

      return events;
    }
  };

  // 兼容舊版
  util.event = util.on;

  // 輸出接口
  exports('util', util);
});
