---
title: 開始使用
toc: true
---

<h1 id="introduce" lay-toc="{title: '簡介'}">開始使用</h1>

> Layui 是一套免費的開源 Web UI 組件庫，採用自身輕量級模塊化規範，遵循原生態的 HTML/CSS/JavaScript 開發模式，極易上手，拿來即用。其風格簡約輕盈，而內在雅緻豐盈，甚至包括文檔在內的每一處細節都經過精心雕琢，非常適合網頁界面的快速構建。Layui 區別於一眾主流的前端框架，卻並非逆道而行，而是信奉返璞歸真之道。確切地說，它更多是面向於追求簡單的務實主義者，即無需涉足各類構建工具，只需面向瀏覽器本身，便可將頁面所需呈現的元素與交互信手拈來。

<p style="font-size: 68px; text-align: center; color: #16baaa;">
  Layui
</p>

<table class="layui-table">
  <tbody>
    <tr>
      <td>諧音：類 UI</td>
      <td>用途：用於更簡單快速地構建網頁界面</td>
    </tr>
    <tr>
      <td>環境：全部主流 Web 瀏覽器（IE8 以下除外）</td>
      <td>特性：原生態開發 / 輕量級模塊化 / 外簡內豐 / 開箱即用</td>
    </tr>
  </tbody>
</table>

<h2 id="install" lay-toc="">下載引用</h2>

您可以通過以下任意一種方式獲得 Layui :

### 🌕 官網下載

您可以在 [官網首頁](/) 或 [更新日誌](./versions.html) 頁面下載到 Layui，它經過了自動化構建，更適合用於生產環境。目錄結構如下：

```
layui/
  ├─css
  │  └─layui.css   # 核心樣式庫
  └─layui.js       # 核心模塊庫
```

### 🌕 Git 下載

> 您也可以通過 [GitHub](https://github.com/layui/layui/releases) 或 [Gitee](https://gitee.com/layui/layui/releases) 的 releases 列表下載，或直接下載整個倉庫。

<p>
  <iframe src="//ghbtns.com/github-btn.html?user=layui&amp;repo=layui&amp;type=watch&amp;count=true&amp;size=large" allowtransparency="true" frameborder="0" scrolling="0" width="156px" height="30px"></iframe>
  <iframe src="//ghbtns.com/github-btn.html?user=layui&amp;repo=layui&amp;type=fork&amp;count=true&amp;size=large" allowtransparency="true" frameborder="0" scrolling="0" width="156px" height="30px"></iframe>
</p>
<div class="layui-btn-container">
  <a class="layui-btn layui-btn-normal" href="https://github.com/layui/layui/" target="_blank" rel="nofollow" style="background-color: #24292E; color: #fff;">GitHub</a>
  <a class="layui-btn layui-btn-normal" href="https://gitee.com/layui/layui/" target="_blank" rel="nofollow" style="background-color: #C71D23; color: #fff;">Gitee</a>
</div>

### 🌕 npm 下載

```
npm i layui
```

### 🌕 第三方 CDN 方式引入：

> 以下均為知名第三方免費開放的公共資源 CDN，每期版本通過 NPM / GitHub 自動同步。

<div class="layui-btn-container">
  <a class="layui-btn layui-btn-primary layui-border-black" href="https://unpkg.com/browse/layui/dist/" target="_blank" rel="nofollow">UNPKG</a>
  <a class="layui-btn layui-btn-primary" style="border-color: #FF6934; color: #FF6934;" href="https://cdnjs.com/libraries/layui" target="_blank" rel="nofollow">CDNJS</a>
  <a class="layui-btn layui-btn-primary" style="border-color: #E64E3D; color: #E64E3D;" href="https://www.jsdelivr.com/package/npm/layui" target="_blank" rel="nofollow">JSDELIVR</a>
</div>


```
<!-- 引入 layui.css -->
<link href="//unpkg.com/layui@{{= d.layui[2].v }}/dist/css/layui.css" rel="stylesheet">
```
```
<!-- 引入 layui.js -->
<script src="//unpkg.com/layui@{{= d.layui[2].v }}/dist/layui.js"></script>
```

<h2 id="quickstart" lay-toc="{}">快速上手</h2>

現在，讓我們以一個最簡單的示例開始入門：

<pre class="layui-code" lay-options="{preview: 'iframe', previewStyle: 'height: 210px;', copy: true, tools: []}">
  <textarea>
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Quick Start - Layui</title>
  <link href="{{= d.layui[2].cdn.css }}" rel="stylesheet">
</head>
<body>
  <!-- HTML Content -->
  <script src="{{= d.layui[2].cdn.js }}"></script>
  <script>
  // Usage
  layui.use(function(){
    var layer = layui.layer;
    // Welcome
    layer.msg('Hello World', {icon: 6});
  });
  </script>
</body>
</html>
  </textarea>
</pre>

點擊上方 `Preview` 標籤可進行效果預覽。

<h3 id="help">其他幫助</h3>

- <a href="https://layui.dev/playground/2/">在線測試</a>
- <a href="https://github.com/Sight-wcg/layui-theme-dark" rel="nofollow" target="_blank">深色主題</a> (社區貢獻)


## 初識寄語

> 願 Layui 從此成為您得心應手的 Web 界面解決方案，化作您方寸屏幕前的億萬字節！
