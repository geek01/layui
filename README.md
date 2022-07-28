<p align="center">
  <a href="https://layui.github.io/">
    <img src="https://unpkg.com/outeres@0.0.6/img/layui/icon-1.png" width="81" alt="Layui">
  </a>
</p>
<h1 align="center">Layui</h1>
<p align="center">
  Classic modular front-end UI library
</p>

<p align="center">  
  <a href="https://www.npmjs.com/package/layui">
    <img src="https://img.shields.io/npm/v/layui" alt="Version">
  </a>
  <a href="https://www.npmjs.com/package/layui">
    <img src="https://img.shields.io/github/license/layui/layui" alt="License">
  </a>
  <a href="https://github.com/layui/layui/blob/master/dist/css/layui.css">
    <img src="https://img.badgesize.io/layui/layui/master/dist/css/layui.css?compression=brotli&label=CSS Brotli size" alt="CSS Brotli size">
  </a>
  <a href="https://github.com/layui/layui/blob/master/dist/layui.js">
    <img src="https://img.badgesize.io/layui/layui/master/dist/layui.js?compression=brotli&label=JS Brotli size" alt="JS Brotli size">
  </a>
</p>

---

Layui 是一套開源的 Web UI 組件庫，採用自身輕量級模塊化規範，遵循原生態的 HTML/CSS/JavaScript 開發模式，極易上手，拿來即用。其風格簡約，而內在豐盈，利於實現網頁界面的快速構建。Layui 區別於一眾主流的前端框架，卻並非逆道而行，而是信奉返璞歸真之道。確切地說，它更多是面向於追求簡單的務實主義者，他們無需涉足各類構建工具，只需面向瀏覽器本身，即可輕鬆掌握頁面所需的元素與交互，進而信手拈來。


## 快速上手

使用 Layui 只需在頁面中引入核心文件即可：

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>開始使用 Layui</title>
    <link href="./layui/css/layui.css" rel="stylesheet">
  </head>
  <body>
    <!-- HTML -->

    <script src="./layui/layui.js"></script>
    <script>
    // 使用組件
    layui.use(['layer', 'form'], function(){
      var layer = layui.layer;
      var form = layui.form;

      // 歡迎語
      layer.msg('Hello World');
    });
    </script>
  </body>
</html>
```

## 使用文檔
[**最新文檔**](https://layui.github.io)

## 項目參與
[項目參與者](https://github.com/layui/layui/graphs/contributors)

## 破舊立新 🌱
layui 原官網已於2021年10月13日下線。詳見：
> 1. <a href="https://unpkg.com/outeres@0.0.7/img/layui/notice-2021.png"  target="_blank">layui 原官網下線公告</a>  2. <a href="https://www.zhihu.com/question/488668647/answer/2159962082"  target="_blank">layui 原官網為什麼要下線？</a>

---

鑑於 Layui 相對龐大的受眾群體，從此 Github 和 Gitee 平臺將支撐起 Layui 的後續。<br>
**Layui 將繼續陪伴著所有為之熱愛的人們，共同去探索和論證「Layui 開發模式的可行性」**