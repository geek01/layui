/**

 @Name：layui.flow 流加載
 @Author：賢心
 @License：MIT

 */


layui.define('jquery', function(exports){
  "use strict";

  var $ = layui.$, Flow = function(options){}
  ,ELEM_MORE = 'layui-flow-more'
  ,ELEM_LOAD = '<i class="layui-anim layui-anim-rotate layui-anim-loop layui-icon ">&#xe63e;</i>';

  //主方法
  Flow.prototype.load = function(options){
    var that = this, page = 0, lock, isOver, lazyimg, timer;
    options = options || {};

    var elem = $(options.elem); if(!elem[0]) return;
    var scrollElem = $(options.scrollElem || document); //滾動條所在元素
    var mb = options.mb || 50; //與底部的臨界距離
    var isAuto = 'isAuto' in options ? options.isAuto : true; //是否自動滾動加載
    var end = options.end || '沒有更多了'; //“末頁”顯示文案

    //滾動條所在元素是否為document
    var notDocment = options.scrollElem && options.scrollElem !== document;

    //加載更多
    var ELEM_TEXT = '<cite>加載更多</cite>'
    ,more = $('<div class="layui-flow-more"><a href="javascript:;">'+ ELEM_TEXT +'</a></div>');

    if(!elem.find('.layui-flow-more')[0]){
      elem.append(more);
    }

    //加載下一個元素
    var next = function(html, over){
      html = $(html);
      more.before(html);
      over = over == 0 ? true : null;
      over ? more.html(end) : more.find('a').html(ELEM_TEXT);
      isOver = over;
      lock = null;
      lazyimg && lazyimg();
    };

    //觸發請求
    var done = function(){
      lock = true;
      more.find('a').html(ELEM_LOAD);
      typeof options.done === 'function' && options.done(++page, next);
    };

    done();

    //不自動滾動加載
    more.find('a').on('click', function(){
      var othis = $(this);
      if(isOver) return;
      lock || done();
    });

    //如果允許圖片懶加載
    if(options.isLazyimg){
      var lazyimg = that.lazyimg({
        elem: options.elem + ' img'
        ,scrollElem: options.scrollElem
      });
    }

    if(!isAuto) return that;

    scrollElem.on('scroll', function(){
      var othis = $(this), top = othis.scrollTop();

      if(timer) clearTimeout(timer);
      if(isOver || !elem.width()) return; //如果已經結束，或者元素處於隱藏狀態，則不執行滾動加載

      timer = setTimeout(function(){
        //計算滾動所在容器的可視高度
        var height = notDocment ? othis.height() : $(window).height();

        //計算滾動所在容器的實際高度
        var scrollHeight = notDocment
          ? othis.prop('scrollHeight')
        : document.documentElement.scrollHeight;

        //臨界點
        if(scrollHeight - top - height <= mb){
          lock || done();
        }
      }, 100);
    });

    return that;
  };

  //圖片懶加載
  Flow.prototype.lazyimg = function(options){
    var that = this, index = 0, haveScroll;
    options = options || {};

    var scrollElem = $(options.scrollElem || document); //滾動條所在元素
    var elem = options.elem || 'img';

    //滾動條所在元素是否為document
    var notDocment = options.scrollElem && options.scrollElem !== document;

    //顯示圖片
    var show = function(item, height){
      var start = scrollElem.scrollTop(), end = start + height;
      var elemTop = notDocment ? function(){
        return item.offset().top - scrollElem.offset().top + start;
      }() : item.offset().top;

      /* 始終只加載在當前屏範圍內的圖片 */
      if(elemTop >= start && elemTop <= end){
        if(!item.attr('src')){
          var src = item.attr('lay-src');
          layui.img(src, function(){
            var next = that.lazyimg.elem.eq(index);
            item.attr('src', src).removeAttr('lay-src');

            /* 當前圖片加載就緒後，檢測下一個圖片是否在當前屏 */
            next[0] && render(next);
            index++;
          });
        }
      }
    }, render = function(othis, scroll){

      //計算滾動所在容器的可視高度
      var height = notDocment ? (scroll||scrollElem).height() : $(window).height();
      var start = scrollElem.scrollTop(), end = start + height;

      that.lazyimg.elem = $(elem);

      if(othis){
        show(othis, height);
      } else {
        //計算未加載過的圖片
        for(var i = 0; i < that.lazyimg.elem.length; i++){
          var item = that.lazyimg.elem.eq(i), elemTop = notDocment ? function(){
            return item.offset().top - scrollElem.offset().top + start;
          }() : item.offset().top;

          show(item, height);
          index = i;

          //如果圖片的top座標，超出了當前屏，則終止後續圖片的遍歷
          if(elemTop > end) break;
        }
      }
    };

    render();

    if(!haveScroll){
      var timer;
      scrollElem.on('scroll', function(){
        var othis = $(this);
        if(timer) clearTimeout(timer)
        timer = setTimeout(function(){
          render(null, othis);
        }, 50);
      });
      haveScroll = true;
    }
    return render;
  };

  //暴露接口
  exports('flow', new Flow());
});
