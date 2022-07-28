/**
 * code 
 * 代碼塊簡易修飾
 */
 
layui.define(['lay', 'util'], function(exports){
  "use strict";
  
  var $ = layui.$;
  var util = layui.util;

  var ELEM_TITLE = 'layui-code-title';

  // 默認參數項
  var config = {
    elem: '.layui-code', // 元素選擇器
    title: '&lt;/&gt;', // 標題
    about: '', // 右上角信息
    ln: true // 是否顯示行號
  };

  var trim = function(str){
    return $.trim(str).replace(/^\n|\n$/, '');
  };
  
  // export api
  exports('code', function(options){
    var opts = options = $.extend({}, config, options);

    // 目標元素是否存在
    options.elem = $(options.elem);
    if(!options.elem[0]) return;

    // 從內至外渲染
    layui.each(options.elem.get().reverse(), function(index, item){
      var othis = $(item);
      var html = trim(othis.html());

      // 合併屬性上的參數，併兼容舊版本屬性寫法 lay-*
      var options = $.extend({}, opts, lay.options(item), function(obj){
        var attrs = ['title', 'height', 'encode', 'skin', 'about'];
        layui.each(attrs, function(i, attr){
          var value = othis.attr('lay-'+ attr);
          if(typeof value === 'string'){
            obj[attr] = value;
          }  
        })
        return obj;
      }({}));

      // 有序或無序列表
      var listTag = options.ln ? 'ol' : 'ul';
      var listElem = $('<'+ listTag +' class="layui-code-'+ listTag +'">');

      // header
      var headerElem = $('<div class="'+ ELEM_TITLE +'">');

      // 添加組件 clasName
      othis.addClass('layui-code-view layui-box');

      // 自定義風格
      if(options.skin){
        if(options.skin === 'notepad') options.skin = 'dark';
        othis.addClass('layui-code-'+ options.skin);
      } 

      // 轉義 HTML 標簽
      if(options.encode) html = util.escape(html);
      html = html.replace(/[\r\t\n]+/g, '</li><li>'); // 轉義換行符
      
      // 生成列表
      othis.html(listElem.html('<li>' + html + '</li>'));
      
      // 創建 header
      if(!othis.children('.'+ ELEM_TITLE)[0]){
        headerElem.html(options.title + (
          options.about 
            ? '<div class="layui-code-about">' + options.about + '</div>'
          : ''
        ));
        othis.prepend(headerElem);
      }

      // 按行數適配左邊距
      (function(autoIncNums){
        if(autoIncNums > 0){
          listElem.css('margin-left', autoIncNums + 'px');
        }
      })(Math.floor(listElem.find('li').length/100));

      // 限制最大高度
      if(options.height){
        listElem.css('max-height', options.height);
      }

    });
    
  });
}).addcss('modules/code.css?v=3', 'skincodecss');