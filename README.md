<p align=center>
  <a href="http://www.layui.com">
    <img src="https://sentsin.gitee.io/res/images/layui/layui.png" alt="layui" width="360">
  </a>
</p>
<p align=center>
  Classic modular front-end UI framework
</p>

<p align="center">
  <a href="https://travis-ci.org/sentsin/layui"><img alt="Build Status" src="https://img.shields.io/travis/sentsin/layui/master.svg"></a>
  <a href="https://saucelabs.com/beta/builds/7e6196205e4f492496203388fc003b65"><img src="https://saucelabs.com/buildstatus/layui" alt="Build Status"></a>
  <a href="https://coveralls.io/r/sentsin/layui?branch=master"><img alt="Test Coverage" src="https://img.shields.io/coveralls/sentsin/layui/master.svg"></a>
</p>
<p align="center">
  <a href="https://saucelabs.com/beta/builds/7e6196205e4f492496203388fc003b65"><img src="https://saucelabs.com/browser-matrix/layui.svg" alt="Browser Matrix"></a>
</p>

---

layui 是一款採用自身模塊規範編寫的前端 UI 框架，遵循原生 HTML/CSS/JS 的書寫與組織形式，門檻極低，拿來即用。其外在極簡，卻又不失飽滿的內在，體積輕盈，組件豐盈，從核心代碼到 API 的每一處細節都經過精心雕琢，非常適合界面的快速開發。layui 首個版本發佈於 2016 年金秋，她區別於那些基於 MVVM 底層的 UI 框架，卻並非逆道而行，而是信奉返璞歸真之道。準確地說，她更多是為服務端程序員量身定做，你無需涉足各種前端工具的複雜配置，只需面對瀏覽器本身，讓一切你所需要的元素與交互，從這裡信手拈來。

## 返璞歸真

layui 定義為“經典模塊化”，並非是自吹她自身有多優秀，而是有意避開當下 JS 社區的主流方案，試圖以最簡單的方式去詮釋高效！<em>她的所謂經典，是在於對返璞歸真的執念</em>，她以當前瀏覽器普通認可的方式去組織模塊！我們認為，這恰是符合當下國內絕大多數程序員從舊時代過渡到未來新標準的最佳指引。所以 layui 本身也並不是完全遵循於AMD時代，準確地說，她試圖建立自己的模式，所以你會看到：

```js
//layui模塊的定義
layui.define([mods], function(exports){

  //……

  exports('mod', api);
});

//layui模塊的使用
layui.use(['mod1', 'mod2'], function(args){
  var mod = layui.mod1;

  //……

});
```
沒錯，她具備AMD的影子，又並非受限於 commonjs 的那些條條框框，layui 認為這種輕量的組織方式，比 WebPack 更符合絕大多數場景。所以她堅持採用經典模塊化，也正是能讓人避開工具的複雜配置，迴歸簡單，安靜高效地擼一會原生態的HTML、CSS、JavaScript。

但是 layui 又並非是 Requirejs 那樣的模塊加載器，而是一款 UI 解決方案，她與 Bootstrap 最大的不同恰恰在於她糅合了自身對經典模塊化的理解。


## 快速上手

獲得 layui 後，將其完整地部署到你的項目目錄（或靜態資源服務器），你只需要引入下述兩個文件：

```
./layui/css/layui.css
./layui/layui.js //提示：如果是採用非模塊化方式（最下面有講解），此處可換成：./layui/layui.all.js
```

不用去管其它任何文件。因為他們（比如各模塊）都是在最終使用的時候才會自動加載。這是一個基本的入門頁面：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <title>開始使用layui</title>
  <link rel="stylesheet" href="../layui/css/layui.css">
</head>
<body>

<!-- 你的HTML代碼 -->

<script src="../layui/layui.js"></script>
<script>
//一般直接寫在一個js文件中
layui.use(['layer', 'form'], function(){
  var layer = layui.layer
  ,form = layui.form;

  layer.msg('Hello World');
});
</script>
</body>
</html>
```

如果你想採用非模塊化方式（即所有模塊一次性加載，儘管我們並不推薦你這麼做），你也可以按照下面的方式使用：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <title>非模塊化方式使用layui</title>
  <link rel="stylesheet" href="../layui/css/layui.css">
</head>
<body>

<!-- 你的HTML代碼 -->

<script src="../layui/layui.all.js"></script>
<script>
//由於模塊都一次性加載，因此不用執行 layui.use() 來加載對應模塊，直接使用即可：
;!function(){
  var layer = layui.layer
  ,form = layui.form;

  layer.msg('Hello World');
}();
</script>
</body>
</html>
```
## [閱讀文檔](http://www.layui.com/)
從現在開始，盡情地擁抱 layui 吧！但願她能成為你長遠的開發伴侶，化作你方寸屏幕前的億萬字節！

## 相關
[官網](http://www.layui.com/)、[更新日誌](http://www.layui.com/doc/base/changelog.html)、[社區交流](http://fly.layui.com)