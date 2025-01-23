/**
 * form 表單組件
 */

layui.define(['lay', 'layer', 'util'], function(exports){
  "use strict";

  var $ = layui.$;
  var layer = layui.layer;
  var util = layui.util;
  var hint = layui.hint();
  var device = layui.device();
  var needCheckboxFallback = lay.ie && parseFloat(lay.ie) === 8;

  var MOD_NAME = 'form';
  var ELEM = '.layui-form';
  var THIS = 'layui-this';
  var SHOW = 'layui-show';
  var HIDE = 'layui-hide';
  var DISABLED = 'layui-disabled';
  var OUT_OF_RANGE = 'layui-input-number-out-of-range';

  var Form = function(){
    this.config = {
      // 內置的驗證規則
      verify: {
        required: function(value) {
          if (!/[\S]+/.test(value) || value === undefined || value === null) {
            return '必填項不能為空';
          }
        },
        phone: function(value) {
          var EXP = /^1\d{10}$/;
          if (value && !EXP.test(value)) {
            return '手機號格式不正確';
          }
        },
        email: function(value) {
          var EXP = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
          if (value && !EXP.test(value)) {
            return '郵箱格式不正確';
          }
        },
        url: function(value) {
          var EXP = /^(#|(http(s?)):\/\/|\/\/)[^\s]+\.[^\s]+$/;
          if (value && !EXP.test(value)) {
            return '鏈接格式不正確';
          }
        },
        number: function(value){
          if (value && isNaN(value)) {
            return '只能填寫數字';
          }
        },
        date: function(value){
          var EXP = /^(\d{4})[-\/](\d{1}|0\d{1}|1[0-2])([-\/](\d{1}|0\d{1}|[1-2][0-9]|3[0-1]))*$/;
          if (value && !EXP.test(value)) {
            return '日期格式不正確';
          }
        },
        identity: function(value) {
          var EXP = /(^\d{15}$)|(^\d{17}(x|X|\d)$)/;
          if (value && !EXP.test(value)) {
            return '身份證號格式不正確';
          }
        }
      },
      autocomplete: null // 全局 autocomplete 狀態。 null 表示不干預
    };
  };

  // 全局設置
  Form.prototype.set = function(options){
    var that = this;
    $.extend(true, that.config, options);
    return that;
  };

  // 驗證規則設定
  Form.prototype.verify = function(settings){
    var that = this;
    $.extend(true, that.config.verify, settings);
    return that;
  };

  // 獲取指定表單對象
  Form.prototype.getFormElem = function(filter){
    return $(ELEM + function(){
      return filter ? ('[lay-filter="' + filter +'"]') : '';
    }());
  };

  // 表單事件
  Form.prototype.on = function(events, callback){
    return layui.onevent.call(this, MOD_NAME, events, callback);
  };

  // 賦值/取值
  Form.prototype.val = function(filter, object){
    var that = this
    ,formElem = that.getFormElem(filter);

    // 遍歷
    formElem.each(function(index, item){
      var itemForm = $(this);

      // 賦值
      layui.each(object, function(key, value){
        var itemElem = itemForm.find('[name="'+ key +'"]')
        ,type;

        // 如果對應的表單不存在，則不執行
        if(!itemElem[0]) return;
        type = itemElem[0].type;

        // 如果為複選框
        if(type === 'checkbox'){
          itemElem[0].checked = value;
        } else if(type === 'radio') { // 如果為單選框
          itemElem.each(function(){
            this.checked = this.value == value + '';
          });
        } else { // 其它類型的表單
          itemElem.val(value);
        }
      });
    });

    form.render(null, filter);

    // 返回值
    return that.getValue(filter);
  };

  // 取值
  Form.prototype.getValue = function(filter, itemForm){
    itemForm = itemForm || this.getFormElem(filter);

    var nameIndex = {} // 數組 name 索引
    ,field = {}
    ,fieldElem = itemForm.find('input,select,textarea') // 獲取所有表單域

    layui.each(fieldElem, function(_, item){
      var othis = $(this)
      ,init_name; // 初始 name

      item.name = (item.name || '').replace(/^\s*|\s*&/, '');
      if(!item.name) return;

      // 用於支持數組 name
      if(/^.*\[\]$/.test(item.name)){
        var key = item.name.match(/^(.*)\[\]$/g)[0];
        nameIndex[key] = nameIndex[key] | 0;
        init_name = item.name.replace(/^(.*)\[\]$/, '$1['+ (nameIndex[key]++) +']');
      }

      if(/^(checkbox|radio)$/.test(item.type) && !item.checked) return;  // 複選框和單選框未選中，不記錄字段
      field[init_name || item.name] = othis.val();
    });

    return field;
  };

  // 表單控件渲染
  Form.prototype.render = function(type, filter){
    var that = this;
    var options = that.config;
    var elemForm = $(ELEM + function(){
      return filter ? ('[lay-filter="' + filter +'"]') : '';
    }());
    var items = {
      // 輸入框
      input: function(elem){
        var inputs = elem || elemForm.find('input,textarea');

        // 初始化全局的 autocomplete
        options.autocomplete && inputs.attr('autocomplete', options.autocomplete);

        var handleInputNumber = function(elem, eventType){
          var that = this;
          var rawValue = elem.val();
          var value = Number(rawValue);
          var step = Number(elem.attr('step')) || 1; // 加減的數字間隔
          var min = Number(elem.attr('min'));
          var max = Number(elem.attr('max'));
          var precision = Number(elem.attr('lay-precision'));
          var noAction = eventType !== 'click' && rawValue === ''; // 初始渲染和失焦時空值不作處理
          var isInit = eventType === 'init';

          if(isNaN(value)) return; // 若非數字，則不作處理

          if(eventType === 'click'){
            var isDecrement = !!$(that).index() // 0: icon-up, 1: icon-down
            value = isDecrement ? value - step : value + step;
          }

          // 獲取小數點後位數
          var decimals = function(step){
            var decimals = (step.toString().match(/\.(\d+$)/) || [])[1] || '';
            return decimals.length;
          };

          precision = precision >= 0 ? precision : Math.max(decimals(step), decimals(rawValue));

          // 賦值
          if (!noAction) {
            // 初始渲染時只處理數字精度
            if (!isInit) {
              if(value <= min) value = min;
              if(value >= max) value = max;
            }
            // 若 `lay-precision` 為 0, 則表示只保留整數
            if (precision === 0) {
              value = parseInt(value);
            } else if(precision > 0) { // 小數位精度
              value = value.toFixed(precision);
            }
            elem.val(value);
          }

          // 超出範圍的樣式
          var outOfRange = value < min || value > max;
          elem[outOfRange && !noAction ? 'addClass' : 'removeClass'](OUT_OF_RANGE);

          if(isInit) return;

          // 更新按鈕狀態
          var controlBtn = {
            increment: elem.next().find('.layui-icon-up'),
            decrement: elem.next().find('.layui-icon-down')
          }
          controlBtn.increment[(value >= max && !noAction) ? 'addClass' : 'removeClass'](DISABLED)
          controlBtn.decrement[(value <= min && !noAction) ? 'addClass' : 'removeClass'](DISABLED)
        }

        // 初始化輸入框動態點綴
        elemForm.find('input[lay-affix],textarea[lay-affix]').each(function(){
          var othis = $(this);
          var affix = othis.attr('lay-affix');
          var CLASS_WRAP = 'layui-input-wrap';
          var CLASS_SUFFIX = 'layui-input-suffix';
          var CLASS_AFFIX = 'layui-input-affix';
          var disabled = othis.is('[disabled]') || othis.is('[readonly]');

          // 根據是否空值來顯示或隱藏元素
          var showAffix = function(elem, value){
            elem = $(elem);
            if(!elem[0]) return;
            elem[$.trim(value) ? 'removeClass' : 'addClass'](HIDE);
          };

          // 渲染動態點綴內容
          var renderAffix = function(opts){
            opts = $.extend({}, (affixOptions[affix] || {
              value: affix
            }), opts, lay.options(othis[0]));
            var elemAffix = $('<div class="'+ CLASS_AFFIX +'">');
            var value = layui.isArray(opts.value) ? opts.value : [opts.value];
            var elemIcon = $(function(){
              var arr = [];
              layui.each(value, function(i, item){
                arr.push('<i class="layui-icon layui-icon-'+ item + (
                  opts.disabled ? (' '+ DISABLED) : ''
                ) +'"></i>');
              });
              return arr.join('');
            }());

            elemAffix.append(elemIcon); // 插入圖標元素

            // 追加 className
            if(opts.split) elemAffix.addClass('layui-input-split');
            if(opts.className) elemAffix.addClass(opts.className);

            // 移除舊的元素
            var hasElemAffix = othis.next('.'+ CLASS_AFFIX);
            if(hasElemAffix[0]) hasElemAffix.remove();

            // 是否在規定的容器中
            if(!othis.parent().hasClass(CLASS_WRAP)){
              othis.wrap('<div class="'+ CLASS_WRAP +'"></div>');
            }

            // 是否已經存在後綴元素
            var hasElemSuffix = othis.next('.'+ CLASS_SUFFIX);
            if(hasElemSuffix[0]){
              hasElemAffix = hasElemSuffix.find('.'+ CLASS_AFFIX);
              if(hasElemAffix[0]) hasElemAffix.remove();

              hasElemSuffix.prepend(elemAffix);

              othis.css('padding-right', function(){
                var paddingRight = othis.closest('.layui-input-group')[0]
                  ? 0
                : hasElemSuffix.outerWidth();
                return paddingRight + elemAffix.outerWidth()
              });
            } else {
              elemAffix.addClass(CLASS_SUFFIX);
              othis.after(elemAffix);
            }

            opts.show === 'auto' && showAffix(elemAffix, othis.val());

            typeof opts.init === 'function' && opts.init.call(this, othis, opts);

            // 輸入事件
            othis.on('input propertychange', function(){
              var value = this.value;
              opts.show === 'auto' && showAffix(elemAffix, value);
            });

            // 失去焦點事件
            othis.on('blur', function(){
              typeof opts.blur === 'function' && opts.blur.call(this, othis, opts);
            });

            // 點擊動態後綴事件
            elemIcon.on('click', function(){
              var inputFilter = othis.attr('lay-filter');
              if($(this).hasClass(DISABLED)) return;

              typeof opts.click === 'function' && opts.click.call(this, othis, opts);

              // 對外事件
              layui.event.call(this, MOD_NAME, 'input-affix('+ inputFilter +')', {
                elem: othis[0],
                affix: affix,
                options: opts
              });
            });
          };

          // 動態點綴配置項
          var affixOptions = {
            eye: { // 密碼顯隱
              value: 'eye-invisible',
              click: function(elem, opts){ // 事件
                var SHOW_NAME = 'LAY_FORM_INPUT_AFFIX_SHOW';
                var isShow = elem.data(SHOW_NAME);

                elem.attr('type', isShow ? 'password' : 'text').data(SHOW_NAME, !isShow);

                renderAffix({
                  value: isShow ? 'eye-invisible' : 'eye'
                });
              }
            },
            clear: { // 內容清除
              value: 'clear',
              click: function(elem){
                elem.val('').focus();
                showAffix($(this).parent(), null);
              },
              show: 'auto', // 根據輸入框值是否存在來顯示或隱藏點綴圖標
              disabled: disabled // 跟隨輸入框禁用狀態
            },
            number: { // 數字輸入框
              value: ['up', 'down'],
              split: true,
              className: 'layui-input-number',
              disabled: othis.is('[disabled]'), // 跟隨輸入框禁用狀態
              init: function(elem){
                handleInputNumber.call(this, elem, 'init')
              },
              click: function(elem){
                handleInputNumber.call(this, elem, 'click')
              },
              blur: function(elem){
                handleInputNumber.call(this, elem, 'blur')
              },
            }
          };

          renderAffix();
        });
      }

      // 下拉選擇框
      ,select: function(elem){
        var TIPS = '請選擇';
        var CLASS = 'layui-form-select';
        var TITLE = 'layui-select-title';
        var NONE = 'layui-select-none';
        var CREATE_OPTION = 'layui-select-create-option';
        var PANEL_WRAP = 'layui-select-panel-wrap'
        var PANEL_ELEM_DATA = 'layui-select-panel-elem-data';
        var selects = elem || elemForm.find('select');

        // 各種事件
        var events = function(reElem, titleElem, disabled, isSearch, isCreatable, isAppendTo){
          var select = $(this);
          var title = titleElem;
          var input = title.find('input');
          var dl = reElem.find('dl');
          var dds = dl.children('dd');
          var dts = dl.children('dt'); // select 分組dt元素
          var index =  this.selectedIndex; // 當前選中的索引
          var initValue = '';
          var removeClickOutsideEvent;

          if(disabled) return;

          /**
           * 搜索項
           * @typedef searchOption
           * @prop {boolean} [caseSensitive=false] 是否區分大小寫
           * @prop {boolean} [fuzzy=false] 是否開啟模糊匹配，開啟後將會忽略模式出現在字符串中的位置。
           */
          /** @type {searchOption} */
          var laySearch = select.attr('lay-search') === 'cs' ? {caseSensitive:true} : lay.options(select, {attr:'lay-search'});
          // 目前只支持 body
          var appendTarget = select.attr('lay-append-to') || 'body';
          var appendPosition = select.attr('lay-append-position');

          // #1449
          // IE10 和 11 中，帶有佔位符的 input 元素獲得/失去焦點時，會觸發 input 事件
          // 當鼠標按下時，根據 input 元素上的 __ieph 標識忽略 input 事件
          var needPlaceholderPatch = !!(lay.ie && (lay.ie === '10' || lay.ie === '11') && input.attr('placeholder'));

          // 展開下拉
          var showDown = function(){
            if(isAppendTo){
              // 如果追加面板元素後出現滾動條，觸發元素寬度可能會有變化，所以先追加面板元素
              reElem.appendTo(appendTarget).css({width: title.width() + 'px'});

              var updatePosition = function(){
                lay.position(title[0], reElem[0], {
                  position: appendPosition,
                  allowBottomOut: true,
                  offset: [0, 5]
                });
              }

              updatePosition();
              $(window).on('resize.lay_select_resize', updatePosition);
            }
            var top = reElem.offset().top + reElem.outerHeight() + 5 - $win.scrollTop();
            var dlHeight = dl.outerHeight();
            var dds = dl.children('dd');

            index = select[0].selectedIndex; // 獲取最新的 selectedIndex
            title.parent().addClass(CLASS+'ed');
            dds.removeClass(HIDE);
            dts.removeClass(HIDE);

            // 初始選中樣式
            dds.removeClass(THIS);
            index >= 0 && dds.eq(index).addClass(THIS);

            // 上下定位識別
            if(top + dlHeight > $win.height() && top >= dlHeight){
              reElem.addClass(CLASS + 'up');
            }

            followScroll();

            if(needPlaceholderPatch){
              dl.off('mousedown.lay_select_ieph').on('mousedown.lay_select_ieph', function(){
                input[0].__ieph = true;
                setTimeout(function(){
                  input[0].__ieph = false;
                }, 60)
              });
            }

            removeClickOutsideEvent = lay.onClickOutside(
              isAppendTo ? reElem[0] : dl[0],
              function(){
                hideDown();
                initValue && input.val(initValue);
              },
              {ignore: title}
            );
          };

          // 隱藏下拉
          var hideDown = function(choose){
            title.parent().removeClass(CLASS+'ed ' + CLASS+'up');
            input.blur();
            isCreatable && dl.children('.' + CREATE_OPTION).remove();
            removeClickOutsideEvent && removeClickOutsideEvent();
            if(isAppendTo){
              reElem.detach();
              $(window).off('resize.lay_select_resize');
            }

            if(choose) return;

            notOption(input.val(), function(none){
              var selectedIndex = select[0].selectedIndex;

              // 未查詢到相關值
              if(none){
                initValue = $(select[0].options[selectedIndex]).html(); // 重新獲得初始選中值

                // 如果是第一項，且文本值等於 placeholder，則清空初始值
                if(selectedIndex === 0 && initValue === input.attr('placeholder')){
                  initValue = '';
                }

                // 如果有選中值，則將輸入框糾正為該值。否則清空輸入框
                input.val(initValue || '');
              }
            });
          };

          // 定位下拉滾動條
          var followScroll = function(){
            var thisDd = dl.children('dd.'+ THIS);

            if(!thisDd[0]) return;

            var posTop = thisDd.position().top;
            var dlHeight = dl.height();
            var ddHeight = thisDd.height();

            // 若選中元素在滾動條不可見底部
            if(posTop > dlHeight){
              dl.scrollTop(posTop + dl.scrollTop() - dlHeight + ddHeight - 5);
            }

            // 若選擇元素在滾動條不可見頂部
            if(posTop < 0){
              dl.scrollTop(posTop + dl.scrollTop() - 5);
            }
          };

          // 點擊標題區域
          title.on('click', function(e){
            title.parent().hasClass(CLASS+'ed') ? (
              hideDown()
            ) : (
              showDown()
            );
            dl.find('.'+NONE).remove();
          });

          // 點擊箭頭獲取焦點
          title.find('.layui-edge').on('click', function(){
            input.focus();
          });

          // select 中 input 鍵盤事件
          input.on('keyup', function(e){ // 鍵盤松開
            var keyCode = e.keyCode;

            // Tab鍵展開
            if(keyCode === 9){
              showDown();
            }
          }).on('keydown', function(e){ // 鍵盤按下
            var keyCode = e.keyCode;

            // Tab鍵隱藏
            if(keyCode === 9){
              hideDown();
            }

            // 標註 dd 的選中狀態
            var setThisDd = function(prevNext){
              e.preventDefault();
              var allDisplayedElem = dl.children('dd:not(.'+ HIDE +',.'+ DISABLED +')');
              if(!allDisplayedElem.length) return;
              var firstIndex = 0;
              var lastIndex = allDisplayedElem.length - 1;
              var selectedIndex = -1;

              layui.each(allDisplayedElem, function(index, el){
                if($(el).hasClass(THIS)){
                  selectedIndex = index;
                  return true;
                }
              })

              var nextIndex = prevNext === 'prev'
                ? (selectedIndex - 1 < firstIndex ? lastIndex : selectedIndex - 1)
                : (selectedIndex + 1 > lastIndex ? firstIndex : selectedIndex + 1)

              var selectedElem = allDisplayedElem.eq(nextIndex);
              selectedElem.addClass(THIS).siblings().removeClass(THIS); // 標註樣式
              followScroll(); // 定位滾動條
            };

            if(keyCode === 38) setThisDd('prev'); // Up 鍵
            if(keyCode === 40) setThisDd('next'); // Down 鍵

            // Enter 鍵
            if(keyCode === 13){
              e.preventDefault();
              dl.children('dd.'+THIS).trigger('click');
            }
          }).on('paste', function(){
            showDown();
          });

          // 檢測值是否不屬於 select 項
          var notOption = function(value, callback, origin){
            var num = 0;
            var dds = dl.children('dd');
            var hasEquals = false;
            var rawValue = value;
            var fuzzyMatchRE;
            if(!laySearch.caseSensitive){
              value = value.toLowerCase();
            }
            if(laySearch.fuzzy){
              fuzzyMatchRE = fuzzyMatchRegExp(value, laySearch.caseSensitive);
            }
            layui.each(dds, function(){
              var othis = $(this);
              var text = othis.text();
              var isCreateOption = isCreatable && othis.hasClass(CREATE_OPTION);

              // 需要區分大小寫
              if(isCreatable && !isCreateOption && text === rawValue){
                hasEquals = true;
              }

              // 是否區分大小寫
              if(!laySearch.caseSensitive){
                text = text.toLowerCase();
              }

              // 匹配
              var not = laySearch.fuzzy ? !fuzzyMatchRE.test(text) : text.indexOf(value) === -1;

              if(value === '' || (origin === 'blur') ? value !== text : not) num++;
              origin === 'keyup' && othis[(isCreatable ? (not && !isCreateOption) : not) ? 'addClass' : 'removeClass'](HIDE);
            });
            // 處理 select 分組元素
            origin === 'keyup' && layui.each(dts, function(){
              var othis = $(this);
              var thisDds = othis.nextUntil('dt').filter('dd'); // 當前分組下的dd元素
              if(isCreatable) thisDds = thisDds.not('.' + CREATE_OPTION);
              var allHide = thisDds.length == thisDds.filter('.' + HIDE).length; // 當前分組下所有dd元素都隱藏了
              othis[allHide ? 'addClass' : 'removeClass'](HIDE);
            });
            var none = num === dds.length;
            return callback(none, hasEquals), none;
          };

          // 搜索匹配
          var search = function(e){
            var value = this.value, keyCode = e.keyCode;

            if(keyCode === 9 || keyCode === 13
              || keyCode === 37 || keyCode === 38
              || keyCode === 39 || keyCode === 40
            ){
              return false;
            }

            if(needPlaceholderPatch && e.target.__ieph){
              e.target.__ieph = false;
              return false;
            }

            notOption(value, function(none, hasEquals){
              if(isCreatable){
                if(hasEquals){
                  dl.children('.' + CREATE_OPTION).remove();
                }else{
                  var createOptionElem = dl.children('.' + CREATE_OPTION);
                  if(createOptionElem[0]){
                    createOptionElem.attr('lay-value', value).html(util.escape(value));
                  }else{
                    // 臨時顯示在頂部
                    var ddElem = $('<dd>').addClass(CREATE_OPTION).attr('lay-value', value).html(util.escape(value));
                    var firstOptionELem = dl.children().eq(0);
                    var hasTips = firstOptionELem.hasClass('layui-select-tips');
                    firstOptionELem[hasTips ? 'after' : 'before'](ddElem);
                  }
                }
              }else{
                if(none){
                  dl.find('.'+NONE)[0] || dl.append('<p class="'+ NONE +'">無匹配項</p>');
                } else {
                  dl.find('.'+NONE).remove();
                }
              }
            }, 'keyup');

            // 當搜索值清空時
            if(value === ''){
              // 取消選中項
              select.val('');
              dl.find('.'+ THIS).removeClass(THIS);
              (select[0].options[0] || {}).value || dl.children('dd:eq(0)').addClass(THIS);
              dl.find('.'+ NONE).remove();
              isCreatable && dl.children('.' + CREATE_OPTION).remove();
            }

            followScroll(); // 定位滾動條
          };

          if(isSearch){
            input.on('input propertychange', layui.debounce(search, 50)).on('blur', function(e){
              var selectedIndex = select[0].selectedIndex;

              initValue = $(select[0].options[selectedIndex]).text(); // 重新獲得初始選中值

              // 如果是第一項，且文本值等於 placeholder，則清空初始值
              if(selectedIndex === 0 && initValue === input.attr('placeholder')){
                initValue = '';
              }

              setTimeout(function(){
                notOption(input.val(), function(none){
                  initValue || input.val(''); // none && !initValue
                }, 'blur');
              }, 200);
            });
          }

          // 選擇
          dl.on('click', 'dd', function(){
            var othis = $(this), value = othis.attr('lay-value');
            var filter = select.attr('lay-filter'); // 獲取過濾器

            if(othis.hasClass(DISABLED)) return false;

            if(othis.hasClass('layui-select-tips')){
              input.val('');
            } else {
              input.val(othis.text());
              othis.addClass(THIS);
            }

            // 將新增的 option 元素添加到末尾
            if(isCreatable && othis.hasClass(CREATE_OPTION)){
              dl.append(othis.removeClass(CREATE_OPTION));
              var optionElem = $('<option>').attr('value', value).text(othis.text());
              select.append(optionElem);
            }

            othis.siblings().removeClass(THIS);
            select.val(value).removeClass('layui-form-danger');

            layui.event.call(this, MOD_NAME, 'select('+ filter +')', {
              elem: select[0]
              ,value: value
              ,othis: reElem
            });

            hideDown(true);
            return false;
          });

          // 用於開啟 lay-append-to 時兼容 dropdown
          dl.on('mousedown pointerdown touchstart', function(e){
            layui.stope(e);
          })

          reElem.find('dl>dt').on('click', function(e){
            return false;
          });

          if(isAppendTo){
            titleElem.on('_lay-select-destroy', function(){
              reElem.remove();
            })
          }
        }

        // 僅 appendTo 使用，移除觸發元素時，自動移除面板元素
        $.event.special['_lay-select-destroy'] = {
          remove: function( handleObj ) {
            handleObj.handler();
          }
        };

        // 初始渲染 select 組件選項
        selects.each(function(index, select){
          var othis = $(this);
          var hasRender = othis.next('.'+CLASS);
          var disabled = this.disabled;
          var value = select.value;
          var selected = $(select.options[select.selectedIndex]); // 獲取當前選中項
          var optionsFirst = select.options[0];

          if(typeof othis.attr('lay-ignore') === 'string') return othis.show();

          var isSearch = typeof othis.attr('lay-search') === 'string'
          var isCreatable = typeof othis.attr('lay-creatable') === 'string' && isSearch
          var isAppendTo = typeof othis.attr('lay-append-to') === 'string'
          var placeholder = optionsFirst
            ? (optionsFirst.value ? TIPS : (optionsFirst.innerHTML || TIPS))
            : TIPS;

          // 替代元素
          var reElem = $(['<div class="'+ (isSearch ? '' : 'layui-unselect ') + CLASS
          ,(disabled ? ' layui-select-disabled' : '') + '"></div>'].join(''));

          var triggerElem = $([
            '<div class="'+ TITLE +'">'
              ,('<input type="text" placeholder="'+ util.escape($.trim(placeholder)) +'" '
                +('value="'+ util.escape($.trim(value ? selected.html() : '')) +'"') // 默認值
                +((!disabled && isSearch) ? '' : ' readonly') // 是否開啟搜索
                +' class="layui-input'
                +(isSearch ? '' : ' layui-unselect')
              + (disabled ? (' ' + DISABLED) : '') +'">') // 禁用狀態
              ,'<i class="layui-edge"></i>'
            ,'</div>'].join(''));

          var contentElem = $(['<dl class="layui-anim layui-anim-upbit'+ (othis.find('optgroup')[0] ? ' layui-select-group' : '') +'">'
            ,function(options){
              var arr = [];
              layui.each(options, function(index, item){
                var tagName = item.tagName.toLowerCase();

                if(index === 0 && !item.value && tagName !== 'optgroup'){
                  arr.push('<dd lay-value="" class="layui-select-tips">'+ $.trim(item.innerHTML || TIPS) +'</dd>');
                } else if(tagName === 'optgroup'){
                  arr.push('<dt>'+ item.label +'</dt>');
                } else {
                  arr.push('<dd lay-value="'+ util.escape(item.value) +'" class="'+ (value === item.value ?  THIS : '') + (item.disabled ? (' '+DISABLED) : '') +'">'+ $.trim(item.innerHTML) +'</dd>');
                }
              });
              arr.length === 0 && arr.push('<dd lay-value="" class="'+ DISABLED +'">沒有選項</dd>');
              return arr.join('');
            }(othis.find('*')) +'</dl>'
          ].join(''));

          // 如果已經渲染，則Rerender
          if(hasRender[0]){
            if(isAppendTo){
              var panelWrapElem = hasRender.data(PANEL_ELEM_DATA);
              panelWrapElem && panelWrapElem.remove();
            }
            hasRender.remove();
          }
          if(isAppendTo){
            reElem.append(triggerElem);
            othis.after(reElem);
            var contentWrapElem = $('<div class="'+ CLASS + ' ' + PANEL_WRAP +'"></div>').append(contentElem);
            reElem.data(PANEL_ELEM_DATA, contentWrapElem); // 將面板元素對象記錄在觸發元素 data 中，重新渲染時需要清理舊面板元素
            events.call(this, contentWrapElem, triggerElem, disabled, isSearch, isCreatable, isAppendTo);
          }else{
            reElem.append(triggerElem).append(contentElem);
            othis.after(reElem);
            events.call(this, reElem, triggerElem, disabled, isSearch, isCreatable, isAppendTo);
          }
        });
      }

      // 複選框/開關
      ,checkbox: function(elem){
        var CLASS = {
          "checkbox": ['layui-form-checkbox', 'layui-form-checked', 'checkbox'],
          "switch": ['layui-form-switch', 'layui-form-onswitch', 'switch'],
          SUBTRA: 'layui-icon-indeterminate'
        };
        var checks = elem || elemForm.find('input[type=checkbox]');
        // 風格
        var skins = {
          "primary": true, // 默認風格
          "tag": true, // 標籤風格
          "switch": true // 開關風格
        };
        // 事件
        var events = function(reElem, RE_CLASS){
          var check = $(this);
          var skin = check.attr('lay-skin') || 'primary';
          var isSwitch = skin === 'switch';
          var isPrimary = skin === 'primary';

          // 勾選
          reElem.on('click', function(){
            var filter = check.attr('lay-filter') // 獲取過濾器

            // 禁用
            if(check[0].disabled) return;

            // 半選
            if (check[0].indeterminate) {
              check[0].indeterminate = false;
            }

            // 開關
            check[0].checked = !check[0].checked

            // 事件
            layui.event.call(check[0], MOD_NAME, RE_CLASS[2]+'('+ filter +')', {
              elem: check[0],
              value: check[0].value,
              othis: reElem
            });
          });

          that.syncAppearanceOnPropChanged(this, 'checked', function(){
            if(isSwitch){
              var title = (reElem.next('*[lay-checkbox]')[0]
                ? reElem.next().html()
                : check.attr('title') || ''
              ).split('|');
              reElem.children('div').html(this.checked ? title[0] : title[1] || title[0]);
            }
            reElem.toggleClass(RE_CLASS[1], this.checked);
          });

          if(isPrimary){
            that.syncAppearanceOnPropChanged(this, 'indeterminate', function(){
              if(this.indeterminate){
                reElem.children('.layui-icon-ok').removeClass('layui-icon-ok').addClass(CLASS.SUBTRA);
              }else{
                reElem.children('.'+ CLASS.SUBTRA).removeClass(CLASS.SUBTRA).addClass('layui-icon-ok');
              }
            })
          }
        };

        // 遍歷複選框
        checks.each(function(index, check){
          var othis = $(this);
          var skin = othis.attr('lay-skin') || 'primary';
          var title = util.escape($.trim(check.title || function(){ // 向下兼容 lay-text 屬性
            return check.title = othis.attr('lay-text') || '';
          }()));
          var disabled = this.disabled;

          // if(!skins[skin]) skin = 'primary'; // 若非內置風格，則強制為默認風格
          var RE_CLASS = CLASS[skin] || CLASS.checkbox;

          // 替代元素
          var hasRender = othis.next('.' + RE_CLASS[0]);
          hasRender[0] && hasRender.remove(); // 若已經渲染，則 Rerender

          // 若存在標題模板，則優先讀取標題模板
          var titleTplAttrs = [];
          if(othis.next('[lay-checkbox]')[0]){
            var titleTplElem = othis.next();
            title = titleTplElem.html() || '';
            if(titleTplElem[0].attributes.length > 1){
              layui.each(titleTplElem[0].attributes, function(i, attr){
                if(attr.name !== 'lay-checkbox'){
                  titleTplAttrs.push(attr.name + '="' + attr.value + '"')
                }
              })
            }
          }
          titleTplAttrs = titleTplAttrs.join(' ');

          // 若為開關，則對 title 進行分隔解析
          title = skin === 'switch' ? title.split('|') : [title];

          if(typeof othis.attr('lay-ignore') === 'string') return othis.show();

          // 處理 IE8 indeterminate 屬性重新定義 get set 後無法設置值的問題
          if(needCheckboxFallback){
            toggleAttribute.call(check, 'lay-form-sync-checked', check.checked);
            !check.checked && toggleAttribute.call(check, 'lay-form-sync-indeterminate', check.indeterminate);
          }

          // 替代元素
          var reElem = $(['<div class="layui-unselect '+ RE_CLASS[0],
            (check.checked ? (' '+ RE_CLASS[1]) : ''), // 選中狀態
            (disabled ? ' layui-checkbox-disabled '+ DISABLED : ''), // 禁用狀態
            '"',
            (skin ? ' lay-skin="'+ skin +'"' : ''), // 風格
          '>',
          function(){ // 不同風格的內容
            var type = {
              // 複選框
              "checkbox": [
                (title[0] ? ('<div ' + titleTplAttrs +'>'+ title[0] +'</div>') : (skin === 'primary' ? '' : '<div></div>')),
                '<i class="layui-icon '+(skin === 'primary' && !check.checked && othis.get(0).indeterminate ? CLASS.SUBTRA : 'layui-icon-ok')+'"></i>'
              ].join(''),
              // 開關
              "switch": '<div>'+ ((check.checked ? title[0] : (title[1] || title[0])) || '') +'</div><i></i>'
            };
            return type[skin] || type['checkbox'];
          }(),
          '</div>'].join(''));

          othis.after(reElem);
          events.call(this, reElem, RE_CLASS);
        });
      }

      // 單選框
      ,radio: function(elem){
        var CLASS = 'layui-form-radio';
        var ICON = ['layui-icon-radio', 'layui-icon-circle'];
        var radios = elem || elemForm.find('input[type=radio]');

        // 事件
        var events = function(reElem){
          var radio = $(this);
          var ANIM = 'layui-anim-scaleSpring';

          reElem.on('click', function(){
            var filter = radio.attr('lay-filter'); // 獲取過濾器

            if(radio[0].disabled) return;

            radio[0].checked = true;

            layui.event.call(radio[0], MOD_NAME, 'radio('+ filter +')', {
              elem: radio[0],
              value: radio[0].value,
              othis: reElem
            });
          });

          that.syncAppearanceOnPropChanged(this, 'checked', function(){
            var radioEl = this;
            if(radioEl.checked){
              reElem.addClass(CLASS + 'ed');
              reElem.children('.layui-icon').addClass(ANIM + ' ' + ICON[0]);
              var forms = radio.parents(ELEM);
              var sameRadios = forms.find('input[name='+ radioEl.name.replace(/(\.|#|\[|\])/g, '\\$1') +']'); // 找到相同name的兄弟
              layui.each(sameRadios, function(){
                if(radioEl === this)return;
                this.checked = false;
              });
            }else{
              reElem.removeClass(CLASS + 'ed');
              reElem.children('.layui-icon').removeClass(ANIM + ' ' + ICON[0]).addClass(ICON[1]);
            }
          })
        };

        // 初始渲染
        radios.each(function(index, radio){
          var othis = $(this), hasRender = othis.next('.' + CLASS);
          var disabled = this.disabled;
          var skin = othis.attr('lay-skin');

          if(typeof othis.attr('lay-ignore') === 'string') return othis.show();

          if(needCheckboxFallback){
            toggleAttribute.call(radio, 'lay-form-sync-checked', radio.checked);
          }

          hasRender[0] && hasRender.remove(); // 如果已經渲染，則Rerender

          var title = util.escape(radio.title || '');
          var titleTplAttrs = [];
          if(othis.next('[lay-radio]')[0]){
            var titleTplElem = othis.next();
            title = titleTplElem.html() || '';
            if(titleTplElem[0].attributes.length > 1){
              layui.each(titleTplElem[0].attributes, function(i, attr){
                if(attr.name !== 'lay-radio'){
                  titleTplAttrs.push(attr.name + '="' + attr.value + '"')
                }
              })
            }
          }
          titleTplAttrs = titleTplAttrs.join(' ');

          // 替代元素
          var reElem = $(['<div class="layui-unselect '+ CLASS,
            (radio.checked ? (' '+ CLASS +'ed') : ''), // 選中狀態
          (disabled ? ' layui-radio-disabled '+DISABLED : '') +'"', // 禁用狀態
          (skin ? ' lay-skin="'+ skin +'"' : ''),
          '>',
          '<i class="layui-anim layui-icon '+ ICON[radio.checked ? 0 : 1] +'"></i>',
          '<div ' + titleTplAttrs +'>'+ title +'</div>',
          '</div>'].join(''));

          othis.after(reElem);
          events.call(this, reElem);
        });
      }
    };

    // 執行所有渲染項
    var renderItem = function(){
      layui.each(items, function(index, item){
        item();
      });
    };

    // jquery 對象
    if (layui.type(type) === 'object') {
      // 若對象為表單域容器
      if($(type).is(ELEM)){
        elemForm = $(type);
        renderItem();
      } else { // 對象為表單項
        type.each(function (index, item) {
          var elem = $(item);
          if (!elem.closest(ELEM).length) {
            return; // 若不在 layui-form 容器中直接跳過
          }
          if (item.tagName === 'SELECT') {
            items['select'](elem);
          } else if (item.tagName === 'INPUT') {
            var itemType = item.type;
            if (itemType === 'checkbox' || itemType === 'radio') {
              items[itemType](elem);
            } else {
              items['input'](elem);
            }
          }
        });
      }
    } else {
      type ? (
        items[type] ? items[type]() : hint.error('不支持的 "'+ type + '" 表單渲染')
      ) : renderItem();
    }
    return that;
  };

  /**
   * checkbox 和 radio 指定屬性變化時自動更新 UI
   * 只能用於 boolean 屬性
   * @param {HTMLInputElement} elem - HTMLInput 元素
   * @param {'checked' | 'indeterminate'} propName - 屬性名
   * @param {() => void} handler - 屬性值改變時執行的回調
   * @see https://learn.microsoft.com/zh-cn/previous-versions//ff382725(v=vs.85)?redirectedfrom=MSDN
   */
  Form.prototype.syncAppearanceOnPropChanged = function(){
    // 處理 IE8 indeterminate 屬性重新定義 get set 後無法設置值的問題
    // 此處性能敏感，不希望每次賦值取值時都判斷是否需要 fallback
    if (needCheckboxFallback) {
      return function(elem, propName, handler) {
        var originProps = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, propName);

        Object.defineProperty(elem, propName,
          lay.extend({}, originProps, {
            // 此處的 get 是為了兼容 IE<9
            get: function(){
              return typeof this.getAttribute('lay-form-sync-' + propName) === 'string';
            },
            set: function (newValue) {
              toggleAttribute.call(this, 'lay-form-sync-' + propName, newValue);
              handler.call(this);
            }
          })
        );
      }
    }
    return function(elem, propName, handler){
      var originProps = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, propName);

      Object.defineProperty(elem, propName,
        lay.extend({}, originProps, {
          // 此處的 get 是為了兼容 IE<9
          get: function(){
            return originProps.get.call(this);
          },
          set: function (newValue) {
            originProps.set.call(this, newValue);
            handler.call(this);
          }
        })
      );
    }
  }()

  /**
   * 主動觸發驗證
   * @param  {(string|HTMLElement|JQuery)} elem - 要驗證的區域表單元素
   * @return {boolean} 返回結果。若驗證通過，返回 `true`, 否則返回 `false`
   */
  Form.prototype.validate = function(elem) {
    var that = this;
    var intercept; // 攔截標識
    var options = that.config; // 獲取全局配置項
    var verify = options.verify; // 驗證規則
    var DANGER = 'layui-form-danger'; // 警示樣式

    elem = $(elem);

    // 節點不存在可視為 true
    if (!elem[0]) return !0;

    // 若節點不存在特定屬性，則查找容器內有待驗證的子節點
    if (elem.attr('lay-verify') === undefined) {
      // 若校驗的是一個不帶驗證規則的容器，校驗內部的 lay-verify 節點
      if (that.validate(elem.find('*[lay-verify]')) === false) {
        return false;
      }
    }

    // 開始校驗
    layui.each(elem, function(_, item) {
      var othis = $(this);
      var verifyStr = othis.attr('lay-verify') || '';
      var vers = verifyStr.split('|');
      var verType = othis.attr('lay-vertype'); // 提示方式
      var value = othis.val();
      value = typeof value === 'string' ? $.trim(value) : value;

      othis.removeClass(DANGER); // 移除警示樣式

      // 遍歷元素綁定的驗證規則
      layui.each(vers, function(_, thisVer) {
        var verst; // 校驗結果
        var errorText = ''; // 錯誤提示文本
        var rule = verify[thisVer]; // 獲取校驗規則

        // 匹配驗證規則
        if (rule) {
          verst = typeof rule === 'function'
            ? errorText = rule(value, item)
          : !rule[0].test(value); // 兼容早期數組中的正則寫法

          // 是否屬於美化替換後的表單元素
          var isForm2Elem = item.tagName.toLowerCase() === 'select' || (
            /^(checkbox|radio)$/.test(item.type)
          );

          errorText = errorText || rule[1];

          // 獲取自定義必填項提示文本
          if (thisVer === 'required') {
            errorText = othis.attr('lay-reqtext') || errorText;
          }

          // 若命中校驗規則
          if (verst) {
            // 提示層風格
            if (verType === 'tips') {
              layer.tips(errorText, function(){
                if(typeof othis.attr('lay-ignore') !== 'string'){
                  if(isForm2Elem){
                    return othis.next();
                  }
                }
                return othis;
              }(), {tips: 1});
            } else if(verType === 'alert') {
              layer.alert(errorText, {title: '提示', shadeClose: true});
            }
            // 若返回的為字符或數字，則自動彈出默認提示框；否則由 verify 方法中處理提示
            else if(/\b(string|number)\b/.test(typeof errorText)) {
              layer.msg(errorText, {icon: 5, shift: 6});
            }

            setTimeout(function() {
              (isForm2Elem ? othis.next().find('input') : item).focus();
            }, 7);

            othis.addClass(DANGER);
            return intercept = true;
          }
        }
      });

      if (intercept) return intercept;
    });

    return !intercept;
  };

  // 提交表單並校驗
  var submit = Form.prototype.submit = function(filter, callback){
    var field = {};  // 字段集合
    var button = $(this); // 當前觸發的按鈕

    // 表單域 lay-filter 屬性值
    var layFilter = typeof filter === 'string'
      ? filter
    : button.attr('lay-filter');

    // 當前所在表單域
    var elem = this.getFormElem
      ? this.getFormElem(layFilter)
    : button.parents(ELEM).eq(0);

    // 獲取需要校驗的元素
    var verifyElem = elem.find('*[lay-verify]');

    // 開始校驗
    if(!form.validate(verifyElem)) return false;

    // 獲取當前表單值
    field = form.getValue(null, elem);

    // 返回的參數
    var params = {
      elem: this.getFormElem ? (window.event && window.event.target) : this // 觸發事件的對象
      ,form: this.getFormElem ? elem[0] : button.parents('form')[0] // 當前所在的 form 元素，如果存在的話
      ,field: field // 當前表單數據
    };

    // 回調
    typeof callback === 'function' && callback(params);

    // 事件
    return layui.event.call(this, MOD_NAME, 'submit('+ layFilter +')', params);
  };

  function fuzzyMatchRegExp(keyword, caseSensitive) {
    var wordMap = {};
    var regexPattern = ['^'];
    var escapeRegExp = function(str){
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    if(!caseSensitive)keyword = keyword.toLowerCase();

    // 統計關鍵字中各字符出現次數
    var wordArr = keyword.trim().split('');
    for (var i = 0; i < wordArr.length; i++) {
      var c = wordArr[i];
      wordMap[c] = (wordMap[c] || 0) + 1;
    }

    // 構建正則表達式模式
    for (c in wordMap) {
      regexPattern.push('(?=.*');
      for (var i = 0; i < wordMap[c]; i++) {
        regexPattern.push(escapeRegExp(c));
        if (i !== wordMap[c] - 1) {
          regexPattern.push('.*'); // 在字符之間添加任意字符匹配
        }
      }
      regexPattern.push(')');
    }
    regexPattern.push('.*');

    return new RegExp(regexPattern.join(''), !caseSensitive ? 'i' : undefined);
  }

  // 引用自 https://github.com/msn0/mdn-polyfills/blob/master/src/Element.prototype.toggleAttribute/toggleattribute.js
  function toggleAttribute(name, force) {
    var forcePassed = arguments.length === 2;
    var forceOn = !!force;
    var forceOff = forcePassed && !force;

    if (this.getAttribute(name) !== null) {
        if (forceOn) return true;

        this.removeAttribute(name);
        return false;
    } else {
        if (forceOff) return false;

        this.setAttribute(name, '');
        return true;
    }
  }

  var form = new Form();
  var $dom = $(document);
  var $win = $(window);

  // 初始自動完成渲染
  $(function(){
    form.render();
  });

  // 表單 reset 重置渲染
  $dom.on('reset', ELEM, function(){
    var filter = $(this).attr('lay-filter');
    setTimeout(function(){
      form.render(null, filter);
    }, 50);
  });

  // 表單提交事件
  $dom.on('submit', ELEM, submit)
  .on('click', '*[lay-submit]', submit);
  
  exports(MOD_NAME, form);
});

 
