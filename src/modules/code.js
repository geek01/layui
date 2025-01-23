/**
 * code
 * Code 預覽組件
 */

layui.define(['lay', 'util', 'element', 'form'], function(exports){
  "use strict";

  var $ = layui.$;
  var util = layui.util;
  var element = layui.element;
  var form = layui.form;
  var layer = layui.layer;
  var hint = layui.hint();

  // 常量
  var CONST = {
    ELEM_VIEW: 'layui-code-view',
    ELEM_TAB: 'layui-tab',
    ELEM_HEADER: 'layui-code-header',
    ELEM_FULL: 'layui-code-full',
    ELEM_PREVIEW: 'layui-code-preview',
    ELEM_ITEM: 'layui-code-item',
    ELEM_SHOW: 'layui-show',
    ELEM_LINE: 'layui-code-line',
    ELEM_LINE_NUM: 'layui-code-line-number',
    ELEM_LN_MODE: 'layui-code-ln-mode',
    CDDE_DATA_CLASS: 'LayuiCodeDataClass',
    LINE_RAW_WIDTH: 45, // 行號初始寬度，需與 css 保持一致
  };

  // 默認參數項
  var config = {
    elem: '', // 元素選擇器
    about: '', // 代碼欄右上角信息
    ln: true, // 代碼區域是否顯示行號
    header: false, // 是否顯示代碼欄頭部區域
    encode: true, // 是否對 code 進行編碼（若開啟預覽，則強制開啟）
    copy: true, // 是否開啟代碼區域複製功能圖標
    // 默認文本
    text: {
      code: util.escape('</>'),
      preview: 'Preview',
    },
    wordWrap: true, // 是否自動換行
    lang: 'text', // 指定語言類型
    highlighter: false, // 是否開啟語法高亮，'hljs','prism','shiki'
    langMarker: false, // 代碼區域是否顯示語言類型標記
  };

  // 初始索引
  var codeIndex = layui.code ? (layui.code.index + 10000) : 0;

  // 去除尾部空格
  var trimEnd = function(str){
    return String(str).replace(/\s+$/, '');
  }
  // 保留首行縮進
  var trim = function(str){
    return trimEnd(str).replace(/^\n|\n$/, '');
  };

  // export api
  exports('code', function(options, mode){
    options = $.extend(true, {}, config, options);

    // 返回對象
    var ret = {
      config: options,
      reload: function(opts) { // 重載
        layui.code(this.updateOptions(opts));
      },
      updateOptions: function(opts) { // 更新屬性（選項）
        opts = opts || {};
        delete opts.elem;
        return $.extend(true, options, opts);
      },
      reloadCode: function(opts) { // 僅重載 code
        layui.code(this.updateOptions(opts), 'reloadCode');
      }
    };

    // 若 elem 非唯一
    var elem = $(options.elem);
    if(elem.length > 1){
      // 是否正向渲染
      layui.each(options.obverse ? elem : elem.get().reverse(), function(){
        layui.code($.extend({}, options, {
          elem: this
        }), mode);
      });
      return ret;
    }

    // 目標元素是否存在
    var othis = options.elem = $(options.elem);
    if(!othis[0]) return ret;

    // 合併屬性上的參數，併兼容舊版本屬性寫法 lay-*
    $.extend(true, options, lay.options(othis[0]), function(obj){
      var attrs = ['title', 'height', 'encode', 'skin', 'about'];
      layui.each(attrs, function(i, attr){
        var value = othis.attr('lay-'+ attr);
        if(typeof value === 'string'){
          obj[attr] = value;
        }
      })
      return obj;
    }({}));

    // codeRender 需要關閉編碼
    // 未使用 codeRender 時若開啟了預覽，則強制開啟編碼
    options.encode = (options.encode || options.preview) && !options.codeRender;

    // 獲得初始 code
    options.code = options.code || function(){
      var arr = [];
      var textarea = othis.children('textarea');

      // 若內容放置在 textarea 中
      textarea.each(function(){
        arr.push(trim(this.value));
      });

      // 內容直接放置在元素外層
      if(arr.length === 0){
        arr.push(trim(othis.html()));
      }

      return arr.join('');
    }();

    // 創建 code 行結構
    var createCode = function(html) {
      // codeRender
      if(typeof options.codeRender === 'function') {
        html = options.codeRender(String(html), options);
      }

      // code 行
      var lines = String(html).split(/\r?\n/g);

      // 包裹 code 行結構
      html = $.map(lines, function(line, num) {
        return [
          '<div class="'+ CONST.ELEM_LINE +'">',
            (
              options.ln ? [
                '<div class="'+ CONST.ELEM_LINE_NUM +'">',
                  (util.digit(num + 1) + '.'),
                '</div>',
              ].join('') : ''
            ),
            '<div class="layui-code-line-content">',
              (line || ' '),
            '</div>',
          '</div>'
        ].join('');
      });

      return {
        lines: lines,
        html: html
      };
    };

    // 原始 code
    var rawCode = options.code;

    // 最終 code
    var finalCode = function(code) {
      return typeof options.codeParse === 'function' ?
        options.codeParse(code, options) :
      code;
    };

    // 僅重載 code
    if (mode === 'reloadCode') {
      return othis.children('.layui-code-wrap').html(
        createCode(finalCode(rawCode)).html
      ), ret;
    }

    // 自增索引
    var index = layui.code.index = ++codeIndex;
    othis.attr('lay-code-index', index);

    // 初始化 className
    var hasDataClass = CONST.CDDE_DATA_CLASS in othis.data();
    if (hasDataClass) {
      othis.attr('class', othis.data(CONST.CDDE_DATA_CLASS) || '');
    }

    // 記錄初始 className
    if (!hasDataClass) {
      othis.data(CONST.CDDE_DATA_CLASS, othis.attr('class'));
    }

    // 工具欄
    var tools = {
      copy: {
        className: 'file-b',
        title: ['複製代碼'],
        event: function(obj){
          var code = util.unescape(finalCode(options.code));
          var hasOnCopy = typeof options.onCopy === 'function';

          // 寫入剪切板
          lay.clipboard.writeText({
            text: code,
            done: function() {
              if(hasOnCopy){
                var ret = options.onCopy(code, true);
                if(ret === false) return;
              }

              layer.msg('已複製', {icon: 1});
            },
            error: function() {
              if(hasOnCopy){
                var ret = options.onCopy(code, false);
                if(ret === false) return;
              }
              layer.msg('複製失敗', {icon: 2});
            }
          });
        }
      }
    };

    // 移除包裹結構
    var unwrap = (function fn() {
      var elemViewHas = othis.parent('.' + CONST.ELEM_PREVIEW);
      var elemTabHas = elemViewHas.children('.'+ CONST.ELEM_TAB);
      var elemPreviewViewHas = elemViewHas.children('.' + CONST.ELEM_ITEM +'-preview');

      // 移除舊結構
      elemTabHas.remove(); // 移除 tab
      elemPreviewViewHas.remove(); // 移除預覽區域
      if (elemViewHas[0]) othis.unwrap(); // 移除外層容器

      return fn;
    })();

    // 是否開啟預覽
    if(options.preview){
      var FILTER_VALUE = 'LAY-CODE-DF-'+ index;
      var layout = options.layout || ['code', 'preview'];
      var isIframePreview = options.preview === 'iframe';

      // 追加 Tab 組件
      var elemView = $('<div class="'+ CONST.ELEM_PREVIEW +'">');
      var elemTabView = $('<div class="layui-tab layui-tab-brief">');
      var elemHeaderView = $('<div class="layui-tab-title">');
      var elemPreviewView = $('<div class="'+ [
        CONST.ELEM_ITEM,
        CONST.ELEM_ITEM +'-preview',
        'layui-border'
      ].join(' ') +'">');
      var elemToolbar = $('<div class="layui-code-tools"></div>');


      if(options.id) elemView.attr('id', options.id);
      elemView.addClass(options.className);
      elemTabView.attr('lay-filter', FILTER_VALUE);

      // 標籤頭
      layui.each(layout, function(i, v){
        var li = $('<li lay-id="'+ v +'">');
        if(i === 0) li.addClass('layui-this');
        li.html(options.text[v]);
        elemHeaderView.append(li);
      });

      // 工具欄
      $.extend(tools, {
        'full': {
          className: 'screen-full',
          title: ['最大化顯示', '還原顯示'],
          event: function(obj){
            var el = obj.elem;
            var elemView = el.closest('.'+ CONST.ELEM_PREVIEW);
            var classNameFull = 'layui-icon-'+ this.className;
            var classNameRestore = 'layui-icon-screen-restore';
            var title = this.title;
            var htmlElem = $('html,body');
            var ELEM_SCROLLBAR_HIDE = 'layui-scrollbar-hide';

            if(el.hasClass(classNameFull)){
              elemView.addClass(CONST.ELEM_FULL);
              el.removeClass(classNameFull).addClass(classNameRestore);
              el.attr('title', title[1]);
              htmlElem.addClass(ELEM_SCROLLBAR_HIDE);
            } else {
              elemView.removeClass(CONST.ELEM_FULL);
              el.removeClass(classNameRestore).addClass(classNameFull);
              el.attr('title', title[0]);
              htmlElem.removeClass(ELEM_SCROLLBAR_HIDE);
            }
          }
        },
        'window': {
          className: 'release',
          title: ['在新窗口預覽'],
          event: function(obj){
            util.openWin({
              content: finalCode(options.code)
            });
          }
        }
      });

      // copy
      if(options.copy){
        if(layui.type(options.tools) === 'array'){
          // 若 copy 未存在於 tools 中，則追加到最前
          if(options.tools.indexOf('copy') === -1){
            options.tools.unshift('copy');
          }
        } else {
          options.tools = ['copy'];
        }
      }

      // 工具欄事件
      elemToolbar.on('click', '>i', function(){
        var oi = $(this);
        var type = oi.data('type');
        var parameters = {
          elem: oi,
          type: type,
          options: options, // 當前屬性選項
          rawCode: options.code, // 原始 code
          finalCode: util.unescape(finalCode(options.code)) // 最終 code
        };

        // 內部 tools event
        tools[type] && typeof tools[type].event === 'function' && tools[type].event(parameters);

        // 外部 tools event
        typeof options.toolsEvent === 'function' && options.toolsEvent(parameters);
      });

      // 增加工具欄
      if (options.addTools && options.tools) {
        options.tools = [].concat(options.tools, options.addTools);
      }

      // 渲染工具欄
      layui.each(options.tools, function(i, v){
        var viso = typeof v === 'object'; // 若為 object 值，則可自定義更多屬性
        var tool = viso ? v : (
          tools[v] || {
            className: v,
            title: [v]
          }
        );

        var className = tool.className || tool.type;
        var title = tool.title || [''];
        var type = viso ? ( tool.type || className ) : v;

        if (!type) return;

        // 若非內置 tool，則合併到 tools 中
        if (!tools[type]) {
          var obj = {};
          obj[type] = tool;
          $.extend(tools, obj);
        }

        elemToolbar.append(
          '<i class="layui-icon layui-icon-'+ className +'" data-type="'+ type +'" title="'+ title[0] +'"></i>'
        );
      });

      othis.addClass(CONST.ELEM_ITEM).wrap(elemView); // 包裹外層容器
      elemTabView.append(elemHeaderView); // 追加標籤頭
      options.tools && elemTabView.append(elemToolbar); // 追加工具欄
      othis.before(elemTabView); // 追加標籤結構

      // 追加預覽
      if(isIframePreview){
        elemPreviewView.html('<iframe allowtransparency="true" frameborder="0"></iframe>');
      }

      // 執行預覽
      var runPreview = function(thisItemBody){
        var iframe = thisItemBody.children('iframe')[0];

        // 是否 iframe 方式預覽
        if(isIframePreview && iframe){
          iframe.srcdoc = finalCode(options.code);
        } else {
          thisItemBody.html(options.code);
        }

        // 當前實例預覽完畢後的回調
        setTimeout(function(){
          typeof options.done === 'function' && options.done({
            container: thisItemBody,
            options: options,
            render: function(){
              form.render(thisItemBody.find('.layui-form'));
              element.render();
            }
          });
        },3);
      };

      if(layout[0] === 'preview'){
        elemPreviewView.addClass(CONST.ELEM_SHOW);
        othis.before(elemPreviewView);
        runPreview(elemPreviewView);
      } else {
        othis.addClass(CONST.ELEM_SHOW).after(elemPreviewView);
      }

      // 內容項初始化樣式
      options.previewStyle = [options.style, options.previewStyle].join('');
      elemPreviewView.attr('style', options.previewStyle);

      // tab change
      element.on('tab('+ FILTER_VALUE +')', function(data){
        var $this = $(this);
        var thisElem = $(data.elem).closest('.'+ CONST.ELEM_PREVIEW);
        var elemItemBody = thisElem.find('.'+ CONST.ELEM_ITEM);
        var thisItemBody = elemItemBody.eq(data.index);

        elemItemBody.removeClass(CONST.ELEM_SHOW);
        thisItemBody.addClass(CONST.ELEM_SHOW);

        if($this.attr('lay-id') === 'preview'){
          runPreview(thisItemBody);
        }

        setCodeLayout();
      });
    }

    // 創建 code 容器
    var codeElem = $('<code class="layui-code-wrap"></code>'); // 此處的閉合標籤是為了兼容 IE8

    // 添加主容器 className
    othis.addClass(function(arr) {
      if (!options.wordWrap) arr.push('layui-code-nowrap');
      return arr.join(' ')
    }(['layui-code-view layui-border-box']));

    // code 主題風格
    var theme = options.theme || options.skin;
    if (theme) {
      othis.removeClass('layui-code-theme-dark layui-code-theme-light');
      othis.addClass('layui-code-theme-'+ theme);
    }

    // 添加高亮必要的 className
    if (options.highlighter) {
      othis.addClass([
        options.highlighter,
        'language-' + options.lang,
        'layui-code-hl'
      ].join(' '));
    }

    // 獲取 code 行結構
    var createCodeRst = createCode(
      options.encode ? util.escape(finalCode(rawCode)) : rawCode // 是否編碼
    );
    var lines = createCodeRst.lines;

    // 插入 code
    othis.html(codeElem.html(createCodeRst.html));

    // 插入行號邊欄
    if (options.ln) {
      othis.append('<div class="layui-code-ln-side"></div>');
    }

    // 兼容舊版本 height 屬性
    if (options.height) {
      codeElem.css('max-height', options.height);
    }

    // code 區域樣式
    options.codeStyle = [options.style, options.codeStyle].join('');
    if (options.codeStyle) {
      codeElem.attr('style', function(i, val) {
        return (val || '') + options.codeStyle;
      });
    }

    // 動態設置樣式
    var cssRules = [
      {
        selector: '>.layui-code-wrap>.layui-code-line{}',
        setValue: function(item, value) {
          item.style['padding-left'] = value + 'px';
        }
      },
      {
        selector: '>.layui-code-wrap>.layui-code-line>.layui-code-line-number{}',
        setValue: function(item, value) {
         item.style.width = value + 'px';
        }
      },
      {
        selector: '>.layui-code-ln-side{}',
        setValue: function(item, value) {
          item.style.width = value + 'px';
        }
      }
    ];

    // 生成初始 style 元素
    var styleElem = lay.style({
      target: othis[0],
      id: 'DF-code-'+ index,
      text: $.map($.map(cssRules, function(val){
        return val.selector;
      }), function(val, i) {
        return ['.layui-code-view[lay-code-index="'+ index + '"]', val].join(' ');
      }).join('')
    })

    // 動態設置 code 佈局
    var setCodeLayout = (function fn() {
      if (options.ln) {
        var multiLine = Math.floor(lines.length / 100);
        var lineElem = codeElem.children('.'+ CONST.ELEM_LINE);
        var width = lineElem.last().children('.'+ CONST.ELEM_LINE_NUM).outerWidth();

        othis.addClass(CONST.ELEM_LN_MODE);

        // 若超出 100 行
        if (multiLine && width > CONST.LINE_RAW_WIDTH) {
          lay.getStyleRules(styleElem, function(item, i) {
            try {
              cssRules[i].setValue(item, width);
            } catch(e) { }
          });
        }
      }

      return fn;
    })();

    // 創建 code header
    if (options.header) {
      var headerElem = $('<div class="'+ CONST.ELEM_HEADER +'"></div>');
      headerElem.html(options.title || options.text.code);
      othis.prepend(headerElem);
    }

    // 創建 code 區域固定條
    var elemFixbar = $('<div class="layui-code-fixbar"></div>');

    // 若開啟複製，且未開啟預覽，則單獨生成複製圖標
    if(options.copy && !options.preview){
      var copyElem = $(['<span class="layui-code-copy">',
        '<i class="layui-icon layui-icon-file-b" title="複製"></i>',
      '</span>'].join(''));

      // 點擊複製
      copyElem.on('click', function(){
        tools.copy.event();
      });

      elemFixbar.append(copyElem);
    }

    // 創建 language marker
    if (options.langMarker) {
      elemFixbar.append('<span class="layui-code-lang-marker">' + options.lang + '</span>');
    }

    // 創建 about 自定義內容
    if (options.about) {
      elemFixbar.append(options.about);
    }

    // 生成 code fixbar
    othis.append(elemFixbar);

    // code 渲染完畢後的回調
    if (!options.preview) {
      setTimeout(function(){
        typeof options.done === 'function' && options.done({});
      },3);
    }

    // 所有實例渲染完畢後的回調
    if(options.elem.length === index + 1){
      typeof options.allDone === 'function' && options.allDone();
    }

    return ret;
  });
});

// 若為源碼版，則自動加載該組件依賴的 css 文件
if(!layui['layui.all']){
  layui.addcss('modules/code.css?v=6', 'skincodecss');
}
