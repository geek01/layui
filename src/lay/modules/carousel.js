/**

 @Name：layui.carousel 輪播模塊
 @Author：賢心
 @License：MIT

 */

layui.define('jquery', function(exports){
  "use strict";

  var $ = layui.$
  ,hint = layui.hint()
  ,device = layui.device()

  //外部接口
  ,carousel = {
    config: {} //全局配置項

    //設置全局項
    ,set: function(options){
      var that = this;
      that.config = $.extend({}, that.config, options);
      return that;
    }

    //事件監聽
    ,on: function(events, callback){
      return layui.onevent.call(this, MOD_NAME, events, callback);
    }
  }

  //字符常量
  ,MOD_NAME = 'carousel', ELEM = '.layui-carousel', THIS = 'layui-this', SHOW = 'layui-show', HIDE = 'layui-hide', DISABLED = 'layui-disabled'

  ,ELEM_ITEM = '>*[carousel-item]>*', ELEM_LEFT = 'layui-carousel-left', ELEM_RIGHT = 'layui-carousel-right', ELEM_PREV = 'layui-carousel-prev', ELEM_NEXT = 'layui-carousel-next', ELEM_ARROW = 'layui-carousel-arrow', ELEM_IND = 'layui-carousel-ind'

  //構造器
  ,Class = function(options){
    var that = this;
    that.config = $.extend({}, that.config, carousel.config, options);
    that.render();
  };

  //默認配置
  Class.prototype.config = {
    width: '600px'
    ,height: '280px'
    ,full: false //是否全屏
    ,arrow: 'hover' //切換箭頭默認顯示狀態：hover/always/none
    ,indicator: 'inside' //指示器位置：inside/outside/none
    ,autoplay: true //是否自動切換
    ,interval: 3000 //自動切換的時間間隔，不能低於800ms
    ,anim: '' //動畫類型：default/updown/fade
    ,trigger: 'click' //指示器的觸發方式：click/hover
    ,index: 0 //初始開始的索引
  };

  //輪播渲染
  Class.prototype.render = function(){
    var that = this
    ,options = that.config;

    options.elem = $(options.elem);
    if(!options.elem[0]) return;
    that.elemItem = options.elem.find(ELEM_ITEM);

    if(options.index < 0) options.index = 0;
    if(options.index >= that.elemItem.length) options.index = that.elemItem.length - 1;
    if(options.interval < 800) options.interval = 800;

    //是否全屏模式
    if(options.full){
      options.elem.css({
        position: 'fixed'
        ,width: '100%'
        ,height: '100%'
        ,zIndex: 9999
      });
    } else {
      options.elem.css({
        width: options.width
        ,height: options.height
      });
    }

    options.elem.attr('lay-anim', options.anim);

    //初始焦點狀態
    that.elemItem.eq(options.index).addClass(THIS);

    //指示器等動作
    if(that.elemItem.length <= 1) return;
    that.indicator();
    that.arrow();
    that.autoplay();
    that.events();
  };

  //重置輪播
  Class.prototype.reload = function(options){
    var that = this;
    clearInterval(that.timer);
    that.config = $.extend({}, that.config, options);
    that.render();
  };

  //獲取上一個等待條目的索引
  Class.prototype.prevIndex = function(){
    var that = this
    ,options = that.config;

    var prevIndex = options.index - 1;
    if(prevIndex < 0){
      prevIndex = that.elemItem.length - 1;
    }
    return prevIndex;
  };

  //獲取下一個等待條目的索引
  Class.prototype.nextIndex = function(){
    var that = this
    ,options = that.config;

    var nextIndex = options.index + 1;
    if(nextIndex >= that.elemItem.length){
      nextIndex = 0;
    }
    return nextIndex;
  };

  //索引遞增
  Class.prototype.addIndex = function(num){
    var that = this
    ,options = that.config;

    num = num || 1;
    options.index = options.index + num;

    //index不能超過輪播總數量
    if(options.index >= that.elemItem.length){
      options.index = 0;
    }
  };

  //索引遞減
  Class.prototype.subIndex = function(num){
    var that = this
    ,options = that.config;

    num = num || 1;
    options.index = options.index - num;

    //index不能超過輪播總數量
    if(options.index < 0){
      options.index = that.elemItem.length - 1;
    }
  };

  //自動輪播
  Class.prototype.autoplay = function(){
    var that = this
    ,options = that.config;

    if(!options.autoplay) return;
    clearInterval(that.timer);

    that.timer = setInterval(function(){
      that.slide();
    }, options.interval);
  };

  //箭頭
  Class.prototype.arrow = function(){
    var that = this
    ,options = that.config;

    //模板
    var tplArrow = $([
      '<button class="layui-icon '+ ELEM_ARROW +'" lay-type="sub">'+ (options.anim === 'updown' ? '&#xe619;' : '&#xe603;') +'</button>'
      ,'<button class="layui-icon '+ ELEM_ARROW +'" lay-type="add">'+ (options.anim === 'updown' ? '&#xe61a;' : '&#xe602;') +'</button>'
    ].join(''));

    //預設基礎屬性
    options.elem.attr('lay-arrow', options.arrow);

    //避免重複插入
    if(options.elem.find('.'+ELEM_ARROW)[0]){
      options.elem.find('.'+ELEM_ARROW).remove();
    };
    options.elem.append(tplArrow);

    //事件
    tplArrow.on('click', function(){
      var othis = $(this)
      ,type = othis.attr('lay-type')
      that.slide(type);
    });
  };

  //指示器
  Class.prototype.indicator = function(){
    var that = this
    ,options = that.config;

    //模板
    var tplInd = that.elemInd = $(['<div class="'+ ELEM_IND +'"><ul>'
      ,function(){
        var li = [];
        layui.each(that.elemItem, function(index){
          li.push('<li'+ (options.index === index ? ' class="layui-this"' : '') +'></li>');
        });
        return li.join('');
      }()
    ,'</ul></div>'].join(''));

    //預設基礎屬性
    options.elem.attr('lay-indicator', options.indicator);

    //避免重複插入
    if(options.elem.find('.'+ELEM_IND)[0]){
      options.elem.find('.'+ELEM_IND).remove();
    };
    options.elem.append(tplInd);

    if(options.anim === 'updown'){
      tplInd.css('margin-top', -(tplInd.height()/2));
    }

    //事件
    tplInd.find('li').on(options.trigger === 'hover' ? 'mouseover' : options.trigger, function(){
      var othis = $(this)
      ,index = othis.index();
      if(index > options.index){
        that.slide('add', index - options.index);
      } else if(index < options.index){
        that.slide('sub', options.index - index);
      }
    });
  };

  //滑動切換
  Class.prototype.slide = function(type, num){
    var that = this
    ,elemItem = that.elemItem
    ,options = that.config
    ,thisIndex = options.index
    ,filter = options.elem.attr('lay-filter');

    if(that.haveSlide) return;

    //滑動方向
    if(type === 'sub'){
      that.subIndex(num);
      elemItem.eq(options.index).addClass(ELEM_PREV);
      setTimeout(function(){
        elemItem.eq(thisIndex).addClass(ELEM_RIGHT);
        elemItem.eq(options.index).addClass(ELEM_RIGHT);
      }, 50);
    } else { //默認遞增滑
      that.addIndex(num);
      elemItem.eq(options.index).addClass(ELEM_NEXT);
      setTimeout(function(){
        elemItem.eq(thisIndex).addClass(ELEM_LEFT);
        elemItem.eq(options.index).addClass(ELEM_LEFT);
      }, 50);
    };

    //移除過度類
    setTimeout(function(){
      elemItem.removeClass(THIS + ' ' + ELEM_PREV + ' ' + ELEM_NEXT + ' ' + ELEM_LEFT + ' ' + ELEM_RIGHT);
      elemItem.eq(options.index).addClass(THIS);
      that.haveSlide = false; //解鎖
    }, 300);

    //指示器焦點
    that.elemInd.find('li').eq(options.index).addClass(THIS)
    .siblings().removeClass(THIS);

    that.haveSlide = true;

    layui.event.call(this, MOD_NAME, 'change('+ filter +')', {
      index: options.index
      ,prevIndex: thisIndex
      ,item: elemItem.eq(options.index)
    });
  };

  //事件處理
  Class.prototype.events = function(){
    var that = this
    ,options = that.config;

    if(options.elem.data('haveEvents')) return;

    //移入移出容器
    options.elem.on('mouseenter', function(){
      clearInterval(that.timer);
    }).on('mouseleave', function(){
      that.autoplay();
    });

    options.elem.data('haveEvents', true);
  };

  //核心入口
  carousel.render = function(options){
    var inst = new Class(options);
    return inst;
  };

  exports(MOD_NAME, carousel);
});


