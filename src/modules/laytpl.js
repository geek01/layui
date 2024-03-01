/**
 * laytpl 輕量模板引擎
 */

layui.define(function(exports){
  "use strict";

  // 默認屬性
  var config = {
    open: '{{', // 標籤符前綴
    close: '}}' // 標籤符後綴
  };

  // 模板工具
  var tool = {
    escape: function(html){
      var exp = /[<"'>]|&(?=#[a-zA-Z0-9]+)/g;
      if(html === undefined || html === null) return '';

      html += '';
      if(!exp.test(html)) return html;

      return html.replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/'/g, '&#39;').replace(/"/g, '&quot;');
    }
  };

  // 內部方法
  var inner = {
    exp: function(str){
      return new RegExp(str, 'g');
    },
    // 錯誤提示
    error: function(e, source){
      var error = 'Laytpl Error: ';
      typeof console === 'object' && console.error(error + e + '\n'+ (source || ''));
      return error + e;
    }
  };

  // constructor
  var Class = function(template, options){
    var that = this;
    that.config = that.config || {};
    that.template = template;

    // 簡單屬性合併
    var extend = function(obj){
      for(var i in obj){
        that.config[i] = obj[i];
      }
    };

    extend(config);
    extend(options);
  };

  // 標籤正則
  Class.prototype.tagExp = function(type, _, __){
    var options = this.config;
    var types = [
      '#([\\s\\S])+?',   // js 語句
      '([^{#}])*?' // 普通字段
    ][type || 0];

    return inner.exp((_||'') + options.open + types + options.close + (__||''));
  };

  // 模版解析
  Class.prototype.parse = function(template, data){
    var that = this;
    var options = that.config;
    var source = template;
    var jss = inner.exp('^'+ options.open +'#', '');
    var jsse = inner.exp(options.close +'$', '');

    // 模板必須為 string 類型
    if(typeof template !== 'string') return template;

    // 正則解析
    template = template.replace(/\s+|\r|\t|\n/g, ' ')
    .replace(inner.exp(options.open +'#'), options.open +'# ')
    .replace(inner.exp(options.close +'}'), '} '+ options.close).replace(/\\/g, '\\\\')

    // 不匹配指定區域的內容
    .replace(inner.exp(options.open + '!(.+?)!' + options.close), function(str){
      str = str.replace(inner.exp('^'+ options.open + '!'), '')
      .replace(inner.exp('!'+ options.close), '')
      .replace(inner.exp(options.open + '|' + options.close), function(tag){
        return tag.replace(/(.)/g, '\\$1')
      });
      return str
    })

    // 匹配 JS 語法
    .replace(/(?="|')/g, '\\').replace(that.tagExp(), function(str){
      str = str.replace(jss, '').replace(jsse, '');
      return '";' + str.replace(/\\(.)/g, '$1') + ';view+="';
    })

    // 匹配普通輸出語句
    .replace(that.tagExp(1), function(str){
      var start = '"+laytpl.escape(';
      if(str.replace(/\s/g, '') === options.open + options.close){
        return '';
      }
      str = str.replace(inner.exp(options.open + '|' + options.close), '');
      if(/^=/.test(str)){
        str = str.replace(/^=/, '');
      } else if(/^-/.test(str)){
        str = str.replace(/^-/, '');
        start = '"+(';
      }
      return start + str.replace(/\\(.)/g, '$1') + ')+"';
    });

    template = '"use strict";var view = "' + template + '";return view;';

    try {
      /**
       * 請注意: 開發者在使用模板語法時，需確保模板中的 JS 語句不來自於頁面用戶輸入。
       * 即模板中的 JS 語句必須在頁面開發者自身的可控範圍內，否則請避免使用該模板解析。
       */
      that.cache = template = new Function('d, laytpl', template);
      return template(data, tool);
    } catch(e) {
      delete that.cache;
      return inner.error(e, source);
    }
  };

  // 數據渲染
  Class.prototype.render = function(data, callback){
    data = data || {};

    var that = this;
    var result = that.cache ? that.cache(data, tool) : that.parse(that.template, data);

    // 返回渲染結果
    typeof callback === 'function' && callback(result);
    return result;
  };

  // 創建實例
  var laytpl = function(template, options){
    return new Class(template, options);
  };

  // 配置全局屬性
  laytpl.config = function(options){
    options = options || {};
    for(var i in options){
      config[i] = options[i];
    }
  };

  laytpl.v = '2.0.0';

  // export
  exports('laytpl', laytpl);
});
