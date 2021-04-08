/**

 @Name：dropdown 下拉菜單組件
 @License：MIT

 */

layui.define(['jquery', 'laytpl', 'lay'], function(exports){
  "use strict";

  var $ = layui.$
  ,laytpl = layui.laytpl
  ,hint = layui.hint()
  ,device = layui.device()
  ,clickOrMousedown = (device.mobile ? 'click' : 'mousedown')

  //模塊名
  ,MOD_NAME = 'dropdown'
  ,MOD_INDEX = 'layui_'+ MOD_NAME +'_index' //模塊索引名

  //外部接口
  ,dropdown = {
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
    ,id = options.id;

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
  ,STR_ELEM = 'layui-dropdown', STR_HIDE = 'layui-hide', STR_DISABLED = 'layui-disabled', STR_NONE = 'layui-none'
  ,STR_ITEM_UP = 'layui-menu-item-up', STR_ITEM_DOWN = 'layui-menu-item-down', STR_MENU_TITLE = 'layui-menu-body-title', STR_ITEM_GROUP = 'layui-menu-item-group', STR_ITEM_PARENT = 'layui-menu-item-parent', STR_ITEM_DIV = 'layui-menu-item-divider', STR_ITEM_CHECKED = 'layui-menu-item-checked', STR_ITEM_CHECKED2 = 'layui-menu-item-checked2', STR_MENU_PANEL = 'layui-menu-body-panel', STR_MENU_PANEL_L = 'layui-menu-body-panel-left'

  ,STR_GROUP_TITLE = '.'+ STR_ITEM_GROUP + '>.'+ STR_MENU_TITLE

  //構造器
  ,Class = function(options){
    var that = this;
    that.index = ++dropdown.index;
    that.config = $.extend({}, that.config, dropdown.config, options);
    that.init();
  };

  //默認配置
  Class.prototype.config = {
    trigger: 'click' //事件類型
    ,content: '' //自定義菜單內容
    ,className: '' //自定義樣式類名
    ,style: '' //設置面板 style 屬性
    ,show: false //是否初始即顯示菜單面板
    ,isAllowSpread: true //是否允許菜單組展開收縮
    ,isSpreadItem: true //是否初始展開子菜單
    ,data: [] //菜單數據結構
    ,delay: 300 //延遲關閉的毫秒數，若 trigger 為 hover 時才生效
  };

  //重載實例
  Class.prototype.reload = function(options){
    var that = this;
    that.config = $.extend({}, that.config, options);
    that.init(true);
  };

  //初始化準備
  Class.prototype.init = function(rerender){
    var that = this
    ,options = that.config
    ,elem = options.elem = $(options.elem);

    //若 elem 非唯一
    if(elem.length > 1){
      layui.each(elem, function(){
        dropdown.render($.extend({}, options, {
          elem: this
        }));
      });
      return that;
    }

    //若重複執行 render，則視為 reload 處理
    if(!rerender && elem[0] && elem.data(MOD_INDEX)){;
      var newThat = thisModule.getThis(elem.data(MOD_INDEX));
      if(!newThat) return;

      return newThat.reload(options);
    };

    //初始化 id 參數
    options.id = ('id' in options) ? options.id : that.index;

    if(options.show) that.render(rerender); //初始即顯示
    that.events(); //事件
  };

  //渲染
  Class.prototype.render = function(rerender){
    var that = this
    ,options = that.config
    ,elemBody = $('body')

    //默認菜單內容
    ,getDefaultView = function(){
      var elemUl = $('<ul class="layui-menu layui-dropdown-menu"></ul>');
      if(options.data.length > 0 ){
        eachItemView(elemUl, options.data)
      } else {
        elemUl.html('<li class="layui-menu-item-none">no menu</li>');
      }
      return elemUl;
    }

    //遍歷菜單項
    ,eachItemView = function(views, data){
      //var views = [];
      layui.each(data, function(index, item){
        //是否存在子級
        var isChild = item.child && item.child.length > 0
        ,isSpreadItem = ('isSpreadItem' in item) ? item.isSpreadItem : options.isSpreadItem
        ,title = item.templet
          ? laytpl(item.templet).render(item)
        : (options.templet ? laytpl(options.templet).render(item) : item.title)

        //初始類型
        ,type = function(){
          if(isChild){
            item.type = item.type || 'parent';
          }
          if(item.type){
            return ({
              group: 'group'
              ,parent: 'parent'
              ,'-': '-'
            })[item.type] || 'parent';
          }
          return '';
        }();

        if(type !== '-' && (!item.title && !item.id && !isChild)) return;

        //列表元素
        var viewLi = $(['<li'+ function(){
          var className = {
            group: 'layui-menu-item-group'+ (
              options.isAllowSpread ? (
                isSpreadItem ? ' layui-menu-item-down' : ' layui-menu-item-up'
              ) : ''
            )
            ,parent: STR_ITEM_PARENT
            ,'-': 'layui-menu-item-divider'
          };
          if(isChild || type){
            return ' class="'+ className[type] +'"';
          }
          return '';
        }() +'>'

          //標題區
          ,function(){
            //是否超文本
            var viewText = ('href' in item) ? (
              '<a href="'+ item.href +'" target="'+ (item.target || '_self') +'">'+ title +'</a>'
            ) : title;

            //是否存在子級
            if(isChild){
              return '<div class="'+ STR_MENU_TITLE +'">'+ viewText + function(){
                if(type === 'parent'){
                  return '<i class="layui-icon layui-icon-right"></i>';
                } else if(type === 'group' && options.isAllowSpread){
                  return '<i class="layui-icon layui-icon-'+ (isSpreadItem ? 'up' : 'down') +'"></i>';
                } else {
                  return '';
                }
              }() +'</div>'

            }
            return '<div class="'+ STR_MENU_TITLE +'">'+ viewText +'</div>';
          }()
        ,'</li>'].join(''));

        viewLi.data('item', item);

        //子級區
        if(isChild){
          var elemPanel = $('<div class="layui-panel layui-menu-body-panel"></div>')
          ,elemUl = $('<ul></ul>');

          if(type === 'parent'){
            elemPanel.append(eachItemView(elemUl, item.child));
            viewLi.append(elemPanel);
          } else {
            viewLi.append(eachItemView(elemUl, item.child));
          }
        }

        views.append(viewLi);
      });
      return views;
    }

    //主模板
    ,TPL_MAIN = ['<div class="layui-dropdown layui-border-box layui-panel layui-anim layui-anim-downbit">'
    ,'</div>'].join('');

    //如果是右鍵事件，則每次觸發事件時，將允許重新渲染
    if(options.trigger === 'contextmenu' || lay.isTopElem(options.elem[0])) rerender = true;

    //判斷是否已經打開了下拉菜單面板
    if(!rerender && options.elem.data(MOD_INDEX +'_opened')) return;

    //記錄模板對象
    that.elemView = $(TPL_MAIN);
    that.elemView.append(options.content || getDefaultView());

    //初始化某些屬性
    if(options.className) that.elemView.addClass(options.className);
    if(options.style) that.elemView.attr('style', options.style);


    //記錄當前執行的實例索引
    dropdown.thisId = options.id;

    //插入視圖
    that.remove(); //移除非當前綁定元素的面板
    elemBody.append(that.elemView);
    options.elem.data(MOD_INDEX +'_opened', true);

    //座標定位
    that.position();
    thisModule.prevElem = that.elemView; //記錄當前打開的元素，以便在下次關閉
    thisModule.prevElem.data('prevElem', options.elem); //將當前綁定的元素，記錄在打開元素的 data 對象中

    //阻止全局事件
    that.elemView.find('.layui-menu').on(clickOrMousedown, function(e){
      lay.stope(e);
    });

    //觸發菜單列表事件
    that.elemView.find('.layui-menu li').on('click', function(e){
      var othis = $(this)
      ,data = othis.data('item') || {}
      ,isChild = data.child && data.child.length > 0;

      if(!isChild && data.type !== '-'){
        that.remove();
        typeof options.click === 'function' && options.click(data, othis);
      }
    });

    //觸發菜單組展開收縮
    that.elemView.find(STR_GROUP_TITLE).on('click', function(e){
      var othis = $(this)
      ,elemGroup = othis.parent()
      ,data = elemGroup.data('item') || {}

      if(data.type === 'group' && options.isAllowSpread){
        thisModule.spread(elemGroup);
      }
    });

    //如果是鼠標移入事件，則鼠標移出時自動關閉
    if(options.trigger === 'mouseenter'){
      that.elemView.on('mouseenter', function(){
        clearTimeout(thisModule.timer);
      }).on('mouseleave', function(){
        that.delayRemove();
      });
    }

  };

  //位置定位
  Class.prototype.position = function(obj){
    var that = this
    ,options = that.config;

    lay.position(options.elem[0], that.elemView[0], {
      position: options.position
      ,e: that.e
      ,clickType: options.trigger === 'contextmenu' ? 'right' : null
    });
  };

  //刪除視圖
  Class.prototype.remove = function(){
    var that = this
    ,options = that.config
    ,elemPrev = thisModule.prevElem;

    //若存在已打開的面板元素，則移除
    if(elemPrev){
      elemPrev.data('prevElem') && (
        elemPrev.data('prevElem').data(MOD_INDEX +'_opened', false)
      );
      elemPrev.remove();
    }
  };

  //延遲刪除視圖
  Class.prototype.delayRemove = function(){
    var that = this
    ,options = that.config;
    clearTimeout(thisModule.timer);

    thisModule.timer = setTimeout(function(){
      that.remove();
    }, options.delay);
  };

  //事件
  Class.prototype.events = function(){
    var that = this
    ,options = that.config;

    //如果傳入 hover，則解析為 mouseenter
    if(options.trigger === 'hover') options.trigger = 'mouseenter';

    //解除上一個事件
    if(that.prevElem) that.prevElem.off(options.trigger, that.prevElemCallback);

    //記錄被綁定的元素及回調
    that.prevElem = options.elem;
    that.prevElemCallback = function(e){
      clearTimeout(thisModule.timer);
      that.e = e;
      that.render();
      e.preventDefault();

      //組件打開完畢的時間
      typeof options.ready === 'function' && options.ready(that.elemView, options.elem, that.e.target);
    };

    //觸發元素事件
    options.elem.on(options.trigger, that.prevElemCallback);

    //如果是鼠標移入事件
    if(options.trigger === 'mouseenter'){
      //直行鼠標移出事件
      options.elem.on('mouseleave', function(){
        that.delayRemove();
      });
    }
  };

  //記錄所有實例
  thisModule.that = {}; //記錄所有實例對象

  //獲取當前實例對象
  thisModule.getThis = function(id){
    var that = thisModule.that[id];
    if(!that) hint.error(id ? (MOD_NAME +' instance with ID \''+ id +'\' not found') : 'ID argument required');
    return that;
  };

  //設置菜單組展開和收縮狀態
  thisModule.spread = function(othis){
    //菜單組展開和收縮
    var elemIcon = othis.children('.'+ STR_MENU_TITLE).find('.layui-icon');
    if(othis.hasClass(STR_ITEM_UP)){
      othis.removeClass(STR_ITEM_UP).addClass(STR_ITEM_DOWN);
      elemIcon.removeClass('layui-icon-down').addClass('layui-icon-up');
    } else {
      othis.removeClass(STR_ITEM_DOWN).addClass(STR_ITEM_UP);
      elemIcon.removeClass('layui-icon-up').addClass('layui-icon-down')
    }
  };

  //全局事件
  ;!function(){
    var _WIN = $(window)
    ,_DOC = $(document);

    //自適應定位
    _WIN.on('resize', function(){
      if(!dropdown.thisId) return;
      var that = thisModule.getThis(dropdown.thisId);
      if(!that) return;

      if(!that.elemView[0] || !$('.'+ STR_ELEM)[0]){
        return false;
      }

      var options = that.config;

      if(options.trigger === 'contextmenu'){
        that.remove();
      } else {
        that.position();
      }
    });



    //點擊任意處關閉
    _DOC.on(clickOrMousedown, function(e){
      if(!dropdown.thisId) return;
      var that = thisModule.getThis(dropdown.thisId)
      if(!that) return;

      var options = that.config;

      //如果觸發的是綁定的元素，或者屬於綁定元素的子元素，則不關閉
      //滿足條件：當前綁定的元素不是 body document，或者不是鼠標右鍵事件
      if(!(lay.isTopElem(options.elem[0]) || options.trigger === 'contextmenu')){
        if(
          e.target === options.elem[0] ||
          options.elem.find(e.target)[0] ||
          e.target === that.elemView[0] ||
          (that.elemView && that.elemView.find(e.target)[0])
        ) return;
      }

      that.remove();
    });

    //基礎菜單的靜態元素事件
    var ELEM_LI = '.layui-menu:not(.layui-dropdown-menu) li';
    _DOC.on('click', ELEM_LI, function(e){
      var othis = $(this)
      ,parent = othis.parents('.layui-menu').eq(0)
      ,isChild = othis.hasClass(STR_ITEM_GROUP) || othis.hasClass(STR_ITEM_PARENT)
      ,filter = parent.attr('lay-filter') || parent.attr('id')
      ,options = lay.options(this);

      //非觸發元素
      if(othis.hasClass(STR_ITEM_DIV)) return;

      //非菜單組
      if(!isChild){
        //選中
        parent.find('.'+ STR_ITEM_CHECKED).removeClass(STR_ITEM_CHECKED); //清除選中樣式
        parent.find('.'+ STR_ITEM_CHECKED2).removeClass(STR_ITEM_CHECKED2); //清除父級菜單選中樣式
        othis.addClass(STR_ITEM_CHECKED); //添加選中樣式
        othis.parents('.'+ STR_ITEM_PARENT).addClass(STR_ITEM_CHECKED2); //添加父級菜單選中樣式

        //觸發事件
        layui.event.call(this, MOD_NAME, 'click('+ filter +')', options);
      }
    });

    //基礎菜單的展開收縮事件
    _DOC.on('click', (ELEM_LI + STR_GROUP_TITLE), function(e){
      var othis = $(this)
      ,elemGroup = othis.parents('.'+ STR_ITEM_GROUP +':eq(0)')
      ,options = lay.options(elemGroup[0]);

      if(('isAllowSpread' in options) ? options.isAllowSpread : true){
        thisModule.spread(elemGroup);
      };
    });

    //判斷子級菜單是否超出屏幕
    var ELEM_LI_PAR = '.layui-menu .'+ STR_ITEM_PARENT
    _DOC.on('mouseenter', ELEM_LI_PAR, function(e){
      var othis = $(this)
      ,elemPanel = othis.find('.'+ STR_MENU_PANEL);

      if(!elemPanel[0]) return;
      var rect = elemPanel[0].getBoundingClientRect();

      //是否超出右側屏幕
      if(rect.right > _WIN.width()){
        elemPanel.addClass(STR_MENU_PANEL_L);
        //不允許超出左側屏幕
        rect = elemPanel[0].getBoundingClientRect();
        if(rect.left < 0){
          elemPanel.removeClass(STR_MENU_PANEL_L);
        }
      }

      //是否超出底部屏幕
      if(rect.bottom > _WIN.height()){
        elemPanel.eq(0).css('margin-top', -(rect.bottom - _WIN.height()));
      };
    }).on('mouseleave', ELEM_LI_PAR, function(e){
      var othis = $(this)
      ,elemPanel = othis.children('.'+ STR_MENU_PANEL);

      elemPanel.removeClass(STR_MENU_PANEL_L);
      elemPanel.css('margin-top', 0);
    });

  }();

  //重載實例
  dropdown.reload = function(id, options){
    var that = thisModule.getThis(id);
    if(!that) return this;

    that.reload(options);
    return thisModule.call(that);
  };

  //核心入口
  dropdown.render = function(options){
    var inst = new Class(options);
    return thisModule.call(inst);
  };

  exports(MOD_NAME, dropdown);
});
