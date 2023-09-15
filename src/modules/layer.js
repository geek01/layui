/**
 * layer
 * 通用 Web 彈出層組件
 */

;!function(window, undefined){
"use strict";

var isLayui = window.layui && layui.define;
var $;
var win;
var ready = {
  getPath: function(){
    var jsPath = document.currentScript ? document.currentScript.src : function(){
      var js = document.scripts;
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
    var GLOBAL = window.LAYUI_GLOBAL || {};
    return GLOBAL.layer_dir || jsPath.substring(0, jsPath.lastIndexOf('/') + 1);
  }(),
  config: {
    removeFocus: true
  },
  end: {},
  events: {resize: {}},
  minStackIndex: 0,
  minStackArr: [],
  btn: ['確定', '取消'],

  // 五種原始層模式
  type: ['dialog', 'page', 'iframe', 'loading', 'tips'],

  // 獲取節點的 style 屬性值
  getStyle: function(node, name){
    var style = node.currentStyle ? node.currentStyle : window.getComputedStyle(node, null);
    return style[style.getPropertyValue ? 'getPropertyValue' : 'getAttribute'](name);
  },

  // 載入 CSS 依賴
  link: function(href, fn, cssname){
    // 未設置路徑，則不主動加載 css
    if(!layer.path) return;

    var head = document.getElementsByTagName("head")[0];
    var link = document.createElement('link');

    if(typeof fn === 'string') cssname = fn;

    var app = (cssname || href).replace(/\.|\//g, '');
    var id = 'layuicss-'+ app;
    var STATUS_NAME = 'creating'
    var timeout = 0;

    link.rel = 'stylesheet';
    link.href = layer.path + href;
    link.id = id;

    if(!document.getElementById(id)){
      head.appendChild(link);
    }

    if(typeof fn !== 'function') return;

    // 輪詢 css 是否加載完畢
    (function poll(status) {
      var delay = 100;
      var getLinkElem = document.getElementById(id); // 獲取動態插入的 link 元素

      // 如果輪詢超過指定秒數，則視為請求文件失敗或 css 文件不符合規範
      if(++timeout > 10 * 1000 / delay){
        return window.console && console.error(app +'.css: Invalid');
      }

      // css 加載就緒
      if(parseInt(ready.getStyle(getLinkElem, 'width')) === 1989){
        // 如果參數來自於初始輪詢（即未加載就緒時的），則移除 link 標籤狀態
        if(status === STATUS_NAME) getLinkElem.removeAttribute('lay-status');
        // 如果 link 標籤的狀態仍為「創建中」，則繼續進入輪詢，直到狀態改變，則執行回調
        getLinkElem.getAttribute('lay-status') === STATUS_NAME ? setTimeout(poll, delay) : fn();
      } else {
        getLinkElem.setAttribute('lay-status', STATUS_NAME);
        setTimeout(function(){
          poll(STATUS_NAME);
        }, delay);
      }

      // parseInt(ready.getStyle(document.getElementById(id), 'width')) === 1989 ? fn() : setTimeout(poll, 1000);
    }());

  }
};

// 默認內置方法。
var layer = {
  v: '3.7.0',
  ie: function(){ // ie 版本
    var agent = navigator.userAgent.toLowerCase();
    return (!!window.ActiveXObject || "ActiveXObject" in window) ? (
      (agent.match(/msie\s(\d+)/) || [])[1] || '11' // 由於 ie11 並沒有 msie 的標識
    ) : false;
  }(),
  index: (window.layer && window.layer.v) ? 100000 : 0,
  path: ready.getPath,
  config: function(options, fn){
    options = options || {};
    layer.cache = ready.config = $.extend({}, ready.config, options);
    layer.path = ready.config.path || layer.path;
    typeof options.extend === 'string' && (options.extend = [options.extend]);

    // 如果設置了路徑，則加載樣式
    if(ready.config.path) layer.ready();

    if(!options.extend) return this;

    // 加載 css
    isLayui
      ? layui.addcss('modules/layer/' + options.extend)
    : ready.link('css/' + options.extend);

    return this;
  },

  // 主體 CSS 等待事件
  ready: function(callback){
    var cssname = 'layer';
    var ver = '';
    var path = (isLayui ? 'modules/' : 'css/') + 'layer.css?v='+ layer.v + ver;

    isLayui ? (
      layui['layui.all']
        ? (typeof callback === 'function' && callback())
      : layui.addcss(path, callback, cssname)
    ) : ready.link(path, callback, cssname);

    return this;
  },

  // 各種快捷引用
  alert: function(content, options, yes){
    var type = typeof options === 'function';
    if(type) yes = options;
    return layer.open($.extend({
      content: content,
      yes: yes
    }, type ? {} : options));
  },

  confirm: function(content, options, yes, cancel){
    var type = typeof options === 'function';
    if(type){
      cancel = yes;
      yes = options;
    }
    return layer.open($.extend({
      content: content,
      btn: ready.btn,
      yes: yes,
      btn2: cancel
    }, type ? {} : options));
  },

  msg: function(content, options, end){ // 最常用提示層
    var type = typeof options === 'function', rskin = ready.config.skin;
    var skin = (rskin ? rskin + ' ' + rskin + '-msg' : '')||'layui-layer-msg';
    var anim = doms.anim.length - 1;
    if(type) end = options;
    return layer.open($.extend({
      content: content,
      time: 3000,
      shade: false,
      skin: skin,
      title: false,
      closeBtn: false,
      btn: false,
      resize: false,
      end: end,
      removeFocus: false
    }, (type && !ready.config.skin) ? {
      skin: skin + ' layui-layer-hui',
      anim: anim
    } : function(){
       options = options || {};
       if(options.icon === -1 || options.icon === undefined && !ready.config.skin){
         options.skin = skin + ' ' + (options.skin||'layui-layer-hui');
       }
       return options;
    }()));
  },

  load: function(icon, options){
    return layer.open($.extend({
      type: 3,
      icon: icon || 0,
      resize: false,
      shade: 0.01,
      removeFocus: false
    }, options));
  },

  tips: function(content, follow, options){
    return layer.open($.extend({
      type: 4,
      content: [content, follow],
      closeBtn: false,
      time: 3000,
      shade: false,
      resize: false,
      fixed: false,
      maxWidth: 260,
      removeFocus: false
    }, options));
  }
};

var Class = function(setings){
  var that = this, creat = function(){
    that.creat();
  };
  that.index = ++layer.index;
  that.config.maxWidth = $(win).width() - 15*2; // 初始最大寬度：當前屏幕寬，左右留 15px 邊距
  that.config = $.extend({}, that.config, ready.config, setings);
  document.body ? creat() : setTimeout(function(){
    creat();
  }, 30);
};

Class.pt = Class.prototype;

// 緩存常用字符
var doms = ['layui-layer', '.layui-layer-title', '.layui-layer-main', '.layui-layer-dialog', 'layui-layer-iframe', 'layui-layer-content', 'layui-layer-btn', 'layui-layer-close'];

// 內置動畫類
doms.anim = {
  // 舊版動畫
  0: 'layer-anim-00',
  1: 'layer-anim-01',
  2: 'layer-anim-02',
  3: 'layer-anim-03',
  4: 'layer-anim-04',
  5: 'layer-anim-05',
  6: 'layer-anim-06',

  // 滑出方向
  slideDown: 'layer-anim-slide-down',
  slideLeft: 'layer-anim-slide-left',
  slideUp: 'layer-anim-slide-up',
  slideRight: 'layer-anim-slide-right'
};

doms.SHADE = 'layui-layer-shade';
doms.MOVE = 'layui-layer-move';

// 默認配置
Class.pt.config = {
  type: 0,
  shade: 0.3,
  fixed: true,
  move: doms[1],
  title: '信息',
  offset: 'auto',
  area: 'auto',
  closeBtn: 1,
  icon: -1,
  time: 0, // 0 表示不自動關閉
  zIndex: 19891014,
  maxWidth: 360,
  anim: 0,
  isOutAnim: true, // 退出動畫
  minStack: true, // 最小化堆疊
  moveType: 1,
  resize: true,
  scrollbar: true, // 是否允許瀏覽器滾動條
  tips: 2
};

// 容器
Class.pt.vessel = function(conType, callback){
  var that = this, times = that.index, config = that.config;
  var zIndex = config.zIndex + times, titype = typeof config.title === 'object';
  var ismax = config.maxmin && (config.type === 1 || config.type === 2);
  var titleHTML = (config.title ? '<div class="layui-layer-title" style="'+ (titype ? config.title[1] : '') +'">'
    + (titype ? config.title[0] : config.title)
  + '</div>' : '');

  config.zIndex = zIndex;
  callback([
    // 遮罩
    config.shade ? ('<div class="'+ doms.SHADE +'" id="'+ doms.SHADE + times +'" times="'+ times +'" style="'+ ('z-index:'+ (zIndex-1) +'; ') +'"></div>') : '',

    // 主體
    '<div class="'+ doms[0] + (' layui-layer-'+ready.type[config.type]) + (((config.type == 0 || config.type == 2) && !config.shade) ? ' layui-layer-border' : '') + ' ' + (config.skin||'') +'" id="'+ doms[0] + times +'" type="'+ ready.type[config.type] +'" times="'+ times +'" showtime="'+ config.time +'" conType="'+ (conType ? 'object' : 'string') +'" style="z-index: '+ zIndex +'; width:'+ config.area[0] + ';height:' + config.area[1] + ';position:'+ (config.fixed ? 'fixed;' : 'absolute;') +'">'
      + (conType && config.type != 2 ? '' : titleHTML)

      // 內容區
      + '<div'+ (config.id ? ' id="'+ config.id +'"' : '') +' class="layui-layer-content'+ ((config.type == 0 && config.icon !== -1) ? ' layui-layer-padding' : '') + (config.type == 3 ? ' layui-layer-loading'+config.icon : '') +'">'
        // 表情或圖標
        + function(){
          var face = [
            'layui-icon-tips',
            'layui-icon-success',
            'layui-icon-error',
            'layui-icon-question',
            'layui-icon-lock',
            'layui-icon-face-cry',
            'layui-icon-face-smile'
          ];

          var additFaceClass;

          // 動畫類
          var animClass = 'layui-anim layui-anim-rotate layui-anim-loop';

          // 信息框表情
          if(config.type == 0 && config.icon !== -1){
            // 加載（加載圖標）
            if(config.icon == 16){
              additFaceClass = 'layui-icon layui-icon-loading '+ animClass;
            }
            return '<i class="layui-layer-face layui-icon '+ (
              additFaceClass || face[config.icon] || face[0]
            ) +'"></i>';
          }

          // 加載層圖標
          if(config.type == 3){
            var type = [
              'layui-icon-loading',
              'layui-icon-loading-1'
            ];
            // 風格 2
            if(config.icon == 2){
              return '<div class="layui-layer-loading-2 '+ animClass +'"></div>';
            }
            return '<i class="layui-layer-loading-icon layui-icon '+ (
              type[config.icon] || type[0]
            )+' '+ animClass +'"></i>'
          }

          return '';
        }()
        + (config.type == 1 && conType ? '' : (config.content||''))
      + '</div>'

      // 右上角按鈕
      + '<div class="layui-layer-setwin">'+ function(){
        var arr = [];

        // 最小化、最大化
        if(ismax){
          arr.push('<span class="layui-layer-min"></span>');
          arr.push('<span class="layui-layer-max"></span>');
        }

        // 關閉按鈕
        if(config.closeBtn){
          arr.push('<span class="layui-icon layui-icon-close '+ [
            doms[7],
            doms[7] + (config.title ? config.closeBtn : (config.type == 4 ? '1' : '2'))
          ].join(' ') +'"></span>')
        }

        return arr.join('');
      }() + '</div>'

      // 底部按鈕
      + (config.btn ? function(){
        var button = '';
        typeof config.btn === 'string' && (config.btn = [config.btn]);
        for(var i = 0, len = config.btn.length; i < len; i++){
          button += '<a class="'+ doms[6] +''+ i +'">'+ config.btn[i] +'</a>'
        }
        return '<div class="'+ function(){
          var className = [doms[6]];
          if(config.btnAlign) className.push(doms[6] + '-' + config.btnAlign);
          return className.join(' ');
        }() +'">'+ button +'</div>'
      }() : '')
      + (config.resize ? '<span class="layui-layer-resize"></span>' : '')
    + '</div>'
  ], titleHTML, $('<div class="'+ doms.MOVE +'" id="'+ doms.MOVE +'"></div>'));
  return that;
};

// 創建骨架
Class.pt.creat = function(){
  var that = this;
  var config = that.config;
  var times = that.index, nodeIndex;
  var content = config.content;
  var conType = typeof content === 'object';
  var body = $('body');

  // 若 id 對應的彈層已經存在，則不重新創建
  if(config.id && $('.'+ doms[0]).find('#'+ config.id)[0]){
    return (function(){
      var layero = $('#'+ config.id).closest('.'+ doms[0]);
      var index = layero.attr('times');
      var options = layero.data('config');
      var elemShade = $('#'+ doms.SHADE + index);

      var maxminStatus = layero.data('maxminStatus') || {};
      // 若彈層為最小化狀態，則點擊目標元素時，自動還原
      if(maxminStatus === 'min'){
        layer.restore(index);
      } else if(options.hideOnClose){
        elemShade.show();
        layero.show();
      }
    })();
  }

  // 是否移除活動元素的焦點
  if(config.removeFocus) {
    document.activeElement.blur(); // 將原始的聚焦節點失焦
  }

  // 初始化 area 屬性
  if(typeof config.area === 'string'){
    config.area = config.area === 'auto' ? ['', ''] : [config.area, ''];
  }

  // anim 兼容舊版 shift
  if(config.shift){
    config.anim = config.shift;
  }

  if(layer.ie == 6){
    config.fixed = false;
  }

  switch(config.type){
    case 0:
      config.btn = ('btn' in config) ? config.btn : ready.btn[0];
      layer.closeAll('dialog');
    break;
    case 2:
      var content = config.content = conType ? config.content : [config.content||'', 'auto'];
      config.content = '<iframe scrolling="'+ (config.content[1]||'auto') +'" allowtransparency="true" id="'+ doms[4] +''+ times +'" name="'+ doms[4] +''+ times +'" onload="this.className=\'\';" class="layui-layer-load" frameborder="0" src="' + config.content[0] + '"></iframe>';
    break;
    case 3:
      delete config.title;
      delete config.closeBtn;
      config.icon === -1 && (config.icon === 0);
      layer.closeAll('loading');
    break;
    case 4:
      conType || (config.content = [config.content, 'body']);
      config.follow = config.content[1];
      config.content = config.content[0] + '<i class="layui-layer-TipsG"></i>';
      delete config.title;
      config.tips = typeof config.tips === 'object' ? config.tips : [config.tips, true];
      config.tipsMore || layer.closeAll('tips');
    break;
  }

  // 建立容器
  that.vessel(conType, function(html, titleHTML, moveElem){
    body.append(html[0]);
    conType ? function(){
      (config.type == 2 || config.type == 4) ? function(){
        $('body').append(html[1]);
      }() : function(){
        if(!content.parents('.'+doms[0])[0]){
          content.data('display', content.css('display')).show().addClass('layui-layer-wrap').wrap(html[1]);
          $('#'+ doms[0] + times).find('.'+doms[5]).before(titleHTML);
        }
      }();
    }() : body.append(html[1]);
    $('#'+ doms.MOVE)[0] || body.append(ready.moveElem = moveElem);

    that.layero = $('#'+ doms[0] + times);
    that.shadeo = $('#'+ doms.SHADE + times);

    config.scrollbar || ready.setScrollbar(times);
  }).auto(times);

  // 遮罩
  that.shadeo.css({
    'background-color': config.shade[1] || '#000'
    ,'opacity': config.shade[0] || config.shade
  });

  config.type == 2 && layer.ie == 6 && that.layero.find('iframe').attr('src', content[0]);

  // 座標自適應瀏覽器窗口尺寸
  config.type == 4 ? that.tips() : function(){
    that.offset()
    // 首次彈出時，若 css 尚未加載，則等待 css 加載完畢後，重新設定尺寸
    parseInt(ready.getStyle(document.getElementById(doms.MOVE), 'z-index')) ||  function(){
      that.layero.css('visibility', 'hidden');
      layer.ready(function(){
        that.offset();
        that.layero.css('visibility', 'visible');
      });
    }();
  }();

  // 若是固定定位，則跟隨 resize 事件來自適應座標
  if(config.fixed){
    if(!ready.events.resize[that.index]){
      ready.events.resize[that.index] = function(){
        that.resize();
      };
      // 此處 resize 事件不會一直疊加，當關閉彈層時會移除該事件
      win.on('resize', ready.events.resize[that.index]);
    }
  }

  config.time <= 0 || setTimeout(function(){
    layer.close(that.index);
  }, config.time);
  that.move().callback();

  // 為兼容 jQuery3.0 的 css 動畫影響元素尺寸計算
  if(doms.anim[config.anim]){
    var animClass = 'layer-anim '+ doms.anim[config.anim];
    that.layero.addClass(animClass).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
      $(this).removeClass(animClass);
    });
  }

  // 記錄配置信息
  that.layero.data('config', config);
};

// 當前實例的 resize 事件
Class.pt.resize = function(){
  var that = this;
  var config = that.config;

  that.offset();
  (/^\d+%$/.test(config.area[0]) || /^\d+%$/.test(config.area[1])) && that.auto(that.index);
  config.type == 4 && that.tips();
};

// 自適應
Class.pt.auto = function(index){
  var that = this, config = that.config, layero = $('#'+ doms[0] + index);

  if(config.area[0] === '' && config.maxWidth > 0){
    // 適配 ie7
    if(layer.ie && layer.ie < 8 && config.btn){
      layero.width(layero.innerWidth());
    }
    layero.outerWidth() > config.maxWidth && layero.width(config.maxWidth);
  }

  var area = [layero.innerWidth(), layero.innerHeight()];
  var titHeight = layero.find(doms[1]).outerHeight() || 0;
  var btnHeight = layero.find('.'+doms[6]).outerHeight() || 0;
  var setHeight = function(elem){
    elem = layero.find(elem);
    elem.height(area[1] - titHeight - btnHeight - 2*(parseFloat(elem.css('padding-top'))|0));
  };

  switch(config.type){
    case 2:
      setHeight('iframe');
    break;
    default:
      if(config.area[1] === ''){
        if(config.maxHeight > 0 && layero.outerHeight() > config.maxHeight){
          area[1] = config.maxHeight;
          setHeight('.'+doms[5]);
        } else if(config.fixed && area[1] >= win.height()){
          area[1] = win.height();
          setHeight('.'+doms[5]);
        }
      } else {
        setHeight('.'+doms[5]);
      }
    break;
  }

  return that;
};

// 計算座標
Class.pt.offset = function(){
  var that = this, config = that.config, layero = that.layero;
  var area = [layero.outerWidth(), layero.outerHeight()];
  var type = typeof config.offset === 'object';
  that.offsetTop = (win.height() - area[1])/2;
  that.offsetLeft = (win.width() - area[0])/2;

  if(type){
    that.offsetTop = config.offset[0];
    that.offsetLeft = config.offset[1]||that.offsetLeft;
  } else if(config.offset !== 'auto'){

    if(config.offset === 't'){ // 上
      that.offsetTop = 0;
    } else if(config.offset === 'r'){ // 右
      that.offsetLeft = win.width() - area[0];
    } else if(config.offset === 'b'){ // 下
      that.offsetTop = win.height() - area[1];
    } else if(config.offset === 'l'){ // 左
      that.offsetLeft = 0;
    } else if(config.offset === 'lt'){ // 左上
      that.offsetTop = 0;
      that.offsetLeft = 0;
    } else if(config.offset === 'lb'){ // 左下
      that.offsetTop = win.height() - area[1];
      that.offsetLeft = 0;
    } else if(config.offset === 'rt'){ // 右上
      that.offsetTop = 0;
      that.offsetLeft = win.width() - area[0];
    } else if(config.offset === 'rb'){ // 右下
      that.offsetTop = win.height() - area[1];
      that.offsetLeft = win.width() - area[0];
    } else {
      that.offsetTop = config.offset;
    }

  }

  if(!config.fixed){
    that.offsetTop = /%$/.test(that.offsetTop) ?
      win.height()*parseFloat(that.offsetTop)/100
    : parseFloat(that.offsetTop);
    that.offsetLeft = /%$/.test(that.offsetLeft) ?
      win.width()*parseFloat(that.offsetLeft)/100
    : parseFloat(that.offsetLeft);
    that.offsetTop += win.scrollTop();
    that.offsetLeft += win.scrollLeft();
  }

  // 最小化窗口時的自適應
  if(layero.data('maxminStatus') === 'min'){
    that.offsetTop = win.height() - (layero.find(doms[1]).outerHeight() || 0);
    that.offsetLeft = layero.css('left');
  }

  // 設置座標
  layero.css({
    top: that.offsetTop,
    left: that.offsetLeft
  });
};

// Tips
Class.pt.tips = function(){
  var that = this, config = that.config, layero = that.layero;
  var layArea = [layero.outerWidth(), layero.outerHeight()], follow = $(config.follow);
  if(!follow[0]) follow = $('body');
  var goal = {
    width: follow.outerWidth(),
    height: follow.outerHeight(),
    top: follow.offset().top,
    left: follow.offset().left
  }, tipsG = layero.find('.layui-layer-TipsG');

  var guide = config.tips[0];
  config.tips[1] || tipsG.remove();

  goal.autoLeft = function(){
    if(goal.left + layArea[0] - win.width() > 0){
      goal.tipLeft = goal.left + goal.width - layArea[0];
      tipsG.css({right: 12, left: 'auto'});
    } else {
      goal.tipLeft = goal.left;
    }
  };

  // 辨別 tips 的方位
  goal.where = [function(){ // 上
    goal.autoLeft();
    goal.tipTop = goal.top - layArea[1] - 10;
    tipsG.removeClass('layui-layer-TipsB').addClass('layui-layer-TipsT').css('border-right-color', config.tips[1]);
  }, function(){ // 右
    goal.tipLeft = goal.left + goal.width + 10;
    goal.tipTop = goal.top;
    tipsG.removeClass('layui-layer-TipsL').addClass('layui-layer-TipsR').css('border-bottom-color', config.tips[1]);
  }, function(){ // 下
    goal.autoLeft();
    goal.tipTop = goal.top + goal.height + 10;
    tipsG.removeClass('layui-layer-TipsT').addClass('layui-layer-TipsB').css('border-right-color', config.tips[1]);
  }, function(){ // 左
    goal.tipLeft = goal.left - layArea[0] - 10;
    goal.tipTop = goal.top;
    tipsG.removeClass('layui-layer-TipsR').addClass('layui-layer-TipsL').css('border-bottom-color', config.tips[1]);
  }];
  goal.where[guide-1]();

  /* 8*2為小三角形佔據的空間 */
  if(guide === 1){
    goal.top - (win.scrollTop() + layArea[1] + 8*2) < 0 && goal.where[2]();
  } else if(guide === 2){
    win.width() - (goal.left + goal.width + layArea[0] + 8*2) > 0 || goal.where[3]()
  } else if(guide === 3){
    (goal.top - win.scrollTop() + goal.height + layArea[1] + 8*2) - win.height() > 0 && goal.where[0]();
  } else if(guide === 4){
     layArea[0] + 8*2 - goal.left > 0 && goal.where[1]()
  }

  layero.find('.'+doms[5]).css({
    'background-color': config.tips[1],
    'padding-right': (config.closeBtn ? '30px' : '')
  });
  layero.css({
    left: goal.tipLeft - (config.fixed ? win.scrollLeft() : 0),
    top: goal.tipTop  - (config.fixed ? win.scrollTop() : 0)
  });
}

// 拖拽層
Class.pt.move = function(){
  var that = this;
  var config = that.config;
  var _DOC = $(document);
  var layero = that.layero;
  var DATA_NAME = ['LAY_MOVE_DICT', 'LAY_RESIZE_DICT'];
  var moveElem = layero.find(config.move);
  var resizeElem = layero.find('.layui-layer-resize');

  // 給指定元素添加拖動光標
  if(config.move) moveElem.css('cursor', 'move');

  // 按下拖動元素
  moveElem.on('mousedown', function(e){
    if (e.button) {return;} // 不是左鍵不處理
    var othis = $(this);
    var dict = {};

    if(config.move){
      dict.layero = layero;
      dict.config = config;
      dict.offset = [
        e.clientX - parseFloat(layero.css('left')),
        e.clientY - parseFloat(layero.css('top'))
      ];

      othis.data(DATA_NAME[0], dict);
      ready.eventMoveElem = othis;
      ready.moveElem.css('cursor', 'move').show();
    }

    e.preventDefault();
  });

  // 按下右下角拉伸
  resizeElem.on('mousedown', function(e){
    var othis = $(this);
    var dict = {};

    if(config.resize){
      dict.layero = layero;
      dict.config = config;
      dict.offset = [e.clientX, e.clientY];
      dict.index = that.index;
      dict.area = [
        layero.outerWidth()
        ,layero.outerHeight()
      ];

      othis.data(DATA_NAME[1], dict);
      ready.eventResizeElem = othis;
      ready.moveElem.css('cursor', 'se-resize').show();
    }

    e.preventDefault();
  });

  // 拖動元素，避免多次調用實例造成事件疊加
  if(ready.docEvent) return that;
  _DOC.on('mousemove', function(e){
    // 拖拽移動
    if(ready.eventMoveElem){
      var dict = ready.eventMoveElem.data(DATA_NAME[0]) || {}
      ,layero = dict.layero
      ,config = dict.config;

      var X = e.clientX - dict.offset[0];
      var Y = e.clientY - dict.offset[1];
      var fixed = layero.css('position') === 'fixed';

      e.preventDefault();

      dict.stX = fixed ? 0 : win.scrollLeft();
      dict.stY = fixed ? 0 : win.scrollTop();

      // 控制元素不被拖出窗口外
      if(!config.moveOut){
        var setRig = win.width() - layero.outerWidth() + dict.stX;
        var setBot = win.height() - layero.outerHeight() + dict.stY;
        X < dict.stX && (X = dict.stX);
        X > setRig && (X = setRig);
        Y < dict.stY && (Y = dict.stY);
        Y > setBot && (Y = setBot);
      }

      // 拖動時跟隨鼠標位置
      layero.css({
        left: X,
        top: Y
      });
    }

    // Resize
    if(ready.eventResizeElem){
      var dict = ready.eventResizeElem.data(DATA_NAME[1]) || {};
      var config = dict.config;

      var X = e.clientX - dict.offset[0];
      var Y = e.clientY - dict.offset[1];

      e.preventDefault();

      // 拉伸寬高
      layer.style(dict.index, {
        width: dict.area[0] + X
        ,height: dict.area[1] + Y
      });

      config.resizing && config.resizing(dict.layero);
    }
  }).on('mouseup', function(e){
    if(ready.eventMoveElem){
      var dict = ready.eventMoveElem.data(DATA_NAME[0]) || {};
      var config = dict.config;

      ready.eventMoveElem.removeData(DATA_NAME[0]);
      delete ready.eventMoveElem;
      ready.moveElem.hide();
      config.moveEnd && config.moveEnd(dict.layero);
    }
    if(ready.eventResizeElem){
      ready.eventResizeElem.removeData(DATA_NAME[1]);
      delete ready.eventResizeElem;
      ready.moveElem.hide();
    }
  });

  ready.docEvent = true; // 已給 document 執行全局事件
  return that;
};

Class.pt.callback = function(){
  var that = this, layero = that.layero, config = that.config;
  that.openLayer();
  if(config.success){
    if(config.type == 2){
      layero.find('iframe').on('load', function(){
        config.success(layero, that.index, that);
      });
    } else {
      config.success(layero, that.index, that);
    }
  }
  layer.ie == 6 && that.IE6(layero);

  // 按鈕
  layero.find('.'+ doms[6]).children('a').on('click', function(){
    var index = $(this).index();
    if(index === 0){
      if(config.yes){
        config.yes(that.index, layero, that);
      } else if(config['btn1']){
        config['btn1'](that.index, layero, that);
      } else {
        layer.close(that.index);
      }
    } else {
      var close = config['btn'+(index+1)] && config['btn'+(index+1)](that.index, layero, that);
      close === false || layer.close(that.index);
    }
  });

  // 取消
  function cancel(){
    var close = config.cancel && config.cancel(that.index, layero, that);
    close === false || layer.close(that.index);
  }

  // 右上角關閉回調
  layero.find('.'+ doms[7]).on('click', cancel);

  // 點遮罩關閉
  if(config.shadeClose){
    that.shadeo.on('click', function(){
      layer.close(that.index);
    });
  }

  // 最小化
  layero.find('.layui-layer-min').on('click', function(){
    var min = config.min && config.min(layero, that.index, that);
    min === false || layer.min(that.index, config);
  });

  // 全屏/還原
  layero.find('.layui-layer-max').on('click', function(){
    if($(this).hasClass('layui-layer-maxmin')){
      layer.restore(that.index);
      config.restore && config.restore(layero, that.index, that);
    } else {
      layer.full(that.index, config);
      setTimeout(function(){
        config.full && config.full(layero, that.index, that);
      }, 100);
    }
  });

  config.end && (ready.end[that.index] = config.end);
};

// for ie6 恢復 select
ready.reselect = function(){
  $.each($('select'), function(index , value){
    var sthis = $(this);
    if(!sthis.parents('.'+doms[0])[0]){
      (sthis.attr('layer') == 1 && $('.'+doms[0]).length < 1) && sthis.removeAttr('layer').show();
    }
    sthis = null;
  });
};

Class.pt.IE6 = function(layero){
  // 隱藏select
  $('select').each(function(index , value){
    var sthis = $(this);
    if(!sthis.parents('.'+doms[0])[0]){
      sthis.css('display') === 'none' || sthis.attr({'layer' : '1'}).hide();
    }
    sthis = null;
  });
};

// 需依賴原型的對外方法
Class.pt.openLayer = function(){
  var that = this;

  // 置頂當前窗口
  layer.zIndex = that.config.zIndex;
  layer.setTop = function(layero){
    var setZindex = function(){
      layer.zIndex++;
      layero.css('z-index', layer.zIndex + 1);
    };
    layer.zIndex = parseInt(layero[0].style.zIndex);
    layero.on('mousedown', setZindex);
    return layer.zIndex;
  };
};

// 記錄寬高座標，用於還原
ready.record = function(layero){
  if(!layero[0]) return window.console && console.error('index error');
  var area = [
    layero[0].style.width || layero.width(),
    layero[0].style.height || layero.height(),
    layero.position().top,
    layero.position().left + parseFloat(layero.css('margin-left'))
  ];
  layero.find('.layui-layer-max').addClass('layui-layer-maxmin');
  layero.attr({area: area});
};

// 設置頁面滾動條
ready.setScrollbar = function(index){
  doms.html.css('overflow', 'hidden').attr('layer-full', index);
};

// 恢復頁面滾動條
ready.restScrollbar = function(index){
  if(doms.html.attr('layer-full') == index){
    doms.html[0].style[doms.html[0].style.removeProperty
      ? 'removeProperty'
    : 'removeAttribute']('overflow');
    doms.html.removeAttr('layer-full');
  }
};

/** 內置成員 */

window.layer = layer;

// 獲取子 iframe 的 DOM
layer.getChildFrame = function(selector, index){
  index = index || $('.'+doms[4]).attr('times');
  return $('#'+ doms[0] + index).find('iframe').contents().find(selector);
};

// 得到當前 iframe 層的索引，子 iframe 時使用
layer.getFrameIndex = function(name){
  return $('#'+ name).parents('.'+doms[4]).attr('times');
};

// iframe 層自適應寬高
layer.iframeAuto = function(index){
  if(!index) return;
  var heg = layer.getChildFrame('html', index).outerHeight();
  var layero = $('#'+ doms[0] + index);
  var titHeight = layero.find(doms[1]).outerHeight() || 0;
  var btnHeight = layero.find('.'+doms[6]).outerHeight() || 0;
  layero.css({height: heg + titHeight + btnHeight});
  layero.find('iframe').css({height: heg});
};

// 重置 iframe url
layer.iframeSrc = function(index, url){
  $('#'+ doms[0] + index).find('iframe').attr('src', url);
};

// 設定層的樣式
layer.style = function(index, options, limit){
  var layero = $('#'+ doms[0] + index);
  var contElem = layero.find('.layui-layer-content');
  var type = layero.attr('type');
  var titHeight = layero.find(doms[1]).outerHeight() || 0;
  var btnHeight = layero.find('.'+doms[6]).outerHeight() || 0;
  var minLeft = layero.attr('minLeft');

  // loading 和 tips 層不允許更改
  if(type === ready.type[3] || type === ready.type[4]){
    return;
  }

  if(!limit){
    if(parseFloat(options.width) <= 260){
      options.width = 260;
    }

    if(parseFloat(options.height) - titHeight - btnHeight <= 64){
      options.height = 64 + titHeight + btnHeight;
    }
  }
  layero.css(options);
  btnHeight = layero.find('.'+doms[6]).outerHeight() || 0;

  if(type === ready.type[2]){
    layero.find('iframe').css({
      height: (typeof options.height === 'number' ? options.height : layero.height()) - titHeight - btnHeight
    });
  } else {
    contElem.css({
      height: (typeof options.height === 'number' ? options.height : layero.height()) - titHeight - btnHeight
      - parseFloat(contElem.css('padding-top'))
      - parseFloat(contElem.css('padding-bottom'))
    })
  }
};

// 最小化
layer.min = function(index, options){
  var layero = $('#'+ doms[0] + index);
  var maxminStatus = layero.data('maxminStatus');

  if(maxminStatus === 'min') return; // 當前的狀態是否已經是最小化
  if(maxminStatus === 'max') layer.restore(index); // 若當前為最大化，則先還原後再最小化

  layero.data('maxminStatus', 'min');
  options = options || layero.data('config') || {};

  var shadeo = $('#'+ doms.SHADE + index);
  var elemMin = layero.find('.layui-layer-min');
  var titHeight = layero.find(doms[1]).outerHeight() || 0;
  var minLeft = layero.attr('minLeft'); // 最小化時的橫座標
  var hasMinLeft = typeof minLeft === 'string'; // 是否已經賦值過最小化座標
  var left = hasMinLeft ? minLeft : (181*ready.minStackIndex)+'px';
  var position = layero.css('position');
  var minWidth = 180; // 最小化時的寬度
  var settings = {
    width: minWidth
    ,height: titHeight
    ,position: 'fixed'
    ,overflow: 'hidden'
  };

  ready.record(layero);  // 記錄當前尺寸、座標，用於還原

  // 簡易最小化補位
  if(ready.minStackArr.length > 0){
    left = ready.minStackArr[0];
    ready.minStackArr.shift();
  }

  // left 是否超出邊界
  if(parseFloat(left) + minWidth  > win.width()){
    left = win.width() - minWidth - function(){
      ready.minStackArr.edgeIndex = ready.minStackArr.edgeIndex || 0;
      return ready.minStackArr.edgeIndex += 3;
    }();
    if(left < 0) left = 0;
  }

  // 是否堆疊在左下角
  if(options.minStack){
    settings.left = left;
    settings.top = win.height() - titHeight;
    hasMinLeft || ready.minStackIndex++; // 若未賦值過最小化座標，則最小化操作索引自增
    layero.attr('minLeft', left);
  }

  layero.attr('position', position);
  layer.style(index, settings, true);

  elemMin.hide();
  layero.attr('type') === 'page' && layero.find(doms[4]).hide();
  ready.restScrollbar(index);

  // 隱藏遮罩
  shadeo.hide();
};

// 還原
layer.restore = function(index){
  var layero = $('#'+ doms[0] + index);
  var shadeo = $('#'+ doms.SHADE + index);
  var area = layero.attr('area').split(',');
  var type = layero.attr('type');
  var options = layero.data('config') || {};

  layero.removeData('maxminStatus'); // 移除最大最小狀態

  // 恢復原來尺寸
  layer.style(index, {
    width: area[0], // 數值或百分比
    height: area[1],
    top: parseFloat(area[2]),
    left: parseFloat(area[3]),
    position: layero.attr('position'),
    overflow: 'visible'
  }, true);

  layero.find('.layui-layer-max').removeClass('layui-layer-maxmin');
  layero.find('.layui-layer-min').show();
  type === 'page' && layero.find(doms[4]).show();

  // 恢復頁面滾動條彈層打開時的狀態
  options.scrollbar ? ready.restScrollbar(index) : ready.setScrollbar(index);

  // 恢復遮罩
  shadeo.show();
  // ready.events.resize[index](); // ?
};

// 全屏（最大化）
layer.full = function(index){
  var layero = $('#'+ doms[0] + index);
  var maxminStatus = layero.data('maxminStatus');

  if(maxminStatus === 'max') return // 檢查當前的狀態是否已經是最大化
  if(maxminStatus === 'min') layer.restore(index); // 若當前為最小化，則先還原後再最大化

  layero.data('maxminStatus', 'max');
  ready.record(layero); // 記錄當前尺寸、座標

  if(!doms.html.attr('layer-full')){
    ready.setScrollbar(index);
  }

  setTimeout(function(){
    var isfix = layero.css('position') === 'fixed';
    layer.style(index, {
      top: isfix ? 0 : win.scrollTop(),
      left: isfix ? 0 : win.scrollLeft(),
      width: '100%',
      height: '100%'
    }, true);
    layero.find('.layui-layer-min').hide();
  }, 100);
};

// 改變 title
layer.title = function(name, index){
  var title = $('#'+ doms[0] + (index || layer.index)).find(doms[1]);
  title.html(name);
};

// 關閉 layer 總方法
layer.close = function(index, callback){
  var layero = function(){
    var closest = $('.'+ doms[0]).children('#'+ index).closest('.'+ doms[0]);
    return closest[0] ? (
      index = closest.attr('times'),
      closest
    ) : $('#'+ doms[0] + index)
  }();
  var type = layero.attr('type');
  var options = layero.data('config') || {};
  var hideOnClose = options.id && options.hideOnClose; // 是否關閉時移除彈層容器

  if(!layero[0]) return;

  // 關閉動畫
  var closeAnim = ({
    slideDown: 'layer-anim-slide-down-out',
    slideLeft: 'layer-anim-slide-left-out',
    slideUp: 'layer-anim-slide-up-out',
    slideRight: 'layer-anim-slide-right-out'
  })[options.anim] || 'layer-anim-close';

  // 移除主容器
  var remove = function(){
    var WRAP = 'layui-layer-wrap';

    // 是否關閉時隱藏彈層容器
    if(hideOnClose){
      layero.removeClass('layer-anim '+ closeAnim);
      return layero.hide();
    }

    // 是否為頁面捕獲層
    if(type === ready.type[1] && layero.attr('conType') === 'object'){
      layero.children(':not(.'+ doms[5] +')').remove();
      var wrap = layero.find('.'+WRAP);
      for(var i = 0; i < 2; i++){
        wrap.unwrap();
      }
      wrap.css('display', wrap.data('display')).removeClass(WRAP);
    } else {
      // 低版本 IE 回收 iframe
      if(type === ready.type[2]){
        try {
          var iframe = $('#'+ doms[4] + index)[0];
          iframe.contentWindow.document.write('');
          iframe.contentWindow.close();
          layero.find('.'+doms[5])[0].removeChild(iframe);
        } catch(e){}
      }
      layero[0].innerHTML = '';
      layero.remove();
    }

    typeof ready.end[index] === 'function' && ready.end[index]();
    delete ready.end[index];
    typeof callback === 'function' && callback();

    // 移除 reisze 事件
    if(ready.events.resize[index]){
      win.off('resize', ready.events.resize[index]);
      delete ready.events.resize[index];
    }
  };
  // 移除遮罩
  var removeShade = (function fn(){
    $('#'+ doms.SHADE + index)[
      hideOnClose ? 'hide' : 'remove'
    ]();
  })();

  // 是否允許關閉動畫
  if(options.isOutAnim){
    layero.addClass('layer-anim '+ closeAnim);
  }

  layer.ie == 6 && ready.reselect();
  ready.restScrollbar(index);

  // 記住被關閉層的最小化堆疊座標
  if(typeof layero.attr('minLeft') === 'string'){
    ready.minStackIndex--;
    ready.minStackArr.push(layero.attr('minLeft'));
  }

  if((layer.ie && layer.ie < 10) || !options.isOutAnim){
    remove()
  } else {
    setTimeout(function(){
      remove();
    }, 200);
  }
};

// 關閉所有層
layer.closeAll = function(type, callback){
  if(typeof type === 'function'){
    callback = type;
    type = null;
  }
  var domsElem = $('.'+doms[0]);
  $.each(domsElem, function(_index){
    var othis = $(this);
    var is = type ? (othis.attr('type') === type) : 1;
    is && layer.close(othis.attr('times'), _index === domsElem.length - 1 ? callback : null);
    is = null;
  });
  if(domsElem.length === 0) typeof callback === 'function' && callback();
};

// 根據彈層類型關閉最近打開的層
layer.closeLast = function(type){
  type = type || 'page';
  layer.close($('.layui-layer-'+ type +':last').attr("times"));
};


/*
 * 拓展模塊，layui 開始合併在一起
 */


var cache = layer.cache || {};
var skin = function(type){
  return (cache.skin ? (' ' + cache.skin + ' ' + cache.skin + '-'+type) : '');
};

// 仿系統 prompt
layer.prompt = function(options, yes){
  var style = '', placeholder = '';
  options = options || {};

  if(typeof options === 'function') yes = options;

  if(options.area){
    var area = options.area;
    style = 'style="width: '+ area[0] +'; height: '+ area[1] + ';"';
    delete options.area;
  }
  if (options.placeholder) {
    placeholder = ' placeholder="' + options.placeholder + '"';
  }
  var prompt, content = options.formType == 2 ? '<textarea class="layui-layer-input"' + style + placeholder + '></textarea>' : function () {
    return '<input type="' + (options.formType == 1 ? 'password' : 'text') + '" class="layui-layer-input"' + placeholder + '>';
  }();

  var success = options.success;
  delete options.success;

  return layer.open($.extend({
    type: 1,
    btn: ['確定','取消'],
    content: content,
    skin: 'layui-layer-prompt' + skin('prompt'),
    maxWidth: win.width(),
    success: function(layero){
      prompt = layero.find('.layui-layer-input');
      prompt.val(options.value || '').focus();
      typeof success === 'function' && success(layero);
    },
    resize: false,
    yes: function(index){
      var value = prompt.val();
      if(value.length > (options.maxlength||500)) {
        layer.tips('最多輸入'+ (options.maxlength || 500) +'個字數', prompt, {tips: 1});
      } else {
        yes && yes(value, index, prompt);
      }
    }
  }, options));
};

// tab 層
layer.tab = function(options){
  options = options || {};

  var tab = options.tab || {};
  var THIS = 'layui-this';
  var success = options.success;

  delete options.success;

  return layer.open($.extend({
    type: 1,
    skin: 'layui-layer-tab' + skin('tab'),
    resize: false,
    title: function(){
      var len = tab.length, ii = 1, str = '';
      if(len > 0){
        str = '<span class="'+ THIS +'">'+ tab[0].title +'</span>';
        for(; ii < len; ii++){
          str += '<span>'+ tab[ii].title +'</span>';
        }
      }
      return str;
    }(),
    content: '<ul class="layui-layer-tabmain">'+ function(){
      var len = tab.length, ii = 1, str = '';
      if(len > 0){
        str = '<li class="layui-layer-tabli '+ THIS +'">'+ (tab[0].content || 'no content') +'</li>';
        for(; ii < len; ii++){
          str += '<li class="layui-layer-tabli">'+ (tab[ii].content || 'no  content') +'</li>';
        }
      }
      return str;
    }() +'</ul>',
    success: function(layero){
      var btn = layero.find('.layui-layer-title').children();
      var main = layero.find('.layui-layer-tabmain').children();
      btn.on('mousedown', function(e){
        e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
        var othis = $(this), index = othis.index();
        othis.addClass(THIS).siblings().removeClass(THIS);
        main.eq(index).show().siblings().hide();
        typeof options.change === 'function' && options.change(index);
      });
      typeof success === 'function' && success(layero);
    }
  }, options));
};

// 圖片層
layer.photos = function(options, loop, key){
  var dict = {};

  // 默認屬性
  options = $.extend(true, {
    toolbar: true,
    footer: true
  }, options);

  if(!options.photos) return;

  // 若 photos 並非選擇器或 jQuery 對象，則為普通 object
  var isObject = !(typeof options.photos === 'string' || options.photos instanceof $);
  var photos = isObject ? options.photos : {};
  var data = photos.data || [];
  var start = photos.start || 0;
  var success = options.success;

  dict.imgIndex = (start|0) + 1;
  options.img = options.img || 'img';
  delete options.success;

  // 若 options.photos 不是一個對象
  if(!isObject){ // 頁面直接獲取
    var parent = $(options.photos), pushData = function(){
      data = [];
      parent.find(options.img).each(function(index){
        var othis = $(this);
        othis.attr('layer-index', index);
        data.push({
          alt: othis.attr('alt'),
          pid: othis.attr('layer-pid'),
          src: othis.attr('lay-src') || othis.attr('layer-src') || othis.attr('src'),
          thumb: othis.attr('src')
        });
      });
    };

    pushData();

    if (data.length === 0) return;

    loop || parent.on('click', options.img, function(){
      pushData();
      var othis = $(this), index = othis.attr('layer-index');
      layer.photos($.extend(options, {
        photos: {
          start: index,
          data: data,
          tab: options.tab
        },
        full: options.full
      }), true);
    });

    // 不直接彈出
    if (!loop) return;
  } else if (data.length === 0){
    return layer.msg('沒有圖片');
  }

  // 上一張
  dict.imgprev = function(key){
    dict.imgIndex--;
    if(dict.imgIndex < 1){
      dict.imgIndex = data.length;
    }
    dict.tabimg(key);
  };

  // 下一張
  dict.imgnext = function(key,errorMsg){
    dict.imgIndex++;
    if(dict.imgIndex > data.length){
      dict.imgIndex = 1;
      if (errorMsg) {return}
    }
    dict.tabimg(key)
  };

  // 方向鍵
  dict.keyup = function(event){
    if(!dict.end){
      var code = event.keyCode;
      event.preventDefault();
      if(code === 37){
        dict.imgprev(true);
      } else if(code === 39) {
        dict.imgnext(true);
      } else if(code === 27) {
        layer.close(dict.index);
      }
    }
  }

  // 切換
  dict.tabimg = function(key){
    if(data.length <= 1) return;
    photos.start = dict.imgIndex - 1;
    layer.close(dict.index);
    return layer.photos(options, true, key);
  }

  dict.isNumber = function (n) {
    return typeof n === 'number' && !isNaN(n);
  }

  dict.image = {};

  dict.getTransform = function(opts){
    var transforms = [];
    var rotate = opts.rotate;
    var scaleX = opts.scaleX;
    var scale = opts.scale;

    if (dict.isNumber(rotate) && rotate !== 0) {
      transforms.push('rotate(' + rotate + 'deg)');
    }

    if (dict.isNumber(scaleX) && scaleX !== 1) {
      transforms.push('scaleX(' + scaleX + ')');
    }

    if (dict.isNumber(scale)) {
      transforms.push('scale(' + scale + ')');
    }

    return transforms.length ? transforms.join(' ') : 'none';
  }

  // 一些動作
  dict.event = function(layero, index, that){
    dict.main.find('.layui-layer-photos-prev').on('click', function(event){
      event.preventDefault();
      dict.imgprev(true);
    });

    dict.main.find('.layui-layer-photos-next').on('click', function(event){
      event.preventDefault();
      dict.imgnext(true);
    });

    $(document).on('keyup', dict.keyup);

    // 頭部工具欄事件
    layero.off('click').on('click','*[toolbar-event]', function () {
      var othis = $(this), event = othis.attr('toolbar-event');
      switch (event) {
        case 'rotate':
          dict.image.rotate = ((dict.image.rotate || 0) + Number(othis.attr('data-option'))) % 360;
          dict.imgElem.css({
            transform: dict.getTransform(dict.image)
          });
          break;
        case 'scalex':
          dict.image.scaleX = dict.image.scaleX === -1 ? 1 : -1;
          dict.imgElem.css({
            transform: dict.getTransform(dict.image)
          });
          break;
        case 'zoom':
          var ratio = Number(othis.attr('data-option'));
          dict.image.scale = (dict.image.scale || 1) + ratio;
          // 縮小狀態最小值
          if (ratio < 0 && dict.image.scale < 0 - ratio) {
            dict.image.scale = 0 - ratio;
          }
          dict.imgElem.css({
            transform: dict.getTransform(dict.image)
          });
          break;
        case 'reset':
          dict.image.scaleX = 1;
          dict.image.scale = 1;
          dict.image.rotate = 0;
          dict.imgElem.css({
            transform: 'none'
          });
          break;
        case 'close':
          layer.close(index);
          break;
      }
      that.offset();
      that.auto(index);
    });

  };

  // 圖片預加載
  function loadImage(url, callback, error) {
    var img = new Image();
    img.src = url;
    if(img.complete){
      return callback(img);
    }
    img.onload = function(){
      img.onload = null;
      callback(img);
    };
    img.onerror = function(e){
      img.onerror = null;
      error(e);
    };
  }

  dict.loadi = layer.load(1, {
    shade: 'shade' in options ? false : 0.9,
    scrollbar: false
  });

  loadImage(data[start].src, function(img){
    layer.close(dict.loadi);

    var alt = data[start].alt || '';

    // 切換圖片時不出現動畫
    if(key) options.anim = -1;

    // 彈出圖片層
    dict.index = layer.open($.extend({
      type: 1,
      id: 'layui-layer-photos',
      area: function(){
        var imgarea = [img.width, img.height];
        var winarea = [$(window).width() - 100, $(window).height() - 100];

        // 若實際圖片的寬或者高比 屏幕大（那麼進行縮放）
        if(!options.full && (imgarea[0]>winarea[0]||imgarea[1]>winarea[1])){
          var wh = [imgarea[0]/winarea[0],imgarea[1]/winarea[1]];// 取寬度縮放比例、高度縮放比例
          if(wh[0] > wh[1]){// 取縮放比例最大的進行縮放
            imgarea[0] = imgarea[0]/wh[0];
            imgarea[1] = imgarea[1]/wh[0];
          } else if(wh[0] < wh[1]){
            imgarea[0] = imgarea[0]/wh[1];
            imgarea[1] = imgarea[1]/wh[1];
          }
        }

        return [imgarea[0]+'px', imgarea[1]+'px'];
      }(),
      title: false,
      shade: 0.9,
      shadeClose: true,
      closeBtn: false,
      move: '.layer-layer-photos-main img',
      moveType: 1,
      scrollbar: false,
      moveOut: true,
      anim: 5,
      isOutAnim: false,
      skin: 'layui-layer-photos' + skin('photos'),
      content: '<div class="layer-layer-photos-main">'
        + '<img src="'+ data[start].src +'" alt="'+ alt +'" layer-pid="'+ (data[start].pid || '') +'">'
        + function(){
          var arr = ['<div class="layui-layer-photos-pointer">'];

          // 左右箭頭翻頁
          if (data.length > 1) {
            arr.push(['<div class="layer-layer-photos-page">',
              '<span class="layui-icon layui-icon-left layui-layer-photos-prev"></span>',
              '<span class="layui-icon layui-icon-right layui-layer-photos-next"></span>',
            '</div>'].join(''));
          }

          // 頭部工具欄
          if (options.toolbar) {
            arr.push([
              '<div class="layui-layer-photos-toolbar layui-layer-photos-header">',
                '<span toolbar-event="rotate" data-option="90" title="旋轉"><i class="layui-icon layui-icon-refresh"></i></span>',
                '<span toolbar-event="scalex" title="變換"><i class="layui-icon layui-icon-slider"></i></span>',
                '<span toolbar-event="zoom" data-option="0.1" title="放大"><i class="layui-icon layui-icon-add-circle"></i></span>',
                '<span toolbar-event="zoom" data-option="-0.1" title="縮小"><i class="layui-icon layui-icon-reduce-circle"></i></span>',
                '<span toolbar-event="reset" title="還原"><i class="layui-icon layui-icon-refresh-1"></i></span>',
                '<span toolbar-event="close" title="關閉"><i class="layui-icon layui-icon-close"></i></span>',
              '</div>'
            ].join(''));
          }

          // 底部欄
          if (options.footer) {
            arr.push(['<div class="layui-layer-photos-toolbar layui-layer-photos-footer">',
              '<h3>'+ alt +'</h3>',
              '<em>'+ dict.imgIndex +' / '+ data.length +'</em>',
              '<a href="'+ data[start].src +'" target="_blank">查看原圖</a>',
            '</div>'].join(''));
          }

          arr.push('</div>');
          return arr.join('');
        }()
      +'</div>',
      success: function(layero, index, that){
        dict.main = layero.find('.layer-layer-photos-main');
        dict.footer = layero.find('.layui-layer-photos-footer');
        dict.imgElem = dict.main.children('img');
        dict.event(layero, index, that);
        options.tab && options.tab(data[start], layero);
        typeof success === 'function' && success(layero);
      }, end: function(){
        dict.end = true;
        $(document).off('keyup', dict.keyup);
      }
    }, options));
  }, function(){
    layer.close(dict.loadi);
    layer.msg('當前圖片地址異常<br>是否繼續查看下一張？', {
      time: 30000,
      btn: ['下一張', '不看了'],
      yes: function(){
        data.length > 1 && dict.imgnext(true,true);
      }
    });
  });
};

// 主入口
ready.run = function(_$){
  $ = _$;
  win = $(window);
  doms.html = $('html');
  layer.open = function(deliver){
    var o = new Class(deliver);
    return o.index;
  };
};

// 加載方式
window.layui && layui.define ? (
  layer.ready(),
  layui.define('jquery', function(exports){ // layui
    layer.path = layui.cache.dir;
    ready.run(layui.$);

    // export api
    window.layer = layer;
    exports('layer', layer);
  })
) : (
  (typeof define === 'function' && define.amd) ? define(['jquery'], function(){ // requirejs
    ready.run(window.jQuery);
    return layer;
  }) : function(){ // 普通 script 標籤引入
    layer.ready();
    ready.run(window.jQuery);
  }()
);

}(window);
