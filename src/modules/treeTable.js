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
    resize: table.resize,
    getOptions: table.getOptions,
    hideCol: table.hideCol,
    renderData: table.renderData
  };

  // 操作當前實例
  var thisTreeTable = function () {
    var that = this;
    var options = that.config
    var id = options.id || options.index;

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

  // 字符
  var MOD_NAME = 'treeTable';
  var HIDE = 'layui-hide';

  var ELEM_VIEW = '.layui-table-view';
  var ELEM_TREE = '.layui-table-tree';
  var ELEM_TOOL = '.layui-table-tool';
  var ELEM_BOX = '.layui-table-box';
  var ELEM_HEADER = '.layui-table-header';
  var ELEM_BODY = '.layui-table-body';
  var ELEM_MAIN = '.layui-table-main';
  var ELEM_FIXED = '.layui-table-fixed';
  var ELEM_FIXL = '.layui-table-fixed-l';
  var ELEM_FIXR = '.layui-table-fixed-r';
  var ELEM_CHECKED = 'layui-table-checked';

  var TABLE_TREE = 'layui-table-tree';
  var LAY_DATA_INDEX = 'LAY_DATA_INDEX';
  var LAY_DATA_INDEX_HISTORY = 'LAY_DATA_INDEX_HISTORY';
  var LAY_PARENT_INDEX = 'LAY_PARENT_INDEX';
  var LAY_CHECKBOX_HALF = 'LAY_CHECKBOX_HALF';
  var LAY_EXPAND = 'LAY_EXPAND';
  var LAY_HAS_EXPANDED = 'LAY_HAS_EXPANDED';
  var LAY_ASYNC_STATUS = 'LAY_ASYNC_STATUS';
  var LAY_CASCADE = ['all', 'parent', 'children', 'none'];

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

  var updateOptions = function (id, options, reload) {
    var that = getThisTable(id);
    reload === 'reloadData' || (that.status = { // 用於記錄一些狀態信息
      expand: {} // 摺疊狀態
    });
    var thatOptionsTemp = $.extend(true, {}, that.getOptions(), options);
    var treeOptions = thatOptionsTemp.tree;
    var childrenKey = treeOptions.customName.children;
    var idKey = treeOptions.customName.id;
    // 處理屬性
    delete options.hasNumberCol;
    delete options.hasChecboxCol;
    delete options.hasRadioCol;
    table.eachCols(null, function (i1, item1) {
      if (item1.type === 'numbers') {
        options.hasNumberCol = true;
      } else if (item1.type === 'checkbox') {
        options.hasChecboxCol = true;
      } else if (item1.type === 'radio') {
        options.hasRadioCol = true;
      }
    }, thatOptionsTemp.cols)

    var parseData = options.parseData;
    var done = options.done;

    if (thatOptionsTemp.url) {
      // 異步加載的時候需要處理parseData進行轉換
      if (!reload || (reload && parseData && !parseData.mod)) {
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
          // 處理節點狀態
          updateStatus(retData[dataName], function (item) {
            item[LAY_EXPAND] = LAY_EXPAND in item ? item[LAY_EXPAND] : (item[idKey] !== undefined && that.status.expand[item[idKey]])
          }, childrenKey);

          if (parseDataThat.autoSort && parseDataThat.initSort && parseDataThat.initSort.type) {
            layui.sort(retData[dataName], parseDataThat.initSort.field, parseDataThat.initSort.type === 'desc', true)
          }

          that.initData(retData[dataName]);

          return retData;
        }
        options.parseData.mod = true
      }
    } else {
      options.data = options.data || [];
      // 處理 isSimpleData
      if (treeOptions.data.isSimpleData) {
        options.data = that.flatToTree(options.data);
      }
      that.initData(options.data);
    }

    if (!reload || (reload && done && !done.mod)) {
      options.done = function () {
        var args = arguments;
        var doneThat = this;
        var isRenderData = args[3]; // 是否是 renderData
        if (!isRenderData) {
          delete that.isExpandAll;
        }

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
        if (!isRenderData && thatOptionsTemp.autoSort && thatOptionsTemp.initSort && thatOptionsTemp.initSort.type) {
          treeTable.sort(id);
        }

        that.renderTreeTable(tableView);

        if (layui.type(done) === 'function') {
          return done.apply(doneThat, args);
        }
      }
      options.done.mod = true;
    }
  }

  Class.prototype.init = function () {
    var that = this;
    var options = that.config;
    var cascade = options.tree.data.cascade;
    if (LAY_CASCADE.indexOf(cascade) === -1) {
      options.tree.data.cascade = 'all'; // 超出範圍的都重置為全聯動
    }

    // 先初始一個空的表格以便拿到對應的表格實例信息
    var tableIns = table.render($.extend({}, options, {
      data: [],
      url: '',
      done: null
    }))
    var id = tableIns.config.id;
    thisTreeTable.that[id] = that; // 記錄當前實例對象
    that.tableIns = tableIns;

    updateOptions(id, options);
  }

  // 初始默認配置
  Class.prototype.config = {
    tree: {
      customName: {
        children: "children", // 節點數據中保存子節點數據的屬性名稱
        isParent: "isParent", // 節點數據保存節點是否為父節點的屬性名稱
        name: "name", // 節點數據保存節點名稱的屬性名稱
        id: "id", // 唯一標識的屬性名稱
        pid: "parentId", // 父節點唯一標識的屬性名稱
        icon: "icon" // 圖標的屬性名稱
      },
      view: {
        indent: 14, // 層級縮進量
        flexIconClose: '<i class="layui-icon layui-icon-triangle-r"></i>', // 關閉時候的摺疊圖標
        flexIconOpen: '<i class="layui-icon layui-icon-triangle-d"></i>', // 打開時候的摺疊圖標
        showIcon: true, // 是否顯示圖標(節點類型圖標)
        icon: '', // 節點圖標，如果設置了這個屬性或者數據中有這個字段信息，不管打開還是關閉都以這個圖標的值為準
        iconClose: '<i class="layui-icon layui-icon-folder"></i>', // 關閉時候的圖標
        iconOpen: '<i class="layui-icon layui-icon-folder-open"></i>', // 打開時候的圖標
        iconLeaf: '<i class="layui-icon layui-icon-leaf"></i>', // 葉子節點的圖標
        showFlexIconIfNotParent: false, // 當節點不是父節點的時候是否顯示摺疊圖標
        dblClickExpand: true, // 雙擊節點時，是否自動展開父節點的標識
        expandAllDefault: false // 默認展開所有節點
      },
      data: {
        isSimpleData: false, // 是否簡單數據模式
        rootPid: null, // 根節點的父 ID 值
        cascade: 'all' // 級聯方式 默認全部級聯：all 可選 級聯父 parent 級聯子 children
      },
      async: {
        enable: false, // 是否開啟異步加載模式，只有開啟的時候其他參數才起作用
        url: '', // 異步加載的接口，可以根據需要設置與頂層接口不同的接口，如果相同可以不設置該參數
        type: null, // 請求的接口類型，設置可缺省同上
        contentType: null, // 提交參數的數據類型，設置可缺省同上
        headers: null, // 設置可缺省同上
        where: null, // 設置可缺省同上
        autoParam: [] // 自動參數
      },
      callback: {
        beforeExpand: null, // 展開前的回調 return false 可以阻止展開的動作
        onExpand: null // 展開之後的回調
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

  function flatToTree(flatArr, idKey, pIdKey, childrenKey, rootPid) {
    idKey = idKey || 'id';
    pIdKey = pIdKey || 'parentId';
    childrenKey = childrenKey || 'children';
    // 創建一個空的 nodes 對象，用於保存所有的節點
    var nodes = {};
    // 遍歷所有節點，將其加入 nodes 對象中
    var idTemp = '';
    layui.each(flatArr, function (index, item) {
      idTemp = idKey + item[idKey];
      nodes[idTemp] = $.extend({}, item);
      nodes[idTemp][childrenKey] = [];
    })
    // 遍歷所有節點，將其父子關係加入 nodes 對象
    var pidTemp = '';
    layui.each(nodes, function (index, item) {
      pidTemp = idKey + item[pIdKey];
      if (pidTemp && nodes[pidTemp]) {
        nodes[pidTemp][childrenKey].push(item);
      }
    })
    // 返回頂層節點
    return Object.values(nodes).filter(function (item) {
      return rootPid ? item[pIdKey] === rootPid : !item[pIdKey];
    })
  }

  Class.prototype.flatToTree = function (tableData) {
    var that = this;
    var options = that.getOptions();
    var treeOptions = options.tree;
    var customName = treeOptions.customName;
    var tableId = options.id;

    tableData = tableData || table.cache[tableId];

    return flatToTree(tableData, customName.id, customName.pid, customName.children, treeOptions.data.rootPid)
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
      dataNew[pIdKey] = item1[pIdKey] || parentId;
      flat.push(dataNew);
      flat = flat.concat(that.treeToFlat(item1[childrenKey], item1[customName.id], dataIndex));
    });

    return flat;
  }

  // 通過當前行數據返回 treeNode 信息
  Class.prototype.getTreeNode = function (data) {
    var that = this;
    if (!data) {
      return hint.error('找不到節點數據');
    }
    var options = that.getOptions();
    var treeOptions = options.tree;
    var tableId = options.id;
    var customName = treeOptions.customName;

    // 帶上一些常用的方法
    return {
      data: data,
      dataIndex: data[LAY_DATA_INDEX],
      getParentNode: function () {
        return that.getNodeByIndex(data[LAY_PARENT_INDEX])
      },
    };
  }

  // 通過 index 返回節點信息
  Class.prototype.getNodeByIndex = function (index) {
    var that = this;
    var treeNodeData = that.getNodeDataByIndex(index);
    if (!treeNodeData) {
      return hint.error('找不到節點數據');
    }
    var options = that.getOptions();
    var treeOptions = options.tree;
    var customName = treeOptions.customName;
    var parentKey = customName.parent;
    var tableId = options.id;

    var treeNode = {
      data: treeNodeData,
      dataIndex: treeNodeData[LAY_DATA_INDEX],
      getParentNode: function () {
        return that.getNodeByIndex(treeNodeData[LAY_PARENT_INDEX])
      },
      update: function (data) {
        return treeTable.updateNode(tableId, index, data)
      },
      remove: function () {
        return treeTable.removeNode(tableId, index)
      },
      expand: function (opts) {
        return treeTable.expandNode(tableId, $.extend({}, opts, {
          index: index
        }))
      },
      setChecked: function (opts) {
        return treeTable.setRowChecked(tableId, $.extend({}, opts, {
          index: index
        }))
      }
    };

    treeNode.dataIndex = index;
    return treeNode;
  }

  // 通過 id 獲取節點信息
  Class.prototype.getNodeById = function (id) {
    var that = this;
    var options = that.getOptions();
    var treeOptions = options.tree;
    var customName = treeOptions.customName;
    var idKey = customName.id;

    // 通過 id 拿到數據的 dataIndex
    var dataIndex = '';
    var tableDataFlat = treeTable.getData(options.id, true);
    layui.each(tableDataFlat, function (i1, item1) {
      if (item1[idKey] === id) {
        dataIndex = item1[LAY_DATA_INDEX];
        return true;
      }
    })
    if (!dataIndex) {
      return;
    }

    // 用index
    return that.getNodeByIndex(dataIndex);
  }

  // 通過index獲取節點數據
  Class.prototype.getNodeDataByIndex = function (index, clone, newValue) {
    var that = this;
    var options = that.getOptions();
    var treeOptions = options.tree;
    var tableId = options.id;

    var dataCache = table.cache[tableId][index];
    if (newValue !== 'delete' && dataCache) {
      $.extend(dataCache, newValue);
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

    updateCache(tableId, childrenKey, data);

    return data;
  }

  // 與 tableId 有關帶防抖的方法
  var debounceFn = (function () {
    var fn = {};
    return function (tableId, func, wait) {
      if (!fn[tableId]) {
        fn[tableId] = layui.debounce(func, wait);
      }
      return fn[tableId];
    }
  })()

  // 優化參數，添加一個 getNodeByIndex 方法 只傳 表格id 和行 dataIndex 分幾步優化 todo
  var expandNode = function (treeNode, expandFlag, sonSign, focus, callbackFlag) {
    // treeNode // 需要展開的節點
    var trElem = treeNode.trElem;
    var tableViewElem = treeNode.tableViewElem || trElem.closest(ELEM_VIEW);
    var tableId = treeNode.tableId || tableViewElem.attr('lay-id');
    var options = treeNode.options || table.getOptions(tableId);
    var dataIndex = treeNode.dataIndex || trElem.attr('lay-data-index'); // 可能出現多層
    var treeTableThat = getThisTable(tableId);

    var treeOptions = options.tree || {};
    var customName = treeOptions.customName || {};
    var isParentKey = customName.isParent;

    var trData = treeTableThat.getNodeDataByIndex(dataIndex);

    // 後續調優：對已經展開的節點進行展開和已經關閉的節點進行關閉應該做優化減少不必要的代碼執行 todo
    var isToggle = layui.type(expandFlag) !== 'boolean';
    var trExpand = isToggle ? !trData[LAY_EXPAND] : expandFlag;
    var retValue = trData[isParentKey] ? trExpand : null;

    if (callbackFlag && trExpand != trData[LAY_EXPAND] && (!trData[LAY_ASYNC_STATUS] || trData[LAY_ASYNC_STATUS] === 'local')) {
      var beforeExpand = treeOptions.callback.beforeExpand;
      if (layui.type(beforeExpand) === 'function') {
        if (beforeExpand(tableId, trData, expandFlag) === false) {
          return retValue;
        }
      }
    }

    var trExpanded = trData[LAY_HAS_EXPANDED]; // 展開過，包括異步加載

    // 找到表格中的同類節點（需要找到lay-data-index一致的所有行）
    var trsElem = tableViewElem.find('tr[lay-data-index="' + dataIndex + '"]');
    // 處理摺疊按鈕圖標
    var flexIconElem = trsElem.find('.layui-table-tree-flexIcon');
    flexIconElem.html(trExpand ? treeOptions.view.flexIconOpen : treeOptions.view.flexIconClose)
    trData[isParentKey] && flexIconElem.css('visibility', 'visible');
    // 處理節點圖標
    treeOptions.view.showIcon && trsElem
      .find('.layui-table-tree-nodeIcon:not(.layui-table-tree-iconCustom,.layui-table-tree-iconLeaf)')
      .html(trExpand ? treeOptions.view.iconOpen : treeOptions.view.iconClose);
    trData[LAY_EXPAND] = trExpand;
    var trDataId = trData[customName.id];
    trDataId !== undefined && (treeTableThat.status.expand[trDataId] = trExpand);
    if (retValue === null) {
      return retValue;
    }

    var childNodes = trData[customName.children] || [];
    // 處理子節點展示與否
    if (trExpand) {
      // 展開
      if (trExpanded) { // 已經展開過
        if (!childNodes.length) return ;//異步如果子節點沒有數據情況下雙點行展開所有已展開的節點問題解決
        trsElem.nextAll(childNodes.map(function (value, index, array) {
          return 'tr[lay-data-index="' + value[LAY_DATA_INDEX] + '"]'
        }).join(',')).removeClass(HIDE);
        layui.each(childNodes, function (i1, item1) {
          if (!item1[isParentKey]) {
            return;
          }

          if (sonSign && !isToggle && !item1[LAY_EXPAND]) { // 非狀態切換的情況下
            // 級聯展開子節點
            expandNode({
              dataIndex: item1[LAY_DATA_INDEX],
              trElem: tableViewElem.find('tr[lay-data-index="' + item1[LAY_DATA_INDEX] + '"]').first(),
              tableViewElem: tableViewElem,
              tableId: tableId,
              options: options,
            }, expandFlag, sonSign, focus, callbackFlag);
          } else if (item1[LAY_EXPAND]) { // 初始化級聯展開
            expandNode({
              dataIndex: item1[LAY_DATA_INDEX],
              trElem: tableViewElem.find('tr[lay-data-index="' + item1[LAY_DATA_INDEX] + '"]').first(),
              tableViewElem: tableViewElem,
              tableId: tableId,
              options: options,
            }, true);
          }
        });
      } else {
        var asyncSetting = treeOptions.async || {};
        var asyncUrl = asyncSetting.url || options.url;
        if (asyncSetting.enable && trData[isParentKey] && !trData[LAY_ASYNC_STATUS]) {
          trData[LAY_ASYNC_STATUS] = 'loading';
          flexIconElem.html('<i class="layui-icon layui-icon-loading layui-anim layui-anim-loop layui-anim-rotate"></i>');

          // 異步獲取子節點數據成功之後處理方法
          var asyncSuccessFn = function (data) {
            trData[LAY_ASYNC_STATUS] = 'success';
            trData[customName.children] = data;
            treeTableThat.initData(trData[customName.children], trData[LAY_DATA_INDEX])
            expandNode(treeNode, true, isToggle ? false : sonSign, focus, callbackFlag);
          }

          var format = asyncSetting.format; // 自定義數據返回方法
          if (layui.type(format) === 'function') {
            format(trData, options, asyncSuccessFn);
            return retValue;
          }

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

          $.ajax({
            type: asyncType || 'get',
            url: asyncUrl,
            contentType: asyncContentType,
            data: data,
            dataType: asyncDataType || 'json',
            jsonpCallback: asyncJsonpCallback,
            headers: asyncHeaders || {},
            success: function (res) {
              // 若有數據解析的回調，則獲得其返回的數據
              if (typeof asyncParseData === 'function') {
                res = asyncParseData.call(options, res) || res;
              }
              // 檢查數據格式是否符合規範
              if (res[asyncResponse.statusName] != asyncResponse.statusCode) {
                trData[LAY_ASYNC_STATUS] = 'error';
                // 異常處理 todo
                flexIconElem.html('<i class="layui-icon layui-icon-refresh"></i>');
                // 事件
              } else {
                // 正常返回
                asyncSuccessFn(res[asyncResponse.dataName]);
              }
            },
            error: function (e, msg) {
              trData[LAY_ASYNC_STATUS] = 'error';
              // 異常處理 todo
              typeof options.error === 'function' && options.error(e, msg);
            }
          });
          return retValue;
        }
        trExpanded = trData[LAY_HAS_EXPANDED] = true;
        if (childNodes.length) {
          // 判斷是否需要排序
          if (options.initSort && (!options.url || options.autoSort)) {
            var initSort = options.initSort;
            if (initSort.type) {
              layui.sort(childNodes, initSort.field, initSort.type === 'desc', true);
            } else {
              // 恢復默認
              layui.sort(childNodes, table.config.indexName, null, true);
            }
          }
          treeTableThat.initData(trData[customName.children], trData[LAY_DATA_INDEX]);
          // 將數據通過模板得出節點的html代碼
          var str2 = table.getTrHtml(tableId, childNodes, null, null, dataIndex);

          var str2Obj = {
            trs: $(str2.trs.join('')),
            trs_fixed: $(str2.trs_fixed.join('')),
            trs_fixed_r: $(str2.trs_fixed_r.join(''))
          }
          var dataLevel = dataIndex.split('-').length - 1;
          var dataLevelNew = (dataLevel || 0) + 1;
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

          tableViewElem.find(ELEM_MAIN).find('tbody tr[lay-data-index="' + dataIndex + '"]').after(str2Obj.trs);
          tableViewElem.find(ELEM_FIXL).find('tbody tr[lay-data-index="' + dataIndex + '"]').after(str2Obj.trs_fixed);
          tableViewElem.find(ELEM_FIXR).find('tbody tr[lay-data-index="' + dataIndex + '"]').after(str2Obj.trs_fixed_r);

          // 初始化新增的節點中的內容
          treeTableThat.renderTreeTable(str2Obj.trs, dataLevelNew);

          if (sonSign && !isToggle) { // 非狀態切換的情況下
            // 級聯展開/關閉子節點
            layui.each(childNodes, function (i1, item1) {
              expandNode({
                dataIndex: item1[LAY_DATA_INDEX],
                trElem: tableViewElem.find('tr[lay-data-index="' + item1[LAY_DATA_INDEX] + '"]').first(),
                tableViewElem: tableViewElem,
                tableId: tableId,
                options: options,
              }, expandFlag, sonSign, focus, callbackFlag);
            })
          }
        }
      }
    } else {
      treeTableThat.isExpandAll = false;
      // 關閉
      if (sonSign && !isToggle) { // 非狀態切換的情況下
        layui.each(childNodes, function (i1, item1) {
          expandNode({
            dataIndex: item1[LAY_DATA_INDEX],
            trElem: tableViewElem.find('tr[lay-data-index="' + item1[LAY_DATA_INDEX] + '"]').first(),
            tableViewElem: tableViewElem,
            tableId: tableId,
            options: options,
          }, expandFlag, sonSign, focus, callbackFlag);
        });
        tableViewElem.find(childNodes.map(function (value, index, array) { // 只隱藏直接子節點，其他由遞歸的處理
          return 'tr[lay-data-index="' + value[LAY_DATA_INDEX] + '"]'
        }).join(',')).addClass(HIDE);
      } else {
        var childNodesFlat = treeTableThat.treeToFlat(childNodes, trData[customName.id], dataIndex);
        tableViewElem.find(childNodesFlat.map(function (value, index, array) {
          return 'tr[lay-data-index="' + value[LAY_DATA_INDEX] + '"]'
        }).join(',')).addClass(HIDE);
      }
    }


    debounceFn('resize-' + tableId, function () {
      treeTable.resize(tableId);
    }, 0)();

    if (callbackFlag && trData[LAY_ASYNC_STATUS] !== 'loading') {
      var onExpand = treeOptions.callback.onExpand;
      layui.type(onExpand) === 'function' && onExpand(tableId, trData, trExpand);
    }

    return retValue;
  }

  /**
   * 展開或關閉一個節點
   * @param {String} id 樹表id
   * @param {Object} opts
   * @param {Number|String} opts.index 展開行的數據下標
   * @param {Boolean} [opts.expandFlag] 展開、關閉、切換
   * @param {Boolean} [opts.inherit] 是否級聯子節點
   * @param {Boolean} [opts.callbackFlag] 是否觸發事件
   * @return [{Boolean}] 狀態結果
   * */
  treeTable.expandNode = function (id, opts) {
    var that = getThisTable(id);
    if (!that) return;

    opts = opts || {};

    var index = opts.index;
    var expandFlag = opts.expandFlag;
    var sonSign = opts.inherit;
    var callbackFlag = opts.callbackFlag;

    var options = that.getOptions();
    var tableViewElem = options.elem.next();
    return expandNode({
      trElem: tableViewElem.find('tr[lay-data-index="' + index + '"]').first()
    }, expandFlag, sonSign, null, callbackFlag)
  };

  /**
   * 展開或關閉全部節點
   * @param {String} id 樹表id
   * @param {Boolean} expandFlag 展開或關閉
   * */
  treeTable.expandAll = function (id, expandFlag) {
    if (layui.type(expandFlag) !== 'boolean') {
      return hint.error('expandAll 的展開狀態參數只接收true/false')
    }

    var that = getThisTable(id);
    if (!that) return;

    that.isExpandAll = expandFlag;
    var options = that.getOptions();
    var treeOptions = options.tree;
    var tableView = options.elem.next();
    var isParentKey = treeOptions.customName.isParent;
    var idKey = treeOptions.customName.id;
    var showFlexIconIfNotParent = treeOptions.view.showFlexIconIfNotParent;

    if (!expandFlag) {
      // 關閉所有
      // 將所有已經打開的節點的狀態設置為關閉，
      that.updateStatus(null, function (d) {
        if (d[isParentKey] || showFlexIconIfNotParent) {
          d[LAY_EXPAND] = false;
          d[idKey] !== undefined && (that.status.expand[d[idKey]] = false);
        }
      }) // 只處理當前頁，如果需要處理全部表格，需要用treeTable.updateStatus
      // 隱藏所有非頂層的節點
      tableView.find('.layui-table-box tbody tr[data-level!="0"]').addClass(HIDE);

      tableView.find('.layui-table-tree-flexIcon').html(treeOptions.view.flexIconClose);
      treeOptions.view.showIcon && tableView
        .find('.layui-table-tree-nodeIcon:not(.layui-table-tree-iconCustom,.layui-table-tree-iconLeaf)')
        .html(treeOptions.view.iconClose);
    } else {
      var tableDataFlat = treeTable.getData(id, true);
      // 展開所有
      // 存在異步加載
      if (treeOptions.async.enable) {
        // 判斷是否有未加載過的節點
        var isAllAsyncDone = true;
        layui.each(tableDataFlat, function (i1, item1) {
          if (item1[isParentKey] && !item1[LAY_ASYNC_STATUS]) {
            isAllAsyncDone = false;
            return true;
          }
        })
        // 有未加載過的節點
        if (!isAllAsyncDone) {
          // 逐個展開
          layui.each(treeTable.getData(id), function (i1, item1) {
            treeTable.expandNode(id, {
              index: item1[LAY_DATA_INDEX],
              expandFlag: true,
              inherit: true
            })
          })
          return;
        }
      }

      // 先判斷是否全部打開過了
      var isAllExpanded = true;
      layui.each(tableDataFlat, function (i1, item1) {
        if (item1[isParentKey] && !item1[LAY_HAS_EXPANDED]) {
            isAllExpanded = false;
            return true;
          }
      })
      // 如果全部節點已經都打開過，就可以簡單處理跟隱藏所有節點反操作
      if (isAllExpanded) {
        that.updateStatus(null, function (d) {
          if (d[isParentKey] || showFlexIconIfNotParent) {
            d[LAY_EXPAND] = true;
            d[idKey] !== undefined && (that.status.expand[d[idKey]] = true);
          }
        });
        // 顯示所有子節點
        tableView.find('tbody tr[data-level!="0"]').removeClass(HIDE);
        // 處理節點的圖標
        tableView.find('.layui-table-tree-flexIcon').html(treeOptions.view.flexIconOpen);
        treeOptions.view.showIcon && tableView
          .find('.layui-table-tree-nodeIcon:not(.layui-table-tree-iconCustom,.layui-table-tree-iconLeaf)')
          .html(treeOptions.view.iconOpen);
      } else {
        // 如果有未打開過的父節點，將 tr 內容全部重新生成
        that.updateStatus(null, function (d) {
          if (d[isParentKey] || showFlexIconIfNotParent) {
            d[LAY_EXPAND] = true;
            d[LAY_HAS_EXPANDED] = true;
            d[idKey] !== undefined && (that.status.expand[d[idKey]] = true);
          }
        });
        if (options.initSort && options.initSort.type && options.autoSort) {
          return treeTable.sort(id);
        }
        var trAll = table.getTrHtml(id, tableDataFlat);

        var trAllObj = {
          trs: $(trAll.trs.join('')),
          trs_fixed: $(trAll.trs_fixed.join('')),
          trs_fixed_r: $(trAll.trs_fixed_r.join(''))
        }
        var props;
        layui.each(tableDataFlat, function (dataIndex, dataItem) {
          var dataLevel = dataItem[LAY_DATA_INDEX].split('-').length - 1;
          props = {
            'data-index': dataItem[LAY_DATA_INDEX],
            'lay-data-index': dataItem[LAY_DATA_INDEX],
            'data-level': dataLevel
          };
          trAllObj.trs.eq(dataIndex).attr(props)
          trAllObj.trs_fixed.eq(dataIndex).attr(props)
          trAllObj.trs_fixed_r.eq(dataIndex).attr(props)
        })
        layui.each(['main', 'fixed-l', 'fixed-r'], function (i, item) {
          tableView.find('.layui-table-' + item + ' tbody').html(trAllObj[['trs', 'trs_fixed', 'trs_fixed_r'][i]]);
        });
        that.renderTreeTable(tableView, 0, false);
      }
    }
    treeTable.resize(id);
  }

  Class.prototype.renderTreeTable = function (tableView, level, sonSign) {
    var that = this;
    var options = that.getOptions();
    var tableViewElem = options.elem.next();
    !tableViewElem.hasClass(TABLE_TREE) && tableViewElem.addClass(TABLE_TREE);
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

    var dataExpand = null; // 記錄需要展開的數據
    var nameKey = customName.name;
    var indent = treeOptionsView.indent || 14;
    layui.each(tableView.find('td[data-field="' + nameKey + '"]'), function (index, item) {
      item = $(item);
      var trElem = item.closest('tr');
      var itemCell = item.children('.layui-table-cell');
      if (itemCell.hasClass('layui-table-tree-item')) {
        return;
      }
      var trIndex = trElem.attr('lay-data-index');
      if (!trIndex) { // 排除在統計行中的節點
        return;
      }
      trElem = tableViewElem.find('tr[lay-data-index="' + trIndex + '"]');
      var trData = treeTableThat.getNodeDataByIndex(trIndex);

      if (trData[LAY_EXPAND] && trData[isParentKey]) {
        // 需要展開
        dataExpand = dataExpand || {};
        dataExpand[trIndex] = true;
      }
      if (trData[LAY_CHECKBOX_HALF]) {
        trElem.find('input[type="checkbox"][name="layTableCheckbox"]').prop('indeterminate', true);
      }

      var htmlTemp = itemCell.html();
      itemCell = trElem.find('td[data-field="' + nameKey + '"]>div.layui-table-cell');
      itemCell.addClass('layui-table-tree-item');
      var flexIconElem = itemCell
        .html(['<div class="layui-inline layui-table-tree-flexIcon" ',
          'style="',
          'margin-left: ' + (indent * trElem.attr('data-level')) + 'px;',
          (trData[isParentKey] || treeOptionsView.showFlexIconIfNotParent) ? '' : ' visibility: hidden;',
          '">',
          trData[LAY_EXPAND] ? treeOptionsView.flexIconOpen : treeOptionsView.flexIconClose, // 摺疊圖標
          '</div>',
          treeOptionsView.showIcon ? '<div class="layui-inline layui-table-tree-nodeIcon' +
            ((trData[customName.icon] || treeOptionsView.icon) ? ' layui-table-tree-iconCustom' : '') +
            (trData[isParentKey] ? '' : ' layui-table-tree-iconLeaf') +
            '">' +
            (trData[customName.icon] || treeOptionsView.icon ||
              (trData[isParentKey] ?
                (trData[LAY_EXPAND] ? treeOptionsView.iconOpen : treeOptionsView.iconClose) :
                treeOptionsView.iconLeaf) ||
              '') + '</div>' : '', // 區分父子節點
          htmlTemp].join('')) // 圖標要可定製
        .find('.layui-table-tree-flexIcon');

      // 添加展開按鈕的事件
      flexIconElem.on('click', function (event) {
        layui.stope(event);
        // 處理數據
        // var trElem = item.closest('tr');
        expandNode({trElem: trElem}, null, null, null, true);
      });
    });

    if (!level && treeOptions.view.expandAllDefault && that.isExpandAll === undefined) {
      return treeTable.expandAll(tableId, true); // 默認展開全部
    }

    // 當前層的數據看看是否需要展開
    if (sonSign !== false && dataExpand) {
      layui.each(dataExpand, function (index, item) {
        var trDefaultExpand = tableViewElem.find('tr[lay-data-index="' + index + '"]');
        trDefaultExpand.find('.layui-table-tree-flexIcon').html(treeOptionsView.flexIconOpen);
        expandNode({trElem: trDefaultExpand.first()}, true);
      });
    } else {
      debounceFn('renderTreeTable-' + tableId, function () {
        options.hasNumberCol && formatNumber(that);
        form.render($('.layui-table-tree[lay-id="' + tableId + '"]'));
      }, 0)();
    }
  }

  var formatNumber = function (that) {
    var options = that.getOptions();
    var tableViewElem = options.elem.next();

    var num = 0;
    var trMain = tableViewElem.find('.layui-table-main tbody tr');
    var trFixedL = tableViewElem.find('.layui-table-fixed-l tbody tr');
    var trFixedR = tableViewElem.find('.layui-table-fixed-r tbody tr');
    layui.each(that.treeToFlat(table.cache[options.id]), function (i1, item1) {
      if (item1['LAY_HIDE']) return;
      var itemData = that.getNodeDataByIndex(item1[LAY_DATA_INDEX]);
      itemData['LAY_NUM'] = ++num;
      trMain.eq(i1).find('.laytable-cell-numbers').html(num);
      trFixedL.eq(i1).find('.laytable-cell-numbers').html(num);
      trFixedR.eq(i1).find('.laytable-cell-numbers').html(num);
    })
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

    // 根據需要處理options中的一些參數
    updateOptions(that.getOptions().id, options, type || true);

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

  var updateStatus = function (data, statusObj, childrenKey, notCascade) {
    var dataUpdated = [];
    layui.each(data, function (i1, item1) {
      if (layui.type(statusObj) === 'function') {
        statusObj(item1);
      } else {
        $.extend(item1, statusObj);
      }
      dataUpdated.push($.extend({}, item1));
      notCascade || (dataUpdated = dataUpdated.concat(updateStatus(item1[childrenKey], statusObj, childrenKey, notCascade)));
    });
    return dataUpdated;
  }

  Class.prototype.updateStatus = function (data, statusObj, notCascade) {
    var that = this;
    var options = that.getOptions();
    var treeOptions = options.tree;
    data = data || table.cache[options.id];

    return updateStatus(data, statusObj, treeOptions.customName.children, notCascade);
  }

  Class.prototype.getTableData = function () {
    var that = this;
    var options = that.getOptions();
    // return options.url ? table.cache[options.id] : options.data;
    return table.cache[options.id];
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
    if (options.autoSort) {
      that.initData();
      treeTable.renderData(id);
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
      var nameKey = obj.config.tree.customName.name;
      nameKey in args[0] && obj.tr.find('td[data-field="' + nameKey + '"]').children('div.layui-table-cell').removeClass('layui-table-tree-item');
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
        'data-level': trLevel
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
    that.updateCheckStatus(nodeP);
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
    options.hasNumberCol && formatNumber(that);

    // 重新適配尺寸
    treeTable.resize(id);
  }

  /**
   * 新增數據節點
   * @param {String} id 樹表id
   * @param {Object} opts
   * @param {String|Number} opts.parentIndex 指定的父節點，如果增加根節點，請設置 parentIndex 為 null 即可
   * @param {Number} opts.index 新節點插入的位置（從 0 開始）index = -1(默認) 時，插入到最後
   * @param {Object|Array} opts.data 新增的節點，單個或者多個
   * @param {Boolean} opts.focus 新增的節點，單個或者多個
   * @return {Array} 新增的節點
   * */
  treeTable.addNodes = function (id, opts) {
    var that = getThisTable(id);
    if(!that) return;

    var options = that.getOptions();
    var treeOptions = options.tree;
    var tableViewElem = options.elem.next();
    var checkName = table.config.checkName;

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

    // 若未傳入 LAY_CHECKED 屬性，則繼承父節點的 checked 狀態
    layui.each(newNodes, function(i, item){
      if(!(checkName in item)){
        item[checkName] = parentNode[checkName];
      }
    })

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

      if (tableViewElem.find('.layui-none').length) {
        table.renderData(id);
        return newNodes;
      }

      var newNodesHtml = table.getTrHtml(id, newNodes);
      var newNodesHtmlObj = {
        trs: $(newNodesHtml.trs.join('')),
        trs_fixed: $(newNodesHtml.trs_fixed.join('')),
        trs_fixed_r: $(newNodesHtml.trs_fixed_r.join(''))
      }

      var attrs = {};
      layui.each(newNodes, function (newNodeIndex, newNodeItem) {
        attrs = {
          'data-index': newNodeItem[LAY_DATA_INDEX],
          'lay-data-index': newNodeItem[LAY_DATA_INDEX],
          'data-level': '0'
        };
        newNodesHtmlObj.trs.eq(newNodeIndex).attr(attrs)
        newNodesHtmlObj.trs_fixed.eq(newNodeIndex).attr(attrs)
        newNodesHtmlObj.trs_fixed_r.eq(newNodeIndex).attr(attrs)
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
        if (d[isParentKey] || treeOptions.view.showFlexIconIfNotParent) {
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
      parentNode[LAY_ASYNC_STATUS] = 'local'; // 轉為本地數據，應該規定異步加載子節點的時候addNodes的規則
      expandNode({trElem: tableViewElem.find('tr[lay-data-index="' + parentIndex + '"]')}, true)
    }
    that.updateCheckStatus(parentNode);
    treeTable.resize(id);
    if (focus) {
      // 滾動到第一個新增的節點
      tableViewElem.find(ELEM_MAIN).find('tr[lay-data-index="' + newNodes[0][LAY_DATA_INDEX] + '"]').get(0).scrollIntoViewIfNeeded();
    }

    return newNodes;
  }

  // 獲取表格選中狀態
  treeTable.checkStatus = function (id, includeHalfCheck) {
    var that = getThisTable(id);
    if (!that) return;
    var options = that.getOptions();
    var treeOptions = options.tree;
    var checkName = table.config.checkName;

    // 需要區分單雙選
    var tableData = treeTable.getData(id, true);
    var checkedData = tableData.filter(function (value, index, array) {
      return value[checkName] || (includeHalfCheck && value[LAY_CHECKBOX_HALF]);
    });

    var isAll = true;
    layui.each(treeOptions.data.cascade === 'all' ? table.cache[id] : treeTable.getData(id, true), function (i1, item1) {
      if (!item1[checkName]) {
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

    if (tableView.hasClass(TABLE_TREE)) {
      treeTable.sort(tableId);
    }
  });

  // 行點擊
  treeTable.on('row', function (obj) {
    var options = obj.config;
    var tableView = options.elem.next();

    if (tableView.hasClass(TABLE_TREE)) {
      updateObjParams(obj);
    }
  })

  // 行雙擊
  treeTable.on('rowDouble', function (obj) {
    var options = obj.config;
    var tableView = options.elem.next();
    var tableId = options.id;

    if (tableView.hasClass(TABLE_TREE)) {
      updateObjParams(obj);

      var treeOptions = options.tree || {};
      if (treeOptions.view.dblClickExpand) {
        expandNode({trElem: obj.tr.first()}, null, null, null, true);
      }
    }
  })

  // 菜單
  treeTable.on('rowContextmenu', function (obj) {
    var options = obj.config;
    var tableView = options.elem.next();
    var tableId = options.id;

    if (tableView.hasClass(TABLE_TREE)) {
      updateObjParams(obj);
    }
  })

  // tr中帶lay-event節點點擊
  treeTable.on('tool', function (obj) {
    var options = obj.config;
    var tableView = options.elem.next();
    var tableId = options.id;

    if (tableView.hasClass(TABLE_TREE)) {
      updateObjParams(obj);
    }
  })

  // 行內編輯
  treeTable.on('edit', function (obj) {
    // 如果編輯涉及到關鍵的name字段需要重新更新一下tr節點
    var options = obj.config;
    var tableView = options.elem.next();
    var tableId = options.id;

    if (tableView.hasClass(TABLE_TREE)) {
      updateObjParams(obj);
      if (obj.field === options.tree.customName.name) {
        var updateData = {};
        updateData[obj.field] = obj.value;
        obj.update(updateData); // 通過update調用執行tr節點的更新
      }
    }
  });

  // 單選
  treeTable.on('radio', function (obj) {
    var options = obj.config;
    var tableView = options.elem.next();
    var tableId = options.id;

    if (tableView.hasClass(TABLE_TREE)) {
      var that = getThisTable(tableId);
      updateObjParams(obj);
      checkNode.call(that, obj.tr, obj.checked)
    }
  })

  // 設置或取消行選中樣式
  Class.prototype.setRowCheckedClass = function(tr, checked){
    var that = this;
    var options = that.getOptions();

    var index = tr.data('index');
    var tableViewElem = options.elem.next();

    tr[checked ? 'addClass' : 'removeClass'](ELEM_CHECKED); // 主體行

    // 右側固定行
    tr.each(function(){
      var index = $(this).data('index');
      var trFixedR = tableViewElem.find('.layui-table-fixed-r tbody tr[data-index="'+ index +'"]');
      trFixedR[checked ? 'addClass' : 'removeClass'](ELEM_CHECKED);
    });
  };

  // 更新表格的複選框狀態
  Class.prototype.updateCheckStatus = function (dataP, checked) {
    var that = this;
    var options = that.getOptions();
    if (!options.hasChecboxCol) {
      return false; // 如果沒有複選列則不需要更新狀態
    }
    var treeOptions = options.tree;
    var tableId = options.id;
    var tableView = options.elem.next();

    var checkName = table.config.checkName;

    var cascade = treeOptions.data.cascade;
    var isCascadeParent = cascade === 'all' || cascade === 'parent';

    // 如有必要更新父節點們的狀態
    if (isCascadeParent && dataP) {
      var trsP = that.updateParentCheckStatus(dataP, layui.type(checked) === 'boolean' ? checked : null);
      layui.each(trsP, function (indexP, itemP) {
        var checkboxElem = tableView.find('tr[lay-data-index="' + itemP[LAY_DATA_INDEX] + '"]  input[name="layTableCheckbox"]:not(:disabled)');
        var checked = itemP[checkName];

        // 標記父節點行背景色
        that.setRowCheckedClass(checkboxElem.closest('tr'), checked);

        // 設置原始複選框 checked 屬性值並渲染
        form.render(checkboxElem.prop({
          checked: checked,
          indeterminate: itemP[LAY_CHECKBOX_HALF]
        }))
      })
    }

    // 更新全選的狀態
    var isAll = true;
    var isIndeterminate = false;
    var data = treeOptions.data.cascade === 'all' ? table.cache[tableId] : treeTable.getData(tableId, true);
    data = data.filter(function (item) {
        return !item[options.disabledName];
    });
    layui.each(data, function (i1, item1) {
      if (item1[checkName] || item1[LAY_CHECKBOX_HALF]) {
        isIndeterminate = true;
      }
      if (!item1[checkName]) {
        isAll = false;
      }
      if (isIndeterminate && !isAll) {
        return true;
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
    if (checked === true) {
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
    } else if (checked === false) {
      // 判斷是否為半選
      layui.each(dataP[childrenKey], function (index, item) {
        if (item[checkName] || item[LAY_CHECKBOX_HALF]) { // 只要有一個子節點為選中或者半選狀態
          dataP[LAY_CHECKBOX_HALF] = true;
          return true;
        }
      });
    } else {
      // 狀態不確定的情況下根據子節點的信息
      checked = false;
      var checkedNum = 0;
      layui.each(dataP[childrenKey], function (index, item) {
        if (item[checkName]) {
          checkedNum++;
        }
      });
      checked = dataP[childrenKey].length ? dataP[childrenKey].length === checkedNum : dataP[checkName]; // 如果沒有子節點保留原來的狀態;
      dataP[LAY_CHECKBOX_HALF] = checked ? false : checkedNum > 0;
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
    var treeOptions = options.tree;
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
            var radioElem = tableView.find('tr[lay-data-index="' + d[LAY_DATA_INDEX] + '"] input[type="radio"][lay-type="layTableRadio"]');
            d[checkName] = false;

            // 取消當前選中行背景色
            that.setRowCheckedClass(radioElem.closest('tr'), false);
            form.render(radioElem.prop('checked', false));
          }
        }); // 取消其他的選中狀態
        trData[checkName] = checked;

        that.setRowCheckedClass(trElem, checked);  // 標記當前選中行背景色
        that.setRowCheckedClass(trElem.siblings(), false); // 取消其他行背景色

        form.render(trElem.find('input[type="radio"][lay-type="layTableRadio"]').prop('checked', checked));
      } else {
        // 切換隻能用到單條，全選到這一步的時候應該是一個確定的狀態
        checked = layui.type(checked) === 'boolean' ? checked : !trData[checkName]; // 狀態切換，如果遇到不可操作的節點待處理 todo
        // 全選或者是一個父節點，將子節點的狀態同步為當前節點的狀態
        // 處理不可操作的信息
        var checkedStatusFn = function (d) {
          if (!d[table.config.disabledName]) { // 節點不可操作的不處理
            d[checkName] = checked;
            d[LAY_CHECKBOX_HALF] = false;
          }
        }

        var trs = that.updateStatus(trData ? [trData] : table.cache[tableId], checkedStatusFn, trData && ['parent', 'none'].indexOf(treeOptions.data.cascade) !== -1);
        var checkboxElem = tableView.find(trs.map(function (value) {
          return 'tr[lay-data-index="' + value[LAY_DATA_INDEX] + '"] input[name="layTableCheckbox"]:not(:disabled)';
        }).join(','));

        that.setRowCheckedClass(checkboxElem.closest('tr'), checked);  // 標記當前選中行背景色
        form.render(checkboxElem.prop({checked: checked, indeterminate: false}));

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

    if (tableView.hasClass(TABLE_TREE)) {
      var that = getThisTable(tableId);
      var checked = obj.checked;
      updateObjParams(obj)
      obj.isAll = checkNode.call(that, obj.tr, checked);
    }
  })

  /**
   * 設置行選中狀態
   * @param {String} id 樹表id
   * @param {Object} opts
   * @param {Object|String} opts.index 節點下標
   * @param {Boolean} opts.checked 選中或取消
   * @param {Boolean} [opts.callbackFlag] 是否觸發事件回調
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
   * @param {Boolean} [isSimpleData] 是否返回平鋪結構的數據
   * @return {Array} 表格數據
   * */
  treeTable.getData = function (id, isSimpleData) {
    var that = getThisTable(id);
    if (!that) return;

    var tableData = [];
    layui.each($.extend(true, [], table.cache[id] || []), function (index, item) {
      // 遍歷排除掉臨時的數據
      tableData.push(item);
    })
    return isSimpleData ? that.treeToFlat(tableData) : tableData;
  }

  /**
   * 重新加載子節點
   * @param {String} id 表格id
   * @param {String} dataIndex 父節點的dataIndex
   * */
  treeTable.reloadAsyncNode = function (id, dataIndex) {
    var that = getThisTable(id);
    if (!that) {
      return;
    }

    var options = that.getOptions();
    var treeOptions = options.tree;
    if (!treeOptions.async || !treeOptions.async.enable) {
      return;
    }
    var dataP = that.getNodeDataByIndex(dataIndex);
    if (!dataP) {
      return;
    }
    dataP[LAY_HAS_EXPANDED] = false;
    dataP[LAY_EXPAND] = false;
    dataP[LAY_ASYNC_STATUS] = false;
    layui.each(that.treeToFlat(dataP[treeOptions.customName.children]).reverse(), function (i1, item1) {
      treeTable.removeNode(id, item1[LAY_DATA_INDEX]);
    })
    // 重新展開
    treeTable.expandNode(id, {
      index: dataIndex,
      expandFlag: true,
      callbackFlag: true,
    })
  }

  /**
   * 通過數據id獲取節點對象
   * */
  treeTable.getNodeById = function (id, dataId) {
    var that = getThisTable(id);
    if (!that) return;

    return that.getNodeById(dataId);
  }

  /**
   * 根據自定義規則搜索節點數據
   * @param {String} id 樹表id
   * @param {Function} filter 自定義過濾器函數
   * @param {Object} [opts]
   * @param {Boolean} [opts.isSingle] 是否只找到第一個
   * @param {Object} [opts.parentNode] 在指定在某個父節點下的子節點中搜索
   * @return {Object} 節點對象
   * */
  treeTable.getNodesByFilter = function (id, filter, opts) {
    var that = getThisTable(id);
    if (!that) return;
    var options = that.getOptions();

    opts = opts || {};
    var isSingle = opts.isSingle;
    var parentNode = opts.parentNode;
    var dataP = parentNode && parentNode.data;
    // dataP = dataP || table.cache[id];
    var nodes = that.treeToFlat(dataP ? (dataP[options.tree.customName.children] || []) : table.cache[id]).filter(filter);
    var nodesResult = [];
    layui.each(nodes, function (i1, item1) {
      nodesResult.push(that.getNodeByIndex(item1[LAY_DATA_INDEX]));
      if (isSingle) {
        return true;
      }
    });

    return nodesResult;
  }


  // 記錄所有實例
  thisTreeTable.that = {}; // 記錄所有實例對象
  // thisTreeTable.config = {}; // 記錄所有實例配置項

  // 重載
  treeTable.reload = function (id, options, deep, type) {
    // deep = deep !== false; // 默認採用深拷貝
    var that = getThisTable(id);
    if (!that) return;
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
