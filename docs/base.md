---
title: 底層方法
toc: true
---

# 底層方法

> Layui 提供了一系列基礎 API，以更好地輔助組件的使用。

<h2 id="config" lay-toc="">全局配置</h2>

`layui.config(options);`

您可以在 Layui 模塊使用之前，採用該方法進行一些全局化的基礎配置，其支持的屬性如下：

```
layui.config({
  base: '', // 設定 Layui 擴展模塊的所在目錄，一般與 extend 方法搭配使用
  version: false, // 用於更新模塊緩存，默認 false。若設為 true，即讓瀏覽器不緩存。也可設為一個任意數值
  dir: 'layui/', // layui 基礎目錄，用於動態導入 src/layui.js 時的內置模塊的加載。一般無需設置
  debug: false // 用於開啟調試模式，默認 false。若設為 true，則模塊的引入節點會保留在頁面
});
```

<!--

### 🌕 預設全局對象 <sup>2.6+</sup>

特別地，若你對 `layui.js` 本身進行了動態加載或是其他特殊場景中使用，那麼上述 `layui.config()` 所設定的 `dir` 屬性會因此失效，此時你可以在動態加載 <code>layui.js</code> 之前預先定義一個我們約定好的全局對象，如：

```
<script>
var LAYUI_GLOBAL = {
  dir: '/res/layui/' // layui.js 所在目錄
};
</script>
```

> 提示：以上 `dir` 屬性的目錄設定僅針對特殊場景，如是採用 `<script>` 標籤正常引入 layui 的，可以無視該操作。

-->


<h2 id="url" lay-toc="">鏈接解析</h2>

`var url = layui.url(href);`

參數 `href` 可選，默認自動讀取當前頁面 URL（`location.href`）。該方法用於將一段 URL 鏈接中的 `pathname、search、hash` 等屬性進行對象化處理， 以下是對一個 URL 解析後的返回結果：

```
// 假設當前頁面 url 為： https://domain.com/docs/base.html?a=1&c=3#/user/set/id=123/
var url = layui.url();

// url 返回結果為：
{
  "pathname": ["docs","base.html"], // 路徑
  "search": {"a":"1","c":"3"}, // 參數
  "hash": { // hash 解析
    "path": ["user","set",""], // hash 中的路徑
    "search": {"id":"123"}, // hash 中的參數
    "hash": "",  // hash 中的 hash
    "href": "/user/set/id=123/"  // hash 中的完整鏈接
  }
}
```

該方法通常可搭配 `location.hash` 和 `hashchange ` 事件，或 `history.pushState()` 和 `popstate` 事件使用，從而實現*單頁面應用開發*。 Layui 的 AdminUI 主題模板則正是基於該方法完成的路由系統。


<h2 id="data" lay-toc="">本地存儲</h2>

本地存儲是對 localStorage 和 sessionStorage 的友好封裝，可更方便地管理本地數據。方法如下：

- `layui.data(table, settings);` 即 localStorage，數據在瀏覽器中的持久化存儲，除非物理刪除。
- `layui.sessionData(table, settings);` 即 sessionStorage ，數據在瀏覽器中的會話性存儲，頁面關閉後即失效。

兩者使用方式完全一致。其中參數 `table` 為表名，`settings` 是一個對象，用於設置 `key/value`。下面以 `layui.data()` 方法為例：

```
// 【增】：向 test 表插入一個 nickname 字段，如果該表不存在，則自動建立。
layui.data('test', {
  key: 'nickname',
  value: '張三'
});

// 【刪】：刪除 test 表的 nickname 字段
layui.data('test', {
  key: 'nickname',
  remove: true
});
layui.data('test', null); // 刪除 test 表

// 【改】：同【增】，會覆蓋已經存儲的數據

// 【查】：向 test 表讀取全部的數據
var localTest = layui.data('test');
console.log(localTest.nickname); // 獲得“張三”
```

<h2 id="device" lay-toc="">瀏覽器信息</h2>

`var device = layui.device(key);`

參數 `key` 可選。可利用該方法對不同的設備進行差異化處理，`device` 即為不同設備下返回的不同信息，如下：

```
{
  os: "windows", // 當前瀏覽器所在的底層操作系統，如：Windows、Linux、Mac 等
  ie: false, // 當前瀏覽器是否為 ie6-11 的版本，如果不是 ie 瀏覽器，則為 false
  weixin: false, // 當前瀏覽器是否為微信 App 環境
  android: false, // 當前瀏覽器是否為安卓系統環境
  ios: false, // 當前瀏覽器是否為 IOS 系統環境
  mobile: false // 當前瀏覽器是否為移動設備環境（v2.5.7 新增）
}
```

