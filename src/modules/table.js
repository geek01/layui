/**
 * layui.table 
 * 表格組件
 */

layui.define(['laytpl', 'laypage', 'form', 'util'], function(exports){
  "use strict";
  
  var $ = layui.$;
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
      checkName: 'LAY_CHECKED' // 是否選中狀態的字段名
      ,indexName: 'LAY_TABLE_INDEX' // 初始下標索引名，用於恢復排序
      ,disabledName: 'LAY_DISABLED'
    }
    ,cache: {} // 數據緩存
    ,index: layui.table ? (layui.table.index + 10000) : 0

    // 設置全局項
    ,set: function(options){
      var that = this;
      that.config = $.extend({}, that.config, options);
      return that;
    }

    // 事件
    ,on: function(events, callback){
      return layui.onevent.call(this, MOD_NAME, events, callback);
    }
  }

  // 操作當前實例
  ,thisTable = function(){
    var that = this
    ,options = that.config
    ,id = options.id || options.index;

    if(id){
      thisTable.that[id] = that; // 記錄當前實例對象
      thisTable.config[id] = options; // 記錄當前實例配置項
    }

    return {
      config: options
      ,reload: function(options, deep){
        that.reload.call(that, options, deep);
      }
      ,reloadData: function(options, deep){
        table.reloadData(id, options, deep);
      }
      ,setColsWidth: function(){
        that.setColsWidth.call(that);
      }
      ,resize: function(){ //重置表格尺寸/結構
        that.resize.call(that);
      }
    }
  }

  // 獲取當前實例配置項
  ,getThisTableConfig = function(id){
    var config = thisTable.config[id];
    if(!config) hint.error(id ? ('The table instance with ID \''+ id +'\' not found') : 'ID argument required');
    return config || null;
  }

  // 解析自定義模板數據
  ,parseTempData = function(obj){
    obj = obj || {};

    var options = this.config || {};
    var item3 = obj.item3; // 表頭數據
    var content = obj.content; // 原始內容

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
  }

  // 字符
  ,MOD_NAME = 'table'
  ,ELEM = '.layui-table'
  ,THIS = 'layui-this'
  ,SHOW = 'layui-show'
  ,HIDE = 'layui-hide'
  ,HIDE_V = 'layui-hide-v'
  ,DISABLED = 'layui-disabled'
  ,NONE = 'layui-none'

  ,ELEM_VIEW = 'layui-table-view'
  ,ELEM_TOOL = '.layui-table-tool'
  ,ELEM_BOX = '.layui-table-box'
  ,ELEM_INIT = '.layui-table-init'
  ,ELEM_HEADER = '.layui-table-header'
  ,ELEM_BODY = '.layui-table-body'
  ,ELEM_MAIN = '.layui-table-main'
  ,ELEM_FIXED = '.layui-table-fixed'
  ,ELEM_FIXL = '.layui-table-fixed-l'
  ,ELEM_FIXR = '.layui-table-fixed-r'
  ,ELEM_TOTAL = '.layui-table-total'
  ,ELEM_PAGE = '.layui-table-page'
  ,ELEM_PAGE_VIEW = '.layui-table-pageview'
  ,ELEM_SORT = '.layui-table-sort'
  ,ELEM_EDIT = 'layui-table-edit'
  ,ELEM_HOVER = 'layui-table-hover'
  ,ELEM_COL_SPECIAL = 'layui-table-col-special'

  ,DATA_MOVE_NAME = 'LAY_TABLE_MOVE_DICT'

  // thead 區域模板
  ,TPL_HEADER = function(options){
    var rowCols = '{{#if(item2.colspan){}} colspan="{{=item2.colspan}}"{{#} if(item2.rowspan){}} rowspan="{{=item2.rowspan}}"{{#}}}';

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
          ,'<th data-field="{{= item2.field||i2 }}" data-key="{{=d.index}}-{{=i1}}-{{=i2}}" {{# if( item2.parentKey){ }}data-parentkey="{{= item2.parentKey }}"{{# } }} {{# if(item2.minWidth){ }}data-minwidth="{{=item2.minWidth}}"{{# } }} '+ rowCols +' {{# if(item2.unresize || item2.colGroup){ }}data-unresize="true"{{# } }} class="{{# if(item2.hide){ }}layui-hide{{# } }}{{# if(isSort){ }} layui-unselect{{# } }}{{# if(!item2.field){ }} layui-table-col-special{{# } }}">'
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
              ,'{{# if(item2.type === "checkbox"){ }}' //復選框
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
  }

  // tbody 區域模板
  ,TPL_BODY = ['<table cellspacing="0" cellpadding="0" border="0" class="layui-table" '
    ,'{{# if(d.data.skin){ }}lay-skin="{{=d.data.skin}}"{{# } }} {{# if(d.data.size){ }}lay-size="{{=d.data.size}}"{{# } }} {{# if(d.data.even){ }}lay-even{{# } }}>'
    ,'<tbody></tbody>'
  ,'</table>'].join('')

  //主模板
  ,TPL_MAIN = [
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

    ,'<style>'
    ,'{{# layui.each(d.data.cols, function(i1, item1){'
      ,'layui.each(item1, function(i2, item2){ }}'
        ,'.laytable-cell-{{=d.index}}-{{=i1}}-{{=i2}}{ '
        ,'{{# if(item2.width){ }}'
          ,'width: {{=item2.width}}px;'
        ,'{{# } }}'
        ,' }'
      ,'{{# });'
    ,'}); }}'
    ,'{{# if(d.data.lineStyle){'
      ,'var cellClassName = ".layui-table-view-"+ d.index +" .layui-table-body .layui-table .layui-table-cell";'
    ,'}}'
      ,'{{= cellClassName }}{'
        ,'display: -webkit-box; -webkit-box-align: center; white-space: normal; {{- d.data.lineStyle }} '
      ,'}'
      ,'{{= cellClassName }}:hover{overflow: auto;}'
    ,'{{# } }}'
    ,'{{# if(d.data.css){ }}'
      ,'{{- d.data.css }}'
    ,'{{# } }}'
    ,'</style>'
  ].join('')

  ,_WIN = $(window)
  ,_DOC = $(document)

  // 構造器
  ,Class = function(options){
    var that = this;
    that.index = ++table.index;
    that.config = $.extend({}, that.config, table.config, options);
    that.render();
  };

  // 初始默認配置
  Class.prototype.config = {
    limit: 10 // 每頁顯示的數量
    ,loading: true // 請求數據時，是否顯示 loading
    ,escape: true // 是否開啟 HTML 編碼功能，即轉義 html 原文
    ,cellMinWidth: 60 // 所有單元格默認最小寬度
    ,editTrigger: 'click' // 單元格編輯的事件觸發方式
    ,defaultToolbar: ['filter', 'exports', 'print'] // 工具欄右側圖標
    ,autoSort: true // 是否前端自動排序。如果否，則需自主排序（通常為服務端處理好排序）
    ,text: {
      none: '無數據'
    }
  };

  // 表格渲染
  Class.prototype.render = function(type){
    var that = this
    ,options = that.config;

    options.elem = $(options.elem);
    options.where = options.where || {};
    options.id = options.id || options.elem.attr('id') || that.index;

    //請求參數的自定義格式
    options.request = $.extend({
      pageName: 'page'
      ,limitName: 'limit'
    }, options.request)

    // 響應數據的自定義格式
    options.response = $.extend({
      statusName: 'code' //規定數據狀態的字段名稱
      ,statusCode: 0 //規定成功的狀態碼
      ,msgName: 'msg' //規定狀態信息的字段名稱
      ,dataName: 'data' //規定數據總數的字段名稱
      ,totalRowName: 'totalRow' //規定數據統計的字段名稱
      ,countName: 'count'
    }, options.response);

    //如果 page 傳入 laypage 對象
    if(typeof options.page === 'object'){
      options.limit = options.page.limit || options.limit;
      options.limits = options.page.limits || options.limits;
      that.page = options.page.curr = options.page.curr || 1;
      delete options.page.elem;
      delete options.page.jump;
    }

    if(!options.elem[0]) return that;

    // 僅重載數據
    if(type === 'reloadData'){
       // 請求數據
      return that.pullData(that.page, {
        type: 'reloadData'
      });
    }

    //高度鋪滿：full-差距值
    if(options.height && /^full-\d+$/.test(options.height)){
      that.fullHeightGap = options.height.split('-')[1];
      options.height = _WIN.height() - that.fullHeightGap;
    }

    //初始化一些參數
    that.setInit();

    //開始插入替代元素
    var othis = options.elem
    ,hasRender = othis.next('.' + ELEM_VIEW)

    //主容器
    ,reElem = that.elem = $('<div></div>');

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
      'lay-filter': 'LAY-TABLE-FORM-DF-'+ that.index
      ,'lay-id': options.id
      ,'style': function(){
        var arr = [];
        if(options.width) arr.push('width:'+ options.width + 'px;');
        if(options.height) arr.push('height:'+ options.height + 'px;');
        return arr.join('')
      }()
    }).html(laytpl(TPL_MAIN).render({
      data: options
      ,index: that.index //索引
    }));

    options.index = that.index;
    that.key = options.id || options.index;

    //生成替代元素
    hasRender[0] && hasRender.remove(); //如果已經渲染，則Rerender
    othis.after(reElem);

    //各級容器
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

    that.pullData(that.page); //請求數據
    that.events(); //事件
  };

  //根據列類型，定製化參數
  Class.prototype.initOpts = function(item){
    var that = this
    ,options = that.config
    ,initWidth = {
      checkbox: 50
      ,radio: 50
      ,space: 30
      ,numbers: 60
    };

    //讓 type 參數兼容舊版本
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
    var that = this
    ,options = that.config;

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

      item2.key = i1 + '-' + i2;
      item2.hide = item2.hide || false;
      item2.colspan = item2.colspan || 1;
      item2.rowspan = item2.rowspan || 1;

      //根據列類型，定製化參數
      that.initOpts(item2);

      //設置列的父列索引
      //如果是組合列，則捕獲對應的子列
      var indexChild = i1 + (parseInt(item2.rowspan) || 1);
      if (indexChild < options.cols.length) { // 只要不是最後一層都會有子列
        item2.colGroup = true;
        var childIndex = 0;
        layui.each(options.cols[indexChild], function (i22, item22) {
          //如果子列已經被標注為{HAS_PARENT}，或者子列累計 colspan 數等於父列定義的 colspan，則跳出當前子列循環
          if (item22.HAS_PARENT || (childIndex >= 1 && childIndex == (item2.colspan || 1))) return;

          item22.HAS_PARENT = true;
          item22.parentKey = i1 + '-' + i2;
          childIndex = childIndex + parseInt(item22.colspan > 1 ? item22.colspan : 1);
          initChildCols(indexChild, options.cols[indexChild], i22, item22);
        });
      } else {
        item2.colGroup = false;
      }
    };

    //初始化列參數
    layui.each(options.cols, function(i1, item1){
      if (i1) return true;
      layui.each(item1, function(i2, item2){
        initChildCols(i1, item1, i2, item2);
      });
    });

  };

  //初始工具欄
  Class.prototype.renderToolbar = function(){
    var that = this
    ,options = that.config

    //添加工具欄左側模板
    var leftDefaultTemp = [
      '<div class="layui-inline" lay-event="add"><i class="layui-icon layui-icon-add-1"></i></div>'
      ,'<div class="layui-inline" lay-event="update"><i class="layui-icon layui-icon-edit"></i></div>'
      ,'<div class="layui-inline" lay-event="delete"><i class="layui-icon layui-icon-delete"></i></div>'
    ].join('')
    ,elemToolTemp = that.layTool.find('.layui-table-tool-temp');

    if(options.toolbar === 'default'){
      elemToolTemp.html(leftDefaultTemp);
    } else if(typeof options.toolbar === 'string'){
      var toolbarHtml = $(options.toolbar).html() || '';
      toolbarHtml && elemToolTemp.html(
        laytpl(toolbarHtml).render(options)
      );
    }

    //添加工具欄右側面板
    var layout = {
      filter: {
        title: '篩選列'
        ,layEvent: 'LAYTABLE_COLS'
        ,icon: 'layui-icon-cols'
      }
      ,exports: {
        title: '導出'
        ,layEvent: 'LAYTABLE_EXPORT'
        ,icon: 'layui-icon-export'
      }
      ,print: {
        title: '打印'
        ,layEvent: 'LAYTABLE_PRINT'
        ,icon: 'layui-icon-print'
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
    var that = this
    ,options = that.config

    ,layPagebar = that.layPagebar = $('<div class="layui-inline layui-table-pagebar"></div>')

    //開啟分頁欄自定義模板
    if(options.pagebar){
      var pagebarHtml = $(options.pagebar).html() || '';
      pagebarHtml && layPagebar.append(laytpl(pagebarHtml).render(options));
      that.layPage.append(layPagebar);
    }
  };

  //同步表頭父列的相關值
  Class.prototype.setParentCol = function(hide, parentKey){
    var that = this
    ,options = that.config

    ,parentTh = that.layHeader.find('th[data-key="'+ options.index +'-'+ parentKey +'"]') //獲取父列元素
    ,parentColspan = parseInt(parentTh.attr('colspan')) || 0;

    if(parentTh[0]){
      var arrParentKey = parentKey.split('-')
      ,getThisCol = options.cols[arrParentKey[0]][arrParentKey[1]];

      hide ? parentColspan-- : parentColspan++;

      parentTh.attr('colspan', parentColspan);
      parentTh[parentColspan < 1 ? 'addClass' : 'removeClass'](HIDE);

      getThisCol.colspan = parentColspan; //同步 colspan 參數
      getThisCol.hide = parentColspan < 1; //同步 hide 參數

      //遞歸，繼續往上查詢是否有父列
      var nextParentKey = parentTh.data('parentkey');
      nextParentKey && that.setParentCol(hide, nextParentKey);
    }
  };

  //多級表頭補丁
  Class.prototype.setColsPatch = function(){
    var that = this
    ,options = that.config

    //同步表頭父列的相關值
    layui.each(options.cols, function(i1, item1){
      layui.each(item1, function(i2, item2){
        if(item2.hide){
          that.setParentCol(item2.hide, item2.parentKey);
        }
      });
    });
  };

  //動態分配列寬
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
      //遍歷所有列
      layui.each(options.cols, function(i1, item1){
        layui.each(item1, function(i2, item2){
          var width = 0
          ,minWidth = item2.minWidth || options.cellMinWidth; //最小寬度

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
            } else if(!width){ // 列寬未填寫
              item2.width = width = 0;
              autoColNums++;
            }
          } else if(autoWidth && autoWidth < minWidth){
            autoColNums--;
            width = minWidth;
          }

          if(item2.hide) width = 0;
          countWidth = countWidth + width;
        });
      });

      // 如果未填充滿，則將剩餘寬度平分
      (cntrWidth > countWidth && autoColNums) && (
        autoWidth = (cntrWidth - countWidth) / autoColNums
      );
    }

    getAutoWidth();
    getAutoWidth(true); // 重新檢測分配的寬度是否低於最小列寬

    // 記錄自動列數
    that.autoColNums = autoColNums;

    // 設置列寬
    that.eachCols(function(i3, item3){
      var minWidth = item3.minWidth || options.cellMinWidth;
      if(item3.colGroup || item3.hide) return;

      // 給未分配寬的列平均分配寬
      if(item3.width === 0){
        that.getCssRule(options.index +'-'+ item3.key, function(item){
          item.style.width = Math.floor(autoWidth >= minWidth ? autoWidth : minWidth) + 'px';
        });
      }

      // 給設定百分比的列分配列寬
      else if(/\d+%$/.test(item3.width)){
        that.getCssRule(options.index +'-'+ item3.key, function(item){
          item.style.width = Math.floor((parseFloat(item3.width) / 100) * cntrWidth) + 'px';
        });
      }
    });

    // 填補 Math.floor 造成的數差
    var patchNums = that.layMain.width() - that.getScrollWidth(that.layMain[0])
    - that.layMain.children('table').outerWidth();

    if(that.autoColNums && patchNums >= -colNums && patchNums <= colNums){
      var getEndTh = function(th){
        var field;
        th = th || that.layHeader.eq(0).find('thead th:last-child')
        field = th.data('field');
        if(!field && th.prev()[0]){
          return getEndTh(th.prev())
        }
        return th
      }
      ,th = getEndTh()
      ,key = th.data('key');

      that.getCssRule(key, function(item){
        var width = item.style.width || th.outerWidth();
        item.style.width = (parseFloat(width) + patchNums) + 'px';

        //二次校驗，如果仍然出現橫向滾動條（通常是 1px 的誤差導致）
        if(that.layMain.height() - that.layMain.prop('clientHeight') > 0){
          item.style.width = (parseFloat(item.style.width) - 1) + 'px';
        }
      });
    }

    that.loading(!0);
  };

  // 重置表格尺寸/結構
  Class.prototype.resize = function(){
    var that = this;
    that.fullSize(); //讓表格鋪滿
    that.setColsWidth(); //自適應列寬
    that.scrollPatch(); //滾動條補丁
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
  };

  // 初始頁碼
  Class.prototype.page = 1;

  // 獲得數據
  Class.prototype.pullData = function(curr, opts){
    var that = this;
    var options = that.config;
    var request = options.request;
    var response = options.response;
    var sort = function(){
      if(typeof options.initSort === 'object'){
        that.sort(options.initSort.field, options.initSort.type);
      }
    };

    opts = opts || {};

    // 數據拉取前的回調
    typeof options.before === 'function' && options.before(
      options
    );
    that.startTime = new Date().getTime(); // 渲染開始時間

    if(options.url){ // Ajax請求
      var params = {};
      params[request.pageName] = curr;
      params[request.limitName] = options.limit;

      // 參數
      var data = $.extend(params, options.where);
      if(options.contentType && options.contentType.indexOf("application/json") == 0){ // 提交 json 格式
        data = JSON.stringify(data);
      }

      that.loading();

      $.ajax({
        type: options.method || 'get'
        ,url: options.url
        ,contentType: options.contentType
        ,data: data
        ,dataType: options.dataType || 'json'
        ,jsonpCallback: options.jsonpCallback
        ,headers: options.headers || {}
        ,success: function(res){
          // 若有數據解析的回調，則獲得其返回的數據
          if(typeof options.parseData === 'function'){
            res = options.parseData(res) || res;
          }
          // 檢查數據格式是否符合規範
          if(res[response.statusName] != response.statusCode){
            that.renderForm();
            that.errorView(
              res[response.msgName] ||
              ('返回的數據不符合規範，正確的成功狀態碼應為："'+ response.statusName +'": '+ response.statusCode)
            );
          } else {
            that.renderData({
              res: res,
              curr: curr,
              count: res[response.countName],
              type: opts.type
            }), sort();

            //耗時（接口請求+視圖渲染）
            options.time = (new Date().getTime() - that.startTime) + ' ms';
          }
          that.setColsWidth();
          typeof options.done === 'function' && options.done(
            res, curr, res[response.countName]
          );
        }
        ,error: function(e, msg){
          that.errorView('請求異常，錯誤提示：'+ msg);

          that.renderForm();
          that.setColsWidth();

          typeof options.error === 'function' && options.error(e, msg);
        }
      });
    } else if(layui.type(options.data) === 'array'){ //已知數據
      var res = {}
      ,startLimit = curr*options.limit - options.limit

      res[response.dataName] = options.data.concat().splice(startLimit, options.limit);
      res[response.countName] = options.data.length;

      //記錄合計行數據
      if(typeof options.totalRow === 'object'){
        res[response.totalRowName] = $.extend({}, options.totalRow);
      }

      that.renderData({
        res: res,
        curr: curr,
        count: res[response.countName],
        type: opts.type
      }), sort();

      that.setColsWidth();

      typeof options.done === 'function' && options.done(
        res, curr, res[response.countName]
      );
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
      return this.config.cols[key[1]][key[2]];
    } catch(e){
      hint.error(e);
      return {};
    }
  };


  // 數據渲染
  Class.prototype.renderData = function(opts){
    var that = this;
    var options = that.config;

    var res = opts.res;
    var curr = opts.curr;
    var count = opts.count;
    var sort = opts.sort;

    var data = res[options.response.dataName] || []; //列表數據
    var totalRowData = res[options.response.totalRowName]; //合計行數據
    var trs = [];
    var trs_fixed = [];
    var trs_fixed_r = [];

    // 渲染視圖
    var render = function(){ // 後續性能提升的重點
      // 同步表頭父列的相關值
      options.HAS_SET_COLS_PATCH || that.setColsPatch();
      options.HAS_SET_COLS_PATCH = true;

      var thisCheckedRowIndex;
      if(!sort && that.sortKey){
        return that.sort(that.sortKey.field, that.sortKey.sort, true);
      }
      layui.each(data, function(i1, item1){
        var tds = [], tds_fixed = [], tds_fixed_r = []
        ,numbers = i1 + options.limit*(curr - 1) + 1; //序號

        //若數據項為空數組，則不往下執行（因為刪除數據時，會將原有數據設置為 []）
        if(layui.type(item1) === 'array' && item1.length === 0) return;

        //記錄下標索引，用於恢復排序
        if(!sort){
          item1[table.config.indexName] = i1;
        }

        //遍歷表頭
        that.eachCols(function(i3, item3){
          var field = item3.field || i3
          ,key = options.index + '-' + item3.key
          ,content = item1[field];

          if(content === undefined || content === null) content = '';
          if(item3.colGroup) return;

          // td 內容
          var td = ['<td data-field="'+ field +'" data-key="'+ key +'" '+ function(){ //追加各種屬性
            var attr = [];
            if(item3.templet) attr.push('data-content="'+ util.escape(content) +'"'); //自定義模板
            if(item3.toolbar) attr.push('data-off="true"'); //行工具列關閉單元格事件
            if(item3.event) attr.push('lay-event="'+ item3.event +'"'); //自定義事件
            if(item3.minWidth) attr.push('data-minwidth="'+ item3.minWidth +'"'); //單元格最小寬度
            return attr.join(' ');
          }() +' class="'+ function(){ //追加樣式
            var classNames = [];
            if(item3.hide) classNames.push(HIDE); //插入隱藏列樣式
            if(!item3.field) classNames.push(ELEM_COL_SPECIAL); //插入特殊列樣式
            return classNames.join(' ');
          }() +'">'
            ,'<div class="layui-table-cell laytable-cell-'+ function(){ //返回對應的CSS類標識
              return item3.type === 'normal' ? key
              : (key + ' laytable-cell-' + item3.type);
            }() +'"'
            + (item3.align ? ' align="'+ item3.align +'"' : '')
            + function(){
              var attr = [];
              if(item3.style) attr.push('style="'+ item3.style +'"'); //自定義單元格樣式
              return attr.join(' ');
            }() +'>'
            + function(){
              var tplData = $.extend(true, {
                LAY_INDEX: numbers
                ,LAY_COL: item3
              }, item1)
              ,checkName = table.config.checkName
              ,disabledName = table.config.disabledName;

              //渲染不同風格的列
              switch(item3.type){
                case 'checkbox': // 復選
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
                  }() +'>';
                break;
                case 'radio': // 單選
                  if(tplData[checkName]){
                    thisCheckedRowIndex = i1;
                  }
                  return '<input type="radio" name="layTableRadio_'+ options.index +'" '
                  + function(){
                    var arr = [];
                    if(tplData[checkName]) arr[0] = 'checked';
                    if(tplData[disabledName]) arr.push('disabled');
                    return arr.join(' ');
                  }() +' lay-type="layTableRadio">';
                break;
                case 'numbers':
                  return numbers;
                break;
              };

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

        trs.push('<tr data-index="'+ i1 +'">'+ tds.join('') + '</tr>');
        trs_fixed.push('<tr data-index="'+ i1 +'">'+ tds_fixed.join('') + '</tr>');
        trs_fixed_r.push('<tr data-index="'+ i1 +'">'+ tds_fixed_r.join('') + '</tr>');
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

      that.renderForm();
      typeof thisCheckedRowIndex === 'number' && that.setThisRowChecked(thisCheckedRowIndex);
      that.syncCheckAll();

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
      that.renderForm();
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
        elem: 'layui-table-page' + options.index
        ,count: count
        ,limit: options.limit
        ,limits: options.limits || [10,20,30,40,50,60,70,80,90]
        ,groups: 3
        ,layout: ['prev', 'page', 'next', 'skip', 'count', 'limit']
        ,prev: '<i class="layui-icon">&#xe603;</i>'
        ,next: '<i class="layui-icon">&#xe602;</i>'
        ,jump: function(obj, first){
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

    that.dataTotal = {};

    var tds = [];
    that.eachCols(function(i3, item3){
      var field = item3.field || i3;

      // 合計數據的特定字段
      var TOTAL_NUMS = totalRowData && totalRowData[item3.field];

      // td 內容
      var content = function(){
        var text = item3.totalRowText || '';
        var decimals = 'totalRowDecimals' in item3 ? item3.totalRowDecimals : 2;
        var thisTotalNum = parseFloat(totalNums[field]).toFixed(decimals);
        var tplData = {
          LAY_COL: item3
        };

        tplData[field] = thisTotalNum;

        // 獲取自動計算的合併內容
        var getContent = item3.totalRow ? (parseTempData.call(that, {
          item3: item3
          ,content: thisTotalNum
          ,tplData: tplData
        }) || text) : text;

        // 如果直接傳入了合計行數據，則不輸出自動計算的結果
        return TOTAL_NUMS || getContent;
      }();

      // td 容器
      var td = ['<td data-field="'+ field +'" data-key="'+ options.index + '-'+ item3.key +'" '+ function(){
        var attr = [];
        if(item3.align) attr.push('align="'+ item3.align +'"'); // 對齊方式
        if(item3.minWidth) attr.push('data-minwidth="'+ item3.minWidth +'"'); // 單元格最小寬度
        return attr.join(' ');
      }() +' class="'+ function(){ // 追加樣式
        var classNames = [];
        if(item3.hide) classNames.push(HIDE); // 插入隱藏列樣式
        if(!item3.field) classNames.push(ELEM_COL_SPECIAL); // 插入特殊列樣式
        return classNames.join(' ');
      }() +'">'
        ,'<div class="layui-table-cell laytable-cell-'+ function(){ // 返回對應的CSS類標識
          var str = (options.index + '-' + item3.key);
          return item3.type === 'normal' ? str
          : (str + ' laytable-cell-' + item3.type);
        }() +'"'+ function(){
        var attr = [];
        if(item3.style) attr.push('style="'+ item3.style +'"'); // 自定義單元格樣式
        return attr.join(' ');
      }() +'>' + function(){
          var totalRow = item3.totalRow || options.totalRow;

          // 如果 totalRow 參數為字符類型，則解析為自定義模版
          if(typeof totalRow === 'string'){
            return laytpl(totalRow).render($.extend({
              TOTAL_NUMS: TOTAL_NUMS || totalNums[field],
              LAY_COL: item3
            }, item3));
          }
          return content;
        }()
      ,'</div></td>'].join('');

      item3.field && (that.dataTotal[field] = content);
      tds.push(td);
    });

    that.layTotal.find('tbody').html('<tr>' + tds.join('') + '</tr>');
  };

  //找到對應的列元素
  Class.prototype.getColElem = function(parent, key){
    var that = this
    ,options = that.config;
    return parent.eq(0).find('.laytable-cell-'+ (options.index + '-' + key) + ':eq(0)');
  };

  //渲染表單
  Class.prototype.renderForm = function(type){
    var that = this
    ,options = that.config
    ,filter = that.elem.attr('lay-filter');
    form.render(type, filter);
  };

  //標記當前行選中狀態
  Class.prototype.setThisRowChecked = function(index){
    var that = this
    ,options = that.config
    ,ELEM_CLICK = 'layui-table-click'
    ,tr = that.layBody.find('tr[data-index="'+ index +'"]');

    tr.addClass(ELEM_CLICK).siblings('tr').removeClass(ELEM_CLICK);
  };

  //數據排序
  Class.prototype.sort = function(th, type, pull, formEvent){
    var that = this
    ,field
    ,res = {}
    ,options = that.config
    ,filter = options.elem.attr('lay-filter')
    ,data = table.cache[that.key], thisData;

    //字段匹配
    if(typeof th === 'string'){
      field = th;
      that.layHeader.find('th').each(function(i, item){
        var othis = $(this)
        ,_field = othis.data('field');
        if(_field === th){
          th = othis;
          field = _field;
          return false;
        }
      });
    }

    try {
      var field = field || th.data('field')
      ,key = th.data('key');

      //如果欲執行的排序已在狀態中，則不執行渲染
      if(that.sortKey && !pull){
        if(field === that.sortKey.field && type === that.sortKey.sort){
          return;
        }
      }

      var elemSort = that.layHeader.find('th .laytable-cell-'+ key).find(ELEM_SORT);
      that.layHeader.find('th').find(ELEM_SORT).removeAttr('lay-sort'); //清除其它標題排序狀態
      elemSort.attr('lay-sort', type || null);
      that.layFixed.find('th')
    } catch(e){
      hint.error('Table modules: sort field \''+ field +'\' not matched');
    }

    //記錄排序索引和類型
    that.sortKey = {
      field: field
      ,sort: type
    };

    //默認為前端自動排序。如果否，則需自主排序（通常為服務端處理好排序）
    if(options.autoSort){
      if(type === 'asc'){ //升序
        thisData = layui.sort(data, field);
      } else if(type === 'desc'){ //降序
        thisData = layui.sort(data, field, true);
      } else { //清除排序
        thisData = layui.sort(data, table.config.indexName);
        delete that.sortKey;
        delete options.initSort;
      }
    }

    res[options.response.dataName] = thisData || data;

    that.renderData({
      res: res,
      curr: that.page,
      count: that.count,
      sort: true
    });

    if(formEvent){
      options.initSort = {
        field: field
        ,type: type
      };
      layui.event.call(th, MOD_NAME, 'sort('+ filter +')', options.initSort);
    }
  };

  //請求loading
  Class.prototype.loading = function(hide){
    var that = this
    ,options = that.config;
    if(options.loading){
      if(hide){
        that.layInit && that.layInit.remove();
        delete that.layInit;
        that.layBox.find(ELEM_INIT).remove();
      } else {
        that.layInit = $(['<div class="layui-table-init">'
          ,'<i class="layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop"></i>'
        ,'</div>'].join(''));
        that.layBox.append(that.layInit);
      }
    }
  };

  //同步選中值狀態
  Class.prototype.setCheckData = function(index, checked){
    var that = this
    ,options = that.config
    ,thisData = table.cache[that.key];
    if(!thisData[index]) return;
    if(layui.type(thisData[index]) === 'array') return;
    thisData[index][options.checkName] = checked;
  };

  // 同步全選按鈕狀態
  Class.prototype.syncCheckAll = function(){
    var that = this
    ,options = that.config
    ,checkAllElem = that.layHeader.find('input[name="layTableCheckbox"]')
    ,syncColsCheck = function(checked){
      that.eachCols(function(i, item){
        if(item.type === 'checkbox'){
          item[options.checkName] = checked;
        }
      });
      return checked;
    };

    if(!checkAllElem[0]) return;

    if(table.checkStatus(that.key).isAll){
      if(!checkAllElem[0].checked){
        checkAllElem.prop('checked', true);
        that.renderForm('checkbox');
      }
      syncColsCheck(true);
    } else {
      if(checkAllElem[0].checked){
        checkAllElem.prop('checked', false);
        that.renderForm('checkbox');
      }
      syncColsCheck(false);
    }
  };

  // 獲取 cssRule
  Class.prototype.getCssRule = function(key, callback){
    var that = this
    ,style = that.elem.find('style')[0]
    ,sheet = style.sheet || style.styleSheet || {}
    ,rules = sheet.cssRules || sheet.rules;
    layui.each(rules, function(i, item){
      if(item.selectorText === ('.laytable-cell-'+ key)){
        return callback(item), true;
      }
    });
  };

  //讓表格鋪滿
  Class.prototype.fullSize = function(){
    var that = this
    ,options = that.config
    ,height = options.height
    ,bodyHeight;

    if(that.fullHeightGap){
      height = _WIN.height() - that.fullHeightGap;
      if(height < 135) height = 135;
      that.elem.css('height', height);
    }

    if(!height) return;

    //減去列頭區域的高度
    bodyHeight = parseFloat(height) - (that.layHeader.outerHeight() || 38); //此處的數字常量是為了防止容器處在隱藏區域無法獲得高度的問題，暫時只對默認尺寸的表格做支持。

    //減去工具欄的高度
    if(options.toolbar){
      bodyHeight -= (that.layTool.outerHeight() || 50);
    }

    //減去統計欄的高度
    if(options.totalRow){
      bodyHeight -= (that.layTotal.outerHeight() || 40);
    }

    //減去分頁欄的高度
    if(options.page || options.pagebar){
      bodyHeight -= (that.layPage.outerHeight() || 43);
    }

    that.layMain.outerHeight(bodyHeight);
  };

  //獲取滾動條寬度
  Class.prototype.getScrollWidth = function(elem){
    var width = 0;
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

  //滾動條補丁
  Class.prototype.scrollPatch = function(){
    var that = this
    ,layMainTable = that.layMain.children('table')
    ,scollWidth = that.layMain.width() - that.layMain.prop('clientWidth') //縱向滾動條寬度
    ,scollHeight = that.layMain.height() - that.layMain.prop('clientHeight') //橫向滾動條高度
    ,getScrollWidth = that.getScrollWidth(that.layMain[0]) //獲取主容器滾動條寬度，如果有的話
    ,outWidth = layMainTable.outerWidth() - that.layMain.width() //表格內容器的超出寬度

    //添加補丁
    ,addPatch = function(elem){
      if(scollWidth && scollHeight){
        elem = elem.eq(0);
        if(!elem.find('.layui-table-patch')[0]){
          var patchElem = $('<th class="layui-table-patch"><div class="layui-table-cell"></div></th>'); //補丁元素
          patchElem.find('div').css({
            width: scollWidth
          });
          elem.find('tr').append(patchElem);
        }
      } else {
        elem.find('.layui-table-patch').remove();
      }
    }

    addPatch(that.layHeader);
    addPatch(that.layTotal);

    //固定列區域高度
    var mainHeight = that.layMain.height()
    ,fixHeight = mainHeight - scollHeight;
    that.layFixed.find(ELEM_BODY).css('height', layMainTable.height() >= fixHeight ? fixHeight : 'auto');

    //表格寬度小於容器寬度時，隱藏固定列
    that.layFixRight[outWidth > 0 ? 'removeClass' : 'addClass'](HIDE);

    //操作欄
    that.layFixRight.css('right', scollWidth - 1);
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

    // 工具欄操作事件
    that.layTool.on('click', '*[lay-event]', function(e){
      var othis = $(this)
      ,events = othis.attr('lay-event')
      ,openPanel = function(sets){
        var list = $(sets.list)
        ,panel = $('<ul class="layui-table-tool-panel"></ul>');

        panel.html(list);

        // 限制最大高度
        if(options.height){
          panel.css('max-height', options.height - (that.layTool.outerHeight() || 50));
        }

        // 插入元素
        othis.find('.layui-table-tool-panel')[0] || othis.append(panel);
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
                  lis.push('<li><input type="checkbox" name="'+ item.field +'" data-key="'+ item.key +'" data-parentkey="'+ (item.parentKey||'') +'" lay-skin="primary" '+ (item.hide ? '' : 'checked') +' title="'+ util.escape(item.title || item.field) +'" lay-filter="LAY_TABLE_TOOL_COLS"></li>');
                }
              });
              return lis.join('');
            }()
            ,done: function(){
              form.on('checkbox(LAY_TABLE_TOOL_COLS)', function(obj){
                var othis = $(obj.elem)
                ,checked = this.checked
                ,key = othis.data('key')
                ,parentKey = othis.data('parentkey');

                layui.each(options.cols, function(i1, item1){
                  layui.each(item1, function(i2, item2){
                    if(i1+ '-'+ i2 === key){
                      var hide = item2.hide;

                      // 同步勾選列的 hide 值和隱藏樣式
                      item2.hide = !checked;
                      that.elem.find('*[data-key="'+ options.index +'-'+ key +'"]')
                      [checked ? 'removeClass' : 'addClass'](HIDE);

                      // 根據列的顯示隱藏，同步多級表頭的父級相關屬性值
                      if(hide != item2.hide){
                        that.setParentCol(!checked, parentKey);
                      }

                      // 重新適配尺寸
                      that.resize();
                    }
                  });
                });
              });
            }
          });
        break;
        case 'LAYTABLE_EXPORT': // 導出
          if(device.ie){
            layer.tips('導出功能不支持 IE，請用 Chrome 等高級瀏覽器導出', this, {
              tips: 3
            })
          } else {
            openPanel({
              list: function(){
                return [
                  '<li data-type="csv">導出 csv 格式文件</li>',
                  '<li data-type="xls">導出 xls 格式文件</li>'
                ].join('')
              }()
              ,done: function(panel, list){
                list.on('click', function(){
                  var type = $(this).data('type')
                  table.exportFile.call(that, options.id, null, type);
                });
              }
            });
          }
        break;
        case 'LAYTABLE_PRINT': // 打印
          var printWin = window.open('about:blank', '_blank')
          ,style = ['<style>'
            ,'body{font-size: 12px; color: #5F5F5F;}'
            ,'table{width: 100%; border-collapse: collapse; border-spacing: 0;}'
            ,'th,td{line-height: 20px; padding: 9px 15px; border: 1px solid #ccc; text-align: left; font-size: 12px; color: #5F5F5F;}'
            ,'a{color: #5F5F5F; text-decoration:none;}'
            ,'*.layui-hide{display: none}'
          ,'</style>'].join('')
          ,html = $(that.layHeader.html()); //輸出表頭

          html.append(that.layMain.find('table').html()); //輸出表體
          html.append(that.layTotal.find('table').html()) //輸出合計行

          html.find('th.layui-table-patch').remove(); //移除補丁
          // 移除表頭特殊列
          html.find('thead>tr>th.'+ ELEM_COL_SPECIAL).filter(function(i, thElem){
            return !$(thElem).children('.laytable-cell-group').length; // 父級表頭除外
          }).remove();
          html.find('tbody>tr>td.'+ ELEM_COL_SPECIAL).remove(); // 移除表體特殊列

          printWin.document.write(style + html.prop('outerHTML'));
          printWin.document.close();
          printWin.print();
          printWin.close();
        break;
      }

      layui.event.call(this, MOD_NAME, 'toolbar('+ filter +')', $.extend({
        event: events
        ,config: options
      },{}));
    });

    // 分頁欄操作事件
    that.layPagebar.on('click', '*[lay-event]', function(e){
      var othis = $(this)
      ,events = othis.attr('lay-event');

      layui.event.call(this, MOD_NAME, 'pagebar('+ filter +')', $.extend({
        event: events
        ,config: options
      },{}));
    });

    // 拖拽調整寬度
    th.on('mousemove', function(e){
      var othis = $(this)
      ,oLeft = othis.offset().left
      ,pLeft = e.clientX - oLeft;
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
        dict.offset = [e.clientX, e.clientY]; //記錄初始坐標

        that.getCssRule(key, function(item){
          var width = item.style.width || othis.outerWidth();
          dict.rule = item;
          dict.ruleWidth = parseFloat(width);
          dict.minWidth = othis.data('minwidth') || options.cellMinWidth;
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
            if(setWidth < dict.minWidth) setWidth = dict.minWidth;
            dict.rule.style.width = setWidth + 'px';
            layer.close(that.tipsIndex);
          }
        }
      }).on('mouseup', function(e){
        if(thisTable.eventMoveElem){
          dict = {};
          _BODY.css('cursor', '');
          that.scrollPatch();

          // 清除當前拖拽信息
          thisTable.eventMoveElem.removeData(DATA_MOVE_NAME);
          delete thisTable.eventMoveElem;
        }
      });
    }

    // 已給 document 執行全局事件，避免重復綁定
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
      that.sort(othis, type, null, true);
    }).find(ELEM_SORT+' .layui-edge ').on('click', function(e){
      var othis = $(this)
      ,index = othis.index()
      ,field = othis.parents('th').eq(0).data('field')
      layui.stope(e);
      if(index === 0){
        that.sort(field, 'asc', null, true);
      } else {
        that.sort(field, 'desc', null, true);
      }
    });

    //數據行中的事件返回的公共對象成員
    var commonMember = that.commonMember = function(sets){
      var othis = $(this)
      ,index = othis.parents('tr').eq(0).data('index')
      ,tr = that.layBody.find('tr[data-index="'+ index +'"]')
      ,data = table.cache[that.key] || [];


      data = data[index] || {};

      return $.extend({
        tr: tr //行元素
        ,data: table.clearCacheKey(data) //當前行數據
        ,del: function(){ //刪除行數據
          table.cache[that.key][index] = [];
          tr.remove();
          that.scrollPatch();
        }
        ,update: function(fields, related){ //修改行數據
          fields = fields || {};
          layui.each(fields, function(key, value){
            var td = tr.children('td[data-field="'+ key +'"]');
            var cell = td.children(ELEM_CELL); //獲取當前修改的列

            // 更新緩存中的數據
            if(key in data) data[key] = value;

            // 更新相應列視圖
            that.eachCols(function(i, item3){
              if(item3.field == key){
                cell.html(parseTempData.call(that, {
                  item3: item3
                  ,content: value
                  ,tplData: data
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
                  ,tplData: data
                }));
                thisTd.data('content', content);
              }
            });
          });

          that.renderForm();
        }
      }, sets);
    };

    // 復選框選擇（替代元素的 click 事件）
    that.elem.on('click', 'input[name="layTableCheckbox"]+', function(){
      var checkbox = $(this).prev()
      ,children = that.layBody.find('input[name="layTableCheckbox"]')
      ,index = checkbox.parents('tr').eq(0).data('index')
      ,checked = checkbox[0].checked
      ,isAll = checkbox.attr('lay-filter') === 'layTableAllChoose';

      if(checkbox[0].disabled) return;

      //全選
      if(isAll){
        children.each(function(i, item){
          item.checked = checked;
          that.setCheckData(i, checked);
        });
        that.syncCheckAll();
        that.renderForm('checkbox');
      } else {
        that.setCheckData(index, checked);
        that.syncCheckAll();
      }

      // 事件
      layui.event.call(
        checkbox[0],
        MOD_NAME, 'checkbox('+ filter +')',
        commonMember.call(checkbox[0], {
          checked: checked,
          type: isAll ? 'all' : 'one'
        })
      );
    });

    //單選框選擇
    that.elem.on('click', 'input[lay-type="layTableRadio"]+', function(){
      var radio = $(this).prev()
      ,checked = radio[0].checked
      ,thisData = table.cache[that.key]
      ,index = radio.parents('tr').eq(0).data('index');

      //重置數據單選屬性
      layui.each(thisData, function(i, item){
        if(index === i){
          item[options.checkName] = true;
        } else {
          delete item[options.checkName];
        }
      });
      that.setThisRowChecked(index);

      layui.event.call(this, MOD_NAME, 'radio('+ filter +')', commonMember.call(this, {
        checked: checked
      }));
    });

    // 行事件
    that.layBody.on('mouseenter', 'tr', function(){ //鼠標移入行
      var othis = $(this)
      ,index = othis.index();
      if(othis.data('off')) return; //不觸發事件
      that.layBody.find('tr:eq('+ index +')').addClass(ELEM_HOVER)
    }).on('mouseleave', 'tr', function(){ //鼠標移出行
      var othis = $(this)
      ,index = othis.index();
      if(othis.data('off')) return; //不觸發事件
      that.layBody.find('tr:eq('+ index +')').removeClass(ELEM_HOVER)
    }).on('click', 'tr', function(){ //單擊行
      setRowEvent.call(this, 'row');
    }).on('dblclick', 'tr', function(){ //雙擊行
      setRowEvent.call(this, 'rowDouble');
    });

    // 創建行單擊、雙擊事件
    var setRowEvent = function(eventType){
      var othis = $(this);
      if(othis.data('off')) return; //不觸發事件
      layui.event.call(this,
        MOD_NAME, eventType + '('+ filter +')'
        ,commonMember.call(othis.children('td')[0])
      );
    };

    // 單元格編輯
    that.layBody.on('change', '.'+ELEM_EDIT, function(){
      var othis = $(this);
      var value = this.value;
      var field = othis.parent().data('field');
      var index = othis.parents('tr').eq(0).data('index');
      var data = table.cache[that.key][index];

      data[field] = value; // 更新緩存中的值
      layui.event.call(this, MOD_NAME, 'edit('+ filter +')', commonMember.call(this, {
        value: value
        ,field: field
      }));
    }).on('blur', '.'+ELEM_EDIT, function(){
      var othis = $(this);
      var td = othis.parent();
      var key = td.data('key');
      var index = othis.closest('tr').data('index');
      var data = table.cache[that.key][index];

      othis.siblings(ELEM_CELL).html(function(value){
        return parseTempData.call(that, {
          item3: that.col(key)
          ,content: value
          ,tplData: data
        });
      }(othis[0].value));
      td.data('content', othis[0].value);
      othis.remove();
    });

    // 單元格事件
    that.layBody.on(options.editTrigger, 'td', function(e){
      var othis = $(this);

      if(othis.data('off')) return; // 不觸發事件

      var field = othis.data('field');
      var key = othis.data('key');
      var col = that.col(key);
      var index = othis.closest('tr').data('index');
      var data = table.cache[that.key][index];
      var elemCell = othis.children(ELEM_CELL);

      // 是否開啟編輯
      // 若 edit 傳入函數，則根據函數的發揮結果判斷是否開啟編輯
      var editType = typeof col.edit === 'function'
        ? col.edit(data)
      : col.edit;

      // 顯示編輯表單
      if(editType){
        var input = $(function(){
          var inputElem = '<input class="layui-input '+ ELEM_EDIT +'">';
          if(editType === 'textarea') {
            inputElem = '<textarea class="layui-input ' + ELEM_EDIT + '"></textarea>';
          }
          return inputElem;
        }());

        input[0].value = othis.data('content') || data[field] || elemCell.text();
        othis.find('.'+ELEM_EDIT)[0] || othis.append(input);
        input.focus();
        layui.stope(e);
        return;
      }
    }).on('mouseenter', 'td', function(){
      gridExpand.call(this)
    }).on('mouseleave', 'td', function(){
       gridExpand.call(this, 'hide');
    });

    //單元格展開圖標
    var ELEM_GRID = 'layui-table-grid', ELEM_GRID_DOWN = 'layui-table-grid-down', ELEM_GRID_PANEL = 'layui-table-grid-panel'
    ,gridExpand = function(hide){
      var othis = $(this)
      ,elemCell = othis.children(ELEM_CELL);

      if(othis.data('off')) return; //不觸發事件

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

    //單元格展開事件
    that.layBody.on('click', '.'+ ELEM_GRID_DOWN, function(e){
      var othis = $(this)
      ,td = othis.parent()
      ,elemCell = td.children(ELEM_CELL);

      that.tipsIndex = layer.tips([
        '<div class="layui-table-tips-main" style="margin-top: -'+ (elemCell.height() + 23) +'px;'+ function(){
          if(options.size === 'sm'){
            return 'padding: 4px 15px; font-size: 12px;';
          }
          if(options.size === 'lg'){
            return 'padding: 14px 15px;';
          }
          return '';
        }() +'">'
          ,elemCell.html()
        ,'</div>'
        ,'<i class="layui-icon layui-table-tips-c layui-icon-close"></i>'
      ].join(''), elemCell[0], {
        tips: [3, '']
        ,time: -1
        ,anim: -1
        ,maxWidth: (device.ios || device.android) ? 300 : that.elem.width()/2
        ,isOutAnim: false
        ,skin: 'layui-table-tips'
        ,success: function(layero, index){
          layero.find('.layui-table-tips-c').on('click', function(){
            layer.close(index);
          });
        }
      });

      layui.stope(e);
    });

    // 行工具條操作事件
    var toolFn = function(type){
      var othis = $(this);
      var index = othis.parents('tr').eq(0).data('index');

      layui.event.call(
        this,
        MOD_NAME,
        (type || 'tool') + '('+ filter +')',
        commonMember.call(this, {
          event: othis.attr('lay-event')
        })
      );
      that.setThisRowChecked(index);
    };

     // 行工具條單擊事件
    that.layBody.on('click', '*[lay-event]', function(){
      toolFn.call(this);
      return false;
    }).on('dblclick', '*[lay-event]', function(){ //行工具條雙擊事件
      toolFn.call(this, 'toolDouble');
      return false;
    });

    //同步滾動條
    that.layMain.on('scroll', function(){
      var othis = $(this)
      ,scrollLeft = othis.scrollLeft()
      ,scrollTop = othis.scrollTop();

      that.layHeader.scrollLeft(scrollLeft);
      that.layTotal.scrollLeft(scrollLeft);
      that.layFixed.find(ELEM_BODY).scrollTop(scrollTop);

      layer.close(that.tipsIndex);
    });

    //自適應
    _WIN.on('resize', function(){
      that.resize();
    });
  };

  //一次性事件
  ;(function(){
    //全局點擊
    _DOC.on('click', function(){
      _DOC.trigger('table.remove.tool.panel');
    });

    //工具面板移除事件
    _DOC.on('table.remove.tool.panel', function(){
      $('.layui-table-tool-panel').remove();
    });
  })();

  //初始化
  table.init = function(filter, settings){
    settings = settings || {};
    var that = this
    ,inst = null
    ,elemTable = filter ? $('table[lay-filter="'+ filter +'"]') : $(ELEM + '[lay-data]')
    ,errorTips = 'Table element property lay-data configuration item has a syntax error: ';

    //遍歷數據表格
    elemTable.each(function(){
      var othis = $(this), tableData = othis.attr('lay-data');

      try {
        tableData = new Function('return '+ tableData)();
      } catch(e) {
        hint.error(errorTips + tableData, 'error')
      }

      var cols = [], options = $.extend({
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
          var th = $(this), itemData = th.attr('lay-data');

          try{
            itemData = new Function('return '+ itemData)();
          } catch(e){
            return hint.error(errorTips + itemData)
          }

          var row = $.extend({
            title: th.text()
            ,colspan: th.attr('colspan') || 1 //列單元格
            ,rowspan: th.attr('rowspan') || 1 //行單元格
          }, itemData);

          if(row.colspan < 2) cols.push(row);
          options.cols[i].push(row);
        });
      });

      //獲取表體數據
      othis.find('tbody>tr').each(function(i1){
        var tr = $(this), row = {};
        //如果定義了字段名
        tr.children('td').each(function(i2, item2){
          var td = $(this)
          ,field = td.data('field');
          if(field){
            return row[field] = td.html();
          }
        });
        //如果未定義字段名
        layui.each(cols, function(i3, item3){
          var td = tr.children('td').eq(i3);
          row[item3.field] = td.html();
        });
        options.data[i1] = row;
      });

      //執行渲染
      table.render(options);
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
          //如果子列已經被標注為{PARENT_COL_INDEX}，或者子列累計 colspan 數等於父列定義的 colspan，則跳出當前子列循環
          if (item22.PARENT_COL_INDEX || (childIndex >= 1 && childIndex == (item2.colspan || 1))) return;
          item22.PARENT_COL_INDEX = index;
          item2.CHILD_COLS.push(item22);
          childIndex = childIndex + (item22.hide ? 0 : parseInt(item22.colspan > 1 ? item22.colspan : 1));
          eachChildCols(index, cols, i2, item22);
        }
      });
    }
  };

  // 遍歷表頭
  table.eachCols = function(id, callback, cols){
    var config = thisTable.config[id] || {}
    ,arrs = [], index = 0;
    
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
  
  // 表格選中狀態
  table.checkStatus = function(id){
    var nums = 0
      ,invalidNum = 0
      ,arr = []
      ,data = table.cache[id] || [];

    //計算全選個數
    layui.each(data, function(i, item){
      if(layui.type(item) === 'array'){
        invalidNum++; //無效數據，或已刪除的
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
      data: arr //選中的數據
      ,isAll: data.length ? (nums === (data.length - invalidNum)) : false //是否全選
    };
  };
  
  // 獲取表格當前頁的所有行數據
  table.getData = function(id){
    var arr = []
    ,data = table.cache[id] || [];
    layui.each(data, function(i, item){
      if(layui.type(item) === 'array'){
        return;
      };
      arr.push(table.clearCacheKey(item));
    });
    return arr;
  };
  
  // 表格導出
  table.exportFile = function(id, data, options){
    data = data || table.clearCacheKey(table.cache[id]);
    options = typeof options === 'object' ? options : function(){
      var obj = {};
      options && (obj.type = options);
      return obj;
    }();

    var type = options.type || 'csv';
    var thatTable = thisTable.that[id];
    var config = thisTable.config[id] || {};
    var textType = ({
      csv: 'text/csv'
      ,xls: 'application/vnd.ms-excel'
    })[type];
    var alink = document.createElement("a");
    
    if(device.ie) return hint.error('IE_NOT_SUPPORT_EXPORTS');
    
    alink.href = 'data:'+ textType +';charset=utf-8,\ufeff'+ encodeURIComponent(function(){
      var dataTitle = []
      ,dataMain = []
      ,dataTotal = []
      ,fieldsIsHide = {};
      
      //表頭和表體
      layui.each(data, function(i1, item1){
        var vals = [];
        if(typeof id === 'object'){ //如果 id 參數直接為表頭數據
          layui.each(id, function(i, item){
            i1 == 0 && dataTitle.push(item || '');
          });
          layui.each(table.clearCacheKey(item1), function(i2, item2){
            vals.push('"'+ (item2 || '') +'"');
          });
        } else {
          table.eachCols(id, function(i3, item3){
            if(item3.field && item3.type == 'normal'){
              //不導出隱藏列
              if(item3.hide){
                if(i1 == 0) fieldsIsHide[item3.field] = true; //記錄隱藏列
                return;
              }

              var content = item1[item3.field]
              ,td = thatTable.layBody.find('tr[data-index="'+ i1 +'"]>td');

              if(content === undefined || content === null) content = '';
              
              i1 == 0 && dataTitle.push(item3.title || '');
              vals.push('"'+ parseTempData.call(thatTable, {
                item3: item3
                ,content: content
                ,tplData: item1
                ,text: 'text'
                ,obj: thatTable.commonMember.call(td.eq(0), {
                  td: function(field){
                    return td.filter('[data-field="'+ field +'"]');
                  }
                })
              }) + '"');
            }
          });
        }
        dataMain.push(vals.join(','));
      });
      
      //表合計
      thatTable && layui.each(thatTable.dataTotal, function(key, value){
        fieldsIsHide[key] || dataTotal.push(value);
      });
      
      return dataTitle.join(',') + '\r\n' + dataMain.join('\r\n') + '\r\n' + dataTotal.join(',');
    }());

    alink.download = (options.title || config.title || 'table_'+ (config.index || '')) + '.' + type;
    document.body.appendChild(alink);
    alink.click();
    document.body.removeChild(alink); 
  };
  
  // 重置表格尺寸結構
  table.resize = function(id){
    //如果指定表格唯一 id，則只執行該 id 對應的表格實例
    if(id){
      var config = getThisTableConfig(id); //獲取當前實例配置項
      if(!config) return;
      
      thisTable.that[id].resize();
      
    } else { //否則重置所有表格實例尺寸
      layui.each(thisTable.that, function(){
        this.resize();
      });
    }
  };
  
  // 重載
  table.reload = function(id, options, deep, type){
    var config = getThisTableConfig(id); //獲取當前實例配置項
    if(!config) return;
    
    var that = thisTable.that[id];
    that.reload(options, deep, type);
    
    return thisTable.call(that);
  };

  // 僅重載數據
  table.reloadData = function(){
    var args = $.extend([], arguments);
    args[3] = 'reloadData';

    // 重載時，與數據相關的參數
    var dataParams = new RegExp('^('+ [
      'data', 'url', 'method', 'contentType', 
      'dataType','jsonpCallback',
      'headers', 'where', 'page', 'limit',
      'request', 'response', 'parseData',
      'scrollPos'
    ].join('|') + ')$');

    // 過濾與數據無關的參數
    layui.each(args[1], function (key, value) {
      if(!dataParams.test(key)){
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
    delete data[table.config.disabledName];
    return data;
  };
  
  // 自動完成渲染
  $(function(){
    table.init();
  });
  
  exports(MOD_NAME, table);
});


