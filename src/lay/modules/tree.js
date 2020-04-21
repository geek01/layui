/**

 @Name：layui.tree 樹
 @Author：star1029
 @License：MIT

 */

layui.define('form', function(exports){
  "use strict";

  var $ = layui.$
  ,form = layui.form
  ,layer = layui.layer

  //模塊名
  ,MOD_NAME = 'tree'

  //外部接口
  ,tree = {
    config: {}
    ,index: layui[MOD_NAME] ? (layui[MOD_NAME].index + 10000) : 0

    //設置全局項
    ,set: function(options){
      var that = this;
      that.config = $.extend({}, that.config, options);
      return that;
    }

    //事件監聽
    ,on: function(events, callback){
      return layui.onevent.call(this, MOD_NAME, events, callback);
    }
  }

  //操作當前實例
  ,thisModule = function(){
    var that = this
    ,options = that.config
    ,id = options.id || that.index;

    thisModule.that[id] = that; //記錄當前實例對象
    thisModule.config[id] = options; //記錄當前實例配置項

    return {
      config: options
      //重置實例
      ,reload: function(options){
        that.reload.call(that, options);
      }
      ,getChecked: function(){
        return that.getChecked.call(that);
      }
      ,setChecked: function(id){//設置值
        return that.setChecked.call(that, id);
      }
    }
  }

  //獲取當前實例配置項
  ,getThisModuleConfig = function(id){
    var config = thisModule.config[id];
    if(!config) hint.error('The ID option was not found in the '+ MOD_NAME +' instance');
    return config || null;
  }

  //字符常量
  ,SHOW = 'layui-show', HIDE = 'layui-hide', NONE = 'layui-none', DISABLED = 'layui-disabled'

  ,ELEM_VIEW = 'layui-tree', ELEM_SET = 'layui-tree-set', ICON_CLICK = 'layui-tree-iconClick'
  ,ICON_ADD = 'layui-icon-addition', ICON_SUB = 'layui-icon-subtraction', ELEM_ENTRY = 'layui-tree-entry', ELEM_MAIN = 'layui-tree-main', ELEM_TEXT = 'layui-tree-txt', ELEM_PACK = 'layui-tree-pack', ELEM_SPREAD = 'layui-tree-spread'
  ,ELEM_LINE_SHORT = 'layui-tree-setLineShort', ELEM_SHOW = 'layui-tree-showLine', ELEM_EXTEND = 'layui-tree-lineExtend'

  //構造器
  ,Class = function(options){
    var that = this;
    that.index = ++tree.index;
    that.config = $.extend({}, that.config, tree.config, options);
    that.render();
  };

  //默認配置
  Class.prototype.config = {
    data: []  //數據

    ,showCheckbox: false  //是否顯示覆選框
    ,showLine: true  //是否開啟連接線
    ,accordion: false  //是否開啟手風琴模式
    ,onlyIconControl: false  //是否僅允許節點左側圖標控制展開收縮
    ,isJump: false  //是否允許點擊節點時彈出新窗口跳轉
    ,edit: false  //是否開啟節點的操作圖標

    ,text: {
      defaultNodeName: '未命名' //節點默認名稱
      ,none: '無數據'  //數據為空時的文本提示
    }
  };

  //重載實例
  Class.prototype.reload = function(options){
    var that = this;

    layui.each(options, function(key, item){
      if(item.constructor === Array) delete that.config[key];
    });

    that.config = $.extend(true, {}, that.config, options);
    that.render();
  };

  //主體渲染
  Class.prototype.render = function(){
    var that = this
    ,options = that.config;

    that.checkids = [];

    var temp = $('<div class="layui-tree'+ (options.showCheckbox ? " layui-form" : "") + (options.showLine ? " layui-tree-line" : "") +'" lay-filter="LAY-tree-'+ that.index +'"></div>');
    that.tree(temp);

    var othis = options.elem = $(options.elem);
    if(!othis[0]) return;

    //索引
    that.key = options.id || that.index;

    //插入組件結構
    that.elem = temp;
    that.elemNone = $('<div class="layui-tree-emptyText">'+ options.text.none +'</div>');
    othis.html(that.elem);

    if(that.elem.find('.layui-tree-set').length == 0){
      return that.elem.append(that.elemNone);
    };

    //複選框渲染
    if(options.showCheckbox){
      that.renderForm('checkbox');
    };

    that.elem.find('.layui-tree-set').each(function(){
      var othis = $(this);
      //最外層
      if(!othis.parent('.layui-tree-pack')[0]){
        othis.addClass('layui-tree-setHide');
      };

      //沒有下一個節點 上一層父級有延伸線
      if(!othis.next()[0] && othis.parents('.layui-tree-pack').eq(1).hasClass('layui-tree-lineExtend')){
        othis.addClass(ELEM_LINE_SHORT);
      };

      //沒有下一個節點 外層最後一個
      if(!othis.next()[0] && !othis.parents('.layui-tree-set').eq(0).next()[0]){
        othis.addClass(ELEM_LINE_SHORT);
      };
    });

    that.events();
  };

  //渲染表單
  Class.prototype.renderForm = function(type){
    form.render(type, 'LAY-tree-'+ this.index);
  };

  //節點解析
  Class.prototype.tree = function(elem, children){
    var that = this
    ,options = that.config
    ,data = children || options.data;

    //遍歷數據
    layui.each(data, function(index, item){
      var hasChild = item.children && item.children.length > 0
      ,packDiv = $('<div class="layui-tree-pack" '+ (item.spread ? 'style="display: block;"' : '') +'"></div>')
      ,entryDiv = $(['<div data-id="'+ item.id +'" class="layui-tree-set'+ (item.spread ? " layui-tree-spread" : "") + (item.checked ? " layui-tree-checkedFirst" : "") +'">'
        ,'<div class="layui-tree-entry">'
          ,'<div class="layui-tree-main">'
            //箭頭
            ,function(){
              if(options.showLine){
                if(hasChild){
                  return '<span class="layui-tree-iconClick layui-tree-icon"><i class="layui-icon '+ (item.spread ? "layui-icon-subtraction" : "layui-icon-addition") +'"></i></span>';
                }else{
                  return '<span class="layui-tree-iconClick"><i class="layui-icon layui-icon-file"></i></span>';
                };
              }else{
                return '<span class="layui-tree-iconClick"><i class="layui-tree-iconArrow '+ (hasChild ? "": HIDE) +'"></i></span>';
              };
            }()

            //複選框
            ,function(){
              return options.showCheckbox ? '<input type="checkbox" name="'+ (item.field || ('layuiTreeCheck_'+ item.id)) +'" same="layuiTreeCheck" lay-skin="primary" '+ (item.disabled ? "disabled" : "") +' value="'+ item.id +'">' : '';
            }()

            //節點
            ,function(){
              if(options.isJump && item.href){
                return '<a href="'+ item.href +'" target="_blank" class="'+ ELEM_TEXT +'">'+ (item.title || item.label || options.text.defaultNodeName) +'</a>';
              }else{
                return '<span class="'+ ELEM_TEXT + (item.disabled ? ' '+ DISABLED : '') +'">'+ (item.title || item.label || options.text.defaultNodeName) +'</span>';
              }
            }()
      ,'</div>'

      //節點操作圖標
      ,function(){
        if(!options.edit) return '';

        var editIcon = {
          add: '<i class="layui-icon layui-icon-add-1"  data-type="add"></i>'
          ,update: '<i class="layui-icon layui-icon-edit" data-type="update"></i>'
          ,del: '<i class="layui-icon layui-icon-delete" data-type="del"></i>'
        }, arr = ['<div class="layui-btn-group layui-tree-btnGroup">'];

        if(options.edit === true){
          options.edit = ['update', 'del']
        }

        if(typeof options.edit === 'object'){
          layui.each(options.edit, function(i, val){
            arr.push(editIcon[val] || '')
          });
          return arr.join('') + '</div>';
        }
      }()
      ,'</div></div>'].join(''));

      //如果有子節點，則遞歸繼續生成樹
      if(hasChild){
        entryDiv.append(packDiv);
        that.tree(packDiv, item.children);
      };

      elem.append(entryDiv);

      //若有前置節點，前置節點加連接線
      if(entryDiv.prev('.'+ELEM_SET)[0]){
        entryDiv.prev().children('.layui-tree-pack').addClass('layui-tree-showLine');
      };

      //若無子節點，則父節點加延伸線
      if(!hasChild){
        entryDiv.parent('.layui-tree-pack').addClass('layui-tree-lineExtend');
      };

      //展開節點操作
      that.spread(entryDiv, item);

      //選擇框
      if(options.showCheckbox){
        item.checked && that.checkids.push(item.id);
        that.checkClick(entryDiv, item);
      }

      //操作節點
      options.edit && that.operate(entryDiv, item);

    });
  };

  //展開節點
  Class.prototype.spread = function(elem, item){
    var that = this
    ,options = that.config
    ,entry = elem.children('.'+ELEM_ENTRY)
    ,elemMain = entry.children('.'+ ELEM_MAIN)
    ,elemIcon = entry.find('.'+ ICON_CLICK)
    ,elemText = entry.find('.'+ ELEM_TEXT)
    ,touchOpen = options.onlyIconControl ? elemIcon : elemMain //判斷展開通過節點還是箭頭圖標
    ,state = '';

    //展開收縮
    touchOpen.on('click', function(e){
      var packCont = elem.children('.'+ELEM_PACK)
      ,iconClick = touchOpen.children('.layui-icon')[0] ? touchOpen.children('.layui-icon') : touchOpen.find('.layui-tree-icon').children('.layui-icon');

      //若沒有子節點
      if(!packCont[0]){
        state = 'normal';
      }else{
        if(elem.hasClass(ELEM_SPREAD)){
          elem.removeClass(ELEM_SPREAD);
          packCont.slideUp(200);
          iconClick.removeClass(ICON_SUB).addClass(ICON_ADD);
        }else{
          elem.addClass(ELEM_SPREAD);
          packCont.slideDown(200);
          iconClick.addClass(ICON_SUB).removeClass(ICON_ADD);

          //是否手風琴
          if(options.accordion){
            var sibls = elem.siblings('.'+ELEM_SET);
            sibls.removeClass(ELEM_SPREAD);
            sibls.children('.'+ELEM_PACK).slideUp(200);
            sibls.find('.layui-tree-icon').children('.layui-icon').removeClass(ICON_SUB).addClass(ICON_ADD);
          };
        };
      };
    });

    //點擊回調
    elemText.on('click', function(){
      var othis = $(this);

      //判斷是否禁用狀態
      if(othis.hasClass(DISABLED)) return;

      //判斷展開收縮狀態
      if(elem.hasClass(ELEM_SPREAD)){
        state = options.onlyIconControl ? 'open' : 'close';
      } else {
        state = options.onlyIconControl ? 'close' : 'open';
      }

      //點擊產生的回調
      options.click && options.click({
        elem: elem
        ,state: state
        ,data: item
      });
    });
  };

  //計算複選框選中狀態
  Class.prototype.setCheckbox = function(elem, item, elemCheckbox){
    var that = this
    ,options = that.config
    ,checked = elemCheckbox.prop('checked');

    if(elemCheckbox.prop('disabled')) return;

    //同步子節點選中狀態
    if(typeof item.children === 'object' || elem.find('.'+ELEM_PACK)[0]){
      var childs = elem.find('.'+ ELEM_PACK).find('input[same="layuiTreeCheck"]');
      childs.each(function(){
        if(this.disabled) return; //不可點擊則跳過
        this.checked = checked;
      });
    };

    //同步父節點選中狀態
    var setParentsChecked = function(thisNodeElem){
      //若無父節點，則終止遞歸
      if(!thisNodeElem.parents('.'+ ELEM_SET)[0]) return;

      var state
      ,parentPack = thisNodeElem.parent('.'+ ELEM_PACK)
      ,parentNodeElem = parentPack.parent()
      ,parentCheckbox =  parentPack.prev().find('input[same="layuiTreeCheck"]');

      //如果子節點有任意一條選中，則父節點為選中狀態
      if(checked){
        parentCheckbox.prop('checked', checked);
      } else { //如果當前節點取消選中，則根據計算“兄弟和子孫”節點選中狀態，來同步父節點選中狀態
        parentPack.find('input[same="layuiTreeCheck"]').each(function(){
          if(this.checked){
            state = true;
          }
        });

        //如果兄弟子孫節點全部未選中，則父節點也應為非選中狀態
        state || parentCheckbox.prop('checked', false);
      }

      //向父節點遞歸
      setParentsChecked(parentNodeElem);
    };

    setParentsChecked(elem);

    that.renderForm('checkbox');
  };

  //複選框選擇
  Class.prototype.checkClick = function(elem, item){
    var that = this
    ,options = that.config
    ,entry = elem.children('.'+ ELEM_ENTRY)
    ,elemMain = entry.children('.'+ ELEM_MAIN);



    //點擊複選框
    elemMain.on('click', 'input[same="layuiTreeCheck"]+', function(e){
      layui.stope(e); //阻止點擊節點事件

      var elemCheckbox = $(this).prev()
      ,checked = elemCheckbox.prop('checked');

      if(elemCheckbox.prop('disabled')) return;

      that.setCheckbox(elem, item, elemCheckbox);

      //複選框點擊產生的回調
      options.oncheck && options.oncheck({
        elem: elem
        ,checked: checked
        ,data: item
      });
    });
  };

  //節點操作
  Class.prototype.operate = function(elem, item){
    var that = this
    ,options = that.config
    ,entry = elem.children('.'+ ELEM_ENTRY)
    ,elemMain = entry.children('.'+ ELEM_MAIN);

    entry.children('.layui-tree-btnGroup').on('click', '.layui-icon', function(e){
      layui.stope(e);  //阻止節點操作

      var type = $(this).data("type")
      ,packCont = elem.children('.'+ELEM_PACK)
      ,returnObj = {
        data: item
        ,type: type
        ,elem:elem
      };
      //增加
      if(type == 'add'){
        //若節點本身無子節點
        if(!packCont[0]){
          //若開啟連接線，更改圖標樣式
          if(options.showLine){
            elemMain.find('.'+ICON_CLICK).addClass('layui-tree-icon');
            elemMain.find('.'+ICON_CLICK).children('.layui-icon').addClass(ICON_ADD).removeClass('layui-icon-file');
          //若未開啟連接線，顯示箭頭
          }else{
            elemMain.find('.layui-tree-iconArrow').removeClass(HIDE);
          };
          //節點添加子節點容器
          elem.append('<div class="layui-tree-pack"></div>');
        };

        //新增節點
        var key = options.operate && options.operate(returnObj)
        ,obj = {};
        obj.title = options.text.defaultNodeName;
        obj.id = key;
        that.tree(elem.children('.'+ELEM_PACK), [obj]);

        //放在新增後面，因為要對元素進行操作
        if(options.showLine){
          //節點本身無子節點
          if(!packCont[0]){
            //遍歷兄弟節點，判斷兄弟節點是否有子節點
            var siblings = elem.siblings('.'+ELEM_SET), num = 1
            ,parentPack = elem.parent('.'+ELEM_PACK);
            layui.each(siblings, function(index, i){
              if(!$(i).children('.'+ELEM_PACK)[0]){
                num = 0;
              };
            });

            //若兄弟節點都有子節點
            if(num == 1){
              //兄弟節點添加連接線
              siblings.children('.'+ELEM_PACK).addClass(ELEM_SHOW);
              siblings.children('.'+ELEM_PACK).children('.'+ELEM_SET).removeClass(ELEM_LINE_SHORT);
              elem.children('.'+ELEM_PACK).addClass(ELEM_SHOW);
              //父級移除延伸線
              parentPack.removeClass(ELEM_EXTEND);
              //同層節點最後一個更改線的狀態
              parentPack.children('.'+ELEM_SET).last().children('.'+ELEM_PACK).children('.'+ELEM_SET).last().addClass(ELEM_LINE_SHORT);
            }else{
              elem.children('.'+ELEM_PACK).children('.'+ELEM_SET).addClass(ELEM_LINE_SHORT);
            };
          }else{
            //添加延伸線
            if(!packCont.hasClass(ELEM_EXTEND)){
              packCont.addClass(ELEM_EXTEND);
            };
            //子節點添加延伸線
            elem.find('.'+ELEM_PACK).each(function(){
              $(this).children('.'+ELEM_SET).last().addClass(ELEM_LINE_SHORT);
            });
            //如果前一個節點有延伸線
            if(packCont.children('.'+ELEM_SET).last().prev().hasClass(ELEM_LINE_SHORT)){
              packCont.children('.'+ELEM_SET).last().prev().removeClass(ELEM_LINE_SHORT);
            }else{
              //若之前的沒有，說明處於連接狀態
              packCont.children('.'+ELEM_SET).last().removeClass(ELEM_LINE_SHORT);
            };
            //若是最外層，要始終保持相連的狀態
            if(!elem.parent('.'+ELEM_PACK)[0] && elem.next()[0]){
              packCont.children('.'+ELEM_SET).last().removeClass(ELEM_LINE_SHORT);
            };
          };
        };
        if(!options.showCheckbox) return;
        //若開啟複選框，同步新增節點狀態
        if(elemMain.find('input[same="layuiTreeCheck"]')[0].checked){
          var packLast = elem.children('.'+ELEM_PACK).children('.'+ELEM_SET).last();
          packLast.find('input[same="layuiTreeCheck"]')[0].checked = true;
        };
        that.renderForm('checkbox');

      //修改
      }else if(type == 'update'){
        var text = elemMain.children('.'+ ELEM_TEXT).html();
        elemMain.children('.'+ ELEM_TEXT).html('');
        //添加輸入框，覆蓋在文字上方
        elemMain.append('<input type="text" class="layui-tree-editInput">');
        //獲取焦點
        elemMain.children('.layui-tree-editInput').val(text).focus();
        //嵌入文字移除輸入框
        var getVal = function(input){
          var textNew = input.val().trim();
          textNew = textNew ? textNew : options.text.defaultNodeName;
          input.remove();
          elemMain.children('.'+ ELEM_TEXT).html(textNew);

          //同步數據
          returnObj.data.title = textNew;

          //節點修改的回調
          options.operate && options.operate(returnObj);
        };
        //失去焦點
        elemMain.children('.layui-tree-editInput').blur(function(){
          getVal($(this));
        });
        //回車
        elemMain.children('.layui-tree-editInput').on('keydown', function(e){
          if(e.keyCode === 13){
            e.preventDefault();
            getVal($(this));
          };
        });

      //刪除
      } else {
        layer.confirm('確認刪除該節點 "<span style="color: #999;">'+ (item.title || '') +'</span>" 嗎？', function(index){
          options.operate && options.operate(returnObj); //節點刪除的回調
          returnObj.status = 'remove'; //標註節點刪除

          layer.close(index);

          //若刪除最後一個，顯示空數據提示
          if(!elem.prev('.'+ELEM_SET)[0] && !elem.next('.'+ELEM_SET)[0] && !elem.parent('.'+ELEM_PACK)[0]){
            elem.remove();
            that.elem.append(that.elemNone);
            return;
          };
          //若有兄弟節點
          if(elem.siblings('.'+ELEM_SET).children('.'+ELEM_ENTRY)[0]){
            //若開啟複選框
            if(options.showCheckbox){
              //若開啟複選框，進行下步操作
              var elemDel = function(elem){
                //若無父結點，則不執行
                if(!elem.parents('.'+ELEM_SET)[0]) return;
                var siblingTree = elem.siblings('.'+ELEM_SET).children('.'+ELEM_ENTRY)
                ,parentTree = elem.parent('.'+ELEM_PACK).prev()
                ,checkState = parentTree.find('input[same="layuiTreeCheck"]')[0]
                ,state = 1, num = 0;
                //若父節點未勾選
                if(checkState.checked == false){
                  //遍歷兄弟節點
                  siblingTree.each(function(i, item1){
                    var input = $(item1).find('input[same="layuiTreeCheck"]')[0]
                    if(input.checked == false && !input.disabled){
                      state = 0;
                    };
                    //判斷是否全為不可勾選框
                    if(!input.disabled){
                      num = 1;
                    };
                  });
                  //若有可勾選選擇框並且已勾選
                  if(state == 1 && num == 1){
                    //勾選父節點
                    checkState.checked = true;
                    that.renderForm('checkbox');
                    //向上遍歷祖先節點
                    elemDel(parentTree.parent('.'+ELEM_SET));
                  };
                };
              };
              elemDel(elem);
            };
            //若開啟連接線
            if(options.showLine){
              //遍歷兄弟節點，判斷兄弟節點是否有子節點
              var siblings = elem.siblings('.'+ELEM_SET), num = 1
              ,parentPack = elem.parent('.'+ELEM_PACK);
              layui.each(siblings, function(index, i){
                if(!$(i).children('.'+ELEM_PACK)[0]){
                  num = 0;
                };
              });
              //若兄弟節點都有子節點
              if(num == 1){
                //若節點本身無子節點
                if(!packCont[0]){
                  //父級去除延伸線，因為此時子節點裡沒有空節點
                  parentPack.removeClass(ELEM_EXTEND);
                  siblings.children('.'+ELEM_PACK).addClass(ELEM_SHOW);
                  siblings.children('.'+ELEM_PACK).children('.'+ELEM_SET).removeClass(ELEM_LINE_SHORT);
                };
                //若為最後一個節點
                if(!elem.next()[0]){
                  elem.prev().children('.'+ELEM_PACK).children('.'+ELEM_SET).last().addClass(ELEM_LINE_SHORT);
                }else{
                  parentPack.children('.'+ELEM_SET).last().children('.'+ELEM_PACK).children('.'+ELEM_SET).last().addClass(ELEM_LINE_SHORT);
                };
                //若為最外層最後一個節點，去除前一個結點的連接線
                if(!elem.next()[0] && !elem.parents('.'+ELEM_SET)[1] && !elem.parents('.'+ELEM_SET).eq(0).next()[0]){
                  elem.prev('.'+ELEM_SET).addClass(ELEM_LINE_SHORT);
                };
              }else{
                //若為最後一個節點且有延伸線
                if(!elem.next()[0] && elem.hasClass(ELEM_LINE_SHORT)){
                  elem.prev().addClass(ELEM_LINE_SHORT);
                };
              };
            };

          }else{
            //若無兄弟節點
            var prevDiv = elem.parent('.'+ELEM_PACK).prev();
            //若開啟了連接線
            if(options.showLine){
              prevDiv.find('.'+ICON_CLICK).removeClass('layui-tree-icon');
              prevDiv.find('.'+ICON_CLICK).children('.layui-icon').removeClass(ICON_SUB).addClass('layui-icon-file');
              //父節點所在層添加延伸線
              var pare = prevDiv.parents('.'+ELEM_PACK).eq(0);
              pare.addClass(ELEM_EXTEND);

              //兄弟節點最後子節點添加延伸線
              pare.children('.'+ELEM_SET).each(function(){
                $(this).children('.'+ELEM_PACK).children('.'+ELEM_SET).last().addClass(ELEM_LINE_SHORT);
              });
            }else{
            //父節點隱藏箭頭
              prevDiv.find('.layui-tree-iconArrow').addClass(HIDE);
            };
            //移除展開屬性
            elem.parents('.'+ELEM_SET).eq(0).removeClass(ELEM_SPREAD);
            //移除節點容器
            elem.parent('.'+ELEM_PACK).remove();
          };

          elem.remove();
        });

      };
    });
  };

  //部分事件
  Class.prototype.events = function(){
    var that = this
    ,options = that.config
    ,checkWarp = that.elem.find('.layui-tree-checkedFirst');

    //初始選中
    that.setChecked(that.checkids);

    //搜索
    that.elem.find('.layui-tree-search').on('keyup', function(){
      var input = $(this)
      ,val = input.val()
      ,pack = input.nextAll()
      ,arr = [];

      //遍歷所有的值
      pack.find('.'+ ELEM_TEXT).each(function(){
        var entry = $(this).parents('.'+ELEM_ENTRY);
        //若值匹配，加一個類以作標識
        if($(this).html().indexOf(val) != -1){
          arr.push($(this).parent());

          var select = function(div){
            div.addClass('layui-tree-searchShow');
            //向上父節點渲染
            if(div.parent('.'+ELEM_PACK)[0]){
              select(div.parent('.'+ELEM_PACK).parent('.'+ELEM_SET));
            };
          };
          select(entry.parent('.'+ELEM_SET));
        };
      });

      //根據標誌剔除
      pack.find('.'+ELEM_ENTRY).each(function(){
        var parent = $(this).parent('.'+ELEM_SET);
        if(!parent.hasClass('layui-tree-searchShow')){
          parent.addClass(HIDE);
        };
      });
      if(pack.find('.layui-tree-searchShow').length == 0){
        that.elem.append(that.elemNone);
      };

      //節點過濾的回調
      options.onsearch && options.onsearch({
        elem: arr
      });
    });

    //還原搜索初始狀態
    that.elem.find('.layui-tree-search').on('keydown', function(){
      $(this).nextAll().find('.'+ELEM_ENTRY).each(function(){
        var parent = $(this).parent('.'+ELEM_SET);
        parent.removeClass('layui-tree-searchShow '+ HIDE);
      });
      if($('.layui-tree-emptyText')[0]) $('.layui-tree-emptyText').remove();
    });
  };

  //得到選中節點
  Class.prototype.getChecked = function(){
    var that = this
    ,options = that.config
    ,checkId = []
    ,checkData = [];

    //遍歷節點找到選中索引
    that.elem.find('.layui-form-checked').each(function(){
      checkId.push($(this).prev()[0].value);
    });

    //遍歷節點
    var eachNodes = function(data, checkNode){
      layui.each(data, function(index, item){
        layui.each(checkId, function(index2, item2){
          if(item.id == item2){
            var cloneItem = $.extend({}, item);
            delete cloneItem.children;

            checkNode.push(cloneItem);

            if(item.children){
              cloneItem.children = [];
              eachNodes(item.children, cloneItem.children);
            }
            return true
          }
        });
      });
    };

    eachNodes($.extend({}, options.data), checkData);

    return checkData;
  };

  //設置選中節點
  Class.prototype.setChecked = function(checkedId){
    var that = this
    ,options = that.config;

    //初始選中
    that.elem.find('.'+ELEM_SET).each(function(i, item){
      var thisId = $(this).data('id')
      ,input = $(item).children('.'+ELEM_ENTRY).find('input[same="layuiTreeCheck"]')
      ,reInput = input.next();

      //若返回數字
      if(typeof checkedId === 'number'){
        if(thisId == checkedId){
          if(!input[0].checked){
            reInput.click();
          };
          return false;
        };
      }
      //若返回數組
      else if(typeof checkedId === 'object'){
        layui.each(checkedId, function(index, value){
          if(value == thisId && !input[0].checked){
            reInput.click();
            return true;
          }
        });
      };
    });
  };

  //記錄所有實例
  thisModule.that = {}; //記錄所有實例對象
  thisModule.config = {}; //記錄所有實例配置項

  //重載實例
  tree.reload = function(id, options){
    var that = thisModule.that[id];
    that.reload(options);

    return thisModule.call(that);
  };

  //獲得選中的節點數據
  tree.getChecked = function(id){
    var that = thisModule.that[id];
    return that.getChecked();
  };

  //設置選中節點
  tree.setChecked = function(id, checkedId){
    var that = thisModule.that[id];
    return that.setChecked(checkedId);
  };

  //核心入口
  tree.render = function(options){
    var inst = new Class(options);
    return thisModule.call(inst);
  };

  exports(MOD_NAME, tree);
})