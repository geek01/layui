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
        default: true, // 是否顯示默認 bar
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
      if(options.default){
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
          'style': item.style || ('background-color: '+ options.bgcolor)
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
    }

    //倒計時
    ,countdown: function(endTime, serverTime, callback){
      var that = this
      ,type = typeof serverTime === 'function'
      ,end = new Date(endTime).getTime()
      ,now = new Date((!serverTime || type) ? new Date().getTime() : serverTime).getTime()
      ,count = end - now
      ,time = [
        Math.floor(count/(1000*60*60*24)) //天
        ,Math.floor(count/(1000*60*60)) % 24 //時
        ,Math.floor(count/(1000*60)) % 60 //分
        ,Math.floor(count/1000) % 60 //秒
      ];

      if(type) callback = serverTime;

      var timer = setTimeout(function(){
        that.countdown(endTime, now + 1000, callback);
      }, 1000);

      callback && callback(count > 0 ? time : [0,0,0,0], serverTime, timer);

      if(count <= 0) clearTimeout(timer);
      return timer;
    }

    //某個時間在當前時間的多久前
    ,timeAgo: function(time, onlyDate){
      var that = this
      ,arr = [[], []]
      ,stamp = new Date().getTime() - new Date(time).getTime();

      //返回具體日期
      if(stamp > 1000*60*60*24*31){
        stamp =  new Date(time);
        arr[0][0] = that.digit(stamp.getFullYear(), 4);
        arr[0][1] = that.digit(stamp.getMonth() + 1);
        arr[0][2] = that.digit(stamp.getDate());

        //是否輸出時間
        if(!onlyDate){
          arr[1][0] = that.digit(stamp.getHours());
          arr[1][1] = that.digit(stamp.getMinutes());
          arr[1][2] = that.digit(stamp.getSeconds());
        }
        return arr[0].join('-') + ' ' + arr[1].join(':');
      }

      //30天以內，返回“多久前”
      if(stamp >= 1000*60*60*24){
        return ((stamp/1000/60/60/24)|0) + ' 天前';
      } else if(stamp >= 1000*60*60){
        return ((stamp/1000/60/60)|0) + ' 小時前';
      } else if(stamp >= 1000*60*3){ //3分鐘以內為：剛剛
        return ((stamp/1000/60)|0) + ' 分鐘前';
      } else if(stamp < 0){
        return '未來';
      } else {
        return '剛剛';
      }
    }

    //數字前置補零
    ,digit: function(num, length){
      var str = '';
      num = String(num);
      length = length || 2;
      for(var i = num.length; i < length; i++){
        str += '0';
      }
      return num < Math.pow(10, length) ? str + (num|0) : num;
    }

    //轉化為日期格式字符
    ,toDateString: function(time, format){
      //若 null 或空字符，則返回空字符
      if(time === null || time === '') return '';

      var that = this
      ,date = new Date(function(){
        if(!time) return;
        return isNaN(time) ? time : (typeof time === 'string' ? parseInt(time) : time)
      }() || new Date())
      ,ymd = [
        that.digit(date.getFullYear(), 4)
        ,that.digit(date.getMonth() + 1)
        ,that.digit(date.getDate())
      ]
      ,hms = [
        that.digit(date.getHours())
        ,that.digit(date.getMinutes())
        ,that.digit(date.getSeconds())
      ];

      if(!date.getDate()) return hint.error('Invalid Msec for "util.toDateString(Msec)"'), '';

      format = format || 'yyyy-MM-dd HH:mm:ss';
      return format.replace(/yyyy/g, ymd[0])
      .replace(/MM/g, ymd[1])
      .replace(/dd/g, ymd[2])
      .replace(/HH/g, hms[0])
      .replace(/mm/g, hms[1])
      .replace(/ss/g, hms[2]);
    }

    //轉義 html
    ,escape: function(html){
      var exp = /[<"'>]|&(?=#[a-zA-Z0-9]+)/g;
      if(html === undefined || html === null) return '';

      html += '';
      if(!exp.test(html)) return html;

      return html.replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/'/g, '&#39;').replace(/"/g, '&quot;');
    }

    //還原轉義的 html
    ,unescape: function(html){
      if(html === undefined || html === null) html = '';
      html += '';

      return html.replace(/\&amp;/g, '&')
      .replace(/\&lt;/g, '<').replace(/\&gt;/g, '>')
      .replace(/\&#39;/g, '\'').replace(/\&quot;/g, '"');
    }

    // 打開新窗口
    ,openWin: function(options){
      var win;
      options = options || {};
      win = options.window || window.open((options.url || ''), options.target, options.specs);
      if(options.url) return;
      win.document.open('text/html', 'replace');
      win.document.write(options.content || '');
      win.document.close();
    }

    //讓指定的元素保持在可視區域
    ,toVisibleArea: function(options){
      options = $.extend({
        margin: 160 //觸發動作的邊界值
        ,duration: 200 //動畫持續毫秒數
        ,type: 'y' //觸發方向，x 水平、y 垂直
      }, options);

      if(!options.scrollElem[0] || !options.thisElem[0]) return;

      var scrollElem = options.scrollElem //滾動元素
      ,thisElem = options.thisElem //目標元素
      ,vertical = options.type === 'y' //是否垂直方向
      ,SCROLL_NAME = vertical ? 'scrollTop' : 'scrollLeft' //滾動方法
      ,OFFSET_NAME = vertical ? 'top' : 'left' //座標方式
      ,scrollValue = scrollElem[SCROLL_NAME]() //當前滾動距離
      ,size = scrollElem[vertical ? 'height' : 'width']() //滾動元素的尺寸
      ,scrollOffet = scrollElem.offset()[OFFSET_NAME] //滾動元素所處位置
      ,thisOffset = thisElem.offset()[OFFSET_NAME] - scrollOffet //目標元素當前的所在位置
      ,obj = {};

      //邊界滿足條件
      if(thisOffset > size - options.margin || thisOffset < options.margin){
        obj[SCROLL_NAME] = thisOffset - size/2 + scrollValue
        scrollElem.animate(obj, options.duration);
      }
    }

    //批量事件
    ,event: function(attr, obj, eventType){
      var _body = $('body');
      eventType = eventType || 'click';

      //記錄事件回調集合
      obj = util.event[attr] = $.extend(true, util.event[attr], obj) || {};

      //清除委託事件
      util.event.UTIL_EVENT_CALLBACK = util.event.UTIL_EVENT_CALLBACK || {};
      _body.off(eventType, '*['+ attr +']', util.event.UTIL_EVENT_CALLBACK[attr])

      //綁定委託事件
      util.event.UTIL_EVENT_CALLBACK[attr] = function(){
        var othis = $(this)
        ,key = othis.attr(attr);
        (typeof obj[key] === 'function') && obj[key].call(this, othis);
      };

      //清除舊事件，綁定新事件
      _body.on(eventType, '*['+ attr +']', util.event.UTIL_EVENT_CALLBACK[attr]);

      return obj;
    }
  };

  util.on = util.event;

  // DOM 尺寸變化，該創意來自：http://benalman.com/projects/jquery-resize-plugin/
  /*
  !function(a,b,c){"$:nomunge";function l(){f=b[g](function(){d.each(function(){var b=a(this),c=b.width(),d=b.height(),e=a.data(this,i);(c!==e.w||d!==e.h)&&b.trigger(h,[e.w=c,e.h=d])}),l()},e[j])}var f,d=a([]),e=a.resize=a.extend(a.resize,{}),g="setTimeout",h="resize",i=h+"-special-event",j="delay",k="throttleWindow";e[j]=250,e[k]=!0,a.event.special[h]={setup:function(){if(!e[k]&&this[g])return!1;var b=a(this);d=d.add(b),a.data(this,i,{w:b.width(),h:b.height()}),1===d.length&&l()},teardown:function(){if(!e[k]&&this[g])return!1;var b=a(this);d=d.not(b),b.removeData(i),d.length||clearTimeout(f)},add:function(b){function f(b,e,f){var g=a(this),h=a.data(this,i)||{};h.w=e!==c?e:g.width(),h.h=f!==c?f:g.height(),d.apply(this,arguments)}if(!e[k]&&this[g])return!1;var d;return a.isFunction(b)?(d=b,f):(d=b.handler,b.handler=f,void 0)}}}($,window);
  */

  // 輸出接口
  exports('util', util);
});