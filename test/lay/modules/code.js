/**
 * @file code - 測試
 * @author xuexb <fe.xiaowu@gmail.com>
 */

/* global layui */
/* eslint-disable max-nested-callbacks, fecs-indent */

var laycode = layui.code;
var $ = layui.$;

/**
 * 創建dom元素, 並返回 jquery 對象
 *
 * @inner
 *
 * @param  {string} html 標籤
 *
 * @return {jQuery}
 */
var createNode = function (html) {
  return $(html).addClass('test-node').appendTo('body');
};

describe('code', function () {
  // 輸出測試節點
  beforeEach(function () {
    createNode('<div id="test-div"></div>');
  });

  // 刪除節點
  afterEach(function () {
    $('.test-node').remove();
  });

  it('css loaded', function () {
    expect($('#layuicss-skincodecss').length).to.equal(1, 'css link 節點必須存在');
  });

  it('default params', function () {
    expect(function () {
      laycode();
    }).to.not.throw();

    createNode('<pre class="layui-code"><div class="layui-code-div">123</div></pre>');
    laycode();

    expect($('.layui-code').hasClass('layui-code-view')).to.equal(true, '元素的樣式名必須包含 layui-code-view');
    expect($('.layui-code').find('.layui-code-div').length).to.equal(1, '默認沒有 encode');
    expect($('.layui-code').find('.layui-code-h3 a').length).to.equal(1, '默認有版權元素');
  });

  it('options.elem', function () {
    createNode('<pre class="layui-test"><div>123</div></pre>');

    laycode();
    expect($('.layui-test').hasClass('layui-code-view')).to.be.false;

    laycode({
      elem: '.layui-test'
    });
    expect($('.layui-test').hasClass('layui-code-view')).to.be.true;
  });

  it('options.title', function () {
    createNode('<pre class="layui-code"><div>123</div></pre>');

    laycode({
      title: 'layui',

      // 主要是版權和標題在一個元素內
      about: false
    });

    expect($('.layui-code-h3').text()).to.equal('layui', '判斷標題元素');
  });

  it('options.height', function () {
    createNode('<pre class="layui-code"><div>123</div></pre>');

    laycode({
      height: 100
    });

    expect($('.layui-code-ol').css('maxHeight')).to.equal('100px', '判斷ol元素的最大高');
  });

  it('options.encode', function () {
    createNode('<pre class="layui-code"><div class="layui-code-div">123\'"</div></pre>');

    laycode({
      encode: true
    });

    expect($('.layui-code').find('.layui-code-div').length).to.equal(0, 'encode 後元素被轉義');
  });

  it('options.skin', function () {
    createNode('<pre class="layui-code"><div class="layui-code-div">123</div></pre>');

    laycode({
      skin: 'notepad'
    });

    expect($('.layui-code-notepad').length).to.equal(1, '自定義風格存在');
  });

  it('options.about', function () {
    createNode('<pre class="layui-code"><div class="layui-code-div">123</div></pre>');

    laycode({
      about: false
    });

    expect($('.layui-code').find('.layui-code-h3 a').length).to.equal(0, '不輸出版權元素');
  });

  it('attr lay-title', function () {
    createNode('<pre class="layui-code" lay-title="layui"><div>123</div></pre>');

    laycode({
      // 主要是版權和標題在一個元素內
      about: false
    });

    expect($('.layui-code-h3').text()).to.equal('layui', '判斷標題元素');
  });

  it('attr lay-height', function () {
    createNode('<pre class="layui-code" lay-height="100px"><div>123</div></pre>');

    laycode();

    expect($('.layui-code-ol').css('maxHeight')).to.equal('100px', '判斷ol元素的最大高');
  });

  it('attr lay-encode', function () {
    createNode('<pre class="layui-code" lay-encode="true"><div class="layui-code-div">123</div></pre>');

    laycode();

    expect($('.layui-code').find('.layui-code-div').length).to.equal(0, 'encode 後元素被轉義');
  });

  it('attr lay-skin', function () {
    createNode('<pre class="layui-code" lay-skin="notepad"><div class="layui-code-div">123</div></pre>');

    laycode();

    expect($('.layui-code-notepad').length).to.equal(1, '自定義風格存在');
  });

  it('multiple nested', function () {
    createNode([
      '<pre class="layui-code">',
        '<div class="layui-code-div">123</div>',
        '<pre class="layui-code"><div class="layui-code-div">123</div></pre>',
      '</pre>'
    ].join(''));

    laycode();

    expect($('.layui-code-view').length).to.equal(2, '必須輸出2個代碼塊');
    expect($('.layui-code-h3').length).to.equal(2, '必須輸出2個標題元素');
  });

  it('multiple init', function () {
    createNode('<pre class="layui-code"><div class="layui-code-div">123</div></pre>');

    laycode();
    expect($('.layui-code-view').length).to.equal(1);
    expect($('.layui-code-h3').length).to.equal(1);

    laycode();
    expect($('.layui-code-view').length).to.equal(1, '同標籤多次調用時 view 層只有一個');
    expect($('.layui-code-h3').length).to.equal(2, '多次調用輸出多個標題元素');
  });

  it('multiple line', function () {
    var html = [];

    for (var i = 0; i < 300; i++) {
      html.push('<div class="layui-code-div">layui</div>');
    }

    createNode('<pre class="layui-code">' + html.join('\n') + '</pre>');

    laycode();

    expect($('.layui-code-div').length).to.equal(300);
  });
});
/* eslint-enable max-nested-callbacks, fecs-indent */
