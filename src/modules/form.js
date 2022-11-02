/**
 * form 表單組件
 */

layui.define(['layer', 'util'], function(exports){
  "use strict";

  var $ = layui.$;
  var layer = layui.layer;
  var util = layui.util;
  var hint = layui.hint();
  var device = layui.device();

  var MOD_NAME = 'form', ELEM = '.layui-form', THIS = 'layui-this';
  var SHOW = 'layui-show', HIDE = 'layui-hide', DISABLED = 'layui-disabled';

  var Form = function(){
    this.config = {
      verify: {
        required: [
          /[\S]+/
          ,'必填項不能為空'
        ]
        ,phone: [
          /^1\d{10}$/
          ,'請輸入正確的手機號'
        ]
        ,email: [
          /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
          ,'郵箱格式不正確'
        ]
        ,url: [
          /^(#|(http(s?)):\/\/|\/\/)[^\s]+\.[^\s]+$/
          ,'鏈接格式不正確'
        ]
        ,number: function(value){
          if(!value || isNaN(value)) return '只能填寫數字'
        }
        ,date: [
          /^(\d{4})[-\/](\d{1}|0\d{1}|1[0-2])([-\/](\d{1}|0\d{1}|[1-2][0-9]|3[0-1]))*$/
          ,'日期格式不正確'
        ]
        ,identity: [
          /(^\d{15}$)|(^\d{17}(x|X|\d)$)/
          ,'請輸入正確的身份證號'
        ]
      }
      ,autocomplete: null // 全局 autocomplete 狀態。null 表示不干預
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
            if(this.value == value ){
              this.checked = true
            }
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

      if(/^checkbox|radio$/.test(item.type) && !item.checked) return;  // 複選框和單選框未選中，不記錄字段
      field[init_name || item.name] = item.value;
    });

    return field;
  };

  // 表單控件渲染
  Form.prototype.render = function(type, filter){
    var that = this
    ,options = that.config
    ,elemForm = $(ELEM + function(){
      return filter ? ('[lay-filter="' + filter +'"]') : '';
    }())
    ,items = {
      // 輸入框
      input: function(elem){
        var inputs = elem || elemForm.find('input,textarea');

        // 初始化全局的 autocomplete
        options.autocomplete && inputs.attr('autocomplete', options.autocomplete);
      }

      // 下拉選擇框
      ,select: function(elem){
        var TIPS = '請選擇', CLASS = 'layui-form-select', TITLE = 'layui-select-title'
        ,NONE = 'layui-select-none', initValue = '', thatInput
        ,selects = elem || elemForm.find('select')

        // 隱藏 select
        ,hide = function(e, clear){
          if(!$(e.target).parent().hasClass(TITLE) || clear){
            $('.'+CLASS).removeClass(CLASS+'ed ' + CLASS+'up');
            thatInput && initValue && thatInput.val(initValue);
          }
          thatInput = null;
        }

        // 各種事件
        ,events = function(reElem, disabled, isSearch){
          var select = $(this)
          ,title = reElem.find('.' + TITLE)
          ,input = title.find('input')
          ,dl = reElem.find('dl')
          ,dds = dl.children('dd')
          ,dts = dl.children('dt') // select分組dt元素
          ,index =  this.selectedIndex // 當前選中的索引
          ,nearElem; // select 組件當前選中的附近元素，用於輔助快捷鍵功能

          if(disabled) return;

          // 搜索項
          var laySearch = select.attr('lay-search');

          // 展開下拉
          var showDown = function(){
            var top = reElem.offset().top + reElem.outerHeight() + 5 - $win.scrollTop()
            ,dlHeight = dl.outerHeight();

            index = select[0].selectedIndex; // 獲取最新的 selectedIndex
            reElem.addClass(CLASS+'ed');
            dds.removeClass(HIDE);
            dts.removeClass(HIDE);
            nearElem = null;

            // 初始選中樣式
            dds.eq(index).addClass(THIS).siblings().removeClass(THIS);

            // 上下定位識別
            if(top + dlHeight > $win.height() && top >= dlHeight){
              reElem.addClass(CLASS + 'up');
            }

            followScroll();
          }

          // 隱藏下拉
          ,hideDown = function(choose){
            reElem.removeClass(CLASS+'ed ' + CLASS+'up');
            input.blur();
            nearElem = null;

            if(choose) return;

            notOption(input.val(), function(none){
              var selectedIndex = select[0].selectedIndex;

              // 未查詢到相關值
              if(none){
                initValue = $(select[0].options[selectedIndex]).html(); // 重新獲得初始選中值

                // 如果是第一項，且文本值等於 placeholder，則清空初始值
                if(selectedIndex === 0 && initValue === input.attr('placeholder')){
                  initValue = '';
                };

                // 如果有選中值，則將輸入框糾正為該值。否則清空輸入框
                input.val(initValue || '');
              }
            });
          }

          // 定位下拉滾動條
          ,followScroll = function(){
            var thisDd = dl.children('dd.'+ THIS);

            if(!thisDd[0]) return;

            var posTop = thisDd.position().top
            ,dlHeight = dl.height()
            ,ddHeight = thisDd.height();

            // 若選中元素在滾動條不可見底部
            if(posTop > dlHeight){
              dl.scrollTop(posTop + dl.scrollTop() - dlHeight + ddHeight - 5);
            }

            // 若選擇玄素在滾動條不可見頂部
            if(posTop < 0){
              dl.scrollTop(posTop + dl.scrollTop() - 5);
            }
          };

          // 點擊標題區域
          title.on('click', function(e){
            reElem.hasClass(CLASS+'ed') ? (
              hideDown()
            ) : (
              hide(e, true),
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
            var setThisDd = function(prevNext, thisElem1){
              var nearDd, cacheNearElem
              e.preventDefault();

              // 得到當前隊列元素
              var thisElem = function(){
                var thisDd = dl.children('dd.'+ THIS);

                // 如果是搜索狀態，且按 Down 鍵，且當前可視 dd 元素在選中元素之前，
                // 則將當前可視 dd 元素的上一個元素作為虛擬的當前選中元素，以保證遞歸不中斷
                if(dl.children('dd.'+  HIDE)[0] && prevNext === 'next'){
                  var showDd = dl.children('dd:not(.'+ HIDE +',.'+ DISABLED +')')
                  ,firstIndex = showDd.eq(0).index();
                  if(firstIndex >=0 && firstIndex < thisDd.index() && !showDd.hasClass(THIS)){
                    return showDd.eq(0).prev()[0] ? showDd.eq(0).prev() : dl.children(':last');
                  }
                }

                if(thisElem1 && thisElem1[0]){
                  return thisElem1;
                }
                if(nearElem && nearElem[0]){
                  return nearElem;
                }

                return thisDd;
                // return dds.eq(index);
              }();

              cacheNearElem = thisElem[prevNext](); // 當前元素的附近元素
              nearDd =  thisElem[prevNext]('dd:not(.'+ HIDE +')'); // 當前可視元素的 dd 元素

              // 如果附近的元素不存在，則停止執行，並清空 nearElem
              if(!cacheNearElem[0]) return nearElem = null;

              // 記錄附近的元素，讓其成為下一個當前元素
              nearElem = thisElem[prevNext]();

              // 如果附近不是 dd ，或者附近的 dd 元素是禁用狀態，則進入遞歸查找
              if((!nearDd[0] || nearDd.hasClass(DISABLED)) && nearElem[0]){
                return setThisDd(prevNext, nearElem);
              }

              nearDd.addClass(THIS).siblings().removeClass(THIS); // 標註樣式
              followScroll(); // 定位滾動條
            };

            if(keyCode === 38) setThisDd('prev'); // Up 鍵
            if(keyCode === 40) setThisDd('next'); // Down 鍵

            // Enter 鍵
            if(keyCode === 13){
              e.preventDefault();
              dl.children('dd.'+THIS).trigger('click');
            }
          });

          // 檢測值是否不屬於 select 項
          var notOption = function(value, callback, origin){
            var num = 0;
            layui.each(dds, function(){
              var othis = $(this);
              var text = othis.text();

              // 是否區分大小寫
              if(laySearch !== 'cs'){
                text = text.toLowerCase();
                value = value.toLowerCase();
              }

              // 匹配
              var not = text.indexOf(value) === -1;

              if(value === '' || (origin === 'blur') ? value !== text : not) num++;
              origin === 'keyup' && othis[not ? 'addClass' : 'removeClass'](HIDE);
            });
            // 處理select分組元素
            origin === 'keyup' && layui.each(dts, function(){
              var othis = $(this)
              ,thisDds = othis.nextUntil('dt').filter('dd') // 當前分組下的dd元素
              ,allHide = thisDds.length == thisDds.filter('.' + HIDE).length; // 當前分組下所有dd元素都隱藏了
              othis[allHide ? 'addClass' : 'removeClass'](HIDE);
            });
            var none = num === dds.length;
            return callback(none), none;
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

            notOption(value, function(none){
              if(none){
                dl.find('.'+NONE)[0] || dl.append('<p class="'+ NONE +'">無匹配項</p>');
              } else {
                dl.find('.'+NONE).remove();
              }
            }, 'keyup');

            if(value === ''){
              dl.find('.'+NONE).remove();
            }

            followScroll(); // 定位滾動條
          };

          if(isSearch){
            input.on('keyup', search).on('blur', function(e){
              var selectedIndex = select[0].selectedIndex;

              thatInput = input; // 當前的 select 中的 input 元素
              initValue = $(select[0].options[selectedIndex]).html(); // 重新獲得初始選中值

              // 如果是第一項，且文本值等於 placeholder，則清空初始值
              if(selectedIndex === 0 && initValue === input.attr('placeholder')){
                initValue = '';
              };

              setTimeout(function(){
                notOption(input.val(), function(none){
                  initValue || input.val(''); // none && !initValue
                }, 'blur');
              }, 200);
            });
          }

          // 選擇
          dds.on('click', function(){
            var othis = $(this), value = othis.attr('lay-value');
            var filter = select.attr('lay-filter'); // 獲取過濾器

            if(othis.hasClass(DISABLED)) return false;

            if(othis.hasClass('layui-select-tips')){
              input.val('');
            } else {
              input.val(othis.text());
              othis.addClass(THIS);
            }

            othis.siblings().removeClass(THIS);
            select.val(value).removeClass('layui-form-danger')
            layui.event.call(this, MOD_NAME, 'select('+ filter +')', {
              elem: select[0]
              ,value: value
              ,othis: reElem
            });

            hideDown(true);
            return false;
          });

          reElem.find('dl>dt').on('click', function(e){
            return false;
          });

          $(document).off('click', hide).on('click', hide); // 點擊其它元素關閉 select
        }

        selects.each(function(index, select){
          var othis = $(this)
          ,hasRender = othis.next('.'+CLASS)
          ,disabled = this.disabled
          ,value = select.value
          ,selected = $(select.options[select.selectedIndex]) // 獲取當前選中項
          ,optionsFirst = select.options[0];

          if(typeof othis.attr('lay-ignore') === 'string') return othis.show();

          var isSearch = typeof othis.attr('lay-search') === 'string'
          ,placeholder = optionsFirst ? (
            optionsFirst.value ? TIPS : (optionsFirst.innerHTML || TIPS)
          ) : TIPS;

          // 替代元素
          var reElem = $(['<div class="'+ (isSearch ? '' : 'layui-unselect ') + CLASS
          ,(disabled ? ' layui-select-disabled' : '') +'">'
            ,'<div class="'+ TITLE +'">'
              ,('<input type="text" placeholder="'+ util.escape($.trim(placeholder)) +'" '
                +('value="'+ util.escape($.trim(value ? selected.html() : '')) +'"') // 默認值
                +((!disabled && isSearch) ? '' : ' readonly') // 是否開啟搜索
                +' class="layui-input'
                +(isSearch ? '' : ' layui-unselect')
              + (disabled ? (' ' + DISABLED) : '') +'">') // 禁用狀態
            ,'<i class="layui-edge"></i></div>'
            ,'<dl class="layui-anim layui-anim-upbit'+ (othis.find('optgroup')[0] ? ' layui-select-group' : '') +'">'
            ,function(options){
              var arr = [];
              layui.each(options, function(index, item){
                if(index === 0 && !item.value){
                  arr.push('<dd lay-value="" class="layui-select-tips">'+ $.trim(item.innerHTML || TIPS) +'</dd>');
                } else if(item.tagName.toLowerCase() === 'optgroup'){
                  arr.push('<dt>'+ item.label +'</dt>');
                } else {
                  arr.push('<dd lay-value="'+ util.escape(item.value) +'" class="'+ (value === item.value ?  THIS : '') + (item.disabled ? (' '+DISABLED) : '') +'">'+ $.trim(item.innerHTML) +'</dd>');
                }
              });
              arr.length === 0 && arr.push('<dd lay-value="" class="'+ DISABLED +'">沒有選項</dd>');
              return arr.join('');
            }(othis.find('*')) +'</dl>'
          ,'</div>'].join(''));

          hasRender[0] && hasRender.remove(); // 如果已經渲染，則Rerender
          othis.after(reElem);
          events.call(this, reElem, disabled, isSearch);
        });
      }

      // 複選框/開關
      ,checkbox: function(elem){
        var CLASS = {
          checkbox: ['layui-form-checkbox', 'layui-form-checked', 'checkbox']
          ,_switch: ['layui-form-switch', 'layui-form-onswitch', 'switch']
        }
        ,checks = elem || elemForm.find('input[type=checkbox]')

        ,events = function(reElem, RE_CLASS){
          var check = $(this);

          // 勾選
          reElem.on('click', function(){
            var filter = check.attr('lay-filter') // 獲取過濾器
            ,text = (check.attr('lay-text')||'').split('|');

            if(check[0].disabled) return;

            check[0].checked ? (
              check[0].checked = false
              ,reElem.removeClass(RE_CLASS[1]).find('em').text(text[1])
            ) : (
              check[0].checked = true
              ,reElem.addClass(RE_CLASS[1]).find('em').text(text[0])
            );

            layui.event.call(check[0], MOD_NAME, RE_CLASS[2]+'('+ filter +')', {
              elem: check[0]
              ,value: check[0].value
              ,othis: reElem
            });
          });
        }

        checks.each(function(index, check){
          var othis = $(this), skin = othis.attr('lay-skin')
          ,text = (othis.attr('lay-text') || '').split('|'), disabled = this.disabled;
          if(skin === 'switch') skin = '_'+skin;
          var RE_CLASS = CLASS[skin] || CLASS.checkbox;

          if(typeof othis.attr('lay-ignore') === 'string') return othis.show();

          // 替代元素
          var hasRender = othis.next('.' + RE_CLASS[0])
          ,reElem = $(['<div class="layui-unselect '+ RE_CLASS[0]
            ,(check.checked ? (' '+ RE_CLASS[1]) : '') // 選中狀態
            ,(disabled ? ' layui-checkbox-disabled '+ DISABLED : '') // 禁用狀態
            ,'"'
            ,(skin ? ' lay-skin="'+ skin +'"' : '') // 風格
          ,'>'
          ,function(){ // 不同風格的內容
            var title = check.title.replace(/\s/g, '')
            ,type = {
              // 複選框
              checkbox: [
                (title ? ('<span>'+ check.title +'</span>') : '')
                ,'<i class="layui-icon layui-icon-ok"></i>'
              ].join('')

              // 開關
              ,_switch: '<em>'+ ((check.checked ? text[0] : text[1]) || '') +'</em><i></i>'
            };
            return type[skin] || type['checkbox'];
          }()
          ,'</div>'].join(''));

          hasRender[0] && hasRender.remove(); // 如果已經渲染，則Rerender
          othis.after(reElem);
          events.call(this, reElem, RE_CLASS);
        });
      }

      // 單選框
      ,radio: function(elem){
        var CLASS = 'layui-form-radio', ICON = ['&#xe643;', '&#xe63f;']
        ,radios = elem || elemForm.find('input[type=radio]')

        ,events = function(reElem){
          var radio = $(this), ANIM = 'layui-anim-scaleSpring';

          reElem.on('click', function(){
            var name = radio[0].name, forms = radio.parents(ELEM);
            var filter = radio.attr('lay-filter'); // 獲取過濾器
            var sameRadio = forms.find('input[name='+ name.replace(/(\.|#|\[|\])/g, '\\$1') +']'); // 找到相同name的兄弟

            if(radio[0].disabled) return;

            layui.each(sameRadio, function(){
              var next = $(this).next('.'+CLASS);
              this.checked = false;
              next.removeClass(CLASS+'ed');
              next.find('.layui-icon').removeClass(ANIM).html(ICON[1]);
            });

            radio[0].checked = true;
            reElem.addClass(CLASS+'ed');
            reElem.find('.layui-icon').addClass(ANIM).html(ICON[0]);

            layui.event.call(radio[0], MOD_NAME, 'radio('+ filter +')', {
              elem: radio[0]
              ,value: radio[0].value
              ,othis: reElem
            });
          });
        };

        radios.each(function(index, radio){
          var othis = $(this), hasRender = othis.next('.' + CLASS), disabled = this.disabled;

          if(typeof othis.attr('lay-ignore') === 'string') return othis.show();
          hasRender[0] && hasRender.remove(); // 如果已經渲染，則Rerender

          // 替代元素
          var reElem = $(['<div class="layui-unselect '+ CLASS
            ,(radio.checked ? (' '+CLASS+'ed') : '') // 選中狀態
          ,(disabled ? ' layui-radio-disabled '+DISABLED : '') +'">' // 禁用狀態
          ,'<i class="layui-anim layui-icon">'+ ICON[radio.checked ? 0 : 1] +'</i>'
          ,'<div>'+ function(){
            var title = radio.title || '';
            if(typeof othis.next().attr('lay-radio') === 'string'){
              title = othis.next().html();
              // othis.next().remove();
            }
            return title
          }() +'</div>'
          ,'</div>'].join(''));

          othis.after(reElem);
          events.call(this, reElem);
        });
      }
    };
    if (layui.type(type) === 'object') {
      // jquery 對象
      type.each(function (index, item) {
        var elem = $(item);
        if (!elem.closest(ELEM).length) {
          // 如果不是存在layui-form中的直接跳過
          return;
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
    } else {
      type ? (
        items[type] ? items[type]() : hint.error('不支持的 "'+ type + '" 表單渲染')
      ) : layui.each(items, function(index, item){
        item();
      });
    }
    return that;
  };

  // elem 即要驗證的區域表單選擇器 -  return true or false
  Form.prototype.validate = function(elem){
    var that = this;
    var stop = null; // 驗證不通過狀態
    var verify = form.config.verify; // 驗證規則
    var DANGER = 'layui-form-danger'; // 警示樣式

    elem = $(elem);

    // 節點不存在可視為 true
    if(!elem[0]) return !0;

    // 若節點不存在特定屬性，則查找容器內有待驗證的子節點
    if(elem.attr('lay-verify') === undefined){
      // 若校驗的是一個不帶驗證規則的容器，校驗內部的 lay-verify 節點
      if (that.validate(elem.find('*[lay-verify]')) === false) {
        return false;
      }
    }

    // 開始校驗
    layui.each(elem, function(_, item){
      var othis = $(this);
      var verifyStr = othis.attr('lay-verify') || '';
      var vers = verifyStr.split('|');
      var verType = othis.attr('lay-verType'); // 提示方式
      var value = othis.val();

      othis.removeClass(DANGER); // 移除警示樣式

      // 遍歷元素綁定的驗證規則
      layui.each(vers, function(_, thisVer){
        var isTrue; // 是否命中校驗
        var errorText = ''; // 錯誤提示文本
        var rule = verify[thisVer]; // 獲取校驗規則

        // 匹配驗證規則
        if(rule){
          var isTrue = typeof rule === 'function'
            ? errorText = rule(value, item)
          : !rule[0].test(value);

          // 是否屬於美化替換後的表單元素
          var isForm2Elem = item.tagName.toLowerCase() === 'select' || (
            /^checkbox|radio$/.test(item.type)
          );

          errorText = errorText || rule[1];

          if(thisVer === 'required'){
            errorText = othis.attr('lay-reqText') || errorText;
          }

          // 若為必填項或者非空命中校驗，則阻止提交，彈出提示
          if(isTrue){
            // 提示層風格
            if(verType === 'tips'){
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
            else if(/\bstring|number\b/.test(typeof errorText)){
              layer.msg(errorText, {icon: 5, shift: 6});
            }

            setTimeout(function(){
              (isForm2Elem ? othis.next().find('input') : item).focus();
            }, 7);

            othis.addClass(DANGER);
            return stop = true;
          }
        }
      });

      if(stop) return stop;
    });

    return !stop;
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

  // 自動完成渲染
  var form = new Form()
  ,$dom = $(document), $win = $(window);

  $(function(){
    form.render();
  });

  // 表單reset重置渲染
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

 