有時，你的 App 可能會對 userAgent 插入一段特定標識，如：

```
Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 MYAPP/1.8.6 Safari/537.36
```

要驗證當前頁面是否在你的 App 環境中，即可通過上述 `MYAPP`（即 Native 給 Webview 插入的標識，可自由定義）來判斷。

```
var device = layui.device('MYAPP');
if(device.MYAPP){
  alert('在 MYAPP 環境中');
}
```

<h2 id="api" lay-toc="{hot: true}">API 列表</span></h2>

前面我們特別介紹了幾個相對特殊的基礎方法，而以下是 Layui 提供的全部基礎 API：

| API | 描述 |
| --- | --- |
| layui.cache | 獲得 UI 的一些配置及臨時緩存信息 |
| layui.config(options) | 基礎配置。[#用法](#config) |
| layui.define([modules], callback) | 定義模塊。[#用法](modules.html#define) |
| layui.use([modules], callback) | 加載模塊。[#用法](modules.html#use) |
| layui.extend(obj) | 擴展模塊。[#用法](modules.html#extend) |
| layui.disuse([modules]) <sup>2.7+</sup> | 棄用模塊，以便重新擴展新的同名模塊。參數支持數組，即可同時棄用多個模塊。 如：`layui.disuse(['table'])` |
| layui.link(href) | 加載 CSS，`href` 即為 css 路徑。一般用於動態加載你的外部 CSS 文件 |
| layui.getStyle(node, name) | 獲得一個原始 DOM 節點的 style 屬性值，如： <br>`layui.getStyle(document.body, 'font-size')` |
| layui.img(src, callback, error) | 圖片預加載 |
| layui.each(obj, callback) | 對象（Array、Object、DOM 對象等）遍歷，可用於取代 for 語句 |
| layui.type(operand) <sup>2.6.7+</sup> | 獲取基本數據類型和各類常見引用類型，如： <br> `layui.type([]); // array` <br> `layui.type({}); //object` <br> `layui.type(new Date()); // date` |
| layui.isArray(obj) <sup>2.7+</sup> | 對象是否為泛數組結構。如 Array、NodeList、jQuery 對象等<br> `layui.isArray([1,6]); // true` <br> `layui.isArray($('div')); // true` |
| layui.sort(obj, key, desc) | 將數組中的對象按某個成員重新對該數組排序，如：`layui.sort([{a: 3},{a: 1},{a: 5}], 'a');  // 返回：[{"a":1},{"a":3},{"a":5}]` |
| layui.url(href) | 鏈接解析。[#用法](#url) |
| layui.data(table, settings) | 持久化存儲。[#用法](#data) |
| layui.sessionData(table, settings) | 會話性存儲。[#用法](#data) |
| layui.device(key) | 獲取瀏覽器信息。[#用法](#device) |
| layui.hint() | 向控制檯打印一些異常信息，目前只返回了 error 方法，如： <br>`var hint = layui.hint();` <br> `hint.error('出錯啦');` |
| layui.stope(e) | 阻止事件冒泡 |
| layui.onevent(modName, events, callback) | 增加自定義模塊事件，一般在內置組件中使用。 |
| layui.event(modName, events, params) | 執行自定義模塊事件，搭配 onevent 使用。注<sup>2.8+</sup>：當 events 參數中未設定 filter 時則可重複執行該事件，否則只會執行一次最新添加的事件。 |
| layui.off(events, modName) <sup>2.5.7+</sup> | 用於移除模塊相關事件，如：`layui.off('select(filter)', 'form')`，那麼`form.on('select(filter)', callback)`事件將會被移除 |
| layui.debounce(fn, wait) <sup>2.8.3+</sup> | 防抖，函數按指定毫秒延時執行 |
| layui.throttle(fn, wait) <sup>2.8.3+</sup> | 節流，限制函數在指定毫秒內不重複執行 |
| layui.factory(modName) | 用於獲取模塊對應的 `layui.define()` 的回調函數 |
| var lay = layui.lay | 基礎模塊，提供了更多基礎 API，一般供 Layui 內置組件中使用 |

> 基礎 API 是整個 UI 的有力支撐，我們在組件的使用過程中也經常會用到。


