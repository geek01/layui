/**

 @Name：form 表單組件
 @License：MIT

 */

layui.define('layer', function(exports){
  "use strict";

  var $ = layui.$
  ,layer = layui.layer
  ,hint = layui.hint()
  ,device = layui.device()

  ,MOD_NAME = 'form', ELEM = '.layui-form', THIS = 'layui-this'
  ,SHOW = 'layui-show', HIDE = 'layui-hide', DISABLED = 'layui-disabled'

  ,Form = function(){
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
          /(^#)|(^http(s*):\/\/[^\s]+\.[^\s]+)/
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
    };
  };

  //全局設置
  Form.prototype.set = function(options){
    var that = this;
    $.extend(true, that.config, options);
    return that;
  };

  //驗證規則設定
  Form.prototype.verify = function(settings){
    var that = this;
    $.extend(true, that.config.verify, settings);
    return that;
  };

  //表單事件
  Form.prototype.on = function(events, callback){
    return layui.onevent.call(this, MOD_NAME, events, callback);
  };

  //賦值/取值
  Form.prototype.val = function(filter, object){
    var that = this
    ,formElem = $(ELEM + '[lay-filter="' + filter +'"]');

    //遍歷
    formElem.each(function(index, item){
      var itemForm = $(this);

      //賦值
      layui.each(object, function(key, value){
        var itemElem = itemForm.find('[name="'+ key +'"]')
        ,type;

        //如果對應的表單不存在，則不執行
        if(!itemElem[0]) return;
        type = itemElem[0].type;

        //如果為複選框
        if(type === 'checkbox'){
          itemElem[0].checked = value;
        } else if(type === 'radio') { //如果為單選框
          itemElem.each(function(){
            if(this.value == value ){
              this.checked = true
            }
          });
        } else { //其它類型的表單
          itemElem.val(value);
        }
      });
    });

    form.render(null, filter);

    //返回值
    return that.getValue(filter);
  };

  //取值
  Form.prototype.getValue = function(filter, itemForm){
    itemForm = itemForm || $(ELEM + '[lay-filter="' + filter +'"]').eq(0);

    var nameIndex = {} //數組 name 索引
    ,field = {}
    ,fieldElem = itemForm.find('input,select,textarea') //獲取所有表單域

    layui.each(fieldElem, function(_, item){
      item.name = (item.name || '').replace(/^\s*|\s*&/, '');

      if(!item.name) return;

      //用於支持數組 name
      if(/^.*\[\]$/.test(item.name)){
        var key = item.name.match(/^(.*)\[\]$/g)[0];
        nameIndex[key] = nameIndex[key] | 0;
        item.name = item.name.replace(/^(.*)\[\]$/, '$1['+ (nameIndex[key]++) +']');
      }

      if(/^checkbox|radio$/.test(item.type) && !item.checked) return;
      field[item.name] = item.value;
    });

    return field;
  };

  //表單控件渲染
  Form.prototype.render = function(type, filter){
    var that = this
    ,elemForm = $(ELEM + function(){
      return filter ? ('[lay-filter="' + filter +'"]') : '';
    }())
    ,items = {

      //下拉選擇框
      select: function(){
        var TIPS = '請選擇', CLASS = 'layui-form-select', TITLE = 'layui-select-title'
        ,NONE = 'layui-select-none', initValue = '', thatInput
        ,selects = elemForm.find('select')

        //隱藏 select
        ,hide = function(e, clear){
          if(!$(e.target).parent().hasClass(TITLE) || clear){
            $('.'+CLASS).removeClass(CLASS+'ed ' + CLASS+'up');
            thatInput && initValue && thatInput.val(initValue);
          }
          thatInput = null;
        }

        //各種事件
        ,events = function(reElem, disabled, isSearch){
          var select = $(this)
          ,title = reElem.find('.' + TITLE)
          ,input = title.find('input')
          ,dl = reElem.find('dl')
          ,dds = dl.children('dd')
          ,index =  this.selectedIndex //當前選中的索引
          ,nearElem; //select 組件當前選中的附近元素，用於輔助快捷鍵功能

          if(disabled) return;

          //展開下拉
          var showDown = function(){
            var top = reElem.offset().top + reElem.outerHeight() + 5 - $win.scrollTop()
            ,dlHeight = dl.outerHeight();

            index = select[0].selectedIndex; //獲取最新的 selectedIndex
            reElem.addClass(CLASS+'ed');
            dds.removeClass(HIDE);
            nearElem = null;

            //初始選中樣式
            dds.eq(index).addClass(THIS).siblings().removeClass(THIS);

            //上下定位識別
            if(top + dlHeight > $win.height() && top >= dlHeight){
              reElem.addClass(CLASS + 'up');
            }

            followScroll();
          }

          //隱藏下拉
          ,hideDown = function(choose){
            reElem.removeClass(CLASS+'ed ' + CLASS+'up');
            input.blur();
            nearElem = null;

            if(choose) return;

            notOption(input.val(), function(none){
              var selectedIndex = select[0].selectedIndex;

              //未查詢到相關值
              if(none){
                initValue = $(select[0].options[selectedIndex]).html(); //重新獲得初始選中值

                //如果是第一項，且文本值等於 placeholder，則清空初始值
                if(selectedIndex === 0 && initValue === input.attr('placeholder')){
                  initValue = '';
                };

                //如果有選中值，則將輸入框糾正為該值。否則清空輸入框
                input.val(initValue || '');
              }
            });
          }

          //定位下拉滾動條
          ,followScroll = function(){
            var thisDd = dl.children('dd.'+ THIS);

            if(!thisDd[0]) return;

            var posTop = thisDd.position().top
            ,dlHeight = dl.height()
            ,ddHeight = thisDd.height();

            //若選中元素在滾動條不可見底部
            if(posTop > dlHeight){
              dl.scrollTop(posTop + dl.scrollTop() - dlHeight + ddHeight - 5);
            }

            //若選擇玄素在滾動條不可見頂部
            if(posTop < 0){
              dl.scrollTop(posTop + dl.scrollTop() - 5);
            }
          };

          //點擊標題區域
          title.on('click', function(e){
            reElem.hasClass(CLASS+'ed') ? (
              hideDown()
            ) : (
              hide(e, true),
              showDown()
            );
            dl.find('.'+NONE).remove();
          });

          //點擊箭頭獲取焦點
          title.find('.layui-edge').on('click', function(){
            input.focus();
          });

          //select 中 input 鍵盤事件
          input.on('keyup', function(e){ //鍵盤松開
            var keyCode = e.keyCode;

            //Tab鍵展開
            if(keyCode === 9){
              showDown();
            }
          }).on('keydown', function(e){ //鍵盤按下
            var keyCode = e.keyCode;

            //Tab鍵隱藏
            if(keyCode === 9){
              hideDown();
            }

            //標註 dd 的選中狀態
            var setThisDd = function(prevNext, thisElem1){
              var nearDd, cacheNearElem
              e.preventDefault();

              //得到當前隊列元素
              var thisElem = function(){
                var thisDd = dl.children('dd.'+ THIS);

                //如果是搜索狀態，且按 Down 鍵，且當前可視 dd 元素在選中元素之前，
                //則將當前可視 dd 元素的上一個元素作為虛擬的當前選中元素，以保證遞歸不中斷
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
                //return dds.eq(index);
              }();

              cacheNearElem = thisElem[prevNext](); //當前元素的附近元素
              nearDd =  thisElem[prevNext]('dd:not(.'+ HIDE +')'); //當前可視元素的 dd 元素

              //如果附近的元素不存在，則停止執行，並清空 nearElem
              if(!cacheNearElem[0]) return nearElem = null;

              //記錄附近的元素，讓其成為下一個當前元素
              nearElem = thisElem[prevNext]();

              //如果附近不是 dd ，或者附近的 dd 元素是禁用狀態，則進入遞歸查找
              if((!nearDd[0] || nearDd.hasClass(DISABLED)) && nearElem[0]){
                return setThisDd(prevNext, nearElem);
              }

              nearDd.addClass(THIS).siblings().removeClass(THIS); //標註樣式
              followScroll(); //定位滾動條
            };

            if(keyCode === 38) setThisDd('prev'); //Up 鍵
            if(keyCode === 40) setThisDd('next'); //Down 鍵

            //Enter 鍵
            if(keyCode === 13){
              e.preventDefault();
              dl.children('dd.'+THIS).trigger('click');
            }
          });

          //檢測值是否不屬於 select 項
          var notOption = function(value, callback, origin){
            var num = 0;
            layui.each(dds, function(){
              var othis = $(this)
              ,text = othis.text()
              ,not = text.indexOf(value) === -1;
              if(value === '' || (origin === 'blur') ? value !== text : not) num++;
              origin === 'keyup' && othis[not ? 'addClass' : 'removeClass'](HIDE);
            });
            var none = num === dds.length;
            return callback(none), none;
          };

          //搜索匹配
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

            followScroll(); //定位滾動條
          };

          if(isSearch){
            input.on('keyup', search).on('blur', function(e){
              var selectedIndex = select[0].selectedIndex;

              thatInput = input; //當前的 select 中的 input 元素
              initValue = $(select[0].options[selectedIndex]).html(); //重新獲得初始選中值

              //如果是第一項，且文本值等於 placeholder，則清空初始值
              if(selectedIndex === 0 && initValue === input.attr('placeholder')){
                initValue = '';
              };

              setTimeout(function(){
                notOption(input.val(), function(none){
                  initValue || input.val(''); //none && !initValue
                }, 'blur');
              }, 200);
            });
          }

          //選擇
          dds.on('click', function(){
            var othis = $(this), value = othis.attr('lay-value');
            var filter = select.attr('lay-filter'); //獲取過濾器

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

          $(document).off('click', hide).on('click', hide); //點擊其它元素關閉 select
        }

        selects.each(function(index, select){
          var othis = $(this)
          ,hasRender = othis.next('.'+CLASS)
          ,disabled = this.disabled
          ,value = select.value
          ,selected = $(select.options[select.selectedIndex]) //獲取當前選中項
          ,optionsFirst = select.options[0];

          if(typeof othis.attr('lay-ignore') === 'string') return othis.show();

          var isSearch = typeof othis.attr('lay-search') === 'string'
          ,placeholder = optionsFirst ? (
            optionsFirst.value ? TIPS : (optionsFirst.innerHTML || TIPS)
          ) : TIPS;

          //替代元素
          var reElem = $(['<div class="'+ (isSearch ? '' : 'layui-unselect ') + CLASS
          ,(disabled ? ' layui-select-disabled' : '') +'">'
            ,'<div class="'+ TITLE +'">'
              ,('<input type="text" placeholder="'+ placeholder +'" '
                +('value="'+ (value ? selected.html() : '') +'"') //默認值
                +((!disabled && isSearch) ? '' : ' readonly') //是否開啟搜索
                +' class="layui-input'
                +(isSearch ? '' : ' layui-unselect')
              + (disabled ? (' ' + DISABLED) : '') +'">') //禁用狀態
            ,'<i class="layui-edge"></i></div>'
            ,'<dl class="layui-anim layui-anim-upbit'+ (othis.find('optgroup')[0] ? ' layui-select-group' : '') +'">'
            ,function(options){
              var arr = [];
              layui.each(options, function(index, item){
                if(index === 0 && !item.value){
                  arr.push('<dd lay-value="" class="layui-select-tips">'+ (item.innerHTML || TIPS) +'</dd>');
                } else if(item.tagName.toLowerCase() === 'optgroup'){
                  arr.push('<dt>'+ item.label +'</dt>');
                } else {
                  arr.push('<dd lay-value="'+ item.value +'" class="'+ (value === item.value ?  THIS : '') + (item.disabled ? (' '+DISABLED) : '') +'">'+ item.innerHTML +'</dd>');
                }
              });
              arr.length === 0 && arr.push('<dd lay-value="" class="'+ DISABLED +'">沒有選項</dd>');
              return arr.join('');
            }(othis.find('*')) +'</dl>'
          ,'</div>'].join(''));

          hasRender[0] && hasRender.remove(); //如果已經渲染，則Rerender
          othis.after(reElem);
          events.call(this, reElem, disabled, isSearch);
        });
      }

      //複選框/開關
      ,checkbox: function(){
        var CLASS = {
          checkbox: ['layui-form-checkbox', 'layui-form-checked', 'checkbox']
          ,_switch: ['layui-form-switch', 'layui-form-onswitch', 'switch']
        }
        ,checks = elemForm.find('input[type=checkbox]')

        ,events = function(reElem, RE_CLASS){
          var check = $(this);

          //勾選
          reElem.on('click', function(){
            var filter = check.attr('lay-filter') //獲取過濾器
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

          //替代元素
          var hasRender = othis.next('.' + RE_CLASS[0])
          ,reElem = $(['<div class="layui-unselect '+ RE_CLASS[0]
            ,(check.checked ? (' '+ RE_CLASS[1]) : '') //選中狀態
            ,(disabled ? ' layui-checkbox-disbaled '+ DISABLED : '') //禁用狀態
            ,'"'
            ,(skin ? ' lay-skin="'+ skin +'"' : '') //風格
          ,'>'
          ,function(){ //不同風格的內容
            var title = check.title.replace(/\s/g, '')
            ,type = {
              //複選框
              checkbox: [
                (title ? ('<span>'+ check.title +'</span>') : '')
                ,'<i class="layui-icon layui-icon-ok"></i>'
              ].join('')

              //開關
              ,_switch: '<em>'+ ((check.checked ? text[0] : text[1]) || '') +'</em><i></i>'
            };
            return type[skin] || type['checkbox'];
          }()
          ,'</div>'].join(''));

          hasRender[0] && hasRender.remove(); //如果已經渲染，則Rerender
          othis.after(reElem);
          events.call(this, reElem, RE_CLASS);
        });
      }

      //單選框
      ,radio: function(){
        var CLASS = 'layui-form-radio', ICON = ['&#xe643;', '&#xe63f;']
        ,radios = elemForm.find('input[type=radio]')

        ,events = function(reElem){
          var radio = $(this), ANIM = 'layui-anim-scaleSpring';

          reElem.on('click', function(){
            var name = radio[0].name, forms = radio.parents(ELEM);
            var filter = radio.attr('lay-filter'); //獲取過濾器
            var sameRadio = forms.find('input[name='+ name.replace(/(\.|#|\[|\])/g, '\\$1') +']'); //找到相同name的兄弟

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
          hasRender[0] && hasRender.remove(); //如果已經渲染，則Rerender

          //替代元素
          var reElem = $(['<div class="layui-unselect '+ CLASS
            ,(radio.checked ? (' '+CLASS+'ed') : '') //選中狀態
          ,(disabled ? ' layui-radio-disbaled '+DISABLED : '') +'">' //禁用狀態
          ,'<i class="layui-anim layui-icon">'+ ICON[radio.checked ? 0 : 1] +'</i>'
          ,'<div>'+ function(){
            var title = radio.title || '';
            if(typeof othis.next().attr('lay-radio') === 'string'){
              title = othis.next().html();
              othis.next().remove();
            }
            return title
          }() +'</div>'
          ,'</div>'].join(''));

          othis.after(reElem);
          events.call(this, reElem);
        });
      }
    };
    type ? (
      items[type] ? items[type]() : hint.error('不支持的'+ type + '表單渲染')
    ) : layui.each(items, function(index, item){
      item();
    });
    return that;
  };

  //表單提交校驗
  var submit = function(){
    var stop = null //驗證不通過狀態
    ,verify = form.config.verify //驗證規則
    ,DANGER = 'layui-form-danger' //警示樣式
    ,field = {}  //字段集合
    ,button = $(this) //當前觸發的按鈕
    ,elem = button.parents(ELEM) //當前所在表單域
    ,verifyElem = elem.find('*[lay-verify]') //獲取需要校驗的元素
    ,formElem = button.parents('form')[0] //獲取當前所在的 form 元素，如果存在的話
    ,filter = button.attr('lay-filter'); //獲取過濾器


    //開始校驗
    layui.each(verifyElem, function(_, item){
      var othis = $(this)
      ,vers = othis.attr('lay-verify').split('|')
      ,verType = othis.attr('lay-verType') //提示方式
      ,value = othis.val();

      othis.removeClass(DANGER); //移除警示樣式

      //遍歷元素綁定的驗證規則
      layui.each(vers, function(_, thisVer){
        var isTrue //是否命中校驗
        ,errorText = '' //錯誤提示文本
        ,isFn = typeof verify[thisVer] === 'function';

        //匹配驗證規則
        if(verify[thisVer]){
          var isTrue = isFn ? errorText = verify[thisVer](value, item) : !verify[thisVer][0].test(value);
          errorText = errorText || verify[thisVer][1];

          if(thisVer === 'required'){
            errorText = othis.attr('lay-reqText') || errorText;
          }

          //如果是必填項或者非空命中校驗，則阻止提交，彈出提示
          if(isTrue){
            //提示層風格
            if(verType === 'tips'){
              layer.tips(errorText, function(){
                if(typeof othis.attr('lay-ignore') !== 'string'){
                  if(item.tagName.toLowerCase() === 'select' || /^checkbox|radio$/.test(item.type)){
                    return othis.next();
                  }
                }
                return othis;
              }(), {tips: 1});
            } else if(verType === 'alert') {
              layer.alert(errorText, {title: '提示', shadeClose: true});
            }
            //如果返回的為字符或數字，則自動彈出默認提示框；否則由 verify 方法中處理提示
            else if(/\bstring|number\b/.test(typeof errorText)){
              layer.msg(errorText, {icon: 5, shift: 6});
            }

            //非移動設備自動定位焦點
            if(!device.android && !device.ios){
              setTimeout(function(){
                item.focus();
              }, 7);
            }

            othis.addClass(DANGER);
            return stop = true;
          }
        }
      });
      if(stop) return stop;
    });

    if(stop) return false;

    //獲取當前表單值
    field = form.getValue(null, elem);

    //返回字段
    return layui.event.call(this, MOD_NAME, 'submit('+ filter +')', {
      elem: this
      ,form: formElem
      ,field: field
    });
  };

  //自動完成渲染
  var form = new Form()
  ,$dom = $(document), $win = $(window);

  $(function(){
    form.render();
  });

  //表單reset重置渲染
  $dom.on('reset', ELEM, function(){
    var filter = $(this).attr('lay-filter');
    setTimeout(function(){
      form.render(null, filter);
    }, 50);
  });

  //表單提交事件
  $dom.on('submit', ELEM, submit)
  .on('click', '*[lay-submit]', submit);

  exports(MOD_NAME, form);
});


