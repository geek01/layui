/**
 * dropdown 
 * 下拉菜單組件
 */

layui.define(['jquery', 'laytpl', 'lay', 'util'], function(exports){
  "use strict";

  var $ = layui.$;
  var laytpl = layui.laytpl;
  var util = layui.util;
  var hint = layui.hint();
  var device = layui.device();
  var clickOrMousedown = (device.mobile ? 'touchstart' : 'mousedown');

  // 模塊名
  var MOD_NAME = 'dropdown';
  var MOD_INDEX = 'layui_'+ MOD_NAME +'_index'; // 模塊索引名
  var MOD_INDEX_OPENED = MOD_INDEX + '_opened';
  var MOD_ID = 'lay-' + MOD_NAME + '-id';

  // 外部接口
  var dropdown = {
    config: {
      customName: { // 自定義 data 字段名
        id: 'id',
        title: 'title',
        children: 'child'
      }
    },
    index: layui[MOD_NAME] ? (layui[MOD_NAME].index + 10000) : 0,

    // 設置全局項
    set: function(options){
      var that = this;
      that.config = $.extend({}, that.config, options);
      return that;
    },

    // 事件
    on: function(events, callback){
      return layui.onevent.call(this, MOD_NAME, events, callback);
    }
  };

  // 操作當前實例
  var thisModule = function(){
    var that = this;
    var options = that.config;
    var id = options.id;

    return {
      config: options,
      // 重置實例
      reload: function(options){
        that.reload.call(that, options);
      },
      reloadData: function(options){
        dropdown.reloadData(id, options);
      },
      close: function () {
        that.remove()
      },
      open: function () {
        that.render()
      }
    }
  };

  // 字符常量
  var STR_ELEM = 'layui-dropdown';
  var STR_HIDE = 'layui-hide';
  var STR_DISABLED = 'layui-disabled';
  var STR_NONE = 'layui-none';
  var STR_ITEM_UP = 'layui-menu-item-up';
  var STR_ITEM_DOWN = 'layui-menu-item-down';
  var STR_MENU_TITLE = 'layui-menu-body-title';
  var STR_ITEM_GROUP = 'layui-menu-item-group';
  var STR_ITEM_PARENT = 'layui-menu-item-parent';
  var STR_ITEM_DIV = 'layui-menu-item-divider';
  var STR_ITEM_CHECKED = 'layui-menu-item-checked';
  var STR_ITEM_CHECKED2 = 'layui-menu-item-checked2';
  var STR_MENU_PANEL = 'layui-menu-body-panel';
  var STR_MENU_PANEL_L = 'layui-menu-body-panel-left';
  var STR_ELEM_SHADE = 'layui-dropdown-shade';

  var STR_GROUP_TITLE = '.'+ STR_ITEM_GROUP + '>.'+ STR_MENU_TITLE;

  // 構造器
  var Class = function(options){
    var that = this;
    that.index = ++dropdown.index;
    that.config = $.extend({}, that.config, dropdown.config, options);
    that.init();
  };

  // 默認配置
  Class.prototype.config = {
    trigger: 'click', // 事件類型
    content: '', // 自定義菜單內容
    className: '', // 自定義樣式類名
    style: '', // 設置面板 style 屬性
    show: false, // 是否初始即顯示菜單面板
    isAllowSpread: true, // 是否允許菜單組展開收縮
    isSpreadItem: true, // 是否初始展開子菜單
    data: [], // 菜單數據結構
    delay: [200, 300], // 延時顯示或隱藏的毫秒數，若為 number 類型，則表示顯示和隱藏的延遲時間相同，trigger 為 hover 時才生效
    shade: 0, // 遮罩
    accordion: false, // 手風琴效果，僅菜單組生效。基礎菜單需要在容器上追加 'lay-accordion' 屬性。
    closeOnClick: true // 面板打開後，再次點擊目標元素時是否關閉面板。行為取決於所使用的觸發事件類型
  };

  // 重載實例
  Class.prototype.reload = function(options, type){
    var that = this;
    that.config = $.extend({}, that.config, options);
    that.init(true, type);
  };

  // 初始化準備
  Class.prototype.init = function(rerender, type){
    var that = this;
    var options = that.config;

    // 若 elem 非唯一
    var elem = $(options.elem);
    if(elem.length > 1){
      layui.each(elem, function(){
        dropdown.render($.extend({}, options, {
          elem: this
        }));
      });
      return that;
    }

    // 合併 lay-options 屬性上的配置信息
    $.extend(options, lay.options(elem[0]));

    // 若重複執行 render，則視為 reload 處理
    if(!rerender && elem.attr(MOD_ID)){
      var newThat = thisModule.getThis(elem.attr(MOD_ID));
      if(!newThat) return;
      return newThat.reload(options, type);
    }

    options.elem = $(options.elem);
    options.target = $('body'); // 後續考慮開放 target 元素

    // 初始化 id 屬性 - 優先取 options > 元素 id > 自增索引
    options.id = 'id' in options ? options.id : (
      elem.attr('id') || that.index
    );

    thisModule.that[options.id] = that; // 記錄當前實例對象
    elem.attr(MOD_ID, options.id); // 目標元素已渲染過的標記

    // 初始化自定義字段名
    options.customName = $.extend({}, dropdown.config.customName, options.customName);

    // 若傳入 hover，則解析為 mouseenter
    if (options.trigger === 'hover') {
      options.trigger = 'mouseenter';
    }

    // 初始即顯示或者面板彈出之後執行了刷新數據
    if(options.show || (type === 'reloadData' && that.mainElem && options.target.find(that.mainElem.get(0)).length)) that.render(type);

    // 事件
    that.events();
  };

  // 渲染
  Class.prototype.render = function(type) {
    var that = this;
    var options = that.config;
    var customName = options.customName;

    // 默認菜單內容
    var getDefaultView = function(){
      var elemUl = $('<ul class="layui-menu layui-dropdown-menu"></ul>');
      if(options.data.length > 0 ){
        eachItemView(elemUl, options.data)
      } else {
        elemUl.html('<li class="layui-menu-item-none">暫無數據</li>');
      }
      return elemUl;
    };

    // 遍歷菜單項
    var eachItemView = function(views, data){
      // var views = [];

      layui.each(data, function(index, item){
        // 是否存在子級
        var isChild = item[customName.children] && item[customName.children].length > 0;
        var isSpreadItem = ('isSpreadItem' in item) ? item.isSpreadItem : options.isSpreadItem
        var title = function(title){
          var templet = item.templet || options.templet;
          if(templet){
            title = typeof templet === 'function'
              ? templet(item)
            : laytpl(templet).render(item);
          }
          return title;
        }(util.escape(item[customName.title]));

        // 初始類型
        var type = function(){
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

        if(type !== '-' && (!item[customName.title] && !item[customName.id] && !isChild)) return;

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
          return item.disabled ? ' class="'+ STR_DISABLED +'"' : '';
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
          var elemPanel = $('<div class="layui-panel layui-menu-body-panel"></div>');
          var elemUl = $('<ul></ul>');

          if(type === 'parent'){
            elemPanel.append(eachItemView(elemUl, item[customName.children]));
            viewLi.append(elemPanel);
          } else {
            viewLi.append(eachItemView(elemUl, item[customName.children]));
          }
        }

        views.append(viewLi);
      });
      return views;
    };

    // 主模板
    var TPL_MAIN = [
      '<div class="layui-dropdown layui-border-box layui-panel layui-anim layui-anim-downbit" ' + MOD_ID + '="' + options.id + '">',
      '</div>'
    ].join('');

    // 重載或插入面板內容
    var content = options.content || getDefaultView();
    var mainElemExisted = thisModule.findMainElem(options.id);
    if (type === 'reloadData' && mainElemExisted.length) { // 是否僅重載數據
      var mainElem = that.mainElem = mainElemExisted;
      mainElemExisted.html(content);
    } else { // 常規渲染
      var mainElem = that.mainElem = $(TPL_MAIN);
      mainElem.append(content);

      // 初始化某些屬性
      mainElem.addClass(options.className);
      mainElem.attr('style', options.style);

      // 辭舊迎新
      that.remove(dropdown.thisId);
      options.target.append(mainElem);
      options.elem.data(MOD_INDEX_OPENED, true); // 面板已打開的標記

      // 遮罩
      var shade = options.shade ? ('<div class="'+ STR_ELEM_SHADE +'" style="'+ ('z-index:'+ (mainElem.css('z-index')-1) +'; background-color: ' + (options.shade[1] || '#000') + '; opacity: ' + (options.shade[0] || options.shade)) +'"></div>') : '';
      mainElem.before(shade);

      // 如果是鼠標移入事件，則鼠標移出時自動關閉
      if(options.trigger === 'mouseenter'){
        mainElem.on('mouseenter', function(){
          clearTimeout(thisModule.timer);
        }).on('mouseleave', function(){
          that.delayRemove();
        });
      }
    }

    that.position(); // 定位座標
    dropdown.thisId = options.id; // 當前打開的面板 id

    // 阻止全局事件
    mainElem.find('.layui-menu').on(clickOrMousedown, function(e){
      layui.stope(e);
    });

    // 觸發菜單列表事件
    mainElem.find('.layui-menu li').on('click', function(e){
      var othis = $(this);
      var data = othis.data('item') || {};
      var isChild = data[customName.children] && data[customName.children].length > 0;
      var isClickAllScope = options.clickScope === 'all'; // 是否所有父子菜單均觸發點擊事件

      if(data.disabled) return; // 菜單項禁用狀態

      // 普通菜單項點擊後的回調及關閉面板
      if((!isChild || isClickAllScope) && data.type !== '-'){
        var ret = typeof options.click === 'function'
          ? options.click(data, othis, e)
        : null;

        ret === false || (isChild || that.remove());
        layui.stope(e);
      }
    });

    // 觸發菜單組展開收縮
    mainElem.find(STR_GROUP_TITLE).on('click', function(e){
      var othis = $(this);
      var elemGroup = othis.parent();
      var data = elemGroup.data('item') || {};

      if(data.type === 'group' && options.isAllowSpread){
        thisModule.spread(elemGroup, options.accordion);
      }
    });

    // 組件打開完畢的事件
    typeof options.ready === 'function' && options.ready(mainElem, options.elem);
  };

  // 位置定位
  Class.prototype.position = function(obj){
    var that = this;
    var options = that.config;

    lay.position(options.elem[0], that.mainElem[0], {
      position: options.position,
      e: that.e,
      clickType: options.trigger === 'contextmenu' ? 'right' : null,
      align: options.align || null
    });
  };

  // 移除面板
  Class.prototype.remove = function(id) {
    id = id || this.config.id;
    var that = thisModule.getThis(id); // 根據 id 查找對應的實例
    if (!that) return;

    var options = that.config;
    var mainElem = thisModule.findMainElem(id);

    // 若存在已打開的面板元素，則移除
    if (mainElem[0]) {
      mainElem.prev('.' + STR_ELEM_SHADE).remove(); // 先移除遮罩
      mainElem.remove();
      options.elem.removeData(MOD_INDEX_OPENED);
      delete dropdown.thisId;
      typeof options.close === 'function' && options.close(options.elem);
    }
  };

  Class.prototype.normalizedDelay = function(){
    var that = this;
    var options = that.config;
    var delay = [].concat(options.delay);

    return {
      show: delay[0],
      hide: delay[1] !== undefined ? delay[1] : delay[0]
    }
  }

  // 延遲移除面板
  Class.prototype.delayRemove = function(){
    var that = this;
    var options = that.config;
    clearTimeout(thisModule.timer);

    thisModule.timer = setTimeout(function(){
      that.remove();
    }, that.normalizedDelay().hide);
  };

  // 事件
  Class.prototype.events = function(){
    var that = this;
    var options = that.config;

    // 是否鼠標移入時觸發
    var isMouseEnter = options.trigger === 'mouseenter';
    var trigger = options.trigger + '.lay_dropdown_render';

    // 始終先解除上一個觸發元素的事件（如重載時改變 elem 的情況）
    if (that.thisEventElem) that.thisEventElem.off(trigger);
    that.thisEventElem = options.elem;

    // 觸發元素事件
    options.elem.off(trigger).on(trigger, function(e) {
      clearTimeout(thisModule.timer);
      that.e = e;

      // 主面板是否已打開
      var opened = options.elem.data(MOD_INDEX_OPENED);

      // 若為鼠標移入事件，則延遲觸發
      if (isMouseEnter) {
        if (!opened) {
          thisModule.timer = setTimeout(function(){
            that.render();
          }, that.normalizedDelay().show);
        }
      } else {
        // 若為 click 事件，則根據主面板狀態，自動切換打開與關閉
        if (options.closeOnClick && opened && options.trigger === 'click') {
          that.remove();
        } else {
          that.render();
        }
      }

      e.preventDefault();
    });

    // 如果是鼠標移入事件
    if (isMouseEnter) {
      // 執行鼠標移出事件
      options.elem.on('mouseleave', function(){
        that.delayRemove();
      });
    }
  };

  // 記錄所有實例
  thisModule.that = {}; // 記錄所有實例對象

  // 獲取當前實例對象
  thisModule.getThis = function(id) {
    if (id === undefined) {
      throw new Error('ID argument required');
    }
    return thisModule.that[id];
  };

  // 根據 id 從頁面查找組件主面板元素
  thisModule.findMainElem = function(id) {
    return $('.' + STR_ELEM + '[' + MOD_ID + '="' + id + '"]');
  };

  // 設置菜單組展開和收縮狀態
  thisModule.spread = function(othis, isAccordion){
    var contentElem = othis.children('ul');
    var needSpread = othis.hasClass(STR_ITEM_UP);
    var ANIM_MS = 200;

    // 動畫執行完成後的操作
    var complete = function() {
      $(this).css({'display': ''}); // 剔除臨時 style，以適配外部樣式的狀態重置;
    };

    // 動畫是否正在執行
    if (contentElem.is(':animated')) return;

    // 展開
    if (needSpread) {
      othis.removeClass(STR_ITEM_UP).addClass(STR_ITEM_DOWN);
      contentElem.hide().stop().slideDown(ANIM_MS, complete);
    } else { // 收縮
      contentElem.stop().slideUp(ANIM_MS, complete);
      othis.removeClass(STR_ITEM_DOWN).addClass(STR_ITEM_UP);
    }

    // 手風琴
    if (needSpread && isAccordion) {
      var groupSibs = othis.siblings('.' + STR_ITEM_DOWN);
      groupSibs.children('ul').stop().slideUp(ANIM_MS, complete);
      groupSibs.removeClass(STR_ITEM_DOWN).addClass(STR_ITEM_UP);
    }
  };

  // 全局事件
  (function(){
    var _WIN = $(window);
    var _DOC = $(document);

    // 自適應定位
    _WIN.on('resize', function(){
      if(!dropdown.thisId) return;
      var that = thisModule.getThis(dropdown.thisId);
      if(!that) return;

      if((that.mainElem && !that.mainElem[0]) || !$('.'+ STR_ELEM)[0]){
        return false;
      }

      var options = that.config;

      if(options.trigger === 'contextmenu'){
        that.remove();
      } else {
        that.position();
      }
    });



    // 點擊任意處關閉
    lay(_DOC).on(clickOrMousedown, function(e){
      if(!dropdown.thisId) return;
      var that = thisModule.getThis(dropdown.thisId)
      if(!that) return;

      var options = that.config;
      var isTopElem = lay.isTopElem(options.elem[0]);
      var isCtxMenu = options.trigger === 'contextmenu';

      // 若觸發的是綁定的元素，或者屬於綁定元素的子元素，則不關閉
      // 滿足條件：當前綁定的元素是 body document，或者是鼠標右鍵事件時，忽略綁定元素
      var isTriggerTarget = !(isTopElem || isCtxMenu) && (options.elem[0] === e.target || options.elem.find(e.target)[0]);
      var isPanelTarget = that.mainElem && (e.target === that.mainElem[0] || that.mainElem.find(e.target)[0]);
      if(isTriggerTarget || isPanelTarget) return;
      // 處理移動端點擊穿透問題
      if(e.type === 'touchstart' && options.elem.data(MOD_INDEX_OPENED)){
        $(e.target).hasClass(STR_ELEM_SHADE) && e.preventDefault();
      }

      // 點擊 dropdown 外部時的回調
      if(typeof options.onClickOutside === 'function'){
        var shouldClose = options.onClickOutside(e);
        if(shouldClose === false) return;
      }

      that.remove();
    }, {passive: false});

    // 基礎菜單的靜態元素事件
    var ELEM_LI = '.layui-menu:not(.layui-dropdown-menu) li';
    _DOC.on('click', ELEM_LI, function(e){
      var othis = $(this);
      var parent = othis.parents('.layui-menu').eq(0);
      var isChild = othis.hasClass(STR_ITEM_GROUP) || othis.hasClass(STR_ITEM_PARENT);
      var filter = parent.attr('lay-filter') || parent.attr('id');
      var options = lay.options(this);

      // 非觸發元素
      if(othis.hasClass(STR_ITEM_DIV)) return;

      // 非菜單組
      if(!isChild){
        // 選中
        parent.find('.'+ STR_ITEM_CHECKED).removeClass(STR_ITEM_CHECKED); // 清除選中樣式
        parent.find('.'+ STR_ITEM_CHECKED2).removeClass(STR_ITEM_CHECKED2); // 清除父級菜單選中樣式
        othis.addClass(STR_ITEM_CHECKED); //添加選中樣式
        othis.parents('.'+ STR_ITEM_PARENT).addClass(STR_ITEM_CHECKED2); // 添加父級菜單選中樣式

        options.title = options.title || $.trim(othis.children('.'+ STR_MENU_TITLE).text());

        // 觸發事件
        layui.event.call(this, MOD_NAME, 'click('+ filter +')', options);
      }
    });

    // 基礎菜單的展開收縮事件
    _DOC.on('click', (ELEM_LI + STR_GROUP_TITLE), function(e){
      var othis = $(this);
      var elemGroup = othis.parents('.'+ STR_ITEM_GROUP +':eq(0)');
      var options = lay.options(elemGroup[0]);
      var isAccordion = typeof othis.parents('.layui-menu').eq(0).attr('lay-accordion') === 'string';

      if(('isAllowSpread' in options) ? options.isAllowSpread : true){
        thisModule.spread(elemGroup, isAccordion);
      }
    });

    // 判斷子級菜單是否超出屏幕
    var ELEM_LI_PAR = '.layui-menu .'+ STR_ITEM_PARENT
    _DOC.on('mouseenter', ELEM_LI_PAR, function(e){
      var othis = $(this);
      var elemPanel = othis.find('.'+ STR_MENU_PANEL);

      if(!elemPanel[0]) return;
      var rect = elemPanel[0].getBoundingClientRect();

      // 是否超出右側屏幕
      if(rect.right > _WIN.width()){
        elemPanel.addClass(STR_MENU_PANEL_L);
        // 不允許超出左側屏幕
        rect = elemPanel[0].getBoundingClientRect();
        if(rect.left < 0){
          elemPanel.removeClass(STR_MENU_PANEL_L);
        }
      }

      // 是否超出底部屏幕
      if(rect.bottom > _WIN.height()){
        elemPanel.eq(0).css('margin-top', -(rect.bottom - _WIN.height() + 5));
      }
    }).on('mouseleave', ELEM_LI_PAR, function(e){
      var othis = $(this)
      var elemPanel = othis.children('.'+ STR_MENU_PANEL);

      elemPanel.removeClass(STR_MENU_PANEL_L);
      elemPanel.css('margin-top', 0);
    });

  })();

  // 關閉面板
  dropdown.close = function(id){
    var that = thisModule.getThis(id);
    if(!that) return this;

    that.remove();
    return thisModule.call(that);
  };

  // 打開面板
  dropdown.open = function(id){
    var that = thisModule.getThis(id);
    if(!that) return this;

    that.render();
    return thisModule.call(that);
  }

  // 重載實例
  dropdown.reload = function(id, options, type){
    var that = thisModule.getThis(id);
    if(!that) return this;

    that.reload(options, type);
    return thisModule.call(that);
  };

  // 僅重載數據
  dropdown.reloadData = function(){
    var args = $.extend([], arguments);
    args[2] = 'reloadData';

    // 重載時，與數據相關的參數
    var dataParams = new RegExp('^('+ [
      'data', 'templet', 'content'
    ].join('|') + ')$');

    // 過濾與數據無關的參數
    layui.each(args[1], function (key, value) {
      if(!dataParams.test(key)){
        delete args[1][key];
      }
    });

    return dropdown.reload.apply(null, args);
  };

  // 核心入口
  dropdown.render = function(options){
    var inst = new Class(options);
    return thisModule.call(inst);
  };

  exports(MOD_NAME, dropdown);
});
