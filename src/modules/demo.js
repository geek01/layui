
/*!
 * MODULE_DEMO_NAME 模塊組件通用結構
 * MIT Licensed
 */

layui.define([''], function(exports){
  "use strict";

  var $ = layui.$

  //模塊名
  ,MOD_NAME = 'MODULE_DEMO_NAME'
  ,MOD_INDEX = 'layui_'+ MOD_NAME +'_index' //模塊索引名

  //外部接口
  ,MODULE_DEMO_NAME = {
    config: {}
    ,index: layui[MOD_NAME] ? (layui[MOD_NAME].index + 10000) : 0

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
  ,thisModule = function(){
    var that = this
    ,options = that.config
    ,id = options.id || that.index;

    thisModule.that[id] = that; //記錄當前實例對象

    return {
      config: options
      //重置實例
      ,reload: function(options){
        that.reload.call(that, options);
      }
    }
  }

  //字符常量
  ,STR_ELEM = 'layui-MODULE_DEMO_NAME', STR_HIDE = 'layui-hide', STR_DISABLED = 'layui-disabled', STR_NONE = 'layui-none'

  //主模板
  ,TPL_MAIN = [''].join('')

  //構造器
  ,Class = function(options){
    var that = this;
    that.index = ++MODULE_DEMO_NAME.index;
    that.config = $.extend({}, that.config, MODULE_DEMO_NAME.config, options);
    that.render();
  };

  //默認配置
  Class.prototype.config = {

  };

  //重載實例
  Class.prototype.reload = function(options){
    var that = this;

    layui.each(options, function(key, item){
      if(item.constructor === Array) delete that.config[key];
    });

    that.config = $.extend(true, {}, that.config, options);
    that.render();
  };

  //渲染
  Class.prototype.render = function(){
    var that = this
    ,options = that.config;

    //解析模板
    var thisElem = that.elem = $(laytpl(TPL_MAIN).render({
      data: options
      ,index: that.index //索引
    }));

    var othis = options.elem = $(options.elem);
    if(!othis[0]) return;



    that.events(); //事件
  };

  //事件
  Class.prototype.events = function(){
    var that = this
    ,options = that.config;


  };

  //記錄所有實例
  thisModule.that = {}; //記錄所有實例對象

  //獲取當前實例對象
  thisModule.getThis = function(id){
    var that = thisModule.that[id];
    if(!that) hint.error(id ? (MOD_NAME +' instance with ID \''+ id +'\' not found') : 'ID argument required');
    return that
  };

  //重載實例
  MODULE_DEMO_NAME.reload = function(id, options){
    var that = thisModule.that[id];
    that.reload(options);

    return thisModule.call(that);
  };

  //核心入口
  MODULE_DEMO_NAME.render = function(options){
    var inst = new Class(options);
    return thisModule.call(inst);
  };

  exports(MOD_NAME, MODULE_DEMO_NAME);
});
