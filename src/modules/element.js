/**
 * element
 * 常用元素操作組件
 */

layui.define('jquery', function(exports){
  'use strict';

  var $ = layui.$;
  var hint = layui.hint();
  var device = layui.device();

  var MOD_NAME = 'element';
  var THIS = 'layui-this';
  var SHOW = 'layui-show';
  var TITLE = '.layui-tab-title';

  var Element = function(){
    this.config = {};
  };

  // 全局設置
  Element.prototype.set = function(options){
    var that = this;
    $.extend(true, that.config, options);
    return that;
  };

  // 表單事件
  Element.prototype.on = function(events, callback){
    return layui.onevent.call(this, MOD_NAME, events, callback);
  };

  // 外部 Tab 新增
  Element.prototype.tabAdd = function(filter, options){
    var tabElem = $('.layui-tab[lay-filter='+ filter +']');
    var titElem = tabElem.children(TITLE);
    var barElem = titElem.children('.layui-tab-bar');
    var contElem = tabElem.children('.layui-tab-content');
    var li = '<li'+ function(){
      var layAttr = [];
      layui.each(options, function(key, value){
        if(/^(title|content)$/.test(key)) return;
        layAttr.push('lay-'+ key +'="'+ value +'"');
      });
      if(layAttr.length > 0) layAttr.unshift(''); //向前插，預留空格
      return layAttr.join(' ');
    }() +'>'+ (options.title || 'unnaming') +'</li>';

    barElem[0] ? barElem.before(li) : titElem.append(li);
    contElem.append('<div class="layui-tab-item" ' + (options.id ? 'lay-id="' + options.id + '"' : '') + '>'+ (options.content || '') +'</div>');
    // call.hideTabMore(true);
    // 是否添加即切換
    options.change && this.tabChange(filter, options.id);
    titElem.data('LAY_TAB_CHANGE', options.change);
    call.tabAuto(options.change ? 'change' : null, tabElem);
    return this;
  };

  /**
   * 外部 Tab 刪除
   * @param {string} filter - 標籤主容器 lay-filter 值
   * @param {string} layid - 標籤頭 lay-id 值
   * @param {boolean} force - 是否強制刪除
   * @returns {this}
   */
  Element.prototype.tabDelete = function(filter, layid, force){
    var tabElem = $('.layui-tab[lay-filter='+ filter +']');
    var titElem = tabElem.children(TITLE);
    var liElem = titElem.find('>li[lay-id="'+ layid +'"]');
    call.tabDelete.call(liElem[0], {
      liElem: liElem,
      force: force
    });
    return this;
  };

  /**
   * 外部 Tab 切換
   * @param {string} filter - 標籤主容器 lay-filter 值
   * @param {string} layid - 標籤頭 lay-id 值
   * @param {boolean} force - 是否強制切換
   * @returns {this}
   */
  Element.prototype.tabChange = function(filter, layid, force){
    var tabElem = $('.layui-tab[lay-filter='+ filter +']');
    var titElem = tabElem.children(TITLE);
    var liElem = titElem.find('>li[lay-id="'+ layid +'"]');

    call.tabClick.call(liElem[0], {
      liElem: liElem,
      force: force
    });
    return this;
  };

  // 自定義 Tab 選項卡
  Element.prototype.tab = function(options){
    options = options || {};
    dom.on('click', options.headerElem, function(e){
      var index = $(options.headerElem).index($(this));
      call.tabClick.call(this, {
        index: index,
        options: options
      });
    });
  };


  // 動態改變進度條
  Element.prototype.progress = function(filter, percent){
    var ELEM = 'layui-progress';
    var elem = $('.'+ ELEM +'[lay-filter='+ filter +']');
    var elemBar = elem.find('.'+ ELEM +'-bar');
    var text = elemBar.find('.'+ ELEM +'-text');

    elemBar.css('width', function(){
      return /^.+\/.+$/.test(percent)
        ? (new Function('return '+ percent)() * 100) + '%'
     : percent;
    }).attr('lay-percent', percent);
    text.text(percent);
    return this;
  };

  var NAV_ELEM = '.layui-nav';
  var NAV_ITEM = 'layui-nav-item';
  var NAV_BAR = 'layui-nav-bar';
  var NAV_TREE = 'layui-nav-tree';
  var NAV_CHILD = 'layui-nav-child';
  var NAV_CHILD_C = 'layui-nav-child-c';
  var NAV_MORE = 'layui-nav-more';
  var NAV_DOWN = 'layui-icon-down';
  var NAV_ANIM = 'layui-anim layui-anim-upbit';

  // 基礎事件體
  var call = {
    // Tab 點擊
    tabClick: function(obj){
      obj = obj || {};
      var options = obj.options || {};
      var othis = obj.liElem || $(this);
      var parents = options.headerElem
        ? othis.parent()
      : othis.parents('.layui-tab').eq(0);
      var item = options.bodyElem
        ? $(options.bodyElem)
      : parents.children('.layui-tab-content').children('.layui-tab-item');
      var elemA = othis.find('a');
      var isJump = elemA.attr('href') !== 'javascript:;' && elemA.attr('target') === '_blank'; // 是否存在跳轉
      var unselect = typeof othis.attr('lay-unselect') === 'string'; // 是否禁用選中
      var filter = parents.attr('lay-filter');
      var hasId = othis.attr('lay-id');

      // 下標
      var index = 'index' in obj
        ? obj.index
      : othis.parent().children('li').index(othis);

      // 若非強制切換，則根據 tabBeforeChange 事件的返回結果決定是否切換
      if (!obj.force) {
        var liThis = othis.siblings('.' + THIS);
        var shouldChange = layui.event.call(this, MOD_NAME, 'tabBeforeChange('+ filter +')', {
          elem: parents,
          from: {
            index: othis.parent().children('li').index(liThis),
            id: liThis.attr('lay-id')
          },
          to: {
            index: index,
            id: hasId
          },
        });
        if(shouldChange === false) return;
      }

      // 執行切換
      if(!(isJump || unselect)){
        othis.addClass(THIS).siblings().removeClass(THIS);
        if(hasId){
          var contentElem = item.filter('[lay-id="' +  hasId + '"]');
          contentElem = contentElem.length ? contentElem : item.eq(index);
          contentElem.addClass(SHOW).siblings().removeClass(SHOW);
        }else{
          item.eq(index).addClass(SHOW).siblings().removeClass(SHOW);
        }
      }

      layui.event.call(this, MOD_NAME, 'tab('+ filter +')', {
        elem: parents,
        index: index,
        id: hasId
      });
    }

    // Tab 刪除
    ,tabDelete: function(obj){
      obj = obj || {};

      var li = obj.liElem || $(this).parent();
      var index = li.parent().children('li').index(li);
      var tabElem = li.closest('.layui-tab');
      var item = tabElem.children('.layui-tab-content').children('.layui-tab-item');
      var filter = tabElem.attr('lay-filter');
      var hasId = li.attr('lay-id');

      // 若非強制刪除，則根據 tabBeforeDelete 事件的返回結果決定是否刪除
      if (!obj.force) {
        var shouldClose = layui.event.call(li[0], MOD_NAME, 'tabBeforeDelete('+ filter +')', {
          elem: tabElem,
          index: index,
          id: hasId
        });
        if(shouldClose === false) return;
      }

      if(li.hasClass(THIS)){
        if (li.next()[0] && li.next().is('li')){
          call.tabClick.call(li.next()[0], {
            index: index + 1
          });
        } else if (li.prev()[0] && li.prev().is('li')){
          call.tabClick.call(li.prev()[0], null, index - 1);
        }
      }

      li.remove();
      if(hasId){
        var contentElem = item.filter('[lay-id="' +  hasId + '"]');
        contentElem = contentElem.length ? contentElem : item.eq(index)
        contentElem.remove()
      }else{
        item.eq(index).remove();
      }
      setTimeout(function(){
        call.tabAuto(null, tabElem);
      }, 50);

      layui.event.call(this, MOD_NAME, 'tabDelete('+ filter +')', {
        elem: tabElem,
        index: index,
        id: hasId
      });
    }

    // Tab 自適應
    ,tabAuto: function(spread, elem){
      var SCROLL = 'layui-tab-scroll';
      var MORE = 'layui-tab-more';
      var BAR = 'layui-tab-bar';
      var CLOSE = 'layui-tab-close';
      var that = this;
      var targetElem = elem || $('.layui-tab');

      targetElem.each(function(){
        var othis = $(this);
        var title = othis.children('.layui-tab-title');
        var item = othis.children('.layui-tab-content').children('.layui-tab-item');
        var STOPE = 'lay-stope="tabmore"';
        var span = $('<span class="layui-unselect layui-tab-bar" '+ STOPE +'><i '+ STOPE +' class="layui-icon">&#xe61a;</i></span>');

        if(that === window && device.ie != 8){
          // call.hideTabMore(true)
        }

        // 開啟關閉圖標
        var allowclose = othis.attr('lay-allowclose');
        if(allowclose && allowclose !== 'false'){
          title.find('li').each(function(){
            var li = $(this);
            if(!li.find('.'+CLOSE)[0] && li.attr('lay-allowclose') !== 'false'){
              var close = $('<i class="layui-icon layui-icon-close layui-unselect '+ CLOSE +'"></i>');
              close.on('click', function(e) {
                call.tabDelete.call(this, {
                  e: e
                });
              });
              li.append(close);
            }
          });
        }

        if(typeof othis.attr('lay-unauto') === 'string') return;

        // 響應式
        if(
          title.prop('scrollWidth') > title.outerWidth() + 1 || (
            title.find('li').length && title.height() > function(height){
              return height + height/2;
            }(title.find('li').eq(0).height())
          )
        ){
          // 若執行是來自於切換，則自動展開
          (
            spread === 'change' && title.data('LAY_TAB_CHANGE')
          ) && title.addClass(MORE);

          if(title.find('.'+BAR)[0]) return;
          title.append(span);
          othis.attr('overflow', '');

          // 展開圖標事件
          span.on('click', function(e){
            var isSpread = title.hasClass(MORE);
            title[isSpread ? 'removeClass' : 'addClass'](MORE);
          });
        } else {
          title.find('.'+ BAR).remove();
          othis.removeAttr('overflow');
        }
      });
    }
    // 隱藏更多 Tab
    ,hideTabMore: function(e){
      var tsbTitle = $('.layui-tab-title');
      if(e === true || $(e.target).attr('lay-stope') !== 'tabmore'){
        tsbTitle.removeClass('layui-tab-more');
        tsbTitle.find('.layui-tab-bar').attr('title','');
      }
    }

    //點擊一級菜單
    /*
    ,clickThis: function(){
      var othis = $(this), parents = othis.parents(NAV_ELEM)
      ,filter = parents.attr('lay-filter')
      ,elemA = othis.find('a')
      ,unselect = typeof othis.attr('lay-unselect') === 'string';

      if(othis.find('.'+NAV_CHILD)[0]) return;

      if(!(elemA.attr('href') !== 'javascript:;' && elemA.attr('target') === '_blank') && !unselect){
        parents.find('.'+THIS).removeClass(THIS);
        othis.addClass(THIS);
      }

      layui.event.call(this, MOD_NAME, 'nav('+ filter +')', othis);
    }
    )
    */

    // 點擊菜單 - a 標籤觸發
    ,clickThis: function() {
      var othis = $(this);
      var parents = othis.closest(NAV_ELEM);
      var filter = parents.attr('lay-filter');
      var parent = othis.parent() ;
      var child = othis.siblings('.'+ NAV_CHILD);
      var unselect = typeof parent.attr('lay-unselect') === 'string'; // 是否禁用選中

      // 滿足點擊選中的條件
      if (!(othis.attr('href') !== 'javascript:;' && othis.attr('target') === '_blank') && !unselect) {
        if (!child[0]) {
          parents.find('.'+ THIS).removeClass(THIS);
          parent.addClass(THIS);
        }
      }

      // 若為垂直菜單
      if (parents.hasClass(NAV_TREE)) {
        var NAV_ITEMED = NAV_ITEM + 'ed'; // 用於標註展開狀態
        var needExpand = !parent.hasClass(NAV_ITEMED); // 是否執行展開
        var ANIM_MS = 200; // 動畫過渡毫秒數

        // 動畫執行完成後的操作
        var complete = function() {
          $(this).css({
            "display": "" // 剔除動畫生成的 style display，以適配外部樣式的狀態重置
          });
          // 避免導航滑塊錯位
          parents.children('.'+ NAV_BAR).css({
            opacity: 0
          })
        };

        // 是否正處於動畫中的狀態
        if (child.is(':animated')) return;

        // 剔除可能存在的 CSS3 動畫類
        child.removeClass(NAV_ANIM);

        // 若有子菜單，則對其執行展開或收縮
        if (child[0]) {
          if (needExpand) {
            // 先執行 slideDown 動畫，再標註展開狀態樣式，避免元素 `block` 狀態導致動畫無效
            child.slideDown(ANIM_MS, complete);
            parent.addClass(NAV_ITEMED);
          } else {
            // 先取消展開狀態樣式，再將元素臨時顯示，避免 `none` 狀態導致 slideUp 動畫無效
            parent.removeClass(NAV_ITEMED);
            child.show().slideUp(ANIM_MS, complete);
          }

          // 手風琴 --- 收縮兄弟展開項
          if (typeof parents.attr('lay-accordion') === 'string' || parents.attr('lay-shrink') === 'all') {
            var parentSibs = parent.siblings('.'+ NAV_ITEMED);
            parentSibs.removeClass(NAV_ITEMED);
            parentSibs.children('.'+ NAV_CHILD).show().stop().slideUp(ANIM_MS, complete);
          }
        }
      }

      layui.event.call(this, MOD_NAME, 'nav('+ filter +')', othis);
    }

    // 摺疊面板
    ,collapse: function(){
      var othis = $(this);
      var icon = othis.find('.layui-colla-icon');
      var elemCont = othis.siblings('.layui-colla-content');
      var parents = othis.parents('.layui-collapse').eq(0);
      var filter = parents.attr('lay-filter');
      var isNone = elemCont.css('display') === 'none';

      // 是否手風琴
      if(typeof parents.attr('lay-accordion') === 'string'){
        var show = parents.children('.layui-colla-item').children('.'+SHOW);
        show.siblings('.layui-colla-title').children('.layui-colla-icon').html('&#xe602;');
        show.removeClass(SHOW);
      }

      elemCont[isNone ? 'addClass' : 'removeClass'](SHOW);
      icon.html(isNone ? '&#xe61a;' : '&#xe602;');

      layui.event.call(this, MOD_NAME, 'collapse('+ filter +')', {
        title: othis
        ,content: elemCont
        ,show: isNone
      });
    }
  };

  // 初始化元素操作
  Element.prototype.init = function(type, filter){
    var that = this, elemFilter = function(){
      return (typeof filter === 'string' && filter) ? ('[lay-filter="' + filter +'"]') : '';
    }(), items = {

      // Tab 選項卡
      tab: function(elem){
        var TAB_ELEM = '.layui-tab';
        var targetElem = elem || $(TAB_ELEM + elemFilter);
        call.tabAuto.call({}, null, targetElem);
      }

      // 導航菜單
      ,nav: function(elem){
        var TIME = 200;
        var timer = {};
        var timerMore = {};
        var timeEnd = {};
        var NAV_TITLE = 'layui-nav-title';

        // 滑塊跟隨
        var follow = function(bar, nav, index) {
          var othis = $(this);
          var child = othis.find('.'+NAV_CHILD);

          // 是否垂直導航菜單
          if (nav.hasClass(NAV_TREE)) {
            // 無子菜單時跟隨
            if (!child[0]) {
              var thisA = othis.children('.'+ NAV_TITLE);
              bar.css({
                top: othis.offset().top - nav.offset().top,
                height: (thisA[0] ? thisA : othis).outerHeight(),
                opacity: 1
              });
            }
          } else {
            child.addClass(NAV_ANIM);

            // 若居中對齊
            if (child.hasClass(NAV_CHILD_C)) {
              child.css({
                left: -(child.outerWidth() - othis.width()) / 2
              });
            }

            // 滑塊定位
            if (child[0]) { // 若有子菜單，則滑塊消失
              bar.css({
                left: bar.position().left + bar.width() / 2,
                width: 0,
                opacity: 0
              });
            } else { // bar 跟隨
              bar.css({
                left: othis.position().left + parseFloat(othis.css('marginLeft')),
                top: othis.position().top + othis.height() - bar.height()
              });
            }

            // 漸顯滑塊並適配寬度
            timer[index] = setTimeout(function() {
              bar.css({
                width: child[0] ? 0 : othis.width(),
                opacity: child[0] ? 0 : 1
              });
            }, device.ie && device.ie < 10 ? 0 : TIME);

            // 顯示子菜單
            clearTimeout(timeEnd[index]);
            if (child.css('display') === 'block') {
              clearTimeout(timerMore[index]);
            }
            timerMore[index] = setTimeout(function(){
              child.addClass(SHOW);
              othis.find('.'+NAV_MORE).addClass(NAV_MORE+'d');
            }, 300);
          }
        };

        // 遍歷導航
        var targetElem = elem || $(NAV_ELEM + elemFilter);
        targetElem.each(function(index) {
          var othis = $(this);
          var bar = $('<span class="'+ NAV_BAR +'"></span>');
          var itemElem = othis.find('.'+NAV_ITEM);

          // hover 滑動效果
          var hasBarElem = othis.find('.'+NAV_BAR);
          if (hasBarElem[0]) hasBarElem.remove();
          othis.append(bar);
          ( othis.hasClass(NAV_TREE)
            ? itemElem.find('dd,>.'+ NAV_TITLE)
            : itemElem
          ).off('mouseenter.lay_nav').on('mouseenter.lay_nav', function() {
            follow.call(this, bar, othis, index);
          }).off('mouseleave.lay_nav').on('mouseleave.lay_nav', function() { // 鼠標移出
            // 是否為垂直導航
            if (othis.hasClass(NAV_TREE)) {
              bar.css({
                height: 0,
                opacity: 0
              });
            } else {
              // 隱藏子菜單
              clearTimeout(timerMore[index]);
              timerMore[index] = setTimeout(function(){
                othis.find('.'+ NAV_CHILD).removeClass(SHOW);
                othis.find('.'+ NAV_MORE).removeClass(NAV_MORE +'d');
              }, 300);
            }
          });

          // 鼠標離開當前菜單時
          othis.off('mouseleave.lay_nav').on('mouseleave.lay_nav', function() {
            clearTimeout(timer[index])
            timeEnd[index] = setTimeout(function() {
              if (!othis.hasClass(NAV_TREE)) {
                bar.css({
                  width: 0,
                  left: bar.position().left + bar.width() / 2,
                  opacity: 0
                });
              }
            }, TIME);
          });

          // 展開子菜單
          itemElem.find('a').each(function() {
            var thisA = $(this);
            var parent = thisA.parent();
            var child = thisA.siblings('.'+ NAV_CHILD);

            // 輸出小箭頭
            if (child[0] && !thisA.children('.'+ NAV_MORE)[0]) {
              thisA.append('<i class="layui-icon '+ NAV_DOWN +' '+ NAV_MORE +'"></i>');
            }

            thisA.off('click', call.clickThis).on('click', call.clickThis); // 點擊菜單
          });
        });
      }

      //麵包屑
      ,breadcrumb: function(elem){
        var ELEM = '.layui-breadcrumb';
        var targetElem = elem || $(ELEM + elemFilter);

        targetElem.each(function(){
          var othis = $(this)
          ,ATTE_SPR = 'lay-separator'
          ,separator = othis.attr(ATTE_SPR) || '/'
          ,aNode = othis.find('a');
          if(aNode.next('span['+ ATTE_SPR +']')[0]) return;
          aNode.each(function(index){
            if(index === aNode.length - 1) return;
            $(this).after('<span '+ ATTE_SPR +'>'+ separator +'</span>');
          });
          othis.css('visibility', 'visible');
        });
      }

      //進度條
      ,progress: function(elem){
        var ELEM = 'layui-progress';
        var targetElem = elem || $('.' + ELEM + elemFilter);

        targetElem.each(function(){
          var othis = $(this)
          ,elemBar = othis.find('.layui-progress-bar')
          ,percent = elemBar.attr('lay-percent');

          elemBar.css('width', function(){
            return /^.+\/.+$/.test(percent)
              ? (new Function('return '+ percent)() * 100) + '%'
           : percent;
          });

          if(othis.attr('lay-showpercent')){
            setTimeout(function(){
              elemBar.html('<span class="'+ ELEM +'-text">'+ percent +'</span>');
            },350);
          }
        });
      }

      //摺疊面板
      ,collapse: function(elem){
        var ELEM = 'layui-collapse';
        var targetElem = elem || $('.' + ELEM + elemFilter);

        targetElem.each(function(){
          var elemItem = $(this).find('.layui-colla-item')
          elemItem.each(function(){
            var othis = $(this)
            ,elemTitle = othis.find('.layui-colla-title')
            ,elemCont = othis.find('.layui-colla-content')
            ,isNone = elemCont.css('display') === 'none';

            //初始狀態
            elemTitle.find('.layui-colla-icon').remove();
            elemTitle.append('<i class="layui-icon layui-colla-icon">'+ (isNone ? '&#xe602;' : '&#xe61a;') +'</i>');

            //點擊標題
            elemTitle.off('click', call.collapse).on('click', call.collapse);
          });

        });
      }
    };

    if(type && typeof filter === 'object' && filter instanceof $){
      var targetElem = filter;
      return items[type](targetElem);
    }

    return items[type] ? items[type]() : layui.each(items, function(index, item){
      item();
    });
  };

  Element.prototype.render = Element.prototype.init;

  var element = new Element();
  var dom = $(document);

  $(function(){
    element.render();
  });

  dom.on('click', '.layui-tab-title li', call.tabClick); // Tab 切換
  // dom.on('click', call.hideTabMore); // 隱藏展開的 Tab
  $(window).on('resize', call.tabAuto); // 自適應
  
  exports(MOD_NAME, element);
});

