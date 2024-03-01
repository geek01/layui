---
title: 模塊系統
toc: true
---

<h1 id="idea" lay-toc="{title: '概要'}">模塊系統</h1>

> Layui 制定了一套適合自身應用場景的輕量級模塊規範，以便在不同規模的項目中，也能對前端代碼進行很好的管理或維護。 Layui 的輕量級模塊系統，並非有意違背 CommonJS 和 ES Module ，而是試圖以更簡單的方式去詮釋高效，這種對*返璞歸真*的執念源於在主流標準尚未完全普及的前 ES5 時代，後來也成為 Layui 獨特的表達方式，而沿用至今。

如下是一個關於模塊的簡單示例：

```
// 定義模塊（通常單獨作為一個 JS 文件）
layui.define([mods], function(exports){
  // …

  exports('mod1', api); // 輸出模塊
});

// 使用模塊
layui.use(['mod1'], function(args){
  var mod1 = layui.mod1;

  // …
});
```

我們可以將其視為「像使用普通 API 一樣來管理模塊」，在此前提下，組件的承載也變得輕鬆自如，我們完全可以遊刃在以瀏覽器為宿主的原生態的 HTML/CSS/JavaScript 的開發模式中，而不必捲入層出不窮的主流框架的浪潮之中，給心靈一個棲息之所。

當然，Layui 自然也不是一個模塊加載器，而是一套相對完整的 UI 解決方案，但與 Bootstrap 又並不相同，除了 HTML+CSS 本身的靜態化處理，Layui 的組件更傾向於 JavaScript 的動態化渲染，併為之提供了相對豐富和統一的 API，使用時，只需稍加熟悉，便可在各種交互中應付自如。


<h2 id="define" lay-toc="">定義模塊</h2>

`layui.define([mods], callback);`

- 參數 `mods` 可選，用於聲明該模塊所依賴的模塊；
- 參數 `callback` 即為模塊加載完畢的回調函數，它返回一個 `exports` 參數，用於輸出該模塊的接口。

```
/** demo.js **/
layui.define(function(exports){
  // do something

  // 輸出 demo 模塊
  exports('demo', {
    msg: 'Hello Demo'
  });
});

// 若該模塊需要依賴別的模塊，則在 `mods` 參數中聲明即可：
// layui.define(['layer', 'form'], callback);
```

如上所示，`callback` 返回的 `exports` 參數是一個函數，它接受兩個參數：參數一為*模塊名*，參數二為*模塊接口*。

另外， `callback` 將會在初次加載該模塊時被自動執行。而有時，在某些特殊場景中可能需要再次執行該 `callback`，那麼可以通過 `layui.factory(mod)` 方法獲得。如：

```
var demoCallback = layui.factory('demo'); // 得到定義 demo 模塊時的 `callback`
```

- **模塊命名空間**

Layui 定義的模塊將會被綁定在 `layui` 對象下，如：`var demo = layui.demo;` 每個模塊都有一個特定命名，且無法被佔用，所以你無需擔心模塊的命名空間被汙染，除非通過 `layui.disuse([mods])` 方法棄用已定義的模塊。

以下是定義一個「依賴 Layui 內置模塊」的模塊示例：

```
layui.define(['layer', 'laydate'], function(exports){
  var layer = layui.layer // 獲得 layer 模塊
  var laydate = layui.laydate; // 獲得 laydate 模塊

  // 輸出模塊
  exports('demo', {}); // 模塊名 demo 未被佔用，此時模塊定義成功
  // exports('layer', {}); // 模塊名 layer 已經存在，此時模塊定義失敗
});
```

同樣的，在「擴展模塊」時，也同樣不能命名已經存在的模塊名。


<h2 id="use" lay-toc="">使用模塊</h2>

`layui.use([mods], callback);`

- 參數 `mods` 若填寫，必須是已被成功定義的模塊名；
  <br>注<sup>2.6+</sup>：若 mods 不填，即只傳一個 callback 參數時，則表示引用所有內置模塊。
- 參數 `callback` 即為使用模塊成功後回調函數。
  <br>注<sup>2.6+</sup>：該回調會在 html 文檔加載完畢後再執行，確保你的代碼在任何地方都能對元素進行操作。

```
// 使用指定模塊
layui.use(['layer', 'table'], function(){
  var layer = layui.layer;
  var table = layui.table;

  // do something
});

// 使用所有內置模塊（layui v2.6 開始支持）
layui.use(function(){
  var layer = layui.layer;
  var table = layui.table;
  var laydate = layui.laydate;
  // …

  // do something
});
```

你還可以通過 `callback` 返回的參數得到模塊對象，如：

```
layui.use(['layer', 'table'], function(layer, table){
  // 使用 layer
  layer.msg('test');

  // 使用 table
  table.render({});
});
```

- **執行「定義模塊」時的回調函數**

