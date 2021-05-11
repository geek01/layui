/**

 @Title: rate 評分評星組件
 @License：MIT

 */

layui.define('jquery',function(exports){
  "use strict";
  var $ = layui.jquery

  //外部接口
  ,rate = {
    config: {}
    ,index: layui.rate ? (layui.rate.index + 10000) : 0

    //設置全局項
    ,set: function(options){
      var that = this;
      that.config = $.extend({}, that.config, options);
      return that;
    }

    //事件
    ,on: function(events, callback){
      return layui.onevent.call(this, MOD_NAME, events, callback);
    }
  }

  //操作當前實例
  ,thisRate = function(){
    var that = this
    ,options = that.config;

    return {
      setvalue: function(value){
        that.setvalue.call(that, value);
      }
      ,config: options
    }
  }

  //字符常量
  ,MOD_NAME = 'rate',ELEM_VIEW = 'layui-rate', ICON_RATE = 'layui-icon-rate', ICON_RATE_SOLID = 'layui-icon-rate-solid', ICON_RATE_HALF = 'layui-icon-rate-half'

  ,ICON_SOLID_HALF = 'layui-icon-rate-solid layui-icon-rate-half',  ICON_SOLID_RATE = 'layui-icon-rate-solid layui-icon-rate',  ICON_HALF_RATE = 'layui-icon-rate layui-icon-rate-half'

  //構造器
  ,Class = function(options){
    var that = this;
    that.index = ++rate.index;
    that.config = $.extend({}, that.config, rate.config, options);
    that.render();
  };

  //默認配置
  Class.prototype.config = {
    length: 5  //初始長度
    ,text: false  //是否顯示評分等級
    ,readonly: false  //是否只讀
    ,half: false  //是否可以半星
    ,value: 0 //星星選中個數
    ,theme: ''
  };

  //評分渲染
  Class.prototype.render = function(){
    var that = this
    ,options = that.config
    ,style = options.theme ? ('style="color: '+ options.theme + ';"') : '';

    options.elem = $(options.elem);

    //最大值不能大於總長度
    if(options.value > options.length){
      options.value = options.length;
    }

    //如果沒有選擇半星的屬性，卻給了小數的數值，統一向上或向下取整
    if(parseInt(options.value) !== options.value){
      if(!options.half){
        options.value = (Math.ceil(options.value) - options.value) < 0.5 ? Math.ceil(options.value): Math.floor(options.value)
      }
    }

    //組件模板
    var temp = '<ul class="layui-rate" '+ (options.readonly ? 'readonly' : '') +'>';
    for(var i = 1;i <= options.length;i++){
      var item = '<li class="layui-inline"><i class="layui-icon '
        + (i>Math.floor(options.value)?ICON_RATE:ICON_RATE_SOLID)
      + '" '+ style +'></i></li>';

      if(options.half){
        if(parseInt(options.value) !== options.value){
          if(i == Math.ceil(options.value)){
            temp = temp + '<li><i class="layui-icon layui-icon-rate-half" '+ style +'></i></li>';
          }else{
            temp = temp + item
          }
        }else{
          temp = temp + item
        }
      }else{
        temp = temp +item;
      }
    }
    temp += '</ul>' + (options.text ? ('<span class="layui-inline">'+ options.value + '星') : '') + '</span>';

    //開始插入替代元素
    var othis = options.elem
    ,hasRender = othis.next('.' + ELEM_VIEW);

    //生成替代元素
    hasRender[0] && hasRender.remove(); //如果已經渲染，則Rerender

    that.elemTemp = $(temp);

    options.span = that.elemTemp.next('span');

    options.setText && options.setText(options.value);

    othis.html(that.elemTemp);

    othis.addClass("layui-inline");

    //如果不是隻讀，那麼進行觸控事件
    if(!options.readonly) that.action();

  };

  //評分重置
  Class.prototype.setvalue = function(value){
    var that = this
    ,options = that.config ;

    options.value = value ;
    that.render();
  };

  //li觸控事件
  Class.prototype.action = function(){
    var that = this
    ,options = that.config
    ,_ul = that.elemTemp
    ,wide = _ul.find("i").width();

    _ul.children("li").each(function(index){
      var ind = index + 1
      ,othis = $(this);

      //點擊
      othis.on('click', function(e){
        //將當前點擊li的索引值賦給value
        options.value = ind;
        if(options.half){
          //獲取鼠標在li上的位置
          var x = e.pageX - $(this).offset().left;
          if(x <= wide / 2){
            options.value = options.value - 0.5;
          }
        }

        if(options.text)  _ul.next("span").text(options.value + "星");

        options.choose && options.choose(options.value);
        options.setText && options.setText(options.value);
      });

      //移入
      othis.on('mousemove', function(e){
        _ul.find("i").each(function(){
          $(this).addClass(ICON_RATE).removeClass(ICON_SOLID_HALF)
        });
        _ul.find("i:lt(" + ind + ")").each(function(){
          $(this).addClass(ICON_RATE_SOLID).removeClass(ICON_HALF_RATE)
        });
        // 如果設置可選半星，那麼判斷鼠標相對li的位置
        if(options.half){
          var x = e.pageX - $(this).offset().left;
          if(x <= wide / 2){
            othis.children("i").addClass(ICON_RATE_HALF).removeClass(ICON_RATE_SOLID)
          }
        }
      })

      //移出
      othis.on('mouseleave', function(){
        _ul.find("i").each(function(){
          $(this).addClass(ICON_RATE).removeClass(ICON_SOLID_HALF)
        });
        _ul.find("i:lt(" + Math.floor(options.value) + ")").each(function(){
          $(this).addClass(ICON_RATE_SOLID).removeClass(ICON_HALF_RATE)
        });
        //如果設置可選半星，根據分數判斷是否有半星
        if(options.half){
          if(parseInt(options.value) !== options.value){
            _ul.children("li:eq(" + Math.floor(options.value) + ")").children("i").addClass(ICON_RATE_HALF).removeClass(ICON_SOLID_RATE)
          }
        }
      })

    })
  };

  //事件處理
  Class.prototype.events = function(){
     var that = this
    ,options = that.config;
  };

  //核心入口
  rate.render = function(options){
    var inst = new Class(options);
    return thisRate.call(inst);
  };

  exports(MOD_NAME, rate);
})