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
    <img src="https://img.badgesize.io/layui/layui/master/dist/css/layui.css?compression=brotli&label=CSS%20Brotli%20size" alt="CSS Brotli size">
  </a>
  <a href="https://github.com/layui/layui/blob/master/dist/layui.js">
    <img src="https://img.badgesize.io/layui/layui/master/dist/layui.js?compression=brotli&label=JS%20Brotli%20size" alt="JS Brotli size">
  </a>
</p>

---

Layui 是一套開源免費的 Web UI 組件庫，採用自身輕量級模塊化規範，遵循原生態的 `HTML/CSS/JavaScript` 開發模式，極易上手，拿來即用。其風格簡約輕盈，而內在雅緻豐盈，甚至包括文檔在內的每一處細節都經過精心雕琢，非常適合網頁界面的快速構建。Layui 區別於一眾主流的前端框架，卻並非逆道而行，而是信奉返璞歸真之道。確切地說，它更多是面向於追求簡單的務實主義者，即無需涉足各類構建工具，只需面向瀏覽器本身，便可將頁面所需呈現的元素與交互信手拈來。

## 快速上手

使用 Layui 只需在頁面中引入核心文件即可：

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Quick Start - Layui</title>
    <link href="./layui/css/layui.css" rel="stylesheet">
  </head>
  <body>
    <!-- HTML Content -->
    <script src="./layui/layui.js"></script>
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
```

## 使用文檔

[**最新文檔**](https://layui.dev)

## 項目參與

[項目參與者](https://github.com/layui/layui/graphs/contributors)

## 破舊立新 🌱

2016年10月14日，Layui 發佈了 `1.0.0` 首版，此後多年被廣泛應用在不計其數的 Web 平臺。

2021年10月13日，Layui 發佈了原官網下線的公告（<a href="https://unpkg.com/outeres@0.0.7/img/layui/notice-2021.png"  target="_blank">導讀</a>），並將文檔站點切換到了 Gitee Pages，社區及日常維護亦全面轉移到了 Gitee 和 Github 平臺，並順帶呼籲大家擁抱其他更好的主流框架，導致大家誤以為 Layui 停更了。事實上，自那以後，Layui 仍然在 Github 和 Gitee 保持活躍，並不存在所謂的停止更新，從當時的 `2.6.8` 一直連續迭代到如今的最新版本。

2023年4月24日，Layui 發佈了 `2.8.0` 正式版，並上線了[新的文檔站點](https://layui.dev)，這是一次樸實的迴歸，更是情懷的延續。 但我們仍然堅持兩年前那則公告中的觀點， _即仍然推薦大家去擁抱主流，始終保持對前沿技術的無限熱愛，是開發者們都應具備的思維屬性_。 **而 Layui 所做的，是為填補主流之外的那些略顯狹小的空隙**。Layui 雖不是前端主流，但也早已不是作者個人的 Layui，而是所有仍在堅持使用它的人的 Layui，它仍然支撐著許多項目，也代表著許多人的工作。作為開源創作者，應該要為這些堅持者而守望。

未來，Layui 會持續陪伴著所有為之熱愛的人們，共同去探索和論證 Layui 開發模式的可行性。

## 開源許可

Layui 採用 [MIT](https://opensource.org/licenses/MIT) 許可發佈。其他相關協議亦可參考《[免責聲明](https://gitee.com/layui/layui/blob/main/DISCLAIMER.md)》。