在上文的定義模塊中，我們提到一個特殊場景，即重新獲取定義模塊時的 `callback` 函數, 譬如在*單頁面應用*開發中，我們在視圖碎片中使用某個模塊，由於定義模塊時的 `callback` 只會在模塊初次加載中被調用，而當視圖碎片在每次被渲染時，又往往需要該 `callback` 被再次執行，那麼則可以通過以下方式實現：

```
// 在單頁面視圖碎片渲染時，再次調用「定義模塊」時的 `callback`
layui.use('demo', layui.factory('demo'));
```

<h2 id="extend" lay-toc="">擴展模塊</h2>

`layui.extend(obj);`

- 參數 `obj` 是一個對象，必選，用於聲明模塊別名。

除了 Layui 的內置模塊，在實際項目開發時，必不可少也需要擴展模塊（可以簡單理解為符合 layui 模塊規範的 JS 文件）。 現在，讓我們嘗試著擴展一個 Layui 第三方模塊：

1. **創建模塊**

我們在前文的「模塊命名空間」提到，模塊名具有唯一性，即不可被佔用，因此我們擴展的模塊必須是一個未被定義過的模塊名。假設為：`firstMod`，然後新建一個 `firstMod.js` 文件並放入項目的任意目錄中（最好不要放入到 Layui 原始目錄）

2. **編寫模塊**

接下來我們開始定義 `firstMod` 模塊，並編寫該模塊主體代碼。

```
/**
 * 編寫一個 firstMod 模塊
 **/
layui.define(function(exports){ // 也可以依賴其他模塊
  var obj = {
    hello: function(str){
      alert('Hello '+ (str || 'firstMod'));
    }
  };

  // 輸出 firstMod 接口
  exports('firstMod', obj);
});
```

3. **聲明模塊**

現在，我們只需聲明模塊名及模塊文件路徑，即完成模塊擴展。

```
// 假設 firstMod 模塊文件所在路徑在： /js/layui_exts/firstMod.js
layui.config({
  base: '/js/layui_exts/' // 配置 Layui 第三方擴展模塊存放的基礎目錄
}).extend({
  firstMod: 'firstMod', // 定義模塊名和模塊文件路徑，繼承 layui.config 的 base 路徑
  // mod2: 'mod2' // 可同時聲明其他更多模塊
});

// 也可以不繼承  layui.config 的 base 路徑，即單獨指定路徑
layui.extend({
  firstMod: '{/}/js/layui_exts/firstMod' // 開頭特定符 {/} 即代表採用單獨路徑
});

// 然後我們就可以像使用內置模塊一樣使用擴展模塊
layui.use(['firstMod'], function(){
  var firstMod = layui.firstMod;

  firstMod.hello('World');
});
```

> 擴展模塊是項目開發的重要環節，它既可以是工具性組件，也可以是純業務組件，是 Layui 的延伸，也是項目的支撐。


<h2 id="index" lay-toc="">建立模塊入口</h2>

在不同的頁面中，可能需要用到不同的業務模塊。以首頁為例：

```
<script src="/js/layui/layui.js"></script>
<script>
layui.config({
  base: '/js/modules/' // 業務模塊所在目錄
}).use('index'); // 加載當前頁面需要的業務模塊
</script>
```

上述的 `index` 模塊即對應的模塊文件 `/js/modules/index.js`，它同樣也必須符合 Layui 模塊規範。如：

```
/**
 * index.js 首頁業務模塊
 */
layui.define(['layer', 'form'], function(exports){
  var layer = layui.layer;
  var form = layui.form;

  layer.msg('Hello Index');

  exports('index', {}); // 輸出模塊名需和 use 和 extend 時的模塊名一致
});
```

**合併模塊入口**

當項目存在許多不同的業務模塊（且存在一定的依賴關係），我們又希望在頁面中建立統一的入口模塊。如：

```
// mod1.js
layui.define('layer', function(exports){
  // …
  exports('mod1', {});
});

// mod2.js，假設依賴 mod1 和 form
layui.define(['mod1', 'form'], function(exports){
  // …
  exports('mod2', {});
});

// mod3.js
// …

// index.js 主入口模塊
layui.define('mod2', function(exports){
  // …
  exports('main', {});
});
```

我們可以將上述模塊合併為一個文件來加載，即藉助構建工具（如 Gulp）將上述的 <code>mod1、mod2、mod3、index</code> 等業務模塊合併到一個模塊文件：`index.js`，此時只需在頁面統一加載該模塊即可。這樣我們最多隻需要加載兩個 JS 文件：`layui.js、index.js`，這將大幅度減少靜態資源的請求。



<br>

## 小貼士

> 綜上： Layui 輕量級模塊系統，無非就是：定義模塊、使用模塊、棄用模塊、擴展模塊的相互呼應，翻譯成 API 即：
> - `layui.define();`
> - `layui.use();`
> - `layui.disuse();`
> - `layui.extend();`
> ---
> 熟練運用，可讓您的項目更利於維護。
