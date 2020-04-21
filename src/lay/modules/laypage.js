/**

 @Name : layui.laypage 分頁組件
 @Author：賢心
 @License：MIT

 */

layui.define(function(exports){
  "use strict";

  var doc = document
  ,id = 'getElementById'
  ,tag = 'getElementsByTagName'

  //字符常量
  ,MOD_NAME = 'laypage', DISABLED = 'layui-disabled'

  //構造器
  ,Class = function(options){
    var that = this;
    that.config = options || {};
    that.config.index = ++laypage.index;
    that.render(true);
  };

  //判斷傳入的容器類型
  Class.prototype.type = function(){
    var config = this.config;
    if(typeof config.elem === 'object'){
      return config.elem.length === undefined ? 2 : 3;
    }
  };

  //分頁視圖
  Class.prototype.view = function(){
    var that = this
    ,config = that.config
    ,groups = config.groups = 'groups' in config ? (config.groups|0) : 5; //連續頁碼個數

    //排版
    config.layout = typeof config.layout === 'object'
      ? config.layout
    : ['prev', 'page', 'next'];

    config.count = config.count|0; //數據總數
    config.curr = (config.curr|0) || 1; //當前頁

    //每頁條數的選擇項
    config.limits = typeof config.limits === 'object'
      ? config.limits
    : [10, 20, 30, 40, 50];
    config.limit = (config.limit|0) || 10; //默認條數

    //總頁數
    config.pages = Math.ceil(config.count/config.limit) || 1;

    //當前頁不能超過總頁數
    if(config.curr > config.pages){
      config.curr = config.pages;
    }

    //連續分頁個數不能低於0且不能大於總頁數
    if(groups < 0){
      groups = 1;
    } else if (groups > config.pages){
      groups = config.pages;
    }

    config.prev = 'prev' in config ? config.prev : '&#x4e0a;&#x4e00;&#x9801;'; //上一頁文本
    config.next = 'next' in config ? config.next : '&#x4e0b;&#x4e00;&#x9801;'; //下一頁文本

    //計算當前組
    var index = config.pages > groups
      ? Math.ceil( (config.curr + (groups > 1 ? 1 : 0)) / (groups > 0 ? groups : 1) )
    : 1

    //視圖片段
    ,views = {
      //上一頁
      prev: function(){
        return config.prev
          ? '<a href="javascript:;" class="layui-laypage-prev'+ (config.curr == 1 ? (' ' + DISABLED) : '') +'" data-page="'+ (config.curr - 1) +'">'+ config.prev +'</a>'
        : '';
      }()

      //頁碼
      ,page: function(){
        var pager = [];

        //數據量為0時，不輸出頁碼
        if(config.count < 1){
          return '';
        }

        //首頁
        if(index > 1 && config.first !== false && groups !== 0){
          pager.push('<a href="javascript:;" class="layui-laypage-first" data-page="1"  title="&#x9996;&#x9801;">'+ (config.first || 1) +'</a>');
        }

        //計算當前頁碼組的起始頁
        var halve = Math.floor((groups-1)/2) //頁碼數等分
        ,start = index > 1 ? config.curr - halve : 1
        ,end = index > 1 ? (function(){
          var max = config.curr + (groups - halve - 1);
          return max > config.pages ? config.pages : max;
        }()) : groups;

        //防止最後一組出現“不規定”的連續頁碼數
        if(end - start < groups - 1){
          start = end - groups + 1;
        }

        //輸出左分割符
        if(config.first !== false && start > 2){
          pager.push('<span class="layui-laypage-spr">&#x2026;</span>')
        }

        //輸出連續頁碼
        for(; start <= end; start++){
          if(start === config.curr){
            //當前頁
            pager.push('<span class="layui-laypage-curr"><em class="layui-laypage-em" '+ (/^#/.test(config.theme) ? 'style="background-color:'+ config.theme +';"' : '') +'></em><em>'+ start +'</em></span>');
          } else {
            pager.push('<a href="javascript:;" data-page="'+ start +'">'+ start +'</a>');
          }
        }

        //輸出輸出右分隔符 & 末頁
        if(config.pages > groups && config.pages > end && config.last !== false){
          if(end + 1 < config.pages){
            pager.push('<span class="layui-laypage-spr">&#x2026;</span>');
          }
          if(groups !== 0){
            pager.push('<a href="javascript:;" class="layui-laypage-last" title="&#x5c3e;&#x9801;"  data-page="'+ config.pages +'">'+ (config.last || config.pages) +'</a>');
          }
        }

        return pager.join('');
      }()

      //下一頁
      ,next: function(){
        return config.next
          ? '<a href="javascript:;" class="layui-laypage-next'+ (config.curr == config.pages ? (' ' + DISABLED) : '') +'" data-page="'+ (config.curr + 1) +'">'+ config.next +'</a>'
        : '';
      }()

      //數據總數
      ,count: '<span class="layui-laypage-count">共 '+ config.count +' 條</span>'

      //每頁條數
      ,limit: function(){
        var options = ['<span class="layui-laypage-limits"><select lay-ignore>'];
        layui.each(config.limits, function(index, item){
          options.push(
            '<option value="'+ item +'"'
            +(item === config.limit ? 'selected' : '')
            +'>'+ item +' 條/頁</option>'
          );
        });
        return options.join('') +'</select></span>';
      }()

      //刷新當前頁
      ,refresh: ['<a href="javascript:;" data-page="'+ config.curr +'" class="layui-laypage-refresh">'
        ,'<i class="layui-icon layui-icon-refresh"></i>'
      ,'</a>'].join('')

      //跳頁區域
      ,skip: function(){
        return ['<span class="layui-laypage-skip">&#x5230;&#x7b2c;'
          ,'<input type="text" min="1" value="'+ config.curr +'" class="layui-input">'
          ,'&#x9801;<button type="button" class="layui-laypage-btn">&#x78ba;&#x5b9a;</button>'
        ,'</span>'].join('');
      }()
    };

    return ['<div class="layui-box layui-laypage layui-laypage-'+ (config.theme ? (
      /^#/.test(config.theme) ? 'molv' : config.theme
    ) : 'default') +'" id="layui-laypage-'+ config.index +'">'
      ,function(){
        var plate = [];
        layui.each(config.layout, function(index, item){
          if(views[item]){
            plate.push(views[item])
          }
        });
        return plate.join('');
      }()
    ,'</div>'].join('');
  };

  //跳頁的回調
  Class.prototype.jump = function(elem, isskip){
    if(!elem) return;
    var that = this
    ,config = that.config
    ,childs = elem.children
    ,btn = elem[tag]('button')[0]
    ,input = elem[tag]('input')[0]
    ,select = elem[tag]('select')[0]
    ,skip = function(){
      var curr = input.value.replace(/\s|\D/g, '')|0;
      if(curr){
        config.curr = curr;
        that.render();
      }
    };

    if(isskip) return skip();

    //頁碼
    for(var i = 0, len = childs.length; i < len; i++){
      if(childs[i].nodeName.toLowerCase() === 'a'){
        laypage.on(childs[i], 'click', function(){
          var curr = this.getAttribute('data-page')|0;
          if(curr < 1 || curr > config.pages) return;
          config.curr = curr;
          that.render();
        });
      }
    }

    //條數
    if(select){
      laypage.on(select, 'change', function(){
        var value = this.value;
        if(config.curr*value > config.count){
          config.curr = Math.ceil(config.count/value);
        }
        config.limit = value;
        that.render();
      });
    }

    //確定
    if(btn){
      laypage.on(btn, 'click', function(){
        skip();
      });
    }
  };

  //輸入頁數字控制
  Class.prototype.skip = function(elem){
    if(!elem) return;
    var that = this, input = elem[tag]('input')[0];
    if(!input) return;
    laypage.on(input, 'keyup', function(e){
      var value = this.value
      ,keyCode = e.keyCode;
      if(/^(37|38|39|40)$/.test(keyCode)) return;
      if(/\D/.test(value)){
        this.value = value.replace(/\D/, '');
      }
      if(keyCode === 13){
        that.jump(elem, true)
      }
    });
  };

  //渲染分頁
  Class.prototype.render = function(load){
    var that = this
    ,config = that.config
    ,type = that.type()
    ,view = that.view();

    if(type === 2){
      config.elem && (config.elem.innerHTML = view);
    } else if(type === 3){
      config.elem.html(view);
    } else {
      if(doc[id](config.elem)){
        doc[id](config.elem).innerHTML = view;
      }
    }

    config.jump && config.jump(config, load);

    var elem = doc[id]('layui-laypage-' + config.index);
    that.jump(elem);

    if(config.hash && !load){
      location.hash = '!'+ config.hash +'='+ config.curr;
    }

    that.skip(elem);
  };

  //外部接口
  var laypage = {
    //分頁渲染
    render: function(options){
      var o = new Class(options);
      return o.index;
    }
    ,index: layui.laypage ? (layui.laypage.index + 10000) : 0
    ,on: function(elem, even, fn){
      elem.attachEvent ? elem.attachEvent('on'+ even, function(e){ //for ie
        e.target = e.srcElement;
        fn.call(elem, e);
      }) : elem.addEventListener(even, fn, false);
      return this;
    }
  }

  exports(MOD_NAME, laypage);
});