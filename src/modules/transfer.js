/**
 * transfer 穿梭框組件
 */

layui.define(['laytpl', 'form'], function(exports){
  "use strict";

  var $ = layui.$;
  var laytpl = layui.laytpl;
  var form = layui.form;

  // 模塊名
  var MOD_NAME = 'transfer';

  // 外部接口
  var transfer = {
    config: {},
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
    var id = options.id || that.index;

    thisModule.that[id] = that; // 記錄當前實例對象
    thisModule.config[id] = options; // 記錄當前實例配置項

    return {
      config: options,
      // 重置實例
      reload: function(options){
        that.reload.call(that, options);
      },
      // 獲取右側數據
      getData: function(){
        return that.getData.call(that);
      }
    }
  };

  // 獲取當前實例配置項
  var getThisModuleConfig = function(id){
    var config = thisModule.config[id];
    if(!config) hint.error('The ID option was not found in the '+ MOD_NAME +' instance');
    return config || null;
  };

  // 字符常量
  var ELEM = 'layui-transfer';
  var HIDE = 'layui-hide';
  var DISABLED = 'layui-btn-disabled';
  var NONE = 'layui-none';
  var ELEM_BOX = 'layui-transfer-box';
  var ELEM_HEADER = 'layui-transfer-header';
  var ELEM_SEARCH = 'layui-transfer-search';
  var ELEM_ACTIVE = 'layui-transfer-active';
  var ELEM_DATA = 'layui-transfer-data';

  // 穿梭框模板
  var TPL_BOX = function(obj){
    obj = obj || {};
    return ['<div class="layui-transfer-box" data-index="'+ obj.index +'">',
      '<div class="layui-transfer-header">',
        '<input type="checkbox" name="'+ obj.checkAllName +'" lay-filter="layTransferCheckbox" lay-type="all" lay-skin="primary" title="{{= d.data.title['+ obj.index +'] || \'list'+ (obj.index + 1) +'\' }}">',
      '</div>',
      '{{# if(d.data.showSearch){ }}',
      '<div class="layui-transfer-search">',
        '<i class="layui-icon layui-icon-search"></i>',
        '<input type="text" class="layui-input" placeholder="關鍵詞搜索">',
      '</div>',
      '{{# } }}',
      '<ul class="layui-transfer-data"></ul>',
    '</div>'].join('');
  };

  // 主模板
  var TPL_MAIN = ['<div class="layui-transfer layui-form layui-border-box" lay-filter="LAY-transfer-{{= d.index }}">',
    TPL_BOX({
      index: 0,
      checkAllName: 'layTransferLeftCheckAll'
    }),
    '<div class="layui-transfer-active">',
      '<button type="button" class="layui-btn layui-btn-sm layui-btn-primary layui-btn-disabled" data-index="0">',
        '<i class="layui-icon layui-icon-next"></i>',
      '</button>',
      '<button type="button" class="layui-btn layui-btn-sm layui-btn-primary layui-btn-disabled" data-index="1">',
        '<i class="layui-icon layui-icon-prev"></i>',
      '</button>',
    '</div>',
    TPL_BOX({
      index: 1,
      checkAllName: 'layTransferRightCheckAll'
    }),
  '</div>'].join('');

  // 構造器
  var Class = function(options){
    var that = this;
    that.index = ++transfer.index;
    that.config = $.extend({}, that.config, transfer.config, options);
    that.render();
  };

  // 默認配置
  Class.prototype.config = {
    title: ['列表一', '列表二'],
    width: 200,
    height: 360,
    data: [], // 數據源
    value: [], // 選中的數據
    showSearch: false, // 是否開啟搜索
    id: '', // 唯一索引，默認自增 index
    text: {
      none: '無數據',
      searchNone: '無匹配數據'
    }
  };

  // 重載實例
  Class.prototype.reload = function(options){
    var that = this;
    that.config = $.extend({}, that.config, options);
    that.render();
  };

  // 渲染
  Class.prototype.render = function(){
    var that = this;
    var options = that.config;

    // 解析模板
    var thisElem = that.elem = $(laytpl(TPL_MAIN, {
      open: '{{', // 標籤符前綴
      close: '}}' // 標籤符後綴
    }).render({
      data: options,
      index: that.index // 索引
    }));

    var othis = options.elem = $(options.elem);
    if(!othis[0]) return;

    // 初始化屬性
    options.data = options.data || [];
    options.value = options.value || [];

    // 初始化 id 屬性 - 優先取 options > 元素 id > 自增索引
    options.id = 'id' in options ? options.id : (
      elem.attr('id') || that.index
    );
    that.key = options.id;

    // 插入組件結構
    othis.html(that.elem);

    // 各級容器
    that.layBox = that.elem.find('.'+ ELEM_BOX)
    that.layHeader = that.elem.find('.'+ ELEM_HEADER)
    that.laySearch = that.elem.find('.'+ ELEM_SEARCH)
    that.layData = thisElem.find('.'+ ELEM_DATA);
    that.layBtn = thisElem.find('.'+ ELEM_ACTIVE + ' .layui-btn');

    // 初始化尺寸
    that.layBox.css({
      width: options.width,
      height: options.height
    });
    that.layData.css({
      height: function(){
        var height = options.height - that.layHeader.outerHeight();
        if(options.showSearch){
          height -= that.laySearch.outerHeight();
        }
        return height - 2;
      }()
    });

    that.renderData(); // 渲染數據
    that.events(); // 事件
  };

  // 渲染數據
  Class.prototype.renderData = function(){
    var that = this;
    var options = that.config;

    // 左右穿梭框差異數據
    var arr = [{
      checkName: 'layTransferLeftCheck',
      views: []
    }, {
      checkName: 'layTransferRightCheck',
      views: []
    }];

    // 解析格式
    that.parseData(function(item){
      // 標註為 selected 的為右邊的數據
      var _index = item.selected ? 1 : 0
      var listElem = ['<li>',
        '<input type="checkbox" name="'+ arr[_index].checkName +'" lay-skin="primary" lay-filter="layTransferCheckbox" title="'+ item.title +'"'+ (item.disabled ? ' disabled' : '') + (item.checked ? ' checked' : '') +' value="'+ item.value +'">',
      '</li>'].join('');
      // 按照 options.value 順序排列右側數據
      if(_index){
        layui.each(options.value, function(i, v){
          if(v == item.value && item.selected){
            arr[_index].views[i] = listElem;
          }
        });
      } else {
        arr[_index].views.push(listElem);
      }
      delete item.selected;
    });

    that.layData.eq(0).html(arr[0].views.join(''));
    that.layData.eq(1).html(arr[1].views.join(''));

    that.renderCheckBtn();
  };

  // 渲染表單
  Class.prototype.renderForm = function(type){
    form.render(type, 'LAY-transfer-'+ this.index);
  };

  // 同步複選框和按鈕狀態
  Class.prototype.renderCheckBtn = function(obj){
    var that = this;
    var options = that.config;

    obj = obj || {};

    that.layBox.each(function(_index){
      var othis = $(this);
      var thisDataElem = othis.find('.'+ ELEM_DATA);
      var allElemCheckbox = othis.find('.'+ ELEM_HEADER).find('input[type="checkbox"]');
      var listElemCheckbox =  thisDataElem.find('input[type="checkbox"]');

      // 同步複選框和按鈕狀態
      var nums = 0;
      var haveChecked = false;

      listElemCheckbox.each(function(){
        var isHide = $(this).data('hide');
        if(this.checked || this.disabled || isHide){
          nums++;
        }
        if(this.checked && !isHide){
          haveChecked = true;
        }
      });

      allElemCheckbox.prop('checked', haveChecked && nums === listElemCheckbox.length); // 全選複選框狀態
      that.layBtn.eq(_index)[haveChecked ? 'removeClass' : 'addClass'](DISABLED); // 對應的按鈕狀態

      // 無數據視圖
      if(!obj.stopNone){
        var isNone = thisDataElem.children('li:not(.'+ HIDE +')').length
        that.noneView(thisDataElem, isNone ? '' : options.text.none);
      }
    });

    that.renderForm('checkbox');
  };

  // 無數據視圖
  Class.prototype.noneView = function(thisDataElem, text){
    var createNoneElem = $('<p class="layui-none">'+ (text || '') +'</p>');
    if(thisDataElem.find('.'+ NONE)[0]){
      thisDataElem.find('.'+ NONE).remove();
    }
    text.replace(/\s/g, '') && thisDataElem.append(createNoneElem);
  };

  // 同步 value 屬性值
  Class.prototype.setValue = function(){
    var that = this;
    var options = that.config;
    var arr = [];

    that.layBox.eq(1).find('.'+ ELEM_DATA +' input[type="checkbox"]').each(function(){
      var isHide = $(this).data('hide');
      isHide || arr.push(this.value);
    });
    options.value = arr;

    return that;
  };

  // 解析數據
  Class.prototype.parseData = function(callback){
    var that = this;
    var options = that.config;
    var newData = [];

    layui.each(options.data, function(index, item){
      // 解析格式
      item = (typeof options.parseData === 'function'
        ? options.parseData(item)
      : item) || item;

      newData.push(item = $.extend({}, item))

      layui.each(options.value, function(index2, item2){
        if(item2 == item.value){
          item.selected = true;
        }
      });
      callback && callback(item);
    });

    options.data = newData;
    return that;
  };

  // 獲得右側面板數據
  Class.prototype.getData = function(value){
    var that = this;
    var options = that.config;
    var selectedData = [];

    that.setValue();

    layui.each(value || options.value, function(index, item){
      layui.each(options.data, function(index2, item2){
        delete item2.selected;
        if(item == item2.value){
          selectedData.push(item2);
        };
      });
    });
    return selectedData;
  };

  // 執行穿梭
  Class.prototype.transfer = function (_index, elem) {
    var that = this;
    var options = that.config;
    var thisBoxElem = that.layBox.eq(_index);
    var arr = [];

    if (!elem) {
      // 通過按鈕觸發找到選中的進行移動
      thisBoxElem.each(function(_index){
        var othis = $(this);
        var thisDataElem = othis.find('.'+ ELEM_DATA);

        thisDataElem.children('li').each(function(){
          var thisList = $(this);
          var thisElemCheckbox = thisList.find('input[type="checkbox"]');
          var isHide = thisElemCheckbox.data('hide');

          if(thisElemCheckbox[0].checked && !isHide){
            thisElemCheckbox[0].checked = false;
            thisBoxElem.siblings('.'+ ELEM_BOX).find('.'+ ELEM_DATA).append(thisList.clone());
            thisList.remove();

            // 記錄當前穿梭的數據
            arr.push(thisElemCheckbox[0].value);
          }

          that.setValue();
        });
      });
    } else {
      // 雙擊單條記錄移動
      var thisList = elem;
      var thisElemCheckbox = thisList.find('input[type="checkbox"]');

      thisElemCheckbox[0].checked = false;
      thisBoxElem.siblings('.'+ ELEM_BOX).find('.'+ ELEM_DATA).append(thisList.clone());
      thisList.remove();

      // 記錄當前穿梭的數據
      arr.push(thisElemCheckbox[0].value);

      that.setValue();
    }

    that.renderCheckBtn();

    // 穿梭時，如果另外一個框正在搜索，則觸發匹配
    var siblingInput = thisBoxElem.siblings('.'+ ELEM_BOX).find('.'+ ELEM_SEARCH +' input')
    siblingInput.val() === '' ||  siblingInput.trigger('keyup');

    // 穿梭時的回調
    options.onchange && options.onchange(that.getData(arr), _index);
  }

  // 事件
  Class.prototype.events = function(){
    var that = this;
    var options = that.config;

    // 左右複選框
    that.elem.on('click', 'input[lay-filter="layTransferCheckbox"]+', function(){
      var thisElemCheckbox = $(this).prev();
      var checked = thisElemCheckbox[0].checked;
      var thisDataElem = thisElemCheckbox.parents('.'+ ELEM_BOX).eq(0).find('.'+ ELEM_DATA);

      if(thisElemCheckbox[0].disabled) return;

      // 判斷是否全選
      if(thisElemCheckbox.attr('lay-type') === 'all'){
        thisDataElem.find('input[type="checkbox"]').each(function(){
          if(this.disabled) return;
          this.checked = checked;
        });
      }

      setTimeout(function () {
        that.renderCheckBtn({stopNone: true});
      }, 0)
    });

    // 雙擊穿梭
    that.elem.on('dblclick', '.' + ELEM_DATA + '>li', function(event){
      var elemThis = $(this);
      var thisElemCheckbox = elemThis.children('input[type="checkbox"]');
      var thisDataElem = elemThis.parent();
      var thisBoxElem = thisDataElem.parent();
      var index = thisBoxElem.data('index');

      if(thisElemCheckbox[0].disabled) return;

      // 根據 dblclick 回調函數返回值決定是否執行穿梭 --- 2.9.3+
      var ret = typeof options.dblclick === 'function' ? options.dblclick({
        elem: elemThis,
        data: that.getData([thisElemCheckbox[0].value])[0],
        index: index
      }) : null;

      if(ret === false) return;

      that.transfer(index, elemThis);
    })

    // 穿梭按鈕事件
    that.layBtn.on('click', function(){
      var othis = $(this);
      var _index = othis.data('index');

      if(othis.hasClass(DISABLED)) return;
      that.transfer(_index);
    });

    // 搜索
    that.laySearch.find('input').on('keyup', function(){
      var value = this.value;
      var thisDataElem = $(this).parents('.'+ ELEM_SEARCH).eq(0).siblings('.'+ ELEM_DATA);
      var thisListElem = thisDataElem.children('li');

      thisListElem.each(function(){
        var thisList = $(this);
        var thisElemCheckbox = thisList.find('input[type="checkbox"]');
        var title = thisElemCheckbox[0].title;

        // 是否區分大小寫
        if(options.showSearch !== 'cs'){
          title = title.toLowerCase();
          value = value.toLowerCase();
        }

        var isMatch = title.indexOf(value) !== -1;

        thisList[isMatch ? 'removeClass': 'addClass'](HIDE);
        thisElemCheckbox.data('hide', isMatch ? false : true);
      });

      that.renderCheckBtn();

      // 無匹配數據視圖
      var isNone = thisListElem.length === thisDataElem.children('li.'+ HIDE).length;
      that.noneView(thisDataElem, isNone ? options.text.searchNone : '');
    });
  };

  // 記錄所有實例
  thisModule.that = {}; // 記錄所有實例對象
  thisModule.config = {}; // 記錄所有實例配置項

  // 重載實例
  transfer.reload = function(id, options){
    var that = thisModule.that[id];
    that.reload(options);

    return thisModule.call(that);
  };

  // 獲得選中的數據（右側面板）
  transfer.getData = function(id){
    var that = thisModule.that[id];
    return that.getData();
  };

  // 核心入口
  transfer.render = function(options){
    var inst = new Class(options);
    return thisModule.call(inst);
  };

  exports(MOD_NAME, transfer);
});
