/**
 * layui.treeTable
 * 樹表組件
 */

layui.define(['table'], function (exports) {
  "use strict";

  var $ = layui.$;
  var form = layui.form;
  var table = layui.table;
  var hint = layui.hint();

  // api
  var treeTable = {
    config: {},
    // 事件
    on: table.on,
    // 遍歷字段
    eachCols: table.eachCols,
    index: table.index,
    set: function (options) {
      var that = this;
      that.config = $.extend({}, that.config, options);
      return that;
    },
    resize: table.resize
  };

  // 操作當前實例
  var thisTreeTable = function () {
    var that = this
      , options = that.config
      , id = options.id || options.index;

    return {
      config: options,
      reload: function (options, deep) {
        that.reload.call(that, options, deep);
      },
      reloadData: function (options, deep) {
        treeTable.reloadData(id, options, deep);
      }
    }
  }

  // 獲取當前實例
  var getThisTable = function (id) {
    var that = thisTreeTable.that[id];
    if (!that) hint.error(id ? ('The treeTable instance with ID \'' + id + '\' not found') : 'ID argument required');
    return that || null;
  }

  // 獲取當前實例配置項
  var getThisTableConfig = function (id) {
    return getThisTable(id).config;
  }

  // 字符
  var MOD_NAME = 'treeTable'
    , ELEMTREE = '.layui-table-tree'
    , THIS = 'layui-this'
    , SHOW = 'layui-show'
    , HIDE = 'layui-hide'
    , HIDE_V = 'layui-hide-v'
    , DISABLED = 'layui-disabled'
    , NONE = 'layui-none'

    , ELEM_VIEW = '.layui-table-view'
    , ELEM_TOOL = '.layui-table-tool'
    , ELEM_BOX = '.layui-table-box'
    , ELEM_INIT = '.layui-table-init'
    , ELEM_HEADER = '.layui-table-header'
    , ELEM_BODY = '.layui-table-body'
    , ELEM_MAIN = '.layui-table-main'
    , ELEM_FIXED = '.layui-table-fixed'
    , ELEM_FIXL = '.layui-table-fixed-l'
    , ELEM_FIXR = '.layui-table-fixed-r'
    , ELEM_TOTAL = '.layui-table-total'
    , ELEM_PAGE = '.layui-table-page'
    , ELEM_SORT = '.layui-table-sort'
    , ELEM_EDIT = 'layui-table-edit'
    , ELEM_HOVER = 'layui-table-hover'
    , ELEM_GROUP = 'laytable-cell-group'

  var LAY_DATA_INDEX = 'LAY_DATA_INDEX';
  var LAY_DATA_INDEX_HISTORY = 'LAY_DATA_INDEX_HISTORY';
  var LAY_PARENT_INDEX = 'LAY_PARENT_INDEX';
  var LAY_CHECKBOX_HALF = 'LAY_CHECKBOX_HALF';
  var LAY_EXPAND = 'LAY_EXPAND';
  var LAY_HAS_EXPANDED = 'LAY_HAS_EXPANDED';

  // 構造器
  var Class = function (options) {
    var that = this;
    that.index = ++treeTable.index;
    that.config = $.extend(true, {}, that.config, treeTable.config, options);
    // 處理一些屬性
    that.init();
    that.render();
  };

  var updateCache = function (id, childrenKey, data) {
    var tableCache = table.cache[id];
    layui.each(data || tableCache, function (index, item) {
      var itemDataIndex = item[LAY_DATA_INDEX];
      if (itemDataIndex.indexOf('-') !== -1) {
        tableCache[itemDataIndex] = item
      }
      item[childrenKey] && updateCache(id, childrenKey, item[childrenKey]);
    })
  }

  Class.prototype.init = function () {
    var that = this;
    var options = that.config;

    // 先初始一個空的表格以便拿到對應的表格實例信息
    var tableIns = table.render($.extend({}, options, {
      data: [],
      url: '',
      done: null
    }))
    var id = tableIns.config.id;
    thisTreeTable.that[id] = that; // 記錄當前實例對象
    that.tableIns = tableIns;

    var treeOptions = options.tree;
    var customName = treeOptions.customName;
    var isParentKey = customName.isParent;
    var childrenKey = customName.children;

    // 處理屬性
    var parseData = options.parseData;
    var done = options.done;

    if (options.url) {
      // 異步加載的時候需要處理parseData進行轉換
      options.parseData = function () {
        var parseDataThat = this;
        var args = arguments;
        var retData = args[0];
        if (layui.type(parseData) === 'function') {
          retData = parseData.apply(parseDataThat, args) || args[0];
        }
        var dataName = parseDataThat.response.dataName;
        // 處理 isSimpleData
        if (treeOptions.data.isSimpleData && !treeOptions.async.enable) { // 異步加載和 isSimpleData 不應該一起使用
          retData[dataName] = that.flatToTree(retData[dataName]);
        }

        that.initData(retData[dataName]);

        return retData;
      }
    } else {
      options.data = options.data || [];
      // 處理 isSimpleData
      if (treeOptions.data.isSimpleData) {
        options.data = that.flatToTree(options.data);
      }
      if (options.initSort && options.initSort.type) {
        options.data = layui.sort(options.data, options.initSort.field, options.initSort.type === 'desc')
      }
      that.initData(options.data);
    }

    options.done = function () {
      var args = arguments;
      var doneThat = this;

      var tableView = this.elem.next();
      that.updateStatus(null, {
        LAY_HAS_EXPANDED: false // 去除已經打開過的狀態
      });
      // 更新cache中的內容 將子節點也存到cache中
      updateCache(id, childrenKey);
      // 更新全選框的狀態
      var layTableAllChooseElem = tableView.find('[name="layTableCheckbox"][lay-filter="layTableAllChoose"]');
      if (layTableAllChooseElem.length) {
        var checkStatus = treeTable.checkStatus(id);
        layTableAllChooseElem.prop({
          checked: checkStatus.isAll && checkStatus.data.length,
          indeterminate: !checkStatus.isAll && checkStatus.data.length
        })
      }

      that.renderTreeTable(tableView);

      if (layui.type(done) === 'function') {
        return done.apply(doneThat, args);
      }
    }
  }

  // 初始默認配置
  Class.prototype.config = {
    tree: {
      customName: {
        children: "children", // 節點數據中保存子節點數據的屬性名稱
        isParent: "isParent", // 節點數據保存節點是否為父節點的屬性名稱
        name: "name", // 節點數據保存節點名稱的屬性名稱
        id: "id", //  唯一標識的屬性名稱
        pid: "parentId",
        rootId: null
      },
      view: {
        indent: 14, // 層級縮進量
        flexIconClose: '<i class="layui-icon layui-icon-triangle-r"></i>', // 關閉時候的摺疊圖標
        flexIconOpen: '<i class="layui-icon layui-icon-triangle-d"></i>', // 打開時候的摺疊圖標
        showIcon: true, // 是否顯示圖標(節點類型圖標)
        icon: '', // 節點圖標，如果設置了這個屬性或者數據中有這個字段信息，不管打開還是關閉都以這個圖標的值為準
        iconClose: '<i class="layui-icon layui-icon-folder-open"></i>', // 打開時候的圖標
        iconOpen: '<i class="layui-icon layui-icon-folder"></i>', // 關閉時候的圖標
        iconLeaf: '<i class="layui-icon layui-icon-leaf"></i>', // 葉子節點的圖標
        showFlexIconIfNotParent: false, // 當節點不是父節點的時候是否顯示摺疊圖標
        dblClickExpand: true, // 雙擊節點時，是否自動展開父節點的標識
      },
      data: {
        isSimpleData: false // 是否簡單數據模式
      },
      async: {
        enable: false, // 是否開啟異步加載模式，只有開啟的時候其他參數才起作用
        url: '', // 異步加載的接口，可以根據需要設置與頂層接口不同的接口，如果相同可以不設置該參數
        type: null, // 請求的接口類型，設置可缺省同上
        contentType: null, // 提交參數的數據類型，設置可缺省同上
        headers: null, // 設置可缺省同上
        where: null, // 設置可缺省同上
        autoParam: [], // 自動參數
      },
      callback: {
        beforeExpand: null, // 展開前的回調 return false 可以阻止展開的動作
        onExpand: null, // 展開之後的回調
      }
    },
  };

  Class.prototype.getOptions = function () {
    var that = this;
    if (that.tableIns) {
      return table.getOptions(that.tableIns.config.id); // 獲取表格的實時配置信息
    } else {
      return that.config;
    }
  };

  function flatToTree(flatArr, idKey, pIdKey, childrenKey, rootPId) {
    idKey = idKey || 'id';
    pIdKey = pIdKey || 'parentId';
    childrenKey = childrenKey || 'children';
    // 創建一個空的 nodes 對象，用於保存所有的節點
    var nodes = {};
    // 遍歷所有節點，將其加入 nodes 對象中
    layui.each(flatArr, function (index, item) {
      nodes[item[idKey]] = $.extend({}, item);
      nodes[item[idKey]][childrenKey] = [];
    })
    // 遍歷所有節點，將其父子關係加入 nodes 對象
    layui.each(nodes, function (index, item) {
      if (item[pIdKey] && nodes[item[pIdKey]]) {
        nodes[item[pIdKey]][childrenKey].push(item);
      }
    })
    // 返回頂層節點
    return Object.values(nodes).filter(function (item) {
      return rootPId ? item[pIdKey] === rootPId : !item[pIdKey];
    })
  }

  Class.prototype.flatToTree = function (tableData) {
    var that = this;
    var options = that.getOptions();
    var treeOptions = options.tree;
    var customName = treeOptions.customName;
    var tableId = options.id;

    tableData = tableData || table.cache[tableId];

    return flatToTree(tableData, customName.id, customName.pid, customName.children, customName.rootId)
  }

  Class.prototype.treeToFlat = function (tableData, parentId, parentIndex) {
    var that = this;
    var options = that.getOptions();
    var treeOptions = options.tree;
    var customName = treeOptions.customName;
    var childrenKey = customName.children;
    var pIdKey = customName.pid;

    var flat = [];
    layui.each(tableData, function (i1, item1) {
      var dataIndex = (parentIndex ? parentIndex + '-' : '') + i1;
      var dataNew = $.extend({}, item1);
      dataNew[childrenKey] = null;
      dataNew[pIdKey] = item1[pIdKey] || parentId;
      flat.push(dataNew);
      flat = flat.concat(that.treeToFlat(item1[childrenKey], item1[customName.id], dataIndex));
    });

    return flat;
  }

  // 通過index獲取節點數據
  Class.prototype.getNodeDataByIndex = function (index, clone, newValue) {
    var that = this;
    var options = that.getOptions();
    var treeOptions = options.tree;
    var tableId = options.id;

    var dataCache = table.cache[tableId][index];
    if (newValue !== 'delete' && dataCache) {
      return clone ? $.extend({}, dataCache) : dataCache;
    }

    var tableData = that.getTableData();
    index += '';
    var indexArr = index.split('-');

    var dataRet = tableData;
    var tableCache = (options.url || indexArr.length > 1) ? null : table.cache[tableId]; // 只有在刪除根節點的時候才需要處理
    for (var i = 0, childrenKey = treeOptions.customName.children; i < indexArr.length; i++) {
      if (newValue && i === indexArr.length - 1) {
        if (newValue === 'delete') {
          // 刪除
          if (tableCache) {
            // 同步cache
            // tableCache.splice(tableCache.findIndex(function (value) {
            //   return value[LAY_DATA_INDEX] === index;
            // }), 1);
            layui.each(tableCache, function (i1, item1) {
              if (item1[LAY_DATA_INDEX] === index) {
                tableCache.splice(i1, 1);
                return true;
              }
            })
          }
          return (i ? dataRet[childrenKey] : dataRet).splice(indexArr[i], 1)[0];
        } else {
          // 更新值
          $.extend((i ? dataRet[childrenKey] : dataRet)[indexArr[i]], newValue);
        }
      }
      dataRet = i ? dataRet[childrenKey][indexArr[i]] : dataRet[indexArr[i]];
    }
    return clone ? $.extend({}, dataRet) : dataRet;
  }

  treeTable.getNodeDataByIndex = function (id, index) {
    var that = getThisTable(id);
    if(!that) return;
    return that.getNodeDataByIndex(index, true);
  }

  // 判斷是否是父節點
  var checkIsParent = function (data, isParentKey, childrenKey) {
    isParentKey = isParentKey || 'isParent';
    childrenKey = childrenKey || 'children';
    layui.each(data, function (i1, item1) {
      if (!(isParentKey in item1)) {
        item1[isParentKey] = !!(item1[childrenKey] && item1[childrenKey].length);
        checkIsParent(item1[childrenKey]);
      }
    })
  }

  Class.prototype.initData = function (data, parentIndex) {
    var that = this;
    var options = that.getOptions();
    var treeOptions = options.tree;
    var tableId = options.id;

    data = data || that.getTableData();

    var customName = treeOptions.customName;
    var isParentKey = customName.isParent;
    var childrenKey = customName.children;

    layui.each(data, function (i1, item1) {
      if (!(isParentKey in item1)) {
        item1[isParentKey] = !!(item1[childrenKey] && item1[childrenKey].length);
      }
      item1[LAY_DATA_INDEX_HISTORY] = item1[LAY_DATA_INDEX];
      item1[LAY_PARENT_INDEX] = parentIndex = parentIndex || '';
      var dataIndex = item1[LAY_DATA_INDEX] = (parentIndex ? parentIndex + '-' : '') + i1;
      that.initData(item1[childrenKey] || [], dataIndex);
    });

    parentIndex || updateCache(tableId, childrenKey);

    return data;
  }

  var expandNode = function (treeNode, expandFlag, sonSign, focus, callbackFlag) {
    // treeNode // 需要展開的節點
    var trElem = treeNode.trElem;
    var tableViewElem = trElem.closest(ELEM_VIEW);
    var tableViewFilterId = tableViewElem.attr('lay-filter');
    var tableId = tableViewElem.attr('lay-id');
    var options = table.getOptions(tableId);
    var treeOptions = options.tree || {};
    var customName = treeOptions.customName || {};
    var isParentKey = customName.isParent;
    var trIndex = trElem.attr('lay-data-index'); // 可能出現多層
    var treeTableThat = getThisTable(tableId);
    var tableData = treeTableThat.getTableData();

    var trData = treeTableThat.getNodeDataByIndex(trIndex);

    var dataLevel = trElem.data('level');
    var dataLevelNew = (dataLevel || 0) + 1;

    // 後續調優：對已經展開的節點進行展開和已經關閉的節點進行關閉應該做優化減少不必要的代碼執行 todo
    var isToggle = layui.type(expandFlag) !== 'boolean';
    var trExpand = isToggle ? !trData[LAY_EXPAND] : expandFlag;
    var retValue = trData[isParentKey] ? trExpand : null;

    if (callbackFlag && trExpand != trData[LAY_EXPAND] && (!trData['LAY_ASYNC_STATUS'] || trData['LAY_ASYNC_STATUS'] === 'local')) {
      var beforeExpand = treeOptions.callback.beforeExpand;
      if (layui.type(beforeExpand) === 'function') {
        if (beforeExpand(tableId, trData, expandFlag) === false) {
          return retValue;
        }
      }
    }

    var trExpanded = trData[LAY_HAS_EXPANDED]; // 展開過，包括異步加載

    // 找到表格中的同類節點（需要找到lay-data-index一致的所有行）
    var trsElem = tableViewElem.find('tr[lay-data-index="' + trIndex + '"]');
    // 處理摺疊按鈕圖標
    var flexIconElem = trsElem.find('.layui-table-tree-flexIcon');
    flexIconElem.html(trExpand ? treeOptions.view.flexIconOpen : treeOptions.view.flexIconClose)
    trData[isParentKey] && flexIconElem.css('visibility', 'visible');
    // 處理節點圖標
    if (treeOptions.view.showIcon && trData[isParentKey] && !trData.icon && !treeOptions.view.icon) {
      var nodeIconElem = trsElem.find('.layui-table-tree-nodeIcon');
      nodeIconElem.html(trExpand ? treeOptions.view.iconOpen : treeOptions.view.iconClose);
    }

    var childNodes = trData[customName.children] || []; // 測試用後續需要改成子節點的字段名稱
    // 處理子節點展示與否
    if (trExpand) {
      // 展開
      if (trExpanded) { // 已經展開過
        trData[LAY_EXPAND] = trExpand;
        tableViewElem.find(childNodes.map(function (value, index, array) {
          return 'tr[lay-data-index="' + value[LAY_DATA_INDEX] + '"]'
        }).join(',')).removeClass('layui-hide');
        layui.each(childNodes, function (i1, item1) {
          if (sonSign && !isToggle) { // 非狀態切換的情況下
            // 級聯展開子節點
            expandNode({trElem: tableViewElem.find('tr[lay-data-index="' + item1.LAY_DATA_INDEX + '"]').first()}, expandFlag, sonSign, focus, callbackFlag);
          } else if (item1[LAY_EXPAND]) {
            // 級聯展開
            expandNode({trElem: tableViewElem.find('tr[lay-data-index="' + item1.LAY_DATA_INDEX + '"]').first()}, true);
          }
        })
      } else {
        var asyncSetting = treeOptions.async || {};
        var asyncUrl = asyncSetting.url || options.url;
        // 提供一個能支持用戶在獲取子數據轉換調用的回調，這樣讓子節點數據獲取更加靈活 todo
        if (asyncSetting.enable && asyncUrl && !trData['LAY_ASYNC_STATUS']) {
          trData['LAY_ASYNC_STATUS'] = 'loading';
          var params = {};
          // 參數
          var data = $.extend(params, asyncSetting.where || options.where);
          var asyncAutoParam = asyncSetting.autoParam;
          layui.each(asyncAutoParam, function (index, item) {
            var itemStr = item;
            var itemArr = item.split('=');
            data[itemArr[0].trim()] = trData[(itemArr[1] || itemArr[0]).trim()]
          })

          var asyncContentType = asyncSetting.contentType || options.contentType;
          if (asyncContentType && asyncContentType.indexOf("application/json") == 0) { // 提交 json 格式
            data = JSON.stringify(data);
          }
          var asyncType = asyncSetting.method || options.method;
          var asyncDataType = asyncSetting.dataType || options.dataType;
          var asyncJsonpCallback = asyncSetting.jsonpCallback || options.jsonpCallback;
          var asyncHeaders = asyncSetting.headers || options.headers;
          var asyncParseData = asyncSetting.parseData || options.parseData;
          var asyncResponse = asyncSetting.response || options.response;

          // that.loading();
          flexIconElem.html('<i class="layui-icon layui-icon-loading layui-anim layui-anim-loop layui-anim-rotate"></i>')
          $.ajax({
            type: asyncType || 'get'
            , url: asyncUrl
            , contentType: asyncContentType
            , data: data
            , dataType: asyncDataType || 'json'
            , jsonpCallback: asyncJsonpCallback
            , headers: asyncHeaders || {}
            , success: function (res) {
              trData['LAY_ASYNC_STATUS'] = 'success';
              // 若有數據解析的回調，則獲得其返回的數據
              if (typeof asyncParseData === 'function') {
                res = asyncParseData.call(options, res) || res;
              }
              // 檢查數據格式是否符合規範
              if (res[asyncResponse.statusName] != asyncResponse.statusCode) {
                trData['LAY_ASYNC_STATUS'] = 'error';
                // 異常處理 todo
                flexIconElem.html('<i class="layui-icon layui-icon-refresh"></i>');
                // 事件
              } else {
                trData[customName.children] = res[asyncResponse.dataName];
                treeTableThat.initData(trData[customName.children], trData[LAY_DATA_INDEX])
                // 正常返回
                expandNode(treeNode, true, isToggle ? false : sonSign, focus, callbackFlag);
              }
            }
            , error: function (e, msg) {
              trData['LAY_ASYNC_STATUS'] = 'error';
              // 異常處理 todo
              typeof options.error === 'function' && options.error(e, msg);
            }
          });
          return retValue;
        }
        trData[LAY_EXPAND] = trExpand;
        trExpanded = trData[LAY_HAS_EXPANDED] = true;
        if (childNodes.length) {
          // 判斷是否需要排序
          if (options.initSort && !options.url) {
            var initSort = options.initSort;
            if (initSort.type) {
              childNodes = trData[customName.children] = layui.sort(childNodes, initSort.field, initSort.type === 'desc');
            } else {
              // 恢復默認
              childNodes = trData[customName.children] = layui.sort(childNodes, table.config.indexName);
            }
          }
          treeTableThat.initData(trData[customName.children], trData[LAY_DATA_INDEX]);
          // 將數據通過模板得出節點的html代碼
          var str2 = table.getTrHtml(tableId, childNodes, null, null, trIndex);

          var str2Obj = {
            trs: $(str2.trs.join('')),
            trs_fixed: $(str2.trs_fixed.join('')),
            trs_fixed_r: $(str2.trs_fixed_r.join(''))
          }
          layui.each(childNodes, function (childIndex, childItem) {
            str2Obj.trs.eq(childIndex).attr({
              'data-index': childItem[LAY_DATA_INDEX],
              'lay-data-index': childItem[LAY_DATA_INDEX],
              'data-level': dataLevelNew
            })
            str2Obj.trs_fixed.eq(childIndex).attr({
              'data-index': childItem[LAY_DATA_INDEX],
              'lay-data-index': childItem[LAY_DATA_INDEX],
              'data-level': dataLevelNew
            })
            str2Obj.trs_fixed_r.eq(childIndex).attr({
              'data-index': childItem[LAY_DATA_INDEX],
              'lay-data-index': childItem[LAY_DATA_INDEX],
              'data-level': dataLevelNew
            })
          })

          tableViewElem.find(ELEM_MAIN).find('tbody tr[lay-data-index="' + trIndex + '"]').after(str2Obj.trs);
          tableViewElem.find(ELEM_FIXL).find('tbody tr[lay-data-index="' + trIndex + '"]').after(str2Obj.trs_fixed);
          tableViewElem.find(ELEM_FIXR).find('tbody tr[lay-data-index="' + trIndex + '"]').after(str2Obj.trs_fixed_r);

          // 初始化新增的節點中的內容
          layui.each(str2Obj, function (key, item) {
            treeTableThat.renderTreeTable(item, dataLevelNew);
          })

          if (sonSign && !isToggle) { // 非狀態切換的情況下
            // 級聯展開/關閉子節點
            layui.each(childNodes, function (i1, item1) {
              expandNode({trElem: tableViewElem.find('tr[lay-data-index="' + item1.LAY_DATA_INDEX + '"]').first()}, expandFlag, sonSign, focus, callbackFlag);
            })
          }
        }
      }
    } else {
      trData[LAY_EXPAND] = trExpand;
      // 摺疊
      if (sonSign && !isToggle) { // 非狀態切換的情況下
        layui.each(childNodes, function (i1, item1) {
          expandNode({trElem: tableViewElem.find('tr[lay-data-index="' + item1.LAY_DATA_INDEX + '"]').first()}, expandFlag, sonSign, focus, callbackFlag);
        });
        tableViewElem.find(childNodes.map(function (value, index, array) { // 只隱藏直接子節點，其他由遞歸的處理
          return 'tr[lay-data-index="' + value[LAY_DATA_INDEX] + '"]'
        }).join(',')).addClass('layui-hide');
      } else {
        var childNodesFlat = treeTableThat.treeToFlat(childNodes, trData[customName.id], trIndex);
        tableViewElem.find(childNodesFlat.map(function (value, index, array) {
          return 'tr[lay-data-index="' + value[LAY_DATA_INDEX] + '"]'
        }).join(',')).addClass('layui-hide');
      }

    }
    table.resize(tableId);

    if (callbackFlag && trData['LAY_ASYNC_STATUS'] !== 'loading') {
      var onExpand = treeOptions.callback.onExpand;
      layui.type(onExpand) === 'function' && onExpand(tableId, trData, expandFlag);
    }

    return retValue;
  }

  treeTable.expandNode = function (id, opts) {
    var that = getThisTable(id);
    if(!that) return;

    opts = opts || {};

    var index = opts.index;
    var expandFlag = opts.expandFlag;
    var sonSign = opts.inherit;
    var callbackFlag = opts.callbackFlag;


    var options = that.getOptions();
    var tableViewElem = options.elem.next();
    return expandNode({trElem: tableViewElem.find('tr[lay-data-index="' + index + '"]').first()}, expandFlag, sonSign, null, callbackFlag)
  };

  // 目前還有性能問題特別是在data模式需要優化暫時不能使用 todo
  treeTable.expandAll = function (id, expandFlag) {
    if (layui.type(expandFlag) !== 'boolean') {
      return hint.error('expandAll的展開狀態參數只接收true/false')
    }

    var that = getThisTable(id);
    if(!that) return;

    var options = that.getOptions();
    var treeOptions = options.tree;
    var tableView = options.elem.next();

    if (!expandFlag) {
      // 關閉所有
      // 將所有已經打開的節點的狀態設置為關閉，
      that.updateStatus(null, {LAY_EXPAND: false}); // 只處理當前頁，如果需要處理全部表格，需要用treeTable.updateStatus
      // 隱藏所有非頂層的節點
      tableView.find('tbody tr[data-level!="0"]').addClass('layui-hide');
      // 處理頂層節點的圖標
      var trLevel0 = tableView.find('tbody tr[data-level="0"]');
      trLevel0.find('.layui-table-tree-flexIcon').html(treeOptions.view.flexIconClose);
      trLevel0.find('.layui-table-tree-nodeIcon').html(treeOptions.view.iconClose);

      treeTable.resize();
    } else {
      return hint.error('暫不支持展開全部');

      // 展開所有
      if (treeOptions.async.enable) {
        // 存在異步加載

      } else {
        // 先判斷是否全部打開過了
        var tableDataFlat = treeTable.getData(id, true);
        var isAllExpanded = true;
        layui.each(tableDataFlat, function (i1, item1) {
          if (!item1[LAY_HAS_EXPANDED]) {
            isAllExpanded = false;
            return true;
          }
        })
        // 如果全部節點已經都打開過，就可以簡單處理跟隱藏所有節點反操作
        if (isAllExpanded) {
          that.updateStatus(null, {LAY_EXPAND: true}); // 只處理當前頁，如果需要處理全部表格，需要用treeTable.updateStatus
          // 隱藏所有非頂層的節點
          tableView.find('tbody tr[data-level!="0"]').removeClass('layui-hide');
          // 處理頂層節點的圖標
          // var trLevel0 = tableView.find('tbody tr[data-level="0"]');
          tableView.find('.layui-table-tree-flexIcon').html(treeOptions.view.flexIconOpen);
          tableView.find('.layui-table-tree-nodeIcon').html(treeOptions.view.iconOpen);

          treeTable.resize();
        } else {
          // 如果有未打開過的父節點，將內容全部生成
          that.updateStatus(null, {LAY_EXPAND: true, LAY_HAS_EXPANDED: true});
          var trsAll = table.getTrHtml(id, tableDataFlat);

        }

      }


      // 如果是異步加載子節點模式 如何處理
      // 如果有部分節點未打開過，也需要重新
    }

  }

  Class.prototype.renderTreeTable = function (tableView, level, sonSign) {
    var that = this;
    var options = that.getOptions();
    var tableViewElem = options.elem.next();
    tableViewElem.addClass('layui-table-tree');
    var tableId = options.id;
    var treeOptions = options.tree || {};
    var treeOptionsData = treeOptions.data || {};
    var treeOptionsView = treeOptions.view || {};
    var customName = treeOptions.customName || {};
    var isParentKey = customName.isParent;
    var tableFilterId = tableViewElem.attr('lay-filter');
    var treeTableThat = that;
    // var tableData = treeTableThat.getTableData();

    level = level || 0;

    if (!level) {
      // 初始化的表格裡面沒有level信息，可以作為頂層節點的判斷
      tableViewElem.find('.layui-table-body tr:not([data-level])').attr('data-level', level);
      layui.each(table.cache[tableId], function (dataIndex, dataItem) {
        tableViewElem.find('.layui-table-main tbody tr[data-level="0"]:eq(' + dataIndex + ')').attr('lay-data-index', dataItem[LAY_DATA_INDEX]);
        tableViewElem.find('.layui-table-fixed-l tbody tr[data-level="0"]:eq(' + dataIndex + ')').attr('lay-data-index', dataItem[LAY_DATA_INDEX]);
        tableViewElem.find('.layui-table-fixed-r tbody tr[data-level="0"]:eq(' + dataIndex + ')').attr('lay-data-index', dataItem[LAY_DATA_INDEX]);
      })
    }

    var dataExpand = {}; // 記錄需要展開的數據
    var nameKey = customName.name;
    var indent = treeOptions.view.indent || 14;
    layui.each(tableView.find('td[data-field="' + nameKey + '"]'), function (index, item) {
      item = $(item);
      var trElem = item.closest('tr');
      var itemCell = item.children('.layui-table-cell');
      if (itemCell.hasClass('layui-table-tree-item')) {
        return;
      }
      itemCell.addClass('layui-table-tree-item');
      var trIndex = trElem.attr('lay-data-index');
      if (!trIndex) { // 排除在統計行中的節點
        return;
      }
      var trData = treeTableThat.getNodeDataByIndex(trIndex);
      if (trData[LAY_EXPAND]) {
        // 需要展開
        dataExpand[trIndex] = true;
      }

      var tableCellElem = item.find('div.layui-table-cell');
      var htmlTemp = tableCellElem.html();

      var flexIconElem = item.find('div.layui-table-cell')
        .html(['<div class="layui-inline layui-table-tree-flexIcon" ',
          'style="',
          'margin-left: ' + (indent * level) + 'px;',
          (trData[isParentKey] || treeOptionsView.showFlexIconIfNotParent) ? '' : ' visibility: hidden;',
          '">',
          treeOptions.view.flexIconClose, // 摺疊圖標
          '</div>',
          '<div class="layui-inline layui-table-tree-nodeIcon">',
          treeOptions.view.showIcon ? (trData.icon || treeOptions.view.icon || (trData[isParentKey] ? treeOptions.view.iconClose : treeOptions.view.iconLeaf) || '') : '',
          '</div>', // 區分父子節點
          htmlTemp].join('')) // 圖標要可定製
        .find('.layui-table-tree-flexIcon');

      // 添加展開按鈕的事件
      flexIconElem.on('click', function (event) {
        layui.stope(event);
        // 處理數據
        // var trElem = item.closest('tr');
        expandNode({trElem}, null, null, null, true);
      });
    });

    // 當前層的數據看看是否需要展開
    sonSign !== false && layui.each(dataExpand, function (index, item) {
      var trDefaultExpand = tableViewElem.find('tr[lay-data-index="' + index + '"]');
      trDefaultExpand.find('.layui-table-tree-flexIcon').html(treeOptions.view.flexIconOpen);
      expandNode({trElem: trDefaultExpand.first()}, true);
    });

    treeTable.formatNumber(tableId);
    form.render(null, tableFilterId);
  }


  /**
   * 重新編號
   * @param {String} id 表格id
   * @return {Object} layui.treeTable
   * */
  treeTable.formatNumber = function (id) {
    var that = getThisTable(id);
    if(!that) return;

    var options = that.getOptions();
    var tableViewElem = options.elem.next();

    var num = 0;
    layui.each(that.treeToFlat(table.cache[id]), function (i1, item1) {
      if (layui.isArray(item1)) {
        return;
      }
      var itemData = that.getNodeDataByIndex(item1.LAY_DATA_INDEX);
      itemData['LAY_NUM'] = ++num;
      tableViewElem.find('tr[lay-data-index="' + item1.LAY_DATA_INDEX + '"] .laytable-cell-numbers').html(itemData['LAY_NUM']);
    })
    return treeTable;
  }

  // 樹表渲染
  Class.prototype.render = function (type) {
    var that = this;
    that.tableIns = table[type === 'reloadData' ? 'reloadData' : 'reload'](that.tableIns.config.id, $.extend(true, {}, that.config));
    that.config = that.tableIns.config;
  };

  // 表格重載
  Class.prototype.reload = function (options, deep, type) {
    var that = this;

    options = options || {};
    delete that.haveInit;

    // 防止數組深度合併
    layui.each(options, function (key, item) {
      if (layui.type(item) === 'array') delete that.config[key];
    });

    // 對參數進行深度或淺擴展
    that.config = $.extend(deep, {}, that.config, options);

    // 執行渲染
    that.render(type);
  };

  // 僅重載數據
  treeTable.reloadData = function () {
    var args = $.extend(true, [], arguments);
    args[3] = 'reloadData';

    return treeTable.reload.apply(null, args);
  };

  var updateStatus = function (data, statusObj, childrenKey) {
    var dataUpdated = [];
    layui.each(data, function (i1, item1) {
      if (layui.type(statusObj) === 'function') {
        statusObj(item1);
      } else {
        $.extend(item1, statusObj);
      }
      dataUpdated.push($.extend({}, item1));
      dataUpdated = dataUpdated.concat(updateStatus(item1[childrenKey], statusObj, childrenKey));
    });
    return dataUpdated;
  }

  Class.prototype.updateStatus = function (data, statusObj) {
    var that = this;
    var options = that.getOptions();
    var treeOptions = options.tree;
    data = data || table.cache[options.id];

    return updateStatus(data, statusObj, treeOptions.customName.children);
  }

  Class.prototype.getTableData = function () {
    var that = this;
    var options = that.getOptions();
    return options.url ? table.cache[options.id] : options.data;
  }

  treeTable.updateStatus = function (id, statusObj, data) {
    var that = getThisTable(id);
    var options = that.getOptions();
    if (!data) {
      if (options.url) {
        data = table.cache[options.id];
      } else {
        data = options.data;
      }
    }
    return that.updateStatus(data, statusObj);
  }

  treeTable.sort = function (id) {
    var that = getThisTable(id);
    if(!that) return;

    var options = that.getOptions();
    var initSort = options.initSort;

    if (!options.url) {
      if (initSort.type) {
        options.data = layui.sort(options.data, initSort.field, initSort.type === 'desc');
      } else {
        options.data = layui.sort(options.data, table.config.indexName);
      }
      that.initData(options.data);
      treeTable.reloadData(id);
    } else {
      // url異步取數的表格一般需要自己添加監聽之後進行reloadData並且把排序參數加入到where中
      if (options.autoSort) {
        var tableData = that.initData();
        var res = {};
        res[options.response.dataName] = tableData;
        typeof options.done === 'function' && options.done(
          res, that.page, that.count
        );
      }
    }
  }

  // 處理事件
  var updateObjParams = function (obj) {
    var tableId = obj.config.id;
    var tableThat = getThisTable(tableId);
    var trData = obj.data = treeTable.getNodeDataByIndex(tableId, obj.index); // 克隆的
    var trIndex = trData[LAY_DATA_INDEX];
    obj.dataIndex = trIndex;

    // 處理update方法
    var updateFn = obj.update;
    obj.update = function () {
      var updateThat = this;
      var args = arguments;
      $.extend(tableThat.getNodeDataByIndex(trIndex), args[0]);
      var ret = updateFn.apply(updateThat, args); // 主要負責更新節點內容
      tableThat.renderTreeTable(obj.tr, obj.tr.attr('data-level'), false);
      return ret;
    }

    // 處理del方法
    obj.del = function () {
      treeTable.removeNode(tableId, trData);
    }

    // 處理setRowChecked
    obj.setRowChecked = function (checked) {
      treeTable.setRowChecked(tableId, {
        index: trData,
        checked: checked
      });
    }
  }

  // 更新數據
  treeTable.updateNode = function (id, index, newNode) {
    var that = getThisTable(id);
    if(!that) return;

    var options = that.getOptions();
    var treeOptions = options.tree;
    var tableView = options.elem.next();
    var trElem = tableView.find('tr[lay-data-index="' + index + '"]');
    var trIndex = trElem.attr('data-index');
    var trLevel = trElem.attr('data-level')

    if (!newNode) {
      return;
    }
    // 更新值
    var newNodeTemp = that.getNodeDataByIndex(index, false, newNode);
    // 獲取新的tr替換
    var trNew = table.getTrHtml(id, [newNodeTemp]);
    // 重新渲染tr
    layui.each(['main', 'fixed-l', 'fixed-r'], function (i, item) {
      tableView.find('.layui-table-' + item + ' tbody tr[lay-data-index="' + index + '"]').replaceWith($(trNew[['trs', 'trs_fixed', 'trs_fixed_r'][i]].join('')).attr({
        'data-index': trIndex,
        'lay-data-index': index,
      }));
    });
    that.renderTreeTable(tableView.find('tr[lay-data-index="' + index + '"]'), trLevel);
  }

  // 刪除數據
  treeTable.removeNode = function (id, node) {
    var that = getThisTable(id);
    if(!that) return;

    var options = that.getOptions();
    var treeOptions = options.tree;
    var tableView = options.elem.next();
    var delNode;
    var indexArr = [];
    delNode = that.getNodeDataByIndex(layui.type(node) === 'string' ? node : node[LAY_DATA_INDEX], false, 'delete');
    var nodeP = that.getNodeDataByIndex(delNode[LAY_PARENT_INDEX]);
    that.updateCheckStatus(nodeP, true);
    var delNodesFlat = that.treeToFlat([delNode], delNode[treeOptions.customName.pid], delNode[LAY_PARENT_INDEX]);
    layui.each(delNodesFlat, function (i2, item2) {
      indexArr.push('tr[lay-data-index="' + item2[LAY_DATA_INDEX] + '"]');
    })

    tableView.find(indexArr.join(',')).remove(); // 刪除行
    // 重新整理數據
    var tableData = that.initData();
    // index發生變化需要更新頁面tr中對應的lay-data-index 新增和刪除都要注意數據結構變動之後的index問題
    layui.each(that.treeToFlat(tableData), function (i3, item3) {
      if (item3[LAY_DATA_INDEX_HISTORY] && item3[LAY_DATA_INDEX_HISTORY] !== item3[LAY_DATA_INDEX]) {
        tableView.find('tr[lay-data-index="' + item3[LAY_DATA_INDEX_HISTORY] + '"]').attr({
          'data-index': item3[LAY_DATA_INDEX],
          'lay-data-index': item3[LAY_DATA_INDEX],
        });
        // item3[LAY_DATA_INDEX_HISTORY] = item3[LAY_DATA_INDEX]
      }
    });
    // 重新更新頂層節點的data-index;
    layui.each(table.cache[id], function (i4, item4) {
      tableView.find('tr[data-level="0"][lay-data-index="' + item4[LAY_DATA_INDEX] + '"]').attr('data-index', i4);
    })
    treeTable.formatNumber(id);
  }

  /**
   * 新增數據節點
   * @param {String} id 樹表id
   * @param {String|Number} parentIndex 指定的父節點，如果增加根節點，請設置 parentIndex 為 null 即可
   * @param {Number} index:Number 新節點插入的位置（從 0 開始）index = -1(默認) 時，插入到最後
   * @param {Object|Array} data 新增的節點，單個或者多個
   * @param {Boolean} focus 新增的節點，單個或者多個
   * @return {Array} 新增的節點
   * */
  treeTable.addNodes = function (id, opts) {
    var that = getThisTable(id);
    if(!that) return;

    var options = that.getOptions();
    var treeOptions = options.tree;
    var tableViewElem = options.elem.next();

    opts = opts || {};

    var parentIndex = opts.parentIndex;
    var index = opts.index;
    var newNodes = opts.data;
    var focus = opts.focus;

    parentIndex = layui.type(parentIndex) === 'number' ? parentIndex.toString() : parentIndex;
    var parentNode = parentIndex ? that.getNodeDataByIndex(parentIndex) : null;
    index = layui.type(index) === 'number' ? index : -1;

    // 添加數據
    newNodes = $.extend(true, [], (layui.isArray(newNodes) ? newNodes : [newNodes]));

    var tableData = that.getTableData(), dataAfter;
    if (!parentNode) {
      // 添加到根節點
      dataAfter = table.cache[id].splice(index === -1 ? table.cache[id].length : index);
      table.cache[id] = table.cache[id].concat(newNodes, dataAfter);
      if (!options.url) {
        // 靜態data模式
        if (!options.page) {
          options.data = table.cache[id];
        } else {
          var pageOptions = options.page;
          options.data.splice.apply(options.data, [pageOptions.limit * (pageOptions.curr - 1), pageOptions.limit].concat(table.cache[id]))
        }
      }
      // 將新節點添加到頁面
      tableData = that.initData();

      var newNodesHtml = table.getTrHtml(id, newNodes);
      var newNodesHtmlObj = {
        trs: $(newNodesHtml.trs.join('')),
        trs_fixed: $(newNodesHtml.trs_fixed.join('')),
        trs_fixed_r: $(newNodesHtml.trs_fixed_r.join(''))
      }

      layui.each(newNodes, function (newNodeIndex, newNodeItem) {
        newNodesHtmlObj.trs.eq(newNodeIndex).attr({
          'data-index': newNodeItem[LAY_DATA_INDEX],
          'lay-data-index': newNodeItem[LAY_DATA_INDEX],
          'data-level': '0'
        })
        newNodesHtmlObj.trs_fixed.eq(newNodeIndex).attr({
          'data-index': newNodeItem[LAY_DATA_INDEX],
          'lay-data-index': newNodeItem[LAY_DATA_INDEX],
          'data-level': '0'
        })
        newNodesHtmlObj.trs_fixed_r.eq(newNodeIndex).attr({
          'data-index': newNodeItem[LAY_DATA_INDEX],
          'lay-data-index': newNodeItem[LAY_DATA_INDEX],
          'data-level': '0'
        })
      })
      var trIndexPrev = parseInt(newNodes[0][LAY_DATA_INDEX]) - 1;
      var tableViewElemMAIN = tableViewElem.find(ELEM_MAIN);
      var tableViewElemFIXL = tableViewElem.find(ELEM_FIXL);
      var tableViewElemFIXR = tableViewElem.find(ELEM_FIXR);
      if (trIndexPrev === -1) {
        // 插入到開頭
        tableViewElemMAIN.find('tr[data-level="0"][data-index="0"]').before(newNodesHtmlObj.trs);
        tableViewElemFIXL.find('tr[data-level="0"][data-index="0"]').before(newNodesHtmlObj.trs_fixed);
        tableViewElemFIXR.find('tr[data-level="0"][data-index="0"]').before(newNodesHtmlObj.trs_fixed_r);
      } else {
        if (index === -1) {
          // 追加到最後
          tableViewElemMAIN.find('tbody').append(newNodesHtmlObj.trs);
          tableViewElemFIXL.find('tbody').append(newNodesHtmlObj.trs_fixed);
          tableViewElemFIXR.find('tbody').append(newNodesHtmlObj.trs_fixed_r);
        } else {
          var trIndexNext = dataAfter[0][LAY_DATA_INDEX_HISTORY];
          tableViewElemMAIN.find('tr[data-level="0"][data-index="' + trIndexNext + '"]').before(newNodesHtmlObj.trs);
          tableViewElemFIXL.find('tr[data-level="0"][data-index="' + trIndexNext + '"]').before(newNodesHtmlObj.trs_fixed);
          tableViewElemFIXR.find('tr[data-level="0"][data-index="' + trIndexNext + '"]').before(newNodesHtmlObj.trs_fixed_r);
        }

      }

      // 重新更新頂層節點的data-index;
      layui.each(table.cache[id], function (i4, item4) {
        tableViewElem.find('tr[data-level="0"][lay-data-index="' + item4[LAY_DATA_INDEX] + '"]').attr('data-index', i4);
      })

      that.renderTreeTable(tableViewElem.find(newNodes.map(function (value, index, array) {
        return 'tr[lay-data-index="' + value[LAY_DATA_INDEX] + '"]'
      }).join(',')));
    } else {
      var isParentKey = treeOptions.customName.isParent;
      var childKey = treeOptions.customName.children;

      parentNode[isParentKey] = true;
      var childrenNodes = parentNode[childKey];
      if (!childrenNodes) {
        childrenNodes = parentNode[childKey] = newNodes;
      } else {
        dataAfter = childrenNodes.splice(index === -1 ? childrenNodes.length : index);
        childrenNodes = parentNode[childKey] = childrenNodes.concat(newNodes, dataAfter);
      }
      // 刪除已經存在的同級節點以及他們的子節點，並且把中間節點的已展開過的狀態設置為false
      that.updateStatus(childrenNodes, function (d) {
        if (d[isParentKey]) {
          d[LAY_HAS_EXPANDED] = false;
        }
      });
      var childrenNodesFlat = that.treeToFlat(childrenNodes);
      tableViewElem.find(childrenNodesFlat.map(function (value) {
        return 'tr[lay-data-index="' + value[LAY_DATA_INDEX] + '"]'
      }).join(',')).remove();

      tableData = that.initData();
      // 去掉父節點的已經展開過的狀態，重新執行一次展開的方法
      parentNode[LAY_HAS_EXPANDED] = false;
      parentNode['LAY_ASYNC_STATUS'] = 'local'; // 轉為本地數據，應該規定異步加載子節點的時候addNodes的規則
      expandNode({trElem: tableViewElem.find('tr[lay-data-index="' + parentIndex + '"]')}, true)
    }
    that.updateCheckStatus(parentNode, true);
    treeTable.resize(id);
    if (focus) {
      // 滾動到第一個新增的節點
      tableViewElem.find(ELEM_MAIN).find('tr[lay-data-index="' + newNodes[0][LAY_DATA_INDEX] + '"]').get(0).scrollIntoViewIfNeeded();
    }
    return newNodes;
  }

  // 獲取表格選中狀態
  treeTable.checkStatus = function (id) {
    var that = getThisTable(id);
    if(!that) return;

    // 需要區分單雙選
    var tableData = treeTable.getData(id, true);
    var checkedData = tableData.filter(function (value, index, array) {
      return value[table.config.checkName];
    });

    var isAll = true;
    layui.each(table.cache[id], function (i1, item1) {
      if (!item1[table.config.checkName]) {
        isAll = false;
        return true;
      }
    })

    return {
      data: checkedData,
      isAll: isAll
    }
  }

  // 排序之後重新渲染成樹表
  treeTable.on('sort', function (obj) {
    var options = obj.config;
    var tableView = options.elem.next();
    var tableId = options.id;

    if (tableView.hasClass('layui-table-tree')) {
      treeTable.sort(tableId);
    }
  });

  // 行點擊
  treeTable.on('row', function (obj) {
    var options = obj.config;
    var tableView = options.elem.next();

    if (tableView.hasClass('layui-table-tree')) {
      updateObjParams(obj);
    }
  })

  // 行雙擊
  treeTable.on('rowDouble', function (obj) {
    var options = obj.config;
    var tableView = options.elem.next();
    var tableId = options.id;

    if (tableView.hasClass('layui-table-tree')) {
      updateObjParams(obj);

      var treeOptions = options.tree || {};
      if (treeOptions.view.dblClickExpand) {
        expandNode({trElem: obj.tr.first()}, null, null, null, true);
      }
    }
  })

  // tr中帶lay-event節點點擊
  treeTable.on('tool', function (obj) {
    var options = obj.config;
    var tableView = options.elem.next();
    var tableId = options.id;

    if (tableView.hasClass('layui-table-tree')) {
      updateObjParams(obj);
    }
  })

  // 行內編輯
  treeTable.on('edit', function (obj) {
    // 如果編輯涉及到關鍵的name字段需要重新更新一下tr節點
    var options = obj.config;
    var tableView = options.elem.next();
    var tableId = options.id;

    if (tableView.hasClass('layui-table-tree')) {
      updateObjParams(obj);
      if (obj.field === options.tree.customName.name) {
        obj.tr.find('td[data-field="' + obj.field + '"]').children('div.layui-table-cell').removeClass('layui-table-tree-item')
        obj.update({}); // 通過update調用執行tr節點的更新
      }
    }
  });

  // 單選
  treeTable.on('radio', function (obj) {
    var options = obj.config;
    var tableView = options.elem.next();
    var tableId = options.id;
    var that = getThisTable(tableId);

    if (tableView.hasClass('layui-table-tree')) {
      updateObjParams(obj);
      checkNode.call(that, obj.tr, obj.checked)
    }
  })

  // 更新表格的複選框狀態
  Class.prototype.updateCheckStatus = function (dataP, checked) {
    var that = this;
    var options = that.getOptions();
    var treeOptions = options.tree;
    var tableId = options.id;
    var tableView = options.elem.next();

    var checkName = table.config.checkName;

    // 如有必要更新父節點們的狀態
    if (dataP) {
      var trsP = that.updateParentCheckStatus(dataP, checked);
      layui.each(trsP, function (indexP, itemP) {
        form.render(tableView.find('tr[lay-data-index="' + itemP[LAY_DATA_INDEX] + '"]  input[name="layTableCheckbox"]:not(:disabled)').prop({
          checked: itemP[checkName],
          indeterminate: itemP[LAY_CHECKBOX_HALF]
        }))
      })
    }

    // 更新全選的狀態
    var isAll = true;
    var isIndeterminate = false;
    layui.each(table.cache[tableId], function (i1, item1) {
      if (item1[checkName] || item1[LAY_CHECKBOX_HALF]) {
        isIndeterminate = true;
      }
      if (!item1[checkName]) {
        isAll = false;
      }
    })
    isIndeterminate = isIndeterminate && !isAll;
    form.render(tableView.find('input[name="layTableCheckbox"][lay-filter="layTableAllChoose"]').prop({
      'checked': isAll,
      indeterminate: isIndeterminate
    }));

    return isAll
  }

  // 更新父節點的選中狀態
  Class.prototype.updateParentCheckStatus = function (dataP, checked) {
    var that = this;
    var options = that.getOptions();
    var treeOptions = options.tree;
    var tableId = options.id;
    var checkName = table.config.checkName;
    var childrenKey = treeOptions.customName.children;

    var dataRet = [];
    dataP[LAY_CHECKBOX_HALF] = false; // 先設置為非半選，是否為半選又下面邏輯判斷
    if (checked) {
      // 為真需要判斷子節點的情況
      if (!dataP[childrenKey].length) {
        checked = false;
      } else {
        layui.each(dataP[childrenKey], function (index, item) {
          if (!item[checkName]) { // 只要有一個子節點為false
            checked = false;
            dataP[LAY_CHECKBOX_HALF] = true;
            return true; // 跳出循環
          }
        });
      }
    } else {
      // 判斷是否為半選
      layui.each(dataP[childrenKey], function (index, item) {
        if (item[checkName] || item[LAY_CHECKBOX_HALF]) { // 只要有一個子節點為選中或者半選狀態
          dataP[LAY_CHECKBOX_HALF] = true;
          return true;
        }
      });
    }
    dataP[checkName] = checked;
    dataRet.push($.extend({}, dataP));
    if (dataP[LAY_PARENT_INDEX]) {
      dataRet = dataRet.concat(that.updateParentCheckStatus(table.cache[tableId][dataP[LAY_PARENT_INDEX]], checked));
    }
    return dataRet
  }

  var checkNode = function (trElem, checked, callbackFlag) {
    var that = this;
    var options = that.getOptions();
    var tableId = options.id;
    var tableView = options.elem.next();
    var inputElem = (trElem.length ? trElem : tableView).find('.laytable-cell-radio, .laytable-cell-checkbox').children('input').last();
    // 判斷是單選還是多選 不應該同時存在radio列和checkbox列
    var isRadio = inputElem.attr('type') === 'radio';

    if (callbackFlag) {
      var triggerEvent = function () {
        var fn = function (event) {
          layui.stope(event);
        }
        inputElem.parent().on('click', fn); // 添加臨時的阻止冒泡事件
        inputElem.next().click();
        inputElem.parent().off('click', fn);
      }
      // 如果需要觸發事件可以簡單的觸發對應節點的click事件
      if (isRadio) {
        // 單選只能選中或者切換其他的不能取消選中 後續看是否有支持的必要 todo
        if (checked && !inputElem.prop('checked')) {
          triggerEvent()
        }
      } else {
        if (layui.type(checked) === 'boolean') {
          if (inputElem.prop('checked') !== checked) {
            // 如果當前已經是想要修改的狀態則不做處理
            triggerEvent()
          }
        } else {
          // 切換
          triggerEvent()
        }
      }
    } else {
      var trData = that.getNodeDataByIndex(trElem.attr('data-index'));
      var checkName = table.config.checkName;
      // 如果不觸發事件應該有一個方法可以更新數據以及頁面的節點
      if (isRadio) {
        if (!trData) {
          // 單選必須是一個存在的行
          return;
        }
        var statusChecked = {};
        statusChecked[checkName] = false;
        // that.updateStatus(null, statusChecked); // 取消其他的選中狀態
        that.updateStatus(null, function (d) {
          if (d[checkName]) {
            d[checkName] = false;
            form.render(tableView.find('tr[lay-data-index="' + d[LAY_DATA_INDEX] + '"] input[type="radio"][lay-type="layTableRadio"]').prop('checked', false));
          }
        }); // 取消其他的選中狀態
        trData[checkName] = checked;
        form.render(trElem.find('input[type="radio"][lay-type="layTableRadio"]').prop('checked', checked));
      } else {
        var isParentKey = options.tree.customName.isParent;
        // 切換隻能用到單條，全選到這一步的時候應該是一個確定的狀態
        checked = layui.type(checked) === 'boolean' ? checked : !trData[checkName]; // 狀態切換，如果遇到不可操作的節點待處理 todo
        // 全選或者是一個父節點，將子節點的狀態同步為當前節點的狀態
        // if (!trData || trData[isParentKey]) {
        // 處理不可操作的信息
        var checkedStatusFn = function (d) {
          if (!d[table.config.disabledName]) { // 節點不可操作的不處理
            d[checkName] = checked;
            d[LAY_CHECKBOX_HALF] = false;
          }
        }

        var trs = that.updateStatus(trData ? [trData] : table.cache[tableId], checkedStatusFn);
        form.render(tableView.find(trs.map(function (value) {
          return 'tr[lay-data-index="' + value[LAY_DATA_INDEX] + '"] input[name="layTableCheckbox"]:not(:disabled)';
        }).join(',')).prop({checked: checked, indeterminate: false}));
        // }
        var trDataP;
        // 更新父節點以及更上層節點的狀態
        if (trData && trData[LAY_PARENT_INDEX]) {
          // 找到父節點，然後判斷父節點的子節點是否全部選中
          trDataP = that.getNodeDataByIndex(trData[LAY_PARENT_INDEX]);
        }

        return that.updateCheckStatus(trDataP, checked);
      }
    }
  }

  // 多選
  treeTable.on('checkbox', function (obj) {
    var options = obj.config;
    var tableView = options.elem.next();
    var tableId = options.id;
    var that = getThisTable(tableId);

    if (tableView.hasClass('layui-table-tree')) {
      updateObjParams(obj);
      var checked = obj.checked;
      obj.isAll = checkNode.call(that, obj.tr, checked);
    }
  })


  /**
   * 設置行選中狀態
   * @param {String} id 樹表id
   * @param {Object|String} index 節點下標
   * @param {Boolean} checked 選中或取消
   * @param {Boolean} [callbackFlag] 是否觸發事件回調
   * */
  treeTable.setRowChecked = function (id, opts) {
    var that = getThisTable(id);
    if(!that) return;

    var options = that.getOptions();
    var tableView = options.elem.next();

    opts = opts || {};

    var node = opts.index;
    var checked = opts.checked;
    var callbackFlag = opts.callbackFlag;

    var dataIndex = layui.type(node) === 'string' ? node : node[LAY_DATA_INDEX];
    // 判斷是否在當前頁面中
    var nodeData = that.getNodeDataByIndex(dataIndex);
    if (!nodeData) {
      // 目前只能處理當前頁的數據
      return;
    }
    // 判斷是否展開過
    var trElem = tableView.find('tr[lay-data-index="' + dataIndex + '"]');
    if (!trElem.length) {
      // 如果還沒有展開沒有渲染的要先渲染出來
      treeTable.expandNode(id, {
        index: nodeData[LAY_PARENT_INDEX],
        expandFlag: true
      });
      trElem = tableView.find('tr[lay-data-index="' + dataIndex + '"]');
    }
    checkNode.call(that, trElem, checked, callbackFlag);
  }

  treeTable.checkAllNodes = function (id, checked) {
    var that = getThisTable(id);
    if(!that) return;

    var options = that.getOptions();
    var tableView = options.elem.next();

    checkNode.call(that, tableView.find('tr[data-index="NONE"]'), !!checked)
  }

  /**
   * 獲得數據
   * @param {String} id 表格id
   * @param {Boolean} isSimpleData 是否返回平鋪結構的數據
   * @return {Array} 表格數據
   * */
  treeTable.getData = function (id, isSimpleData) {
    var tableData = [];
    layui.each($.extend(true, [], table.cache[id] || []), function (index, item) {
      // 遍歷排除掉臨時的數據
      tableData.push(item);
    })
    return isSimpleData ? getThisTable(id).treeToFlat(tableData) : tableData;
  }

  // 記錄所有實例
  thisTreeTable.that = {}; // 記錄所有實例對象
  // thisTreeTable.config = {}; // 記錄所有實例配置項

  // 重載
  treeTable.reload = function (id, options, deep, type) {
    deep = deep !== false; // 默認採用深拷貝
    var config = getThisTableConfig(id); // 獲取當前實例配置項
    if (!config) return;

    var that = getThisTable(id);
    that.reload(options, deep, type);

    return thisTreeTable.call(that);
  };

  // 核心入口
  treeTable.render = function (options) {
    var inst = new Class(options);
    return thisTreeTable.call(inst);
  };

  exports(MOD_NAME, treeTable);
});
