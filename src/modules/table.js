/**
 * layui.table
 * 表格組件
 */

layui.define(['lay', 'laytpl', 'laypage', 'form', 'util'], function(exports){
  "use strict";

  var $ = layui.$;
  var lay = layui.lay;
  var laytpl = layui.laytpl;
  var laypage = layui.laypage;
  var layer = layui.layer;
  var form = layui.form;
  var util = layui.util;
  var hint = layui.hint();
  var device = layui.device();

  // api
  var table = {
    config: { // 全局配置項
      checkName: 'LAY_CHECKED', // 是否選中狀態的特定字段名
      indexName: 'LAY_INDEX', // 初始下標索引名，用於恢復當前頁表格排序
      numbersName: 'LAY_NUM', // 序號
      disabledName: 'LAY_DISABLED' // 禁用狀態的特定字段名
    },
    cache: {}, // 數據緩存
    index: layui.table ? (layui.table.index + 10000) : 0,

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
  var thisTable = function(){
    var that = this;
    var options = that.config;
    var id = options.id || options.index;

    return {
      config: options,
      reload: function(options, deep){
        that.reload.call(that, options, deep);
      },
      reloadData: function(options, deep){
        table.reloadData(id, options, deep);
      },
      setColsWidth: function(){
        that.setColsWidth.call(that);
      },
      resize: function(){ // 重置表格尺寸/結構
        that.resize.call(that);
      }
    }
  };

  // 獲取當前實例
  var getThisTable = function(id){
    var that = thisTable.that[id];
    if(!that) hint.error(id ? ('The table instance with ID \''+ id +'\' not found') : 'ID argument required');
    return that || null;
  };

  // 獲取當前實例配置項
  var getThisTableConfig = function(id){
    var config = thisTable.config[id];
    if(!config) hint.error(id ? ('The table instance with ID \''+ id +'\' not found') : 'ID argument required');
    return config || null;
  };

  // 解析自定義模板數據
  var parseTempData = function(obj){
    obj = obj || {};

    var options = this.config || {};
    var item3 = obj.item3; // 表頭數據
    var content = obj.content; // 原始內容
    if (item3.type === 'numbers') content = obj.tplData[table.config.numbersName];

    // 是否編碼 HTML
    var escaped = 'escape' in item3 ? item3.escape : options.escape;
    if(escaped) content = util.escape(content);

    // 獲取模板
    var templet = obj.text && item3.exportTemplet || (item3.templet || item3.toolbar);

    // 獲取模板內容
    if(templet){
      content = typeof templet === 'function'
        ? templet.call(item3, obj.tplData, obj.obj)
      : laytpl($(templet).html() || String(content)).render($.extend({
        LAY_COL: item3
      }, obj.tplData));
    }

    // 是否只返回文本
    return obj.text ? $('<div>'+ content +'</div>').text() : content;
  };

  // 字符
  var MOD_NAME = 'table';
  var ELEM = '.layui-table';
  var THIS = 'layui-this';
  var SHOW = 'layui-show';
  var HIDE = 'layui-hide';
  var HIDE_V = 'layui-hide-v';
  var DISABLED = 'layui-disabled';
  var NONE = 'layui-none';

  var ELEM_VIEW = 'layui-table-view';
  var ELEM_TOOL = '.layui-table-tool';
  var ELEM_BOX = '.layui-table-box';
  var ELEM_INIT = '.layui-table-init';
  var ELEM_HEADER = '.layui-table-header';
  var ELEM_BODY = '.layui-table-body';
  var ELEM_MAIN = '.layui-table-main';
  var ELEM_FIXED = '.layui-table-fixed';
  var ELEM_FIXL = '.layui-table-fixed-l';
  var ELEM_FIXR = '.layui-table-fixed-r';
  var ELEM_TOTAL = '.layui-table-total';
  var ELEM_PAGE = '.layui-table-page';
  var ELEM_PAGE_VIEW = '.layui-table-pageview';
  var ELEM_SORT = '.layui-table-sort';
  var ELEM_CHECKED = 'layui-table-checked';
  var ELEM_EDIT = 'layui-table-edit';
  var ELEM_HOVER = 'layui-table-hover';
  var ELEM_GROUP = 'laytable-cell-group';
  var ELEM_COL_SPECIAL = 'layui-table-col-special';
  var ELEM_TOOL_PANEL = 'layui-table-tool-panel';
  var ELEM_EXPAND = 'layui-table-expanded'

  var DATA_MOVE_NAME = 'LAY_TABLE_MOVE_DICT';

  // thead 區域模板
  var TPL_HEADER = function(options){
    var rowCols = '{{#var colspan = layui.type(item2.colspan2) === \'number\' ? item2.colspan2 : item2.colspan; if(colspan){}} colspan="{{=colspan}}"{{#} if(item2.rowspan){}} rowspan="{{=item2.rowspan}}"{{#}}}';

    options = options || {};
    return ['<table cellspacing="0" cellpadding="0" border="0" class="layui-table" '
      ,'{{# if(d.data.skin){ }}lay-skin="{{=d.data.skin}}"{{# } }} {{# if(d.data.size){ }}lay-size="{{=d.data.size}}"{{# } }} {{# if(d.data.even){ }}lay-even{{# } }}>'
      ,'<thead>'
      ,'{{# layui.each(d.data.cols, function(i1, item1){ }}'
        ,'<tr>'
        ,'{{# layui.each(item1, function(i2, item2){ }}'
          ,'{{# if(item2.fixed && item2.fixed !== "right"){ left = true; } }}'
          ,'{{# if(item2.fixed === "right"){ right = true; } }}'
          ,function(){
            if(options.fixed && options.fixed !== 'right'){
              return '{{# if(item2.fixed && item2.fixed !== "right"){ }}';
            }
            if(options.fixed === 'right'){
              return '{{# if(item2.fixed === "right"){ }}';
            }
            return '';
          }()
          ,'{{# var isSort = !(item2.colGroup) && item2.sort; }}'
          ,'<th data-field="{{= item2.field||i2 }}" data-key="{{=d.index}}-{{=i1}}-{{=i2}}" {{# if( item2.parentKey){ }}data-parentkey="{{= item2.parentKey }}"{{# } }} {{# if(item2.minWidth){ }}data-minwidth="{{=item2.minWidth}}"{{# } }} {{# if(item2.maxWidth){ }}data-maxwidth="{{=item2.maxWidth}}"{{# } }} {{# if(item2.style){ }}style="{{=item2.style}}"{{# } }} '+ rowCols +' {{# if(item2.unresize || item2.colGroup){ }}data-unresize="true"{{# } }} class="{{# if(item2.hide){ }}layui-hide{{# } }}{{# if(isSort){ }} layui-unselect{{# } }}{{# if(!item2.field){ }} layui-table-col-special{{# } }}"{{# if(item2.title){ }} title="{{ layui.$(\'<div>\' + item2.title + \'</div>\').text() }}"{{# } }}>'
            ,'<div class="layui-table-cell laytable-cell-'
              ,'{{# if(item2.colGroup){ }}'
                ,'group'
              ,'{{# } else { }}'
                ,'{{=d.index}}-{{=i1}}-{{=i2}}'
                ,'{{# if(item2.type !== "normal"){ }}'
                  ,' laytable-cell-{{= item2.type }}'
                ,'{{# } }}'
              ,'{{# } }}'
            ,'" {{#if(item2.align){}}align="{{=item2.align}}"{{#}}}>'
              ,'{{# if(item2.type === "checkbox"){ }}' //複選框
                ,'<input type="checkbox" name="layTableCheckbox" lay-skin="primary" lay-filter="layTableAllChoose" {{# if(item2[d.data.checkName]){ }}checked{{# }; }}>'
              ,'{{# } else { }}'
                ,'<span>{{-item2.title||""}}</span>'
                ,'{{# if(isSort){ }}'
                  ,'<span class="layui-table-sort layui-inline"><i class="layui-edge layui-table-sort-asc" title="升序"></i><i class="layui-edge layui-table-sort-desc" title="降序"></i></span>'
                ,'{{# } }}'
              ,'{{# } }}'
            ,'</div>'
          ,'</th>'
          ,(options.fixed ? '{{# }; }}' : '')
        ,'{{# }); }}'
        ,'</tr>'
      ,'{{# }); }}'
      ,'</thead>'
    ,'</table>'].join('');
  };

  // tbody 區域模板
  var TPL_BODY = ['<table cellspacing="0" cellpadding="0" border="0" class="layui-table" '
    ,'{{# if(d.data.skin){ }}lay-skin="{{=d.data.skin}}"{{# } }} {{# if(d.data.size){ }}lay-size="{{=d.data.size}}"{{# } }} {{# if(d.data.even){ }}lay-even{{# } }}>'
    ,'<tbody></tbody>'
  ,'</table>'].join('');

  // 主模板
  var TPL_MAIN = [
    ,'{{# if(d.data.toolbar){ }}'
    ,'<div class="layui-table-tool">'
      ,'<div class="layui-table-tool-temp"></div>'
      ,'<div class="layui-table-tool-self"></div>'
    ,'</div>'
    ,'{{# } }}'

    ,'<div class="layui-table-box">'
      ,'{{# if(d.data.loading){ }}'
      ,'<div class="layui-table-init" style="background-color: #fff;">'
        ,'<i class="layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop"></i>'
      ,'</div>'
      ,'{{# } }}'

      ,'{{# var left, right; }}'
      ,'<div class="layui-table-header">'
        ,TPL_HEADER()
      ,'</div>'
      ,'<div class="layui-table-body layui-table-main">'
        ,TPL_BODY
      ,'</div>'

      ,'{{# if(left){ }}'
      ,'<div class="layui-table-fixed layui-table-fixed-l">'
        ,'<div class="layui-table-header">'
          ,TPL_HEADER({fixed: true})
        ,'</div>'
        ,'<div class="layui-table-body">'
          ,TPL_BODY
        ,'</div>'
      ,'</div>'
      ,'{{# }; }}'

      ,'{{# if(right){ }}'
      ,'<div class="layui-table-fixed layui-table-fixed-r layui-hide">'
        ,'<div class="layui-table-header">'
          ,TPL_HEADER({fixed: 'right'})
          ,'<div class="layui-table-mend"></div>'
        ,'</div>'
        ,'<div class="layui-table-body">'
          ,TPL_BODY
        ,'</div>'
      ,'</div>'
      ,'{{# }; }}'
    ,'</div>'

    ,'{{# if(d.data.totalRow){ }}'
      ,'<div class="layui-table-total">'
        ,'<table cellspacing="0" cellpadding="0" border="0" class="layui-table" '
        ,'{{# if(d.data.skin){ }}lay-skin="{{=d.data.skin}}"{{# } }} {{# if(d.data.size){ }}lay-size="{{=d.data.size}}"{{# } }} {{# if(d.data.even){ }}lay-even{{# } }}>'
          ,'<tbody><tr><td><div class="layui-table-cell" style="visibility: hidden;">Total</div></td></tr></tbody>'
      , '</table>'
      ,'</div>'
    ,'{{# } }}'

    ,'<div class="layui-table-column layui-table-page layui-hide">'
      ,'<div class="layui-inline layui-table-pageview" id="layui-table-page{{=d.index}}"></div>'
    ,'</div>'
  ].join('');

  var _WIN = $(window);
  var _DOC = $(document);

  // constructor
  var Class = function(options){
    var that = this;
    that.index = ++table.index;
    that.config = $.extend({}, that.config, table.config, options);
    that.render();
  };

  // 初始默認配置
  Class.prototype.config = {
    limit: 10, // 每頁顯示的數量
    loading: true, // 請求數據時，是否顯示 loading
    escape: true, // 是否開啟 HTML 編碼功能，即轉義 html 原文
    cellMinWidth: 60, // 所有單元格默認最小寬度
    cellMaxWidth: Number.MAX_VALUE, // 所有單元格默認最大寬度
    editTrigger: 'click', // 單元格編輯的事件觸發方式
    defaultToolbar: ['filter', 'exports', 'print'], // 工具欄右側圖標
    defaultContextmenu: true, // 顯示默認上下文菜單
    autoSort: true, // 是否前端自動排序。如果否，則需自主排序（通常為服務端處理好排序）
    text: {
      none: '無數據'
    },
    cols: []
  };

  // 表格渲染
  Class.prototype.render = function(type){
    var that = this;
    var options = that.config;

    options.elem = $(options.elem);
    options.where = options.where || {};

    // 初始化 id 屬性 - 優先取 options > 元素 id > 自增索引
    var id = options.id = 'id' in options ? options.id : (
      options.elem.attr('id') || that.index
    );

    thisTable.that[id] = that; // 記錄當前實例對象
    thisTable.config[id] = options; // 記錄當前實例配置項

    //請求參數的自定義格式
    options.request = $.extend({
      pageName: 'page',
      limitName: 'limit'
    }, options.request)

    // 響應數據的自定義格式
    options.response = $.extend({
      statusName: 'code', //規定數據狀態的字段名稱
      statusCode: 0, //規定成功的狀態碼
      msgName: 'msg', //規定狀態信息的字段名稱
      dataName: 'data', //規定數據總數的字段名稱
      totalRowName: 'totalRow', //規定數據統計的字段名稱
      countName: 'count'
    }, options.response);

    //如果 page 傳入 laypage 對象
    if(options.page !== null && typeof options.page === 'object'){
      options.limit = options.page.limit || options.limit;
      options.limits = options.page.limits || options.limits;
      that.page = options.page.curr = options.page.curr || 1;
      delete options.page.elem;
      delete options.page.jump;
    }

    if(!options.elem[0]) return that;

    // 若元素未設 lay-filter 屬性，則取實例 id 值
    if(!options.elem.attr('lay-filter')){
      options.elem.attr('lay-filter', options.id);
    }

    // 僅重載數據
    if(type === 'reloadData'){
       // 請求數據
      return that.pullData(that.page, {
        type: 'reloadData'
      });
    }

    // 初始化索引
    options.index = that.index;
    that.key = options.id || options.index;

    //初始化一些其他參數
    that.setInit();

    //高度鋪滿：full-差距值
    if(options.height && /^full-\d+$/.test(options.height)){
      that.fullHeightGap = options.height.split('-')[1];
      options.height = _WIN.height() - that.fullHeightGap;
    } else if (options.height && /^#\w+\S*-\d+$/.test(options.height)) {
      var parentDiv = options.height.split("-");
      that.parentHeightGap = parentDiv.pop();
      that.parentDiv = parentDiv.join("-");
      options.height = $(that.parentDiv).height() - that.parentHeightGap;
    }

    // 開始插入替代元素
    var othis = options.elem;
    var hasRender = othis.next('.' + ELEM_VIEW);

    // 主容器
    var reElem = that.elem = $('<div></div>');

    // 添加 className
    reElem.addClass(function(){
      var arr = [
        ELEM_VIEW,
        ELEM_VIEW +'-'+ that.index,
        'layui-form',
        'layui-border-box'
      ];
      if(options.className) arr.push(options.className);
      return arr.join(' ');
    }()).attr({
      'lay-filter': 'LAY-TABLE-FORM-DF-'+ that.index,
      'lay-id': options.id,
      'style': function(){
        var arr = [];
        if(options.width) arr.push('width:'+ options.width + 'px;');
        // if(options.height) arr.push('height:'+ options.height + 'px;');
        return arr.join('')
      }()
    }).html(laytpl(TPL_MAIN, {
      open: '{{', // 標籤符前綴
      close: '}}' // 標籤符後綴
    }).render({
      data: options,
      index: that.index //索引
    }));

    // 初始化樣式
    that.renderStyle();

    // 生成替代元素
    hasRender[0] && hasRender.remove(); // 如果已經渲染，則 Rerender
    othis.after(reElem);

    // 各級容器
    that.layTool = reElem.find(ELEM_TOOL);
    that.layBox = reElem.find(ELEM_BOX);
    that.layHeader = reElem.find(ELEM_HEADER);
    that.layMain = reElem.find(ELEM_MAIN);
    that.layBody = reElem.find(ELEM_BODY);
    that.layFixed = reElem.find(ELEM_FIXED);
    that.layFixLeft = reElem.find(ELEM_FIXL);
    that.layFixRight = reElem.find(ELEM_FIXR);
    that.layTotal = reElem.find(ELEM_TOTAL);
    that.layPage = reElem.find(ELEM_PAGE);

    // 初始化頭部工具欄
    that.renderToolbar();

    // 初始化底部分頁欄
    that.renderPagebar();

    // 讓表格平鋪
    that.fullSize();

    that.pullData(that.page); // 請求數據
    that.events(); // 事件
  };

  // 根據列類型，定製化參數
  Class.prototype.initOpts = function(item){
    var that = this
    var options = that.config;
    var initWidth = {
      checkbox: 50,
      radio: 50,
      space: 30,
      numbers: 60
    };

    // 讓 type 參數兼容舊版本
    if(item.checkbox) item.type = "checkbox";
    if(item.space) item.type = "space";
    if(!item.type) item.type = "normal";

    if(item.type !== "normal"){
      item.unresize = true;
      item.width = item.width || initWidth[item.type];
    }
  };

  //初始化一些參數
  Class.prototype.setInit = function(type){
    var that = this;
    var options = that.config;

    options.clientWidth = options.width || function(){ //獲取容器寬度
      //如果父元素寬度為0（一般為隱藏元素），則繼續查找上層元素，直到找到真實寬度為止
      var getWidth = function(parent){
        var width, isNone;
        parent = parent || options.elem.parent()
        width = parent.width();
        try {
          isNone = parent.css('display') === 'none';
        } catch(e){}
        if(parent[0] && (!width || isNone)) return getWidth(parent.parent());
        return width;
      };
      return getWidth();
    }();

    if(type === 'width') return options.clientWidth;
    // 初始化高度配置，如果設置了最高高度，以最高高度形式為準
    options.height = options.maxHeight || options.height;

    // 初始化 css 參數
    if(options.css && options.css.indexOf(ELEM_VIEW) === -1){
      var css = options.css.split('}');
      layui.each(css, function(index, value){
        if(value){
          css[index] = '.'+ ELEM_VIEW + '-'+ that.index + ' ' + value;
        }
      });
      options.css = css.join('}');
    }

    // 封裝對 col 的配置處理
    var initChildCols = function (i1, item1, i2, item2) {
      //如果列參數為空，則移除
      if (!item2) {
        item1.splice(i2, 1);
        return;
      }

      item2.key = [options.index, i1, i2].join('-');
      item2.colspan = item2.colspan || 0;
      item2.rowspan = item2.rowspan || 0;

      //根據列類型，定製化參數
      that.initOpts(item2);

      //設置列的父列索引
      //如果是組合列，則捕獲對應的子列
      var indexChild = i1 + (parseInt(item2.rowspan) || 1);
      if (indexChild < options.cols.length) { // 只要不是最後一層都會有子列
        item2.colGroup = true;
        var childIndex = 0;
        layui.each(options.cols[indexChild], function (i22, item22) {
          //如果子列已經被標註為{HAS_PARENT}，或者子列累計 colspan 數等於父列定義的 colspan，則跳出當前子列循環
          if (item22.HAS_PARENT || (childIndex >= 1 && childIndex == (item2.colspan || 1))) return;

          item22.HAS_PARENT = true;
          item22.parentKey = [options.index, i1, i2].join('-') // i1 + '-' + i2;
          childIndex = childIndex + parseInt(item22.colspan > 1 ? item22.colspan : 1);
          initChildCols(indexChild, options.cols[indexChild], i22, item22);
        });
      } else {
        item2.colGroup = false;
      }
      item2.hide = item2.hide && !item2.colGroup || false; // 初始化中中間節點的hide信息不做處理，否則會出錯，如果需要必須將其子節點也都同步成hide
    };

    // 初始化列參數
    layui.each(options.cols, function(i1, item1){
      layui.each(item1, function(i2, item2){
        if (i1) {
          delete item2.HAS_PARENT; // 去掉臨時的計數排除標識，避免有新字段插入的時候重新計算被跳過導致下標出錯的問題
        } else {
          initChildCols(i1, item1, i2, item2); // 只解析頂層節點由遞歸完成解析
        }
      });
    });

  };

  // 初始化樣式
  Class.prototype.renderStyle = function() {
    var that = this;
    var options = that.config;
    var index = that.index;
    var text = [];

    // 單元格寬度
    layui.each(options.cols, function(i1, item1) {
      layui.each(item1, function(i2, item2) {
        var key = [index, i1, i2].join('-');
        var val = item2.width ? ['width: ', item2.width, 'px'].join('') : '';
        text.push('.laytable-cell-'+ key +'{'+ val +'}');
      });
    });

    // 自定義行樣式
    (function (lineStyle) {
      if (!lineStyle) return;
      var trClassName = '.layui-table-view-'+ index +' .layui-table-body .layui-table tr';
      var rules = lineStyle.split(';');
      var cellMaxHeight = 'none';

      // 計算單元格最大高度
      layui.each(rules, function(i, rule) {
        rule = rule.split(':');
        if (rule[0] === 'height') {
          var val = parseFloat(rule[1]);
          if (!isNaN(val)) cellMaxHeight = (val - 1) + 'px';
          return true;
        }
      });

      // 多行相關樣式
      layui.each([
        '{'+ lineStyle +'}',
        '.layui-table-cell{height: auto; max-height: '+ cellMaxHeight +'; white-space: normal; text-overflow: clip;}',
        '> td:hover > .layui-table-cell{overflow: auto;}'
      ].concat(
        device.ie ? [
          '.layui-table-edit{height: '+ cellMaxHeight +';}',
          'td[data-edit]:hover:after{height: '+ cellMaxHeight +';}'
        ] : []
      ), function(i, val) {
        val && text.push(trClassName + ' ' + val);
      });
    })(options.lineStyle);

    // 自定義 css 屬性
    if (options.css) text.push(options.css);

    // 生成 style
    lay.style({
      target: that.elem[0],
      text: text.join(''),
      id: 'DF-table-'+ index
    });
  };

  // 初始工具欄
  Class.prototype.renderToolbar = function(){
    var that = this
    var options = that.config

    // 添加工具欄左側模板
    var leftDefaultTemp = [
      '<div class="layui-inline" lay-event="add"><i class="layui-icon layui-icon-add-1"></i></div>',
      '<div class="layui-inline" lay-event="update"><i class="layui-icon layui-icon-edit"></i></div>',
      '<div class="layui-inline" lay-event="delete"><i class="layui-icon layui-icon-delete"></i></div>'
    ].join('');
    var elemToolTemp = that.layTool.find('.layui-table-tool-temp');

    if(options.toolbar === 'default'){
      elemToolTemp.html(leftDefaultTemp);
    } else if(typeof options.toolbar === 'string'){
      var toolbarHtml = $(options.toolbar).html() || '';
      toolbarHtml && elemToolTemp.html(
        laytpl(toolbarHtml).render(options)
      );
    }

    // 添加工具欄右側面板
    var layout = {
      filter: {
        title: '篩選列',
        layEvent: 'LAYTABLE_COLS',
        icon: 'layui-icon-cols'
      },
      exports: {
        title: '導出',
        layEvent: 'LAYTABLE_EXPORT',
        icon: 'layui-icon-export'
      },
      print: {
        title: '打印',
        layEvent: 'LAYTABLE_PRINT',
        icon: 'layui-icon-print'
      }
    }, iconElem = [];

    if(typeof options.defaultToolbar === 'object'){
      layui.each(options.defaultToolbar, function(i, item){
        var thisItem = typeof item === 'string' ? layout[item] : item;
        if(thisItem){
          iconElem.push('<div class="layui-inline" title="'+ thisItem.title +'" lay-event="'+ thisItem.layEvent +'">'
            +'<i class="layui-icon '+ thisItem.icon +'"></i>'
          +'</div>');
        }
      });
    }
    that.layTool.find('.layui-table-tool-self').html(iconElem.join(''));
  };

  // 分頁欄
  Class.prototype.renderPagebar = function(){
    var that = this;
    var options = that.config;

    var layPagebar = that.layPagebar = $('<div class="layui-inline layui-table-pagebar"></div>');

    // 開啟分頁欄自定義模板
    if(options.pagebar){
      var pagebarHtml = $(options.pagebar).html() || '';
      pagebarHtml && layPagebar.append(laytpl(pagebarHtml).render(options));
      that.layPage.append(layPagebar);
    }
  };

  // 同步表頭父列的相關值
  Class.prototype.setParentCol = function(hide, parentKey){
    var that = this;
    var options = that.config;

    var parentTh = that.layHeader.find('th[data-key="'+ parentKey +'"]'); // 獲取父列元素
    var parentColspan = parseInt(parentTh.attr('colspan')) || 0;

    if(parentTh[0]){
      var arrParentKey = parentKey.split('-');
      var getThisCol = options.cols[arrParentKey[1]][arrParentKey[2]];

      hide ? parentColspan-- : parentColspan++;

      parentTh.attr('colspan', parentColspan);
      parentTh[parentColspan ? 'removeClass' : 'addClass'](HIDE); // 如果子列顯示，父列必然需要顯示

      getThisCol.colspan2 = parentColspan; // 更新實際的 colspan 數
      getThisCol.hide = parentColspan < 1; // 同步 hide 參數

      // 遞歸，繼續往上查詢是否有父列
      var nextParentKey = parentTh.data('parentkey');
      nextParentKey && that.setParentCol(hide, nextParentKey);
    }
  };

  // 多級表頭補丁
  Class.prototype.setColsPatch = function(){
    var that = this;
    var options = that.config;

    // 同步表頭父列的相關值
    layui.each(options.cols, function(i1, item1){
      layui.each(item1, function(i2, item2){
        if(item2.hide){
          that.setParentCol(item2.hide, item2.parentKey);
        }
      });
    });
  };

  // 設置組合表頭的最大寬度
  Class.prototype.setGroupWidth = function(th){
    var that = this;
    var options = that.config;

    if(options.cols.length <= 1) return;

    // 獲取表頭組合
    var groups = that.layHeader.find((
      // 根據當前活動的表頭 parentkey 屬性查找其組合表頭
      th ? ('th[data-key='+ th.data('parentkey') +']>') : ''
    ) + '.' + ELEM_GROUP); // 若無指向當前活動表頭，則自下而上獲取所有組合表頭

    groups.css('width', 0);
    layui.each(groups.get().reverse(), function(){
      var othis = $(this);
      var key = othis.parent().data('key');
      var maxWidth = 0;

      that.layHeader.eq(0).find('th[data-parentkey='+ key +']').width(function(i, width){
        var oTh = $(this);
        if(oTh.hasClass(HIDE)) return;
        width > 0 && (maxWidth += width);
      });

      // 給組合表頭賦值最大寬度
      if(maxWidth) othis.css('max-width', maxWidth - 1);

      // 若當前活動的組合表頭仍存在上級，則繼續向上設置
      if(th && othis.parent().data('parentkey')){
        that.setGroupWidth(othis.parent());
      }
    });
    groups.css('width', 'auto');
  };

  // 動態分配列寬
  Class.prototype.setColsWidth = function(){
    var that = this;
    var options = that.config;
    var colNums = 0; // 列個數
    var autoColNums = 0; // 自動列寬的列個數
    var autoWidth = 0; // 自動列分配的寬度
    var countWidth = 0; // 所有列總寬度和
    var cntrWidth = that.setInit('width');

    // 統計列個數
    that.eachCols(function(i, item){
      item.hide || colNums++;
    });

    // 減去邊框差和滾動條寬
    cntrWidth = cntrWidth - function(){
      return (options.skin === 'line' || options.skin === 'nob') ? 2 : colNums + 1;
    }() - that.getScrollWidth(that.layMain[0]) - 1;

    // 計算自動分配的寬度
    var getAutoWidth = function(back){
      // 遍歷所有列
      layui.each(options.cols, function(i1, item1){
        layui.each(item1, function(i2, item2){
          var width = 0;
          var minWidth = item2.minWidth || options.cellMinWidth; // 最小寬度
          var maxWidth = item2.maxWidth || options.cellMaxWidth; // 最大寬度

          if(!item2){
            item1.splice(i2, 1);
            return;
          }

          if(item2.colGroup || item2.hide) return;

          if(!back){
            width = item2.width || 0;
            if(/\d+%$/.test(width)){ // 列寬為百分比
              width = Math.floor((parseFloat(width) / 100) * cntrWidth);
              width < minWidth && (width = minWidth);
              width > maxWidth && (width = maxWidth);
            } else if(!width){ // 列寬未填寫
              item2.width = width = 0;
              autoColNums++;
            } else if(item2.type === 'normal'){
              // 若 width 小於 minWidth， 則將 width 值自動設為 minWidth 的值
              width < minWidth && (item2.width = width = minWidth);
              // 若 width 大於 maxWidth， 則將 width 值自動設為 maxWidth 的值
              width > maxWidth && (item2.width = width = maxWidth);
            }
          } else if(autoWidth && autoWidth < minWidth){
            autoColNums--;
            width = minWidth;
          } else if(autoWidth && autoWidth > maxWidth){
            autoColNums--;
            width = maxWidth;
          }

          if(item2.hide) width = 0;
          countWidth = countWidth + width;
        });
      });

      // 如果未填充滿，則將剩餘寬度平分
      (cntrWidth > countWidth && autoColNums > 0) && (
        autoWidth = (cntrWidth - countWidth) / autoColNums
      );
    }

    getAutoWidth();
    getAutoWidth(true); // 重新檢測分配的寬度是否低於最小列寬

    // 記錄自動列數
    that.autoColNums = autoColNums = autoColNums > 0 ? autoColNums : 0;

    // 設置列寬
    that.eachCols(function(i3, item3){
      var minWidth = item3.minWidth || options.cellMinWidth;
      var maxWidth = item3.maxWidth || options.cellMaxWidth;

      if(item3.colGroup || item3.hide) return;

      // 給未分配寬的列平均分配寬
      if(item3.width === 0){
        that.cssRules(item3.key, function(item){
          item.style.width = Math.floor(function(){
            if(autoWidth < minWidth) return minWidth;
            if(autoWidth > maxWidth) return maxWidth;
            return autoWidth;
          }()) + 'px';
        });
      }

      // 給設定百分比的列分配列寬
      else if(/\d+%$/.test(item3.width)){
        that.cssRules(item3.key, function(item){
          var width = Math.floor((parseFloat(item3.width) / 100) * cntrWidth);
          width < minWidth && (width = minWidth);
          width > maxWidth && (width = maxWidth);
          item.style.width = width + 'px';
        });
      }

      // 給擁有普通 width 值的列分配最新列寬
      else {
        that.cssRules(item3.key, function(item){
          item.style.width = item3.width + 'px';
        });
      }
    });

    // 填補 Math.floor 造成的數差
    var patchNums = that.layMain.width() - that.getScrollWidth(that.layMain[0])
    - that.layMain.children('table').outerWidth();

    if(that.autoColNums > 0 && patchNums >= -colNums && patchNums <= colNums){
      var getEndTh = function(th){
        var field;
        th = th || that.layHeader.eq(0).find('thead > tr:first-child > th:last-child')
        field = th.data('field');
        if(!field && th.prev()[0]){
          return getEndTh(th.prev())
        }
        return th;
      };
      var th = getEndTh();
      var key = th.data('key');

      that.cssRules(key, function(item){
        var width = item.style.width || th.outerWidth();
        item.style.width = (parseFloat(width) + patchNums) + 'px';

        // 二次校驗，如果仍然出現橫向滾動條（通常是 1px 的誤差導致）
        if(that.layMain.height() - that.layMain.prop('clientHeight') > 0){
          item.style.width = (parseFloat(item.style.width) - 1) + 'px';
        }
      });
    }

    that.setGroupWidth();

    // 如果表格內容為空（無數據 或 請求異常）
    if (that.layMain.find('tbody').is(":empty")) {
      // 將表格寬度設置為跟表頭一樣的寬度，使之可以出現底部滾動條，以便滾動查看所有字段
      var headerWidth = that.layHeader.first().children('table').width()
      that.layMain.find('table').width(headerWidth);
    } else {
      that.layMain.find('table').width('auto');
    }

    that.loading(!0);
  };

  // 重置表格尺寸/結構
  Class.prototype.resize = function(){
    var that = this;

    if (!that.layMain) return;

    that.fullSize(); // 讓表格鋪滿
    that.setColsWidth(); // 自適應列寬
    that.scrollPatch(); // 滾動條補丁
  };

  // 表格重載
  Class.prototype.reload = function(options, deep, type){
    var that = this;

    options = options || {};
    delete that.haveInit;

    // 防止數組深度合併
    layui.each(options, function(key, item){
      if(layui.type(item) === 'array') delete that.config[key];
    });

    // 對參數進行深度或淺擴展
    that.config = $.extend(deep, {}, that.config, options);
    if (type !== 'reloadData') {
      layui.each(that.config.cols, function (i1, item1) {
        layui.each(item1, function (i2, item2) {
          delete item2.colspan2;
        })
      })
      delete that.config.HAS_SET_COLS_PATCH;
    }
    // 執行渲染
    that.render(type);
  };

  // 異常提示
  Class.prototype.errorView = function(html){
    var that = this
    ,elemNone = that.layMain.find('.'+ NONE)
    ,layNone = $('<div class="'+ NONE +'">'+ (html || 'Error') +'</div>');

    if(elemNone[0]){
      that.layNone.remove();
      elemNone.remove();
    }

    that.layFixed.addClass(HIDE);
    that.layMain.find('tbody').html('');

    that.layMain.append(that.layNone = layNone);

    // 異常情況下對 page 和 total 的內容處理
    that.layTotal.addClass(HIDE_V);
    that.layPage.find(ELEM_PAGE_VIEW).addClass(HIDE_V);

    table.cache[that.key] = []; //格式化緩存數據

    that.syncCheckAll();
    that.renderForm();
    that.setColsWidth();
  };

  // 初始頁碼
  Class.prototype.page = 1;

  // 獲得數據
  Class.prototype.pullData = function(curr, opts){
    var that = this;
    var options = that.config;
    // 同步表頭父列的相關值
    options.HAS_SET_COLS_PATCH || that.setColsPatch();
    options.HAS_SET_COLS_PATCH = true;
    var request = options.request;
    var response = options.response;
    var res;
    var sort = function(){
      if(typeof options.initSort === 'object'){
        that.sort({
          field: options.initSort.field,
          type: options.initSort.type,
          reloadType: opts.type
        });
      }
    };
    var done = function(res, origin){
      that.setColsWidth();
      typeof options.done === 'function' && options.done(
        res, curr, res[response.countName], origin
      );
    };

    opts = opts || {};

    // 數據拉取前的回調
    typeof options.before === 'function' && options.before(
      options
    );
    that.startTime = new Date().getTime(); // 渲染開始時間

    if (opts.renderData) { // 將 cache 信息重新渲染
      res = {};
      res[response.dataName] = table.cache[that.key];
      res[response.countName] = options.url ? (layui.type(options.page) === 'object' ? options.page.count : res[response.dataName].length) : options.data.length;

      // 記錄合計行數據
      if(typeof options.totalRow === 'object'){
        res[response.totalRowName] = $.extend({}, that.totalRow);
      }

      that.renderData({
        res: res,
        curr: curr,
        count: res[response.countName],
        type: opts.type,
        sort: true
      }), done(res, 'renderData');
    } else if(options.url){ // Ajax請求
      var params = {};
      // 當 page 開啟，默認自動傳遞 page、limit 參數
      if(options.page){
        params[request.pageName] = curr;
        params[request.limitName] = options.limit;
      }

      // 參數
      var data = $.extend(params, options.where);
      if(options.contentType && options.contentType.indexOf("application/json") == 0){ // 提交 json 格式
        data = JSON.stringify(data);
      }

      that.loading();

      $.ajax({
        type: options.method || 'get',
        url: options.url,
        contentType: options.contentType,
        data: data,
        dataType: options.dataType || 'json',
        jsonpCallback: options.jsonpCallback,
        headers: options.headers || {},
        complete: function(xhr,ts){
          typeof options.complete === 'function' && options.complete(xhr, ts);
        },
        success: function(res){
          // 若有數據解析的回調，則獲得其返回的數據
          if(typeof options.parseData === 'function'){
            res = options.parseData(res) || res;
          }
          // 檢查數據格式是否符合規範
          if(res[response.statusName] != response.statusCode){
            that.errorView(
              res[response.msgName] ||
              ('返回的數據不符合規範，正確的成功狀態碼應為："'+ response.statusName +'": '+ response.statusCode)
            );
          } else {
            that.totalRow = res[response.totalRowName];
            that.renderData({
              res: res,
              curr: curr,
              count: res[response.countName],
              type: opts.type
            }), sort();

            // 耗時（接口請求+視圖渲染）
            options.time = (new Date().getTime() - that.startTime) + ' ms';
          }
          done(res);
        },
        error: function(e, msg){
          that.errorView('請求異常，錯誤提示：'+ msg);
          typeof options.error === 'function' && options.error(e, msg);
        }
      });
    } else if(layui.type(options.data) === 'array'){ //已知數據
      res = {};
      var startLimit = curr*options.limit - options.limit;
      var newData = options.data.concat();

      res[response.dataName] = options.page
        ? newData.splice(startLimit, options.limit)
      : newData;
      res[response.countName] = options.data.length;

      // 記錄合計行數據
      if(typeof options.totalRow === 'object'){
        res[response.totalRowName] = $.extend({}, options.totalRow);
      }
      that.totalRow = res[response.totalRowName];

      that.renderData({
        res: res,
        curr: curr,
        count: res[response.countName],
        type: opts.type
      }), sort();

      done(res);
    }
  };

  // 遍歷表頭
  Class.prototype.eachCols = function(callback){
    var that = this;
    table.eachCols(null, callback, that.config.cols);
    return that;
  };

  // 獲取表頭參數項
  Class.prototype.col = function(key){
    try {
      key = key.split('-');
      return this.config.cols[key[1]][key[2]] || {};
    } catch(e){
      hint.error(e);
      return {};
    }
  };

  Class.prototype.getTrHtml = function(data, sort, curr, trsObj) {
    var that = this;
    var options = that.config;
    var trs = trsObj && trsObj.trs || [];
    var trs_fixed = trsObj && trsObj.trs_fixed || [];
    var trs_fixed_r = trsObj && trsObj.trs_fixed_r || [];
    curr = curr || 1

    layui.each(data, function(i1, item1){
      var tds = [];
      var tds_fixed = [];
      var tds_fixed_r = [];
      var numbers = i1 + options.limit*(curr - 1) + 1; // 序號

      // 數組值是否為 object，如果不是，則自動轉為 object
      if(typeof item1 !== 'object'){
        data[i1] = item1 = {LAY_KEY: item1};
        try {
          table.cache[that.key][i1] = item1;
        } catch(e) {}
      }

      //若數據項為空數組，則不往下執行（因為刪除數據時，會將原有數據設置為 []）
      if(layui.type(item1) === 'array' && item1.length === 0) return;

      // 加入序號保留字段
      item1[table.config.numbersName] = numbers;

      // 記錄下標索引，用於恢復排序
      if(!sort) item1[table.config.indexName] = i1;

      // 遍歷表頭
      that.eachCols(function(i3, item3){
        var field = item3.field || i3;
        var key = item3.key;
        var content = item1[field];

        if(content === undefined || content === null) content = '';
        if(item3.colGroup) return;

        // td 內容
        var td = ['<td data-field="'+ field +'" data-key="'+ key +'" '+ function(){
          // 追加各種屬性
          var attr = [];
          // 是否開啟編輯。若 edit 傳入函數，則根據函數的返回結果判斷是否開啟編輯
          (function(edit){
            if(edit) attr.push('data-edit="'+ edit +'"'); // 添加單元格編輯屬性標識
          })(typeof item3.edit === 'function' ? item3.edit(item1) : item3.edit);
          if(item3.templet) attr.push('data-content="'+ util.escape(content) +'"'); // 自定義模板
          if(item3.toolbar) attr.push('data-off="true"'); // 行工具列關閉單元格事件
          if(item3.event) attr.push('lay-event="'+ item3.event +'"'); //自定義事件
          if(item3.minWidth) attr.push('data-minwidth="'+ item3.minWidth +'"'); // 單元格最小寬度
          if(item3.maxWidth) attr.push('data-maxwidth="'+ item3.maxWidth +'"'); // 單元格最大寬度
          if(item3.style) attr.push('style="'+ item3.style +'"'); // 自定義單元格樣式
          return attr.join(' ');
        }() +' class="'+ function(){ // 追加樣式
          var classNames = [];
          if(item3.hide) classNames.push(HIDE); // 插入隱藏列樣式
          if(!item3.field) classNames.push(ELEM_COL_SPECIAL); // 插入特殊列樣式
          return classNames.join(' ');
        }() +'">'
          ,'<div class="layui-table-cell laytable-cell-'+ function(){ // 返回對應的CSS類標識
            return item3.type === 'normal' ? key
              : (key + ' laytable-cell-' + item3.type);
          }() +'"'
          + (item3.align ? ' align="'+ item3.align +'"' : '')
          +'>'
          + function(){
            var tplData = $.extend(true, {
              LAY_COL: item3
            }, item1);
            var checkName = table.config.checkName;
            var disabledName = table.config.disabledName;

            // 渲染不同風格的列
            switch(item3.type){
              case 'checkbox': // 複選
                return '<input type="checkbox" name="layTableCheckbox" lay-skin="primary" '+ function(){
                  // 其他屬性
                  var arr = [];

                  //如果是全選
                  if(item3[checkName]){
                    item1[checkName] = item3[checkName];
                    if(item3[checkName]) arr[0] = 'checked';
                  }
                  if(tplData[checkName]) arr[0] = 'checked';

                  // 禁選
                  if(tplData[disabledName]) arr.push('disabled');

                  return arr.join(' ');
                }() +' lay-type="layTableCheckbox">';
                //break;
              case 'radio': // 單選
                return '<input type="radio" name="layTableRadio_'+ options.index +'" '
                  + function(){
                    var arr = [];
                    if(tplData[checkName]) arr[0] = 'checked';
                    if(tplData[disabledName]) arr.push('disabled');
                    return arr.join(' ');
                  }() +' lay-type="layTableRadio">';
                //break;
              case 'numbers':
                return numbers;
                //break;
            }

            //解析工具列模板
            if(item3.toolbar){
              return laytpl($(item3.toolbar).html()||'').render(tplData);
            }
            return parseTempData.call(that, {
              item3: item3
              ,content: content
              ,tplData: tplData
            });
          }()
          ,'</div></td>'].join('');

        tds.push(td);
        if(item3.fixed && item3.fixed !== 'right') tds_fixed.push(td);
        if(item3.fixed === 'right') tds_fixed_r.push(td);
      });

      // 添加 tr 屬性
      var trAttr = function(){
        var arr = ['data-index="'+ i1 +'"'];
        if(item1[table.config.checkName]) arr.push('class="'+ ELEM_CHECKED +'"');
        return arr.join(' ');
      }();

      trs.push('<tr '+ trAttr +'>'+ tds.join('') + '</tr>');
      trs_fixed.push('<tr '+ trAttr +'>'+ tds_fixed.join('') + '</tr>');
      trs_fixed_r.push('<tr '+ trAttr +'>'+ tds_fixed_r.join('') + '</tr>');
    });

    return {
      trs: trs,
      trs_fixed: trs_fixed,
      trs_fixed_r: trs_fixed_r
    }
  }

  // 返回行節點代碼
  table.getTrHtml = function (id, data) {
    var that = getThisTable(id);
    return that.getTrHtml(data, null, that.page);
  }

  // 數據渲染
  Class.prototype.renderData = function(opts){
    var that = this;
    var options = that.config;

    var res = opts.res;
    var curr = opts.curr;
    var count = that.count = opts.count;
    var sort = opts.sort;

    var data = res[options.response.dataName] || []; //列表數據
    var totalRowData = res[options.response.totalRowName]; //合計行數據
    var trs = [];
    var trs_fixed = [];
    var trs_fixed_r = [];

    // 渲染視圖
    var render = function(){ // 後續性能提升的重點
      if(!sort && that.sortKey){
        return that.sort({
          field: that.sortKey.field,
          type: that.sortKey.sort,
          pull: true,
          reloadType: opts.type
        });
      }
      that.getTrHtml(data, sort, curr, {
        trs: trs,
        trs_fixed: trs_fixed,
        trs_fixed_r: trs_fixed_r
      });

      // 容器的滾動條位置
      if(!(options.scrollPos === 'fixed' && opts.type === 'reloadData')){
        that.layBody.scrollTop(0);
      }
      if(options.scrollPos === 'reset'){
        that.layBody.scrollLeft(0);
      }

      that.layMain.find('.'+ NONE).remove();
      that.layMain.find('tbody').html(trs.join(''));
      that.layFixLeft.find('tbody').html(trs_fixed.join(''));
      that.layFixRight.find('tbody').html(trs_fixed_r.join(''));

      // 渲染表單
      that.syncCheckAll();
      that.renderForm();

      // 因為 page 參數有可能發生變化 先重新鋪滿
      that.fullSize();

      // 滾動條補丁
      that.haveInit ? that.scrollPatch() : setTimeout(function(){
        that.scrollPatch();
      }, 50);
      that.haveInit = true;

      layer.close(that.tipsIndex);
    };

    table.cache[that.key] = data; //記錄數據

    //顯示隱藏合計欄
    that.layTotal[data.length == 0 ? 'addClass' : 'removeClass'](HIDE_V);

    //顯示隱藏分頁欄
    that.layPage[(options.page || options.pagebar) ? 'removeClass' : 'addClass'](HIDE);
    that.layPage.find(ELEM_PAGE_VIEW)[
      (!options.page || count == 0 || (data.length === 0 && curr == 1))
        ? 'addClass'
      : 'removeClass'
    ](HIDE_V);

    //如果無數據
    if(data.length === 0){
      return that.errorView(options.text.none);
    } else {
      that.layFixLeft.removeClass(HIDE);
    }

    //如果執行初始排序
    if(sort){
      return render();
    }

    //正常初始化數據渲染
    render(); //渲染數據
    that.renderTotal(data, totalRowData); //數據合計
    that.layTotal && that.layTotal.removeClass(HIDE);

    //同步分頁狀態
    if(options.page){
      options.page = $.extend({
        elem: 'layui-table-page' + options.index,
        count: count,
        limit: options.limit,
        limits: options.limits || [10,20,30,40,50,60,70,80,90],
        groups: 3,
        layout: ['prev', 'page', 'next', 'skip', 'count', 'limit'],
        prev: '<i class="layui-icon">&#xe603;</i>',
        next: '<i class="layui-icon">&#xe602;</i>',
        jump: function(obj, first){
          if(!first){
            //分頁本身並非需要做以下更新，下面參數的同步，主要是因為其它處理統一用到了它們
            //而並非用的是 options.page 中的參數（以確保分頁未開啟的情況仍能正常使用）
            that.page = obj.curr; //更新頁碼
            options.limit = obj.limit; //更新每頁條數

            that.pullData(obj.curr);
          }
        }
      }, options.page);
      options.page.count = count; //更新總條數
      laypage.render(options.page);
    }
  };

  // 重新渲染數據
  table.renderData = function (id) {
    var that = getThisTable(id);
    if (!that) {
      return;
    }

    that.pullData(that.page, {
      renderData: true,
      type: 'reloadData'
    });
  }

  // 數據合計行
  Class.prototype.renderTotal = function(data, totalRowData){
    var that = this;
    var options = that.config;
    var totalNums = {};

    if(!options.totalRow) return;

    layui.each(data, function(i1, item1){
      // 若數據項為空數組，則不往下執行（因為刪除數據時，會將原有數據設置為 []）
      if(layui.type(item1) === 'array' && item1.length === 0) return;

      that.eachCols(function(i3, item3){
        var field = item3.field || i3
        ,content = item1[field];

        if(item3.totalRow){
          totalNums[field] = (totalNums[field] || 0) + (parseFloat(content) || 0);
        }
      });
    });

    that.dataTotal = []; // 記錄合計行結果

    var tds = [];
    that.eachCols(function(i3, item3){
      var field = item3.field || i3;

      // 合計數據的特定字段
      var TOTAL_NUMS = totalRowData && totalRowData[item3.field];

      // 合計數據的小數點位數處理
      var decimals = 'totalRowDecimals' in item3 ? item3.totalRowDecimals : 2;
      var thisTotalNum = totalNums[field]
        ? parseFloat(totalNums[field] || 0).toFixed(decimals)
      : '';

      // td 顯示內容
      var content = function(){
        var text = item3.totalRowText || '';
        var tplData = {
          LAY_COL: item3
        };

        tplData[field] = thisTotalNum;

        // 獲取自動計算的合併內容
        var getContent = item3.totalRow ? (parseTempData.call(that, {
          item3: item3,
          content: thisTotalNum,
          tplData: tplData
        }) || text) : text;

        // 如果直接傳入了合計行數據，則不輸出自動計算的結果
        return TOTAL_NUMS || getContent;
      }();

      // 合計原始結果
      var total = TOTAL_NUMS || thisTotalNum || '';
      item3.field && that.dataTotal.push({
        field: item3.field,
        total: $('<div>'+ content +'</div>').text()
      });

      // td 容器
      var td = ['<td data-field="'+ field +'" data-key="'+ item3.key +'" '+ function(){
        var attr = [];
        if(item3.minWidth) attr.push('data-minwidth="'+ item3.minWidth +'"'); // 單元格最小寬度
        if(item3.maxWidth) attr.push('data-maxwidth="'+ item3.maxWidth +'"'); // 單元格最小寬度
        if(item3.style) attr.push('style="'+ item3.style +'"'); // 自定義單元格樣式
        return attr.join(' ');
      }() +' class="'+ function(){ // 追加樣式
        var classNames = [];
        if(item3.hide) classNames.push(HIDE); // 插入隱藏列樣式
        if(!item3.field) classNames.push(ELEM_COL_SPECIAL); // 插入特殊列樣式
        return classNames.join(' ');
      }() +'">',
        '<div class="layui-table-cell laytable-cell-'+ function(){ // 返回對應的CSS類標識
          var key = item3.key;
          return item3.type === 'normal' ? key
          : (key + ' laytable-cell-' + item3.type);
        }() +'"'+ function(){
        var attr = [];
        if(item3.align) attr.push('align="'+ item3.align +'"'); // 對齊方式
        return attr.join(' ');
      }() +'>' + function(){
          var totalRow = item3.totalRow || options.totalRow;

          // 如果 totalRow 參數為字符類型，則解析為自定義模版
          if(typeof totalRow === 'string'){
            return laytpl(totalRow).render($.extend({
              TOTAL_NUMS: TOTAL_NUMS || totalNums[field],
              TOTAL_ROW: totalRowData || {},
              LAY_COL: item3
            }, item3));
          }
          return content;
        }(),
      '</div></td>'].join('');

      tds.push(td);
    });

    var patchElem = that.layTotal.find('.layui-table-patch'); // 可能存在滾動條補丁
    that.layTotal.find('tbody').html('<tr>' + tds.join('') + (patchElem.length ? patchElem.get(0).outerHTML : '') + '</tr>');
  };

  //找到對應的列元素
  Class.prototype.getColElem = function(parent, key){
    var that = this;
    //var options = that.config;
    return parent.eq(0).find('.laytable-cell-'+ key + ':eq(0)');
  };

  // 渲染表單
  Class.prototype.renderForm = function(type){
    var that = this;
    var options = that.config;
    var filter = that.elem.attr('lay-filter');
    form.render(type, filter);
  };

  // 同步全選按鈕狀態
  Class.prototype.syncCheckAll = function(){
    var that = this;
    var options = that.config;
    var checkAllElem = that.layHeader.find('input[name="layTableCheckbox"]');
    var syncColsCheck = function(checked){
      that.eachCols(function(i, item){
        if(item.type === 'checkbox'){
          item[options.checkName] = checked;
        }
      });
      return checked;
    };
    var checkStatus = table.checkStatus(that.key);

    if(!checkAllElem[0]) return;

    // 選中狀態
    syncColsCheck(checkStatus.isAll);
    checkAllElem.prop({
      checked: checkStatus.isAll,
      indeterminate: !checkStatus.isAll && checkStatus.data.length // 半選
    });
    form.render(checkAllElem);
  };

  // 標記當前活動行背景色
  Class.prototype.setRowActive = function(index, className, removeClass){
    var that = this;
    var options = that.config;
    var tr = that.layBody.find('tr[data-index="'+ index +'"]');
    className = className || 'layui-table-click';

    if(removeClass) return tr.removeClass(className);

    tr.addClass(className);
    tr.siblings('tr').removeClass(className);
  };

  // 設置行選中狀態
  Class.prototype.setRowChecked = function(opts){
    var that = this;
    var options = that.config;
    var tr = that.layBody.find('tr'+ (
      opts.index === 'all' ? '' : '[data-index="'+ opts.index +'"]'
    ));

    // 默認屬性
    opts = $.extend({
      type: 'checkbox' // 選中方式
    }, opts);

    // 同步數據選中屬性值
    var thisData = table.cache[that.key];
    var existChecked = 'checked' in opts;
    var getChecked = function(value){
      // 若為單選框，則單向選中；若為複選框，則切換選中。
      return opts.type === 'radio' ? true : (existChecked ? opts.checked : !value)
    };

    // 設置數據選中屬性
    layui.each(thisData, function(i, item){
      if(layui.type(item) === 'array' || item[options.disabledName]) return; // 空項
      if(Number(opts.index) === i || opts.index === 'all'){
        var checked = item[options.checkName] = getChecked(item[options.checkName]);
        tr[checked ? 'addClass' : 'removeClass'](ELEM_CHECKED); // 標記當前選中行背景色
        // 若為 radio 類型，則取消其他行選中背景色
        if(opts.type === 'radio'){
          tr.siblings().removeClass(ELEM_CHECKED);
        }
      } else if(opts.type === 'radio') {
        delete item[options.checkName];
      }
    });

    // 若存在複選框或單選框，則標註選中狀態樣式
    var checkedElem = tr.find('input[lay-type="'+ ({
      radio: 'layTableRadio',
      checkbox: 'layTableCheckbox'
    }[opts.type] || 'checkbox') +'"]:not(:disabled)');
    var checkedSameElem = checkedElem.last();
    var fixRElem = checkedSameElem.closest(ELEM_FIXR);

    ( opts.type === 'radio' && fixRElem.hasClass(HIDE)
      ?  checkedElem.first()
    : checkedElem ).prop('checked', getChecked(checkedSameElem.prop('checked')));

    that.syncCheckAll();
    that.renderForm(opts.type);
  };

  // 數據排序
  Class.prototype.sort = function(opts){ // field, type, pull, fromEvent
    var that = this;
    var field;
    var res = {};
    var options = that.config;
    var filter = options.elem.attr('lay-filter');
    var data = table.cache[that.key], thisData;

    opts = opts || {};

    // 字段匹配
    if(typeof opts.field === 'string'){
      field = opts.field;
      that.layHeader.find('th').each(function(i, item){
        var othis = $(this);
        var _field = othis.data('field');
        if(_field === opts.field){
          opts.field = othis;
          field = _field;
          return false;
        }
      });
    }

    try {
      field = field || opts.field.data('field');
      var key = opts.field.data('key');

      // 如果欲執行的排序已在狀態中，則不執行渲染
      if(that.sortKey && !opts.pull){
        if(field === that.sortKey.field && opts.type === that.sortKey.sort){
          return;
        }
      }

      var elemSort = that.layHeader.find('th .laytable-cell-'+ key).find(ELEM_SORT);
      that.layHeader.find('th').find(ELEM_SORT).removeAttr('lay-sort'); // 清除其它標題排序狀態
      elemSort.attr('lay-sort', opts.type || null);
      that.layFixed.find('th')
    } catch(e){
      hint.error('Table modules: sort field \''+ field +'\' not matched');
    }

    // 記錄排序索引和類型
    that.sortKey = {
      field: field,
      sort: opts.type
    };

    // 默認為前端自動排序。如果否，則需自主排序（通常為服務端處理好排序）
    if(options.autoSort){
      if(opts.type === 'asc'){ //升序
        thisData = layui.sort(data, field, null, true);
      } else if(opts.type === 'desc'){ //降序
        thisData = layui.sort(data, field, true, true);
      } else { // 清除排序
        thisData = layui.sort(data, table.config.indexName, null, true);
        delete that.sortKey;
        delete options.initSort;
      }
    }

    res[options.response.dataName] = thisData || data;

    // 重載數據
    that.renderData({
      res: res,
      curr: that.page,
      count: that.count,
      sort: true,
      type: opts.reloadType
    });

    // 排序是否來自於點擊表頭事件觸發
    if(opts.fromEvent){
      options.initSort = {
        field: field,
        type: opts.type
      };
      layui.event.call(opts.field, MOD_NAME, 'sort('+ filter +')', $.extend({
        config: options
      }, options.initSort));
    }
  };

  // 請求 loading
  Class.prototype.loading = function(hide){
    var that = this;
    var options = that.config;
    if(options.loading){
      if(hide){
        that.layInit && that.layInit.remove();
        delete that.layInit;
        that.layBox.find(ELEM_INIT).remove();
      } else {
        that.layInit = $(['<div class="layui-table-init">',
          '<i class="layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop"></i>',
          '</div>'].join(''));
        that.layBox.append(that.layInit);
      }
    }
  };

  // 獲取對應單元格的 cssRules
  Class.prototype.cssRules = function(key, callback){
    var that = this;
    var style = that.elem.children('style')[0];

    lay.getStyleRules(style, function(item){
      if (item.selectorText === ('.laytable-cell-'+ key)) {
        return callback(item), true;
      }
    });
  };

  // 讓表格鋪滿
  Class.prototype.fullSize = function(){
    var that = this;
    var options = that.config;
    var height = options.height;
    var bodyHeight;

    if(that.fullHeightGap){
      height = _WIN.height() - that.fullHeightGap;
      if(height < 135) height = 135;
      // that.elem.css('height', height);
    } else if (that.parentDiv && that.parentHeightGap) {
      height = $(that.parentDiv).height() - that.parentHeightGap;
      if (height < 135) height = 135;
      // that.elem.css("height", height);
    }

    // 如果多級表頭，則填補表頭高度
    if(options.cols.length > 1){
      // 補全高度
      var th = that.layFixed.find(ELEM_HEADER).find('th');
      // 固定列表頭同步跟本體 th 一致高度
      var headerMain = that.layHeader.first();
      layui.each(th, function (thIndex, thElem) {
        thElem = $(thElem);
        thElem.height(headerMain.find('th[data-key="' + thElem.attr('data-key') + '"]').height() + 'px');
      })
    }

    if(!height) return;

    // 減去列頭區域的高度 --- 此處的數字常量是為了防止容器處在隱藏區域無法獲得高度的問題，只對默認尺寸表格做支持
    bodyHeight = parseFloat(height) - (that.layHeader.outerHeight() || 39)

    // 減去工具欄的高度
    if(options.toolbar){
      bodyHeight -= (that.layTool.outerHeight() || 51);
    }

    // 減去統計欄的高度
    if(options.totalRow){
      bodyHeight -= (that.layTotal.outerHeight() || 40);
    }

    // 減去分頁欄的高度
    if(options.page || options.pagebar){
      bodyHeight -= (that.layPage.outerHeight() || 43);
    }

    if (options.maxHeight) {
      layui.each({elem: height, layMain: bodyHeight}, function (elemName, elemHeight) {
        that[elemName].css({
          height: 'auto',
          maxHeight: elemHeight + 'px'
        });
      });
    } else {
      that.layMain.outerHeight(bodyHeight);
    }
  };

  //獲取滾動條寬度
  Class.prototype.getScrollWidth = function(elem){
    var width;
    if(elem){
      width = elem.offsetWidth - elem.clientWidth;
    } else {
      elem = document.createElement('div');
      elem.style.width = '100px';
      elem.style.height = '100px';
      elem.style.overflowY = 'scroll';

      document.body.appendChild(elem);
      width = elem.offsetWidth - elem.clientWidth;
      document.body.removeChild(elem);
    }
    return width;
  };

  // 滾動條補丁
  Class.prototype.scrollPatch = function(){
    var that = this;
    var layMainTable = that.layMain.children('table');
    var scrollWidth = that.layMain.width() - that.layMain.prop('clientWidth'); // 縱向滾動條寬度
    var scrollHeight = that.layMain.height() - that.layMain.prop('clientHeight'); // 橫向滾動條高度
    var getScrollWidth = that.getScrollWidth(that.layMain[0]); // 獲取主容器滾動條寬度，如果有的話
    var outWidth = layMainTable.outerWidth() - that.layMain.width(); // 表格內容器的超出寬度

    // 添加補丁
    var addPatch = function(elem){
      if(scrollWidth && scrollHeight){
        elem = elem.eq(0);
        if(!elem.find('.layui-table-patch')[0]){
          var patchElem = $('<th class="layui-table-patch"><div class="layui-table-cell"></div></th>'); // 補丁元素
          patchElem.find('div').css({
            width: scrollWidth
          });
          elem.find('tr').append(patchElem);
        }
      } else {
        elem.find('.layui-table-patch').remove();
      }
    };

    addPatch(that.layHeader);
    addPatch(that.layTotal);

    // 固定列區域高度
    var mainHeight = that.layMain.height();
    var fixHeight = mainHeight - scrollHeight;

    that.layFixed.find(ELEM_BODY).css(
      'height',
      layMainTable.height() >= fixHeight ? fixHeight : 'auto'
    ).scrollTop(that.layMain.scrollTop()); // 固定列滾動條高度

    // 表格寬度小於容器寬度時，隱藏固定列
    that.layFixRight[
      (table.cache[that.key] && table.cache[that.key].length) && outWidth > 0
        ? 'removeClass'
      : 'addClass'
    ](HIDE);

    // 操作欄
    that.layFixRight.css('right', scrollWidth - 1);
  };

  // 事件處理
  Class.prototype.events = function(){
    var that = this;
    var options = that.config;

    var filter = options.elem.attr('lay-filter');
    var th = that.layHeader.find('th');
    var ELEM_CELL = '.layui-table-cell';

    var _BODY = $('body');
    var dict = {};

    // 頭部工具欄操作事件
    that.layTool.on('click', '*[lay-event]', function(e){
      var othis = $(this);
      var events = othis.attr('lay-event');
      var data = table.cache[options.id];
      var openPanel = function(sets){
        var list = $(sets.list);
        var panel = $('<ul class="' + ELEM_TOOL_PANEL + '"></ul>');

        panel.html(list);

        // 限制最大高度
        if(options.height){
          panel.css('max-height', options.height - (that.layTool.outerHeight() || 50));
        }

        // 插入元素
        othis.find('.' + ELEM_TOOL_PANEL)[0] || othis.append(panel);
        that.renderForm();

        panel.on('click', function(e){
          layui.stope(e);
        });

        sets.done && sets.done(panel, list)
      };

      layui.stope(e);
      _DOC.trigger('table.tool.panel.remove');
      layer.close(that.tipsIndex);

      switch(events){
        case 'LAYTABLE_COLS': // 篩選列
          openPanel({
            list: function(){
              var lis = [];
              that.eachCols(function(i, item){
                if(item.field && item.type == 'normal'){
                  lis.push('<li><input type="checkbox" name="'+ item.field +'" data-key="'+ item.key +'" data-parentkey="'+ (item.parentKey||'') +'" lay-skin="primary" '+ (item.hide ? '' : 'checked') +' title="'+ util.escape($('<div>' + (item.fieldTitle || item.title || item.field) + '</div>').text()) +'" lay-filter="LAY_TABLE_TOOL_COLS"></li>');
                }
              });
              return lis.join('');
            }()
            ,done: function(){
              form.on('checkbox(LAY_TABLE_TOOL_COLS)', function(obj){
                var othis = $(obj.elem);
                var checked = this.checked;
                var key = othis.data('key');
                var col = that.col(key);
                var hide = col.hide;
                var parentKey = othis.data('parentkey');

                if(!col.key) return;

                // 同步勾選列的 hide 值和隱藏樣式
                col.hide = !checked;
                that.elem.find('*[data-key="'+ key +'"]')[
                  checked ? 'removeClass' : 'addClass'
                ](HIDE);

                // 根據列的顯示隱藏，同步多級表頭的父級相關屬性值
                if(hide != col.hide){
                  that.setParentCol(!checked, parentKey);
                }

                // 重新適配尺寸
                that.resize();

                // 列篩選（顯示或隱藏）後的事件
                layui.event.call(this, MOD_NAME, 'colToggled('+ filter +')', {
                  col: col,
                  config: options
                });
              });
            }
          });
        break;
        case 'LAYTABLE_EXPORT': // 導出
          if (!data.length) return layer.tips('當前表格無數據', this, {tips: 3});
          if(device.ie){
            layer.tips('導出功能不支持 IE，請用 Chrome 等高級瀏覽器導出', this, {
              tips: 3
            });
          } else {
            openPanel({
              list: function(){
                return [
                  '<li data-type="csv">導出 csv 格式文件</li>',
                  '<li data-type="xls">導出 xls 格式文件</li>'
                ].join('')
              }(),
              done: function(panel, list){
                list.on('click', function(){
                  var type = $(this).data('type')
                  table.exportFile.call(that, options.id, null, type);
                });
              }
            });
          }
        break;
        case 'LAYTABLE_PRINT': // 打印
          if (!data.length) return layer.tips('當前表格無數據', this, {tips: 3});
          var printWin = window.open('about:blank', '_blank');
          var style = ['<style>',
            'body{font-size: 12px; color: #5F5F5F;}',
            'table{width: 100%; border-collapse: collapse; border-spacing: 0;}',
            'th,td{line-height: 20px; padding: 9px 15px; border: 1px solid #ccc; text-align: left; font-size: 12px; color: #5F5F5F;}',
            'a{color: #5F5F5F; text-decoration:none;}',
            'img{max-height: 100%;}',
            '*.layui-hide{display: none}',
          '</style>'].join('')
          var html = $(that.layHeader.html()); // 輸出表頭

          html.append(that.layMain.find('table').html()); // 輸出表體
          html.append(that.layTotal.find('table').html()) // 輸出合計行

          html.find('th.layui-table-patch').remove(); // 移除補丁
          // 移除表頭特殊列
          html.find('thead>tr>th.'+ ELEM_COL_SPECIAL).filter(function(i, thElem){
            return !$(thElem).children('.'+ ELEM_GROUP).length; // 父級表頭除外
          }).remove();
          html.find('tbody>tr>td.'+ ELEM_COL_SPECIAL).remove(); // 移除表體特殊列

          printWin.document.write(style + html.prop('outerHTML'));
          printWin.document.close();

          if(layui.device('edg').edg){
            printWin.onafterprint = printWin.close;
            printWin.print();
          }else{
            printWin.print();
            printWin.close();
          }
        break;
      }

      layui.event.call(this, MOD_NAME, 'toolbar('+ filter +')', $.extend({
        event: events,
        config: options
      },{}));
    });

    // 表頭自定義元素事件
    that.layHeader.on('click', '*[lay-event]', function(e){
      var othis = $(this);
      var events = othis.attr('lay-event');
      var th = othis.closest('th');
      var key = th.data('key');
      var col = that.col(key);

      layui.event.call(this, MOD_NAME, 'colTool('+ filter +')', $.extend({
        event: events,
        config: options,
        col: col
      },{}));
    });

    // 分頁欄操作事件
    that.layPagebar.on('click', '*[lay-event]', function(e){
      var othis = $(this);
      var events = othis.attr('lay-event');

      layui.event.call(this, MOD_NAME, 'pagebar('+ filter +')', $.extend({
        event: events,
        config: options
      },{}));
    });

    // 拖拽調整寬度
    th.on('mousemove', function(e){
      var othis = $(this);
      var oLeft = othis.offset().left;
      var pLeft = e.clientX - oLeft;
      if(othis.data('unresize') || thisTable.eventMoveElem){
        return;
      }
      dict.allowResize = othis.width() - pLeft <= 10; //是否處於拖拽允許區域
      _BODY.css('cursor', (dict.allowResize ? 'col-resize' : ''));
    }).on('mouseleave', function(){
      var othis = $(this);
      if(thisTable.eventMoveElem) return;
      _BODY.css('cursor', '');
    }).on('mousedown', function(e){
      var othis = $(this);
      if(dict.allowResize){
        var key = othis.data('key');
        e.preventDefault();
        dict.offset = [e.clientX, e.clientY]; //記錄初始座標

        that.cssRules(key, function(item){
          var width = item.style.width || othis.outerWidth();
          dict.rule = item;
          dict.ruleWidth = parseFloat(width);
          dict.minWidth = othis.data('minwidth') || options.cellMinWidth;
          dict.maxWidth = othis.data('maxwidth') || options.cellMaxWidth;
        });

        // 臨時記錄當前拖拽信息
        othis.data(DATA_MOVE_NAME, dict);
        thisTable.eventMoveElem = othis;
      }
    });

    // 拖拽中
    if(!thisTable.docEvent){
      _DOC.on('mousemove', function(e){
        if(thisTable.eventMoveElem){
          var dict = thisTable.eventMoveElem.data(DATA_MOVE_NAME) || {};

          thisTable.eventMoveElem.data('resizing', 1);
          e.preventDefault();

          if(dict.rule){
            var setWidth = dict.ruleWidth + e.clientX - dict.offset[0];
            var id = thisTable.eventMoveElem.closest('.' + ELEM_VIEW).attr('lay-id');
            var thatTable = getThisTable(id);

            if(!thatTable) return;

            if(setWidth < dict.minWidth) setWidth = dict.minWidth;
            if(setWidth > dict.maxWidth) setWidth = dict.maxWidth;

            dict.rule.style.width = setWidth + 'px';
            thatTable.setGroupWidth(thisTable.eventMoveElem);
            layer.close(that.tipsIndex);
          }
        }
      }).on('mouseup', function(e){
        if(thisTable.eventMoveElem){
          var th = thisTable.eventMoveElem; // 當前觸發拖拽的 th 元素
          var id = th.closest('.' + ELEM_VIEW).attr('lay-id');
          var thatTable = getThisTable(id);

          if(!thatTable) return;

          var key = th.data('key');
          var col = thatTable.col(key);
          var filter = thatTable.config.elem.attr('lay-filter');

          // 重置過度信息
          dict = {};
          _BODY.css('cursor', '');
          thatTable.scrollPatch();

          // 清除當前拖拽信息
          th.removeData(DATA_MOVE_NAME);
          delete thisTable.eventMoveElem;

          // 列拖拽寬度後的事件
          thatTable.cssRules(key, function(item){
            col.width = parseFloat(item.style.width);
            layui.event.call(th[0], MOD_NAME, 'colResized('+ filter +')', {
              col: col,
              config: thatTable.config
            });
          });
        }
      });
    }

    // 已給 document 執行全局事件，避免重複綁定
    thisTable.docEvent = true;


    // 排序
    th.on('click', function(e){
      var othis = $(this);
      var elemSort = othis.find(ELEM_SORT);
      var nowType = elemSort.attr('lay-sort');
      var type;

      // 排序不觸發的條件
      if(!elemSort[0] || othis.data('resizing') === 1){
        return othis.removeData('resizing');
      }

      if(nowType === 'asc'){
        type = 'desc';
      } else if(nowType === 'desc'){
        type = null;
      } else {
        type = 'asc';
      }
      that.sort({
        field: othis,
        type: type,
        fromEvent: true
      });
    }).find(ELEM_SORT+' .layui-edge ').on('click', function(e){
      var othis = $(this);
      var index = othis.index();
      var field = othis.parents('th').eq(0).data('field');
      layui.stope(e);
      if(index === 0){
        that.sort({
          field: field,
          type: 'asc',
          fromEvent: true
        });
      } else {
        that.sort({
          field: field,
          type: 'desc',
          fromEvent: true
        });
      }
    });

    //數據行中的事件返回的公共對象成員
    var commonMember = that.commonMember = function(sets){
      var othis = $(this);
      var index = othis.parents('tr').eq(0).data('index');
      var tr = that.layBody.find('tr[data-index="'+ index +'"]');
      var data = table.cache[that.key] || [];

      data = data[index] || {};

      // 事件返回的公共成員
      var obj = {
        tr: tr, // 行元素
        config: options,
        data: table.clearCacheKey(data), // 當前行數據
        dataCache: data, // 當前行緩存中的數據
        index: index,
        del: function(){ // 刪除行數據
          table.cache[that.key][index] = [];
          tr.remove();
          that.scrollPatch();
        },
        update: function(fields, related){ // 修改行數據
          fields = fields || {};
          layui.each(fields, function(key, value){
            var td = tr.children('td[data-field="'+ key +'"]');
            var cell = td.children(ELEM_CELL); // 獲取當前修改的列

            // 更新緩存中的數據
            data[key] = obj.data[key] = value;

            // 更新相應列視圖
            that.eachCols(function(i, item3){
              if(item3.field == key){
                cell.html(parseTempData.call(that, {
                  item3: item3
                  ,content: value
                  ,tplData: $.extend({
                    LAY_COL: item3
                  }, data)
                }));
                td.data('content', value);
              }
              // 更新其他包含自定義模板且可能有所關聯的列視圖
              else if(related && (item3.templet || item3.toolbar)){
                var thisTd = tr.children('td[data-field="'+ (item3.field || i) +'"]');
                var content = data[item3.field];

                thisTd.children(ELEM_CELL).html(parseTempData.call(that, {
                  item3: item3
                  ,content: content
                  ,tplData: $.extend({
                    LAY_COL: item3
                  }, data)
                }));
                thisTd.data('content', content);
              }
            });
          });

          that.renderForm();
        },
        // 設置行選中狀態
        setRowChecked: function(opts){
          that.setRowChecked($.extend({
            index: index
          }, opts));
        }
        // 獲取當前列
      };

      return $.extend(obj, sets);
    };

    // 複選框選擇（替代元素的 click 事件）
    that.elem.on('click', 'input[name="layTableCheckbox"]+', function(e){
      var othis = $(this);
      var td = othis.closest('td');
      var checkbox = othis.prev();
      var children = that.layBody.find('input[name="layTableCheckbox"]');
      var index = checkbox.parents('tr').eq(0).data('index');
      var checked = checkbox[0].checked;
      var isAll = checkbox.attr('lay-filter') === 'layTableAllChoose';

      if(checkbox[0].disabled) return;

      // 全選
      if(isAll){
        that.setRowChecked({
          index: 'all',
          checked: checked
        });
      } else {
        that.setRowChecked({
          index: index,
          checked: checked
        });
        layui.stope(e);
      }

      // 事件
      layui.event.call(
        checkbox[0],
        MOD_NAME, 'checkbox('+ filter +')',
        commonMember.call(checkbox[0], {
          checked: checked,
          type: isAll ? 'all' : 'one',
          getCol: function(){ // 獲取當前列的表頭配置信息
            return that.col(td.data('key'));
          }
        })
      );
    });

    // 單選框選擇
    that.elem.on('click', 'input[lay-type="layTableRadio"]+', function(e){
      var othis = $(this);
      var td = othis.closest('td');
      var radio = othis.prev();
      var checked = radio[0].checked;
      var index = radio.parents('tr').eq(0).data('index');

      layui.stope(e);
      if(radio[0].disabled) return false;

      // 標註選中樣式
      that.setRowChecked({
        type: 'radio',
        index: index
      });

      // 事件
      layui.event.call(
        radio[0],
        MOD_NAME, 'radio('+ filter +')',
        commonMember.call(radio[0], {
          checked: checked,
          getCol: function(){ // 獲取當前列的表頭配置信息
            return that.col(td.data('key'));
          }
        })
      );
    });

    // 行事件
    that.layBody.on('mouseenter', 'tr', function(){ // 鼠標移入行
      var othis = $(this);
      var index = othis.index();
      if(othis.data('off')) return; // 不觸發事件
      that.layBody.find('tr:eq('+ index +')').addClass(ELEM_HOVER)
    }).on('mouseleave', 'tr', function(){ // 鼠標移出行
      var othis = $(this);
      var index = othis.index();
      if(othis.data('off')) return; // 不觸發事件
      that.layBody.find('tr:eq('+ index +')').removeClass(ELEM_HOVER)
    }).on('click', 'tr', function(e){ // 單擊行
      // 不支持行單擊事件的元素
      var UNROW = [
        '.layui-form-checkbox',
        '.layui-form-switch',
        '.layui-form-radio',
        '[lay-unrow]'
      ].join(',');
      if( $(e.target).is(UNROW) || $(e.target).closest(UNROW)[0]){
        return;
      }
      setRowEvent.call(this, 'row');
    }).on('dblclick', 'tr', function(){ // 雙擊行
      setRowEvent.call(this, 'rowDouble');
    }).on('contextmenu', 'tr', function(e){ // 菜單
      if (!options.defaultContextmenu) e.preventDefault();
      setRowEvent.call(this, 'rowContextmenu');
    });

    // 創建行單擊、雙擊、菜單事件
    var setRowEvent = function(eventType){
      var othis = $(this);
      if(othis.data('off')) return; //不觸發事件
      layui.event.call(this,
        MOD_NAME, eventType + '('+ filter +')',
        commonMember.call(othis.children('td')[0])
      );
    };

    // 渲染單元格編輯狀態
    var renderGridEdit = function(othis, e){
      othis = $(othis);

      if(othis.data('off')) return; // 不觸發事件

      var field = othis.data('field');
      var key = othis.data('key');
      var col = that.col(key);
      var index = othis.closest('tr').data('index');
      var data = table.cache[that.key][index];
      var elemCell = othis.children(ELEM_CELL);

      // 是否開啟編輯
      // 若 edit 傳入函數，則根據函數的返回結果判斷是否開啟編輯
      var editType = typeof col.edit === 'function'
        ? col.edit(data)
      : col.edit;

      // 顯示編輯表單
      if(editType){
        var input = $(function(){
          var inputElem = '<input class="layui-input '+ ELEM_EDIT +'" lay-unrow>';
          if(editType === 'textarea') {
            inputElem = '<textarea class="layui-input ' + ELEM_EDIT + '" lay-unrow></textarea>';
          }
          return inputElem;
        }());

        input[0].value = othis.data('content') || data[field] || elemCell.text();
        othis.find('.'+ELEM_EDIT)[0] || othis.append(input);
        input.focus();
        e && layui.stope(e);
      }
    };

    // 單元格編輯 - 輸入框內容被改變的事件
    that.layBody.on('change', '.'+ ELEM_EDIT, function(){
      var othis = $(this);
      var td = othis.parent();
      var value = this.value;
      var field = othis.parent().data('field');
      var index = othis.closest('tr').data('index');
      var data = table.cache[that.key][index];

      //事件回調的參數對象
      var params = commonMember.call(td[0], {
        value: value,
        field: field,
        oldValue: data[field], // 編輯前的值
        td: td,
        reedit: function(){ // 重新編輯
          setTimeout(function(){
            // 重新渲染為編輯狀態
            renderGridEdit(params.td);

            // 將字段緩存的值恢復到編輯之前的值
            var obj = {};
            obj[field] = params.oldValue;
            params.update(obj);
          });
        },
        getCol: function(){ // 獲取當前列的表頭配置信息
          return that.col(td.data('key'));
        }
      });

      // 更新緩存中的值
      var obj = {}; //變更的鍵值
      obj[field] = value;
      params.update(obj);

      // 執行 API 編輯事件
      layui.event.call(td[0], MOD_NAME, 'edit('+ filter +')', params);
    }).on('blur', '.'+ ELEM_EDIT, function(){ // 單元格編輯 - 恢復非編輯狀態事件
      $(this).remove(); // 移除編輯狀態
    });

    // 表格主體單元格觸發編輯的事件
    that.layBody.on(options.editTrigger, 'td', function(e){
      renderGridEdit(this, e)
    }).on('mouseenter', 'td', function(){
      showGridExpandIcon.call(this)
    }).on('mouseleave', 'td', function(){
       showGridExpandIcon.call(this, 'hide');
    });

    // 表格合計欄單元格 hover 顯示展開圖標
    that.layTotal.on('mouseenter', 'td', function(){
      showGridExpandIcon.call(this)
    }).on('mouseleave', 'td', function(){
       showGridExpandIcon.call(this, 'hide');
    });

    // 顯示單元格展開圖標
    var ELEM_GRID = 'layui-table-grid';
    var ELEM_GRID_DOWN = 'layui-table-grid-down';
    var ELEM_GRID_PANEL = 'layui-table-grid-panel';
    var showGridExpandIcon = function(hide){
      var othis = $(this);
      var elemCell = othis.children(ELEM_CELL);

      if(othis.data('off')) return; // 不觸發事件
      if(othis.parent().hasClass(ELEM_EXPAND)) return; // 是否已為展開狀態

      if(hide){
        othis.find('.layui-table-grid-down').remove();
      } else if((
        elemCell.prop('scrollWidth') > elemCell.outerWidth() ||
        elemCell.find("br").length > 0
      ) && !options.lineStyle){
        if(elemCell.find('.'+ ELEM_GRID_DOWN)[0]) return;
        othis.append('<div class="'+ ELEM_GRID_DOWN +'"><i class="layui-icon layui-icon-down"></i></div>');
      }
    };
    // 展開單元格內容
    var gridExpand = function(e){
      var othis = $(this);
      var td = othis.parent();
      var key = td.data('key');
      var col = that.col(key);
      var index = td.parent().data('index');
      var elemCell = td.children(ELEM_CELL);
      var ELEM_CELL_C = 'layui-table-cell-c';
      var elemCellClose = $('<i class="layui-icon layui-icon-up '+ ELEM_CELL_C +'">');
      var expandedMode = col.expandedMode || options.cellExpandedMode;

      // 展開風格
      if (expandedMode === 'tips') { // TIPS 展開風格
        that.tipsIndex = layer.tips([
          '<div class="layui-table-tips-main" style="margin-top: -'+ (elemCell.height() + 23) +'px;'+ function(){
            if(options.size === 'sm'){
              return 'padding: 4px 15px; font-size: 12px;';
            }
            if(options.size === 'lg'){
              return 'padding: 14px 15px;';
            }
            return '';
          }() +'">',
            elemCell.html(),
          '</div>',
          '<i class="layui-icon layui-table-tips-c layui-icon-close"></i>'
        ].join(''), elemCell[0], {
          tips: [3, ''],
          time: -1,
          anim: -1,
          maxWidth: (device.ios || device.android) ? 300 : that.elem.width()/2,
          isOutAnim: false,
          skin: 'layui-table-tips',
          success: function(layero, index){
            layero.find('.layui-table-tips-c').on('click', function(){
              layer.close(index);
            });
          }
        });
      } else { // 多行展開風格
        // 恢復其他已經展開的單元格
        that.elem.find('.'+ ELEM_CELL_C).trigger('click');

        // 設置當前單元格展開寬度
        that.cssRules(key, function(item){
          var width = item.style.width;
          var expandedWidth = col.expandedWidth || options.cellExpandedWidth;

          // 展開後的寬度不能小於當前寬度
          if(expandedWidth < parseFloat(width)) expandedWidth = parseFloat(width);

          elemCellClose.data('cell-width', width);
          item.style.width = expandedWidth + 'px';

          setTimeout(function(){
            that.scrollPatch(); // 滾動條補丁
          });
        });

        // 設置當前單元格展開樣式
        that.setRowActive(index, ELEM_EXPAND);

        // 插入關閉按鈕
        if(!elemCell.next('.'+ ELEM_CELL_C)[0]){
          elemCell.after(elemCellClose);
        }

        // 關閉展開狀態
        elemCellClose.on('click', function(){
          var $this = $(this);
          that.setRowActive(index, ELEM_EXPAND, true); // 移除單元格展開樣式
          that.cssRules(key, function(item){
            item.style.width =  $this.data('cell-width'); // 恢復單元格展開前的寬度
            that.resize(); // 滾動條補丁
          });
          $this.remove();
        });
      }

      othis.remove();
      layui.stope(e);
    };

    // 表格主體單元格展開事件
    that.layBody.on('click', '.'+ ELEM_GRID_DOWN, function(e){
      gridExpand.call(this, e);
    });
    // 表格合計欄單元格展開事件
    that.layTotal.on('click', '.'+ ELEM_GRID_DOWN, function(e){
      gridExpand.call(this, e);
    });

    // 行工具條操作事件
    var toolFn = function(type){
      var othis = $(this);
      var td = othis.closest('td');
      var index = othis.parents('tr').eq(0).data('index');
      // 標記當前活動行
      that.setRowActive(index);

      // 執行事件
      layui.event.call(
        this,
        MOD_NAME,
        (type || 'tool') + '('+ filter +')',
        commonMember.call(this, {
          event: othis.attr('lay-event'),
          getCol: function(){ // 獲取當前列的表頭配置信息
            return that.col(td.data('key'));
          }
        })
      );
    };

     // 行工具條單擊事件
    that.layBody.on('click', '*[lay-event]', function(e){
      toolFn.call(this);
      layui.stope(e);
    }).on('dblclick', '*[lay-event]', function(e){ //行工具條雙擊事件
      toolFn.call(this, 'toolDouble');
      layui.stope(e);
    });

    // 同步滾動條
    that.layMain.on('scroll', function(){
      var othis = $(this);
      var scrollLeft = othis.scrollLeft();
      var scrollTop = othis.scrollTop();

      that.layHeader.scrollLeft(scrollLeft);
      that.layTotal.scrollLeft(scrollLeft);
      that.layFixed.find(ELEM_BODY).scrollTop(scrollTop);

      layer.close(that.tipsIndex);
    });

    // 固定列滾輪事件 - 臨時兼容方案
    that.layFixed.find(ELEM_BODY).on('mousewheel DOMMouseScroll', function(e) {
      var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;
      var scrollTop = that.layMain.scrollTop();
      var step = 30;

      e.preventDefault();
      that.layMain.scrollTop(scrollTop + (delta > 0 ? -step : step));
    });
  };

  // 全局事件
  (function(){
    // 自適應尺寸
    _WIN.on('resize', function(){
      layui.each(thisTable.that, function(){
        this.resize();
      });
    });

    // 全局點擊
    _DOC.on('click', function(){
      _DOC.trigger('table.remove.tool.panel');
    });

    // 工具面板移除事件
    _DOC.on('table.remove.tool.panel', function(){
      $('.' + ELEM_TOOL_PANEL).remove();
    });
  })();

  // 初始化
  table.init = function(filter, settings){
    settings = settings || {};
    var that = this;
    var inst = null;
    var elemTable = typeof filter === 'object' ? filter : (
      typeof filter === 'string'
        ? $('table[lay-filter="'+ filter +'"]')
      : $(ELEM + '[lay-data], '+ ELEM + '[lay-options]')
    );
    var errorTips = 'Table element property lay-data configuration item has a syntax error: ';

    //遍歷數據表格
    elemTable.each(function(){
      var othis = $(this);
      var attrData = othis.attr('lay-data');
      var tableData = lay.options(this, {
        attr: attrData ? 'lay-data' : null,
        errorText: errorTips + (attrData || othis.attr('lay-options'))
      });

      var options = $.extend({
        elem: this
        ,cols: []
        ,data: []
        ,skin: othis.attr('lay-skin') //風格
        ,size: othis.attr('lay-size') //尺寸
        ,even: typeof othis.attr('lay-even') === 'string' //偶數行背景
      }, table.config, settings, tableData);

      filter && othis.hide();

      //獲取表頭數據
      othis.find('thead>tr').each(function(i){
        options.cols[i] = [];
        $(this).children().each(function(ii){
          var th = $(this);
          var attrData = th.attr('lay-data');
          var itemData = lay.options(this, {
            attr: attrData ? 'lay-data' : null,
            errorText: errorTips + (attrData || th.attr('lay-options'))
          });

          var row = $.extend({
            title: th.text()
            ,colspan: parseInt(th.attr('colspan')) || 1 //列單元格
            ,rowspan: parseInt(th.attr('rowspan')) || 1 //行單元格
          }, itemData);

          options.cols[i].push(row);
        });
      });

      //緩存靜態表體數據
      var trElem = othis.find('tbody>tr');

      //執行渲染
      var tableIns = table.render(options);

      //獲取表體數據
      if (trElem.length && !settings.data && !tableIns.config.url) {
        var tdIndex = 0;
        table.eachCols(tableIns.config.id, function (i3, item3) {
          trElem.each(function(i1){
            options.data[i1] = options.data[i1] || {};
            var tr = $(this);
            var field = item3.field;
            options.data[i1][field] = tr.children('td').eq(tdIndex).html();
          });
          tdIndex++;
        })

        tableIns.reloadData({
          data: options.data
        });
      }
    });

    return that;
  };

  //記錄所有實例
  thisTable.that = {}; //記錄所有實例對象
  thisTable.config = {}; //記錄所有實例配置項

  var eachChildCols = function (index, cols, i1, item2) {
    //如果是組合列，則捕獲對應的子列
    if (item2.colGroup) {
      var childIndex = 0;
      index++;
      item2.CHILD_COLS = [];
      // 找到它的子列所在cols的下標
      var i2 = i1 + (parseInt(item2.rowspan) || 1);
      layui.each(cols[i2], function (i22, item22) {
        if (item22.parentKey) { // 如果字段信息中包含了parentKey和key信息
          if (item22.parentKey === item2.key) {
            item22.PARENT_COL_INDEX = index;
            item2.CHILD_COLS.push(item22);
            eachChildCols(index, cols, i2, item22);
          }
        } else {
          // 沒有key信息以colspan數量所謂判斷標準
          //如果子列已經被標註為{PARENT_COL_INDEX}，或者子列累計 colspan 數等於父列定義的 colspan，則跳出當前子列循環
          if (item22.PARENT_COL_INDEX || (childIndex >= 1 && childIndex == (item2.colspan || 1))) return;
          item22.PARENT_COL_INDEX = index;
          item2.CHILD_COLS.push(item22);
          childIndex = childIndex + (parseInt(item22.colspan > 1 ? item22.colspan : 1));
          eachChildCols(index, cols, i2, item22);
        }
      });
    }
  };

  // 遍歷表頭
  table.eachCols = function(id, callback, cols){
    var config = thisTable.config[id] || {};
    var arrs = [], index = 0;

    cols = $.extend(true, [], cols || config.cols);

    //重新整理表頭結構
    layui.each(cols, function(i1, item1){
      if (i1) return true; // 只需遍歷第一層
      layui.each(item1, function(i2, item2){
        eachChildCols(index, cols, i1, item2);
        if(item2.PARENT_COL_INDEX) return; //如果是子列，則不進行追加，因為已經存儲在父列中
        arrs.push(item2)
      });
    });

    //重新遍歷列，如果有子列，則進入遞歸
    var eachArrs = function(obj){
      layui.each(obj || arrs, function(i, item){
        if(item.CHILD_COLS) return eachArrs(item.CHILD_COLS);
        typeof callback === 'function' && callback(i, item);
      });
    };

    eachArrs();
  };

  // 獲取表格選中狀態
  table.checkStatus = function(id){
    var nums = 0;
    var invalidNum = 0;
    var arr = [];
    var data = table.cache[id] || [];

    //計算全選個數
    layui.each(data, function(i, item){
      if(layui.type(item) === 'array' || item[table.config.disabledName]){
        invalidNum++; // 無效數據，或已刪除的
        return;
      }
      if(item[table.config.checkName]){
        nums++;
        if(!item[table.config.disabledName]){
          arr.push(table.clearCacheKey(item));
        }
      }
    });
    return {
      data: arr, // 選中的數據
      isAll: data.length ? (nums === (data.length - invalidNum)) : false // 是否全選
    };
  };

  // 設置行選中狀態
  table.setRowChecked = function(id, opts){
    var that = getThisTable(id);
    if(!that) return;
    that.setRowChecked(opts);
  };

  // 獲取表格當前頁的所有行數據
  table.getData = function(id){
    var arr = [];
    var data = table.cache[id] || [];
    layui.each(data, function(i, item){
      if(layui.type(item) === 'array'){
        return;
      }
      arr.push(table.clearCacheKey(item));
    });
    return arr;
  };

  // 重置表格尺寸結構
  table.resize = function(id){
    // 若指定表格唯一 id，則只執行該 id 對應的表格實例
    if(id){
      var config = getThisTableConfig(id); // 獲取當前實例配置項
      if(!config) return;

      getThisTable(id).resize();

    } else { // 否則重置所有表格實例尺寸
      layui.each(thisTable.that, function(){
        this.resize();
      });
    }
  };

  // 表格導出
  table.exportFile = function(id, data, opts){
    data = data || table.clearCacheKey(table.cache[id]);
    opts = typeof opts === 'object' ? opts : function(){
      var obj = {};
      opts && (obj.type = opts);
      return obj;
    }();

    var type = opts.type || 'csv';
    var thatTable = thisTable.that[id];
    var config = thisTable.config[id] || {};
    var textType = ({
      csv: 'text/csv',
      xls: 'application/vnd.ms-excel'
    })[type];
    var alink = document.createElement("a");

    if(device.ie) return hint.error('IE_NOT_SUPPORT_EXPORTS');

    // 處理 treeTable 數據
    if (config.tree && config.tree.view) {
      try {
        data = $.extend(true, [], table.cache[id]);
        data = (function fn(data) {
          return data.reduce(function (acc, obj){
            var children = obj.children || [];
            delete obj.children;
            return acc.concat(obj, fn(children));
          }, []);
        })(Array.from(data));
      } catch (e) {}
    }

    alink.href = 'data:'+ textType +';charset=utf-8,\ufeff'+ encodeURIComponent(function(){
      var dataTitle = [];
      var dataMain = [];
      var dataTotal = [];
      var fieldsIsHide = {};

      // 表頭和表體
      layui.each(data, function(i1, item1){
        var vals = [];
        if(typeof id === 'object'){ // 若 id 參數直接為表頭數據
          layui.each(id, function(i, item){
            i1 == 0 && dataTitle.push(item || '');
          });
          layui.each(layui.isArray(item1) ? $.extend([], item1) : table.clearCacheKey(item1), function(i2, item2){
            vals.push('"'+ (item2 || '') +'"');
          });
        } else {
          table.eachCols(id, function(i3, item3){
            if(item3.ignoreExport === false || item3.field && item3.type == 'normal'){
              // 不導出隱藏列，除非設置 ignoreExport 強制導出
              if (
                (item3.hide && item3.ignoreExport !== false) ||
                item3.ignoreExport === true // 忽略導出
              ) {
                if(i1 == 0) fieldsIsHide[item3.field] = true; // 記錄隱藏列
                return;
              }

              var content = item1[item3.field];
              if(content === undefined || content === null) content = '';

              i1 == 0 && dataTitle.push(item3.fieldTitle || item3.title || item3.field || '');

              // 解析內容
              content = parseTempData.call(thatTable, {
                item3: item3,
                content: content,
                tplData: item1,
                text: 'text',
                obj: {
                  td: function(field){
                    var td = thatTable.layBody.find('tr[data-index="'+ i1 +'"]>td');
                    return td.filter('[data-field="'+ field +'"]');
                  }
                }
              });

              // 異常處理
              content = content.replace(/"/g, '""'); // 避免內容存在「雙引號」導致異常分隔
              // content += '\t'; // 加「水平製表符」 避免內容被轉換格式
              content = '"'+ content +'"'; // 避免內容存在「逗號」導致異常分隔

              // 插入內容
              vals.push(content);
            }
          });
        }
        dataMain.push(vals.join(','));
      });

      // 表合計
      thatTable && layui.each(thatTable.dataTotal, function(i, o){
        fieldsIsHide[o.field] || dataTotal.push('"' + (o.total || '') + '"');
      });

      return dataTitle.join(',') + '\r\n' + dataMain.join('\r\n') + '\r\n' + dataTotal.join(',');
    }());

    alink.download = (opts.title || config.title || 'table_'+ (config.index || '')) + '.' + type;
    document.body.appendChild(alink);
    alink.click();
    document.body.removeChild(alink);
  };

  // 獲取表格配置信息
  table.getOptions = function (id) {
    return getThisTableConfig(id);
  }

  // 顯示或隱藏列
  table.hideCol = function (id, cols) {
    var that = getThisTable(id);
    if (!that) {
      return;
    }

    if (layui.type(cols) === 'boolean') {
      // 顯示全部或者隱藏全部
      that.eachCols(function (i2, item2) {
        var key = item2.key;
        var col = that.col(key);
        var parentKey = item2.parentKey;
        // 同步勾選列的 hide 值和隱藏樣式
        if (col.hide != cols) {
          var hide = col.hide = cols;
          that.elem.find('*[data-key="'+ key +'"]')[
            hide ? 'addClass' : 'removeClass'
            ](HIDE);
          // 根據列的顯示隱藏，同步多級表頭的父級相關屬性值
          that.setParentCol(hide, parentKey);
        }
      })
    } else {
      cols = layui.isArray(cols) ? cols : [cols];
      layui.each(cols, function (i1, item1) {
        that.eachCols(function (i2, item2) {
          if (item1.field === item2.field) {
            var key = item2.key;
            var col = that.col(key);
            var parentKey = item2.parentKey;
            // 同步勾選列的 hide 值和隱藏樣式
            if ('hide' in item1 && col.hide != item1.hide) {
              var hide = col.hide = !!item1.hide;
              that.elem.find('*[data-key="'+ key +'"]')[
                hide ? 'addClass' : 'removeClass'
                ](HIDE);
              // 根據列的顯示隱藏，同步多級表頭的父級相關屬性值
              that.setParentCol(hide, parentKey);
            }
          }
        })
      });
    }
    $('.' + ELEM_TOOL_PANEL).remove(); // 關閉字段篩選面板如果打開的話
    // 重新適配尺寸
    that.resize();
  }

  // 重載
  table.reload = function(id, options, deep, type){
    var config = getThisTableConfig(id); //獲取當前實例配置項
    if(!config) return;

    var that = getThisTable(id);
    that.reload(options, deep, type);

    return thisTable.call(that);
  };

  // 僅重載數據
  table.reloadData = function(){
    var args = $.extend([], arguments);
    args[3] = 'reloadData';

    // 重載時，影響整個結構的參數，不適合更新的參數
    var dataParams = new RegExp('^('+ [
      'elem', 'id', 'cols', 'width', 'height', 'maxHeight',
      'toolbar', 'defaultToolbar',
      'className', 'css', 'pagebar'
    ].join('|') + ')$');

    // 過濾與數據無關的參數
    layui.each(args[1], function (key, value) {
      if(dataParams.test(key)){
        delete args[1][key];
      }
    });

    return table.reload.apply(null, args);
  };

  // 核心入口
  table.render = function(options){
    var inst = new Class(options);
    return thisTable.call(inst);
  };

  // 清除臨時 Key
  table.clearCacheKey = function(data){
    data = $.extend({}, data);
    delete data[table.config.checkName];
    delete data[table.config.indexName];
    delete data[table.config.numbersName];
    delete data[table.config.disabledName];
    return data;
  };

  // 自動完成渲染
  $(function(){
    table.init();
  });

  exports(MOD_NAME, table);
});
