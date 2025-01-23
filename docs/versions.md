---
title: 更新日誌
toc: true
---

# 更新日誌

> 導讀：📑 [Layui 2.8+ 《升級指南》](/notes/2.8/upgrade-guide.html) · 📑 [Layui 新版文檔站上線初衷](/notes/2.8/news.html)

<h2 id="2.9.x" lay-toc="{title: '2.9.x'}"></h2>

<h2 id="v2.9.21" class="ws-anchor">
  v2.9.21
  <span class="layui-badge-rim" style="color: #16b777;">穩定版</span>
  <span class="layui-badge-rim">2025-01-03</span>
</h2>

- #### table
  - 新增 通過 `ResizeObserver` 自動處理 `table.reisze`，以適應所處容器的尺寸變化 #2411 @Sight-wcg
  - 修復 未正確導出合計行模板的問題 #2412 @sentsim
  - 優化 表格在隱藏元素中渲染的寬度問題 #2376 #2402 @Sight-wcg
  - 修復 IE8 下執行渲染的報錯問題 #2437 @Sight-wcg
- #### treeTable
  - 修復 直接賦值 `data` 時切換分頁出現報錯的問題 #2406 @sentsim
- #### tab
  - 新增 `element.tabDelete()` 方法的第三個參數，用於強制刪除 tab #2407 @sentsim
  - 修復 指定元素渲染，添加和刪除選項卡會導致全部 tab 重新渲染的問題 #2386 @Sight-wcg
  - 修復 出現展開按鈕時，活動選項卡底邊框顯示異常 #2387 @Sight-wcg
- #### form
  - 修復 `form.val()` 獲取 `multiple select` 值錯誤 #2425 @Sight-wcg
  - 修復 IE8 中 `checkbox` 半選異常問題 #2442 @Sight-wcg
- #### nav
  - 修復 IE 低版本下執行 `element.render('nav')` 的報錯問題 #2415 @Sight-wcg
- #### colorpicker
  - 修復 清空後點擊右側顏色滑塊，出現的顏色值錯誤 #2401 @Sight-wcg
- #### code
  - 增強 `onCopy` 可獲取複製狀態和阻止默認提示 #2419 @Sight-wcg
- #### 其他
  - 優化 `.layui-body` 和 `.layui-text` 樣式細節 #2395 @sentsim

### 下載： [layui-v2.9.21.zip](https://gitee.com/layui/layui/attach_files/2014210/download)

---

<h2 id="v2.9.20" class="ws-anchor">
  v2.9.20
  <span class="layui-badge-rim" style="color: #16b777;">穩定版</span>
  <span class="layui-badge-rim">2024-11-25</span>
</h2>

- #### table
  - 加強 固定列的滾動體驗使得其更接近原生的平滑 #2335 @Sight-wcg
  - 改進 表格自動調整大小的處理，以修復一些邊緣報錯問題 #2284 @Sight-wcg
  - 修復 由 #2250 造成的右側固定列偏移問題 #2318 @Sight-wcg
  - 修復 設置列寬仍然存在的一些邊緣情況 #2332 @Sight-wcg
  - 修復 排序且重載後 `table.cache` 數據中的 `LAY_INDEX` 丟失的問題 #2340 @sentsim
- #### layer
  - 新增 iframe 彈層在初始加載時的 loading 動畫 #2330 @sentsim
- #### dropdown
  - 重構 面板打開與關閉的邏輯 #2349 @sentsim
  - 調整 `closeOnClick` 選項默認值為 `true`，即點擊目標元素時自動切換打開與關閉 #2349 @sentsim
  - 修復 在元素自定義事件中創建實例並立刻顯示的報錯問題 #2349 @sentsim
- #### util
  - 修復 `util.on()` 多個方法並列使用時，同一委託元素的 `trigger` 衝突問題 #2348 @sentsim

### 下載： [layui-v2.9.20.zip](https://gitee.com/layui/layui/attach_files/1973261/download)

---

😹 `2.9.19` 版本因為存在一個小缺陷而被跳過

---

<h2 id="v2.9.18" class="ws-anchor">
  v2.9.18
  <span class="layui-badge-rim">2024-10-14</span>
</h2>

- #### table
  - 修復 重載時若當前頁超過總頁數，序號列渲染異常 #2247 @Sight-wcg
  - 修復 表格列寬計算一些邊緣情況 #2250 @Sight-wcg
  - 修復 table 在 Firefox 中偶現行閃爍的問題 #2260 @Sight-wcg
- #### layer
  - 改進 `maxWidth` 和 `maxHeight` 的處理 #2270 @Sight-wcg
  - 修復 `layer.path` 潛在的缺陷 #2257 @sentsim
- #### laydate
  - 優化 `date` 或 `datetime` 類型時點擊年列表換到月選擇器功能 #2235 @Diyar-IT
- #### dropdown
  - 新增 `click` 回調中傳遞的事件對象 #2273 @Sight-wcg
  - 新增 `closeOnClick` 選項，用於點擊觸發元素時是否關閉面板 #2274 @Sight-wcg
  - 新增 `onClickOutside` 回調函數，點擊下拉麵板外部時觸發 #2274 @Sight-wcg
  - 修復 `trigger:'contextmenu'` 時點擊自定義 `content` 任意處導致面板異常關閉的問題 #2274 @Sight-wcg
- #### nav
  - 修復 動態添加元素渲染異常的問題 #2276 @Sight-wcg

### 下載： [layui-v2.9.18.zip](https://gitee.com/layui/layui/attach_files/1930232/download)

---

<h2 id="v2.9.17" class="ws-anchor">
  v2.9.17
  <span class="layui-badge-rim">2024-09-25</span>
</h2>

- #### table
  - 修復 表格列寬計算問題 #2187 @Sight-wcg
  - 優化 慢速網絡下表頭數據加載時的列寬 #2205 @Sight-wcg
  - 增加 ` table.checkStatus()` 方法返回的 `dataCache`，即包含內部特定字段的緩存數據 #2239 @sentsim
  - 修復 返回數據均為 `LAY_DISABLED: true` 時默認全選的問題 #2239 @sentsim
- #### dropdown
  - 修復 移動端遮罩層點擊穿透問題 #2206 @Sight-wcg
- #### flow
  - 回滾 #1852 中加載時自動清除綁定元素內容的改動 #2218 @Sight-wcg
- #### 重要
  - 修復 `getPath` 內部方法潛在的 XSS 安全漏洞，建議儘快升級（[詳見低版本修復方式](https://layui.dev/notes/share/security-currentscript.html)） - [f756b41] @jackfromeast

### 下載： [layui-v2.9.17.zip](https://gitee.com/layui/layui/attach_files/1911445/download)

---

<h2 id="v2.9.16" class="ws-anchor">
  v2.9.16
  <span class="layui-badge-rim">2024-08-21</span>
</h2>

- #### select
  - 改進 `lay-search` 屬性，支持設置「是否大小寫敏感」和「模糊搜索」 #2121 @Sight-wcg
  - 修復 `lay-append-to` 屬性開啟時在 dropdown 中點擊 select 導致 dropdown 被關閉的問題 #2138 @Sight-wcg
- #### table
  - 重構 `table.setRowChecked()` 方法，以優化若干邊緣問題 #2146 @sentsim
  - 恢復 #1773 的變更，以避免設置自動寬度的列被拖拽時的異常問題 #2169 @Sight-wcg
- #### tab
  - 新增 `tabBeforeChange` 事件，tab 切換之前觸發，可用於阻止 tab 切換 #2111 @sunxiaobin89
- #### element
  - 新增 指定元素渲染的支持 #2162 @Sight-wcg
- #### upload
  - 新增 `error` 回調函數的第四個參數為 xhr 對象 #2151 @sentsim
- #### carousel
  - 修復 動態刪除條目至最後一個時調用 `inst.reload` 的異常問題 #2107 @sentsim
- #### 其他
  - 微調 `layui-text` 文本區域樣式，以更好地適配 Markdown #2126 @sentsim

### 下載： [layui-v2.9.16.zip](https://gitee.com/layui/layui/attach_files/1878209/download)

---

`2.9.15` 版本因為存在一個小缺陷而被跳過

---

<h2 id="v2.9.14" class="ws-anchor">
  v2.9.14
  <span class="layui-badge-rim">2024-07-09</span>
</h2>

- #### form
  - 改進 `select` 搜索，支持非連續、亂序字符匹配 #2065 @Sight-wcg
  - 優化 `checkbox` 的 `checked` 屬性設置為非 `boolean` 類型值時的異常問題 #2033 @Sight-wcg
  - 修復 `radio` 改變 `checked` 屬性值時，UI 更新異常的問題 #2084 @Sight-wcg
- #### table
  - 優化 行單雙擊事件機制，避免與單元格編輯等事件衝突 #2064 @sentsim
- #### treeTable
  - 修復 `cols` 的 `exportTemplet` 函數導出異常的問題 #2034 @sentsim
- #### carousel
  - 修復 點擊切換按鈕會觸發 `form` 表單 `submit` 事件的問題 #2059 @Pencil-hzp

### 下載： [layui-v2.9.14.zip](https://gitee.com/layui/layui/attach_files/1830626/download)

---

<h2 id="v2.9.13" class="ws-anchor">
  v2.9.13
  <span class="layui-badge-rim">2024-06-18</span>
</h2>

> 頗具看點的一個版本 🎉🎉🎉

- #### form
  - 新增 `checkbox,radio` 的數據驅動功能，可直接設置 `checked` 屬性更新 UI #2004 @Sight-wcg
  - 新增 `select` 的 `lay-append-to` 屬性，用於將 `select` 面板追加到給定的元素中 #1926 @Sight-wcg
- #### table
  - 重構 `defaultToolbar` 選項，增加 `onClick` 事件，可自定義文件導出等操作 #2019 @sentsim
  - 優化 表格數據量較大時行選中的性能 #2004 @Sight-wcg
- #### layer
  - 新增 `btnAsync` 選項，用於對按鈕進行異步操作 #2002 @Sight-wcg
- #### laydate
  - 修復 日期範圍聯動模式中，點擊任一側邊緣日期時，另一側面板未正確切換的問題 #2005 @Diyar-IT @Sight-wcg
  - 優化 選中主題色 #2018 @sentsim
- #### upload
  - 優化 `error` 回調函數的返回參數，增加返回值 #1988 @Pencil-hzp
  - 修復 `auto` 選項開啟且 `before` 返回 `false` 後再次選擇同一文件不自動上傳的問題 #1991 @langyan1022
- #### dropdown
  - 修復 重複 `render` 時未 reload 的問題 #2022 @Sight-wcg
- #### treeTable
  - 修復 `treeTable.reloadAsyncNode` 方法重載節點異常 #2014 @Sight-wcg
- #### tab
  - 修復 `element.tabAdd()` 第二個參數的 `id` 選項若傳入特殊字符時的異常問題 #1992 @Sight-wcg
- #### colorpicker
  - 修復 移動端顏色選取異常的問題 #1986 @Sight-wcg

### 下載： [layui-v2.9.13.zip](https://gitee.com/layui/layui/attach_files/1805830/download)

---

`2.9.12` 版本因為存在缺陷而被跳過

---

<h2 id="v2.9.11" class="ws-anchor">
  v2.9.11
  <span class="layui-badge-rim">2024-06-05</span>
</h2>

- #### tab
  - 新增 標籤頭 `lay-allowclose="false"` 屬性支持，用於給指定標籤禁用刪除圖標 #1955 @Sight-wcg
  - 新增 `element.tabAdd()` 第二個參數的 `allowClose` 選項，用於是否顯示關閉圖標 #1955 @Sight-wcg
  - 新增 `tabBeforeDelete` 事件，返回 `false` 時可阻止關閉對應的選項卡 #1955 @Sight-wcg
  - 優化 當標籤頭存在 `lay-id` 屬性時，根據其屬性值切換或刪除對應的內容，方便拖拽排序 #1955 @Sight-wcg
  - 優化 標籤相關事件的返回參數，新增 `id` 屬性 #1955 @Sight-wcg
- #### layer
  - 新增 `beforeEnd` 回調函數選項，在彈層關閉之前觸發，可用於阻止彈層關閉 #1968 @Sight-wcg
  - 修復 在某些瀏覽器的兼容模式下報錯無法彈出的問題 #1940 @meihangbo
- #### select
  - 調整 當開啟 `lay-creatable` 時，新創建的 `<option>` 元素顯示在頂部 #1950 @Sight-wcg
  - 新增 循環切換選中元素的支持 #1950 @Sight-wcg
  - 修復 開啟 `lay-creatable` 後方向鍵切換選中元素偶現異常 #1950 @Sight-wcg
- #### upload
  - 新增 `before` 返回值為 Promise 和 Deferred Promise 對象類型的支持 #1919 @Sight-wcg
- #### flow
  - 新增 `moreText` 選項，用於自定義"加載更多"按鈕文本 #1965 @Pencil-hzp
- #### treeTable
  - 修復 `data` 模式非深度重載時，若未傳入 `data` 選項導致表格數據被清除的問題 #1938 @Sight-wcg
- #### colorpicker
  - 優化 遊標滑動效果 #1923 @Sight-wcg
- #### lay
  - 修復 IE8-10 中 `lay.off` 無法解除 `lay.on` 綁定的事件的問題 #1964 @Sight-wcg

### 下載： [layui-v2.9.11.zip](https://gitee.com/layui/layui/attach_files/1793865/download)

---

<h2 id="v2.9.10" class="ws-anchor">
  v2.9.10
  <span class="layui-badge-rim">2024-05-20</span>
</h2>

- #### table
  - 加強 `loading` 選項，以支持數據加載時的自定義動畫風格 #1893 @Sight-wcg
  - 修復 上個版本導致的 `table.setRowChecked` 的 `index` 選項為數組值時無法選中的問題 #1914 @Sight-wcg
- #### treeTable
  - 修復重載數據時，指定參數 `scrollPos: 'fixed'` 無效的問題 #1892 @jichuanan
  - 改進內部 `flatToTree` 函數性能 #1912 @Sight-wcg
- #### colorpicker
  - 優化遊標顯示效果 #1863 @Sight-wcg
- #### form
  - 修復 `form.val()` 為 radio 設置布爾值時的失效問題 #1903 @meihangbo
- #### 其他
  - 將部分組件上的 `lay-id` 屬性重命名為 `lay-${MOD_NAME}-id` #1898 @Sight-wcg

### 下載： [layui-v2.9.10.zip](https://gitee.com/layui/layui/attach_files/1773905/download)

---

<h2 id="v2.9.9" class="ws-anchor">
  v2.9.9
  <span class="layui-badge-rim">2024-05-05</span>
</h2>

- #### laydate
  - 新增 `mark` 和 `holidays` 選項的函數類型支持，以實現更靈活的賦值 #1786 @Sight-wcg
  - 新增 `cellRender` 選項，用於自定義單元格內容，可實現農曆擴展 #1843 @Sight-wcg
  - 新增 `formatToDisplay` 選項，僅用於格式化日期顯示的格式 #1788 @Sight-wcg
  - 修復點擊時間時 `change` 回調未觸發的問題 #1787 @Sight-wcg
- #### treeTable
  - 新增對 `tree.view` 的圖標相關選項中的 className 設置功能 #1808 @Sight-wcg
  - 修復刪除所有行後，再次添加新行失敗的問題 #1758 @Sight-wcg
  - 修復刪除所有行後，全選按鈕選中的問題 #1759 @Sight-wcg
  - 修復刪除子節點時，內部緩存未同步的問題 #1760 @Sight-wcg
  - 修復節點移動後，點擊事件中行索引獲取錯誤的問題 #1760 @Sight-wcg
  - 修復添加和刪除節點時，未更新節點圖標的問題 #1784 @Sight-wcg
  - 修復刪除子節點時，內部未更新 `isParentKey` 的問題 #1792 @Sight-wcg
  - 修復節點移動後，行索引獲取錯誤 #1812 @Sight-wcg
- #### form
  - 修復 `select`  組件當設置 `lay-creatable=""` 屬性時的 XSS 問題 #1813 @Sight-wcg
- #### tree
  - 修復編輯節點標題時的 XSS 問題 #1845
- #### upload
  - 新增 `choose` 回調的 `getChooseFiles` 方法，用於獲取本次選取的文件 #1849 @Sight-wcg
  - 修復多文件上傳時能選擇已在隊列中的文件的問題 #1757 @Diyar-IT
- #### dropdown
  - 將 `id` 選項添加到觸發元素的 `lay-id` 屬性上，以配合其它組件使用 #1761 @Sight-wcg
- #### element
  - 改進自定義 tab 的索引獲取 #1853 @Sight-wcg
- #### colorpicker
  - 優化遊標顯示問題 #1850 @Sight-wcg
  - 優化 RGBA 顏色輸入框顯示不全的問題 #1851 @Sight-wcg
- #### flow
  - 加強 `flow.load` 以便在重複執行時解除舊的事件 #1852 @Sight-wcg

### 下載： [layui-v2.9.9.zip](https://gitee.com/layui/layui/attach_files/1757745/download)

---

<h2 id="v2.9.8" class="ws-anchor">
  v2.9.8
  <span class="layui-badge-rim">2024-03-31</span>
</h2>

- #### form
  - 新增 `checkbox, radio` 組件更靈活的多選和單選模板自定義功能 #1686 @Sight-wcg
  - 新增 `input-number` 組件的 `lay-precision` 屬性值為 `0` 時的取整支持
  - 修復 `select` 組件的 `lay-creatable` 屬性在舊版微軟拼音輸入法兼容性問題 #1667 @Sight-wcg
- #### treeTable
  - 修復 點擊表頭排序後，內部緩存數據和表格顯示數據不一致的問題 #1734 @Sight-wcg
- #### laydate
  - 新增 `disabledDate, disabledTime` 選項，用於設置不可選取的日期和時間 #1569 @Sight-wcg
  - 優化 `holidays` 節假日標註在數字前置為 `0` 失效的問題 #1719 @Sight-wcg
- #### slider
  - 新增 `step` 選項的小數支持 #1663 @Sight-wcg
  - 修復 Firefox 瀏覽器中拖動滑塊時會選中文本的問題 #1716 @Sight-wcg
- #### dropdown
  - 新增 `dropdown.open()` 方法，用於外部打開下拉菜單面板 #1693 @Sight-wcg
- #### upload
  - 新增 圖片 `.webp` 默認格式支持

### 下載： [layui-v2.9.8.zip](https://gitee.com/layui/layui/attach_files/1720816/download)

---

<h2 id="v2.9.7" class="ws-anchor">
  v2.9.7
  <span class="layui-badge-rim">2024-02-28</span>
</h2>

- #### select
  - 新增 `lay-creatable` 屬性，用於在開啟搜索時允許創建新選項 #1618 @Sight-wcg
- #### table
  - 修復 禁止拖拽列寬後仍可拖拽的問題 #1591 @Sight-wcg
- #### layer
  - 新增 遮罩層添加過渡效果 #1616 @Sight-wcg
  - 修復 彈出高度設置為 `auto` 時，恢復大小時內容區高度錯誤 #1617 @Sight-wcg
  - 優化 最大/小化再恢復大小後寬高偶現細微差異的問題 #1653 @Sight-wcg
- #### laydate
  - 新增時間選擇器根據 `format` 格式進行顯隱支持 #1656 @Sight-wcg
- #### dropdown
  - 新增 close 選項，用於下拉麵板被關閉後觸發的回調函數 #1605 @Sight-wcg
- #### flow
  - 新增 direction 選項，用於設置觸發加載的方向 #1638 @Sight-wcg
- #### 其他
  - 修改 源碼 Unicode 編碼轉換為中文字符 #1600 @Sight-wcg

### 下載： [layui-v2.9.7.zip](https://gitee.com/layui/layui/attach_files/1685481/download)

---

<h2 id="v2.9.6" class="ws-anchor">
  v2.9.6
  <span class="layui-badge-rim">2024-01-24</span>
</h2>

- #### table
  - 新增 `table.updateRow` 方法，用於更新指定行 #1540 @Sight-wcg
  - 修復 關閉展開狀態時，未重置單元格滾動條位置的問題 #1536 @Sight-wcg
  - ~~修復 Chrome DevTools 審查 iframe srcdoc 中的 table 元素時導致頁面崩潰的問題~~ #1571
    <br> Chrome 121.0.x 版本自身已修復 DevTools 導致的網頁崩潰問題，因此上述補丁已在 v2.9.6 中移除 #1584
- #### laydate
  - 優化 時間選擇器在 Safari on iOS, Firefox for Android 中的滑動操作 #1550 @Sight-wcg
- #### slider
  - 新增 `tipsAlways` 選項，用於設置提示文本是否始終顯示 #1520 @yxb94616

### 下載： [layui-v2.9.6.zip](https://gitee.com/layui/layui/attach_files/1660301/download)

---

`2.9.4 / 2.9.5` 版本因為存在缺陷而被跳過

---

<h2 id="v2.9.3" class="ws-anchor">
  v2.9.3
  <span class="layui-badge-rim">2023-12-31</span>
</h2>

2023 收官。

- #### form
  - 優化 `input` 組件圓角時後綴存在方框的問題 #1467 @bxjt123
  - 優化 `select` 搜索面板打開邏輯，以適配文字直接粘貼觸發搜索的情況 #1498 @Sight-wcg
- #### table
  - 修復非常規列設置 `field` 表頭選項時，導出 excel 出現合計行錯位的問題 #1522 @Sight-wcg
- #### treeTable
  - 修復 `treeTable.updateNode()` 更新已打開的節點時，未重新渲染表單元素的問題 #1468 @Sight-wcg
- #### laydate
  - 修復 開啟 `rangeLinked` 時，選擇同一日期，某些情況時間會反選的問題 #1517 @Sight-wcg
- #### upload
  - 加強 `data` 選項的函數寫法，支持獲取文件相關數據 #1494 @Sight-wcg
- #### transfer
  - 新增 `dblclick` 回調函數選項 #1491 @Sight-wcg
- #### 移動端的適配
  - 修復 `rate,carousel` 一些小問題 #1469 @Sight-wcg

### 下載： [layui-v2.9.3.zip](https://gitee.com/layui/layui/attach_files/1633409/download)

---

<h2 id="v2.9.2" class="ws-anchor">
  v2.9.2
  <span class="layui-badge-rim">2023-12-18</span>
</h2>

`2.9.x` 是對 `2.8.18` 的進一步完善，旨在打造一個可長期用於生產環境的穩定版本。對 `2.8.x` 向下兼容，可覆蓋升級。

- #### 移動端的改進
  - 新增 `slider,layer,carousel,laydate,rate,colorpicker` 手勢操作支持 #1446 @Sight-wcg
  - 新增 `lay` 模塊中針對手勢操作的多個基礎方法 #1446 @Sight-wcg
- #### table
  - 修復 IE 下的報錯問題 #1453 @Sight-wcg
- #### form
  - 修復 `select` 在 IE10+ 中的兼容性問題 #1452 @Sight-wcg
- #### dropdown
  - 增強 `delay` 選項，支持設置 顯示/隱藏 的延遲時間 #1454 @Sight-wcg

### 下載： [layui-v2.9.2.zip](https://gitee.com/layui/layui/attach_files/1615568/download)

---

<h2 id="2.9.1" class="ws-anchor">
  2.9.1
  <span class="layui-badge-rim">2023-12-11</span>
</h2>

- #### table
  - 增強 `height` 選項，支持函數 #1437  @Sight-wcg
  - 增強 `table.setRowChecked()` 方法，支持批量選中 [7c12ddf]
  - 修復 全選時，禁用行仍有選中樣式的問題 #1436 @Sight-wcg
  - 修復 `templet` 模板字符中的一些特殊 laytpl 界定符被轉義的問題 #1438 @Sight-wcg
- #### layer
  - 修復 `iframe` 層在某些情況出現異常縱向滾動條的問題 [8f0c87f]
  - 優化 `layer.tips` 在觸發元素高度較小時的定位 #1439 @Sight-wcg
- #### treeTable
  - 修復 `treeTable.reloadData()` 在某些情況下報錯的問題 [3f148a9]
- #### laydate
  - 清除 內部 `MODE_NAME` 變量重複聲明 #1441 @mek1986
- #### laypage
  - 新增 `countText` 選項，用於自定義數據總數區域文本 #1444 @Sight-wcg
- #### nav
  - 修復 IE8 下子菜單背景色問題 #1445 @Sight-wcg
- #### util
  - 優化 `util.on()` 在特殊情況下的用法問題 [3b78139]

### 下載： [layui-v2.9.1.zip](https://gitee.com/layui/layui/attach_files/1608279/download)

---

<h2 id="2.9.0" class="ws-anchor">
  2.9.0
  <span class="layui-badge-rim">2023-11-29</span>
</h2>

- #### table
  - 修復 `complete` 屬性導致 `$.ajaxSetup()` 的 `complete` 失效的問題 #1423 @Sight-wcg
  - 修復 單元格展開再收縮後，當列通過拖拽改變過寬度，列存在概率性錯位的問題 [28347fc]
  - 修復 合計行單元格展開異常的問題 #Gitee-I8FH3K
  - 優化 `height` 屬性高度鋪滿語法中不支持浮點型數值的問題 #Gitee-I8DSPH
  - 優化 關閉單元格多行展開狀態後，懸停狀態樣式未移除的問題 #1425 @Sight-wcg
  - 優化 在末行展開單元格後，出現的固定列水平未對齊的問題 [85add62]
  - 優化 當數據值為 `0,undefined,null` 且開啟列模板，編輯單元格會帶入模板字符的問題 [1d408f0]
- #### util
  - 優化 `util.on()` 方法，提升參數的靈活性和代碼的可讀性 [d74abb4] [92c8580]
- #### layer
  - 優化 `layer.closeLast()` 方法，給第二個參數增加回調函數 [ab4ded2]
- #### tree
  - 修復 `title` 有特殊字符時點擊編輯的顯示問題 #1432 @Sight-wcg
- #### colorpicker
  - 優化 內部輸入框取值，移除字符串兩側的空白字符 #1427 @Sight-wcg
- #### 其他
  - 優化 `lay.clipboard.writeText()` 邏輯，以適配無寫入權限時的場景 #1421 @Sight-wcg

### 下載： [layui-v2.9.0.zip](https://gitee.com/layui/layui/attach_files/1597365/download)

<script>
(function(){
  // 解析更新日誌關聯鏈接
  var elem = document.querySelectorAll('#WS-text li');
  elem.forEach(function (item) {
    item.childNodes.forEach(function (node) {
      if (node.nodeType === 3) {
        var nodeValue = node.nodeValue;
        var types = [
          {
            rule: /(#)Gitee-(\S+)/g,
            href: 'https://gitee.com/layui/layui/issues/'
          },
          {
            rule: /(#)(\d+)/g,
            href: 'https://github.com/layui/layui/pull/'
          },
          {
            rule: /\[()([\d\w]+)\]/g,
            href: 'https://github.com/layui/layui/commit/'
          },
          {
            rule: /(@)(\S+)/g,
            href: 'https://github.com/'
          }
        ];
        var i = 0;
        var sNode = document.createElement('span');
        for (; i < types.length; i++) {
          if (types[i].rule.test(nodeValue)) {
            nodeValue = nodeValue.replace(types[i].rule, function(s, s1, s2) {
              return '<a href="'+ types[i].href + s2 +'" target="_blank">'+ s1 + s2 +'</a>';
            });
            node.matched = true;
          }
        }
        if (node.matched) {
          sNode.innerHTML = nodeValue;
          node.parentNode.insertBefore(sNode, node);
          node.parentNode.removeChild(node);
        }
      }
    });
  });
})();
</script>

---

<h2 id="2.8.x" lay-toc="{title: '2.8.x'}"></h2>

<h2 id="2.8.18" class="ws-anchor">
  2.8.18
  <span class="layui-badge-rim">2023-10-31</span>
</h2>

- #### form
  - 新增 `input` 數字輸入框組件的特定屬性 `lay-precision`，用於設置數值精度 # 1375/I81SY4
  - 優化 `input` 數字輸入框組件的失去焦點對值的有效範圍約束 # 1375/I7KU6V
  - 優化 `input` 數字輸入框組件當值達到臨界點時加減按鈕的禁用視覺效果 # 1375
  - 優化 `input` 數字輸入框當表單驗證失敗時的邊框顏色 # 1371
- #### nav
  - 新增 垂直導航菜單展開和收縮時的過渡動畫 # 1407
  - 新增 `lay-accordion` 屬性支持，用於開啟手風琴，兼容舊版 `lay-shrink="all"` # 1384
- #### layer
  - 新增 `photos` 層的鼠標滾輪縮放功能 # I7ZAE8
  - 優化 移動端定位 # 1376
- #### table
  - 新增 `complete` 屬性，當數據接口請求完成後執行，無論成功還是失敗均會觸發 # 1379
  - 修復 `ignoreExport` 表頭屬性值效果與文檔不符的問題 # I86DBY
  - 修復 `type: 'radio'` 且為右側固定列時，選擇效果無效的問題 # 1406
  - 優化 鼠標在固定列滾輪時無法觸發滾動條的問題 # I8CGZH
  - 優化 某些情況在 Firefox 的報錯問題
- #### treeTable
  - 修復 `treeTable.removeNode()` 在開啟 `data` 模式時刪除異常問題 # I7Z0AB/I82E2S
  - 修復 `treeTable.setRowChecked()` 方法未逐層展開上級節點的問題 # 1385/I84RUT
  - 修復 `treeTable.addNodes()` 新增根節點時出現的報錯問題 # 1414
  - 修復 數據格式為簡單類型時 IE9+ 兼容問題 # 1415/I8C04Y
- #### upload
  - 修復 `unified: true` 時的報錯問題 # 1391
  - 優化 渲染入口邏輯，以解決因重複渲染導致的若干問題 # 1391
  - 優化 實例的 `reload` 方法，可更好地進行完整重載 # 1391
- #### dropdown / menu
  - 新增 `accordion` 屬性，開啟手風琴效果（menu: 主容器設置 `lay-accordion` 屬性） # 1397
  - 新增 摺疊展開動畫效果 # 1397
- #### laydate
  - 優化 `rangeLinked` 屬性開啟時，點擊目標元素可重新渲染的問題 # 1391
  - 優化 `type` 為 `time,datetime` 選擇器時，「現在」按鈕的禁用狀態判斷條件 # I828CD
- #### laypage
  - 新增 `limitTemplet` 屬性，用於自定義條目模板 # I80AHZ
  - 新增 `skipText` 屬性，用於自定義跳頁區域文本 # I80AHZ
- #### carousel
  - 優化 輪播切換時的動畫效果 # 1378/I82STP
- #### rate / slider
  - 優化 代碼細節 # 1374
- #### code
  - 新增 `code` 屬性，用於設置原始 code 值，優先級高於目標元素中的內容 # 1391
  - 優化 預覽區域顯示效果 # 1398
  - 優化 其他若干小問題 # 1391
- #### 其他
  - 新增 Source Maps 支持  # 1404/I89W5P
  - 新增 lay 模塊部分函數 JSDoc 註釋和示例 #1401
  - 優化 `<hr>` 全局樣式優先級 # I86R6G

### 下載： [layui-v2.8.18.zip](https://gitee.com/layui/layui/attach_files/1570299/download)

---

<h2 id="2.8.17" class="ws-anchor">
  2.8.17
  <span class="layui-badge-rim">2023-09-11</span>
</h2>

- #### table
  - 新增 `cellExpandedMode` 基礎屬性，用於設置所有單元格默認展開方式 # I7XW28 [8bd8415]
  - 新增 `cellExpandedWidth` 基礎屬性，用於設置所有單元格默認展開後的寬度 [8bd8415]
  - 新增 `expandedMode` 表頭屬性，用於設置當前表頭單元格展開方式，優先級高於 `cellExpandedMode` [8bd8415]
  - 修復 導出來自 treeTable 數據的順序錯亂問題 # I7YOXZ [3123adf]
- #### form
  - 優化 驗證機制，以確保自定義驗證規則的靈活性，內置規則若為必填項，依舊需疊加 `required` 規則 [a00ecf2]
  - 剔除 `verIncludeRequired` 全局屬性，因為會造成不必要的歧義 [a00ecf2]
- #### laydate
  - 修復 開啟 `rangeLinked` 屬性後，done 函數第二個參數未能正確返回開始日期的問題 #I7XBOA/I7YCHW [4d9365e]
  - 修復 開啟 `rangeLinked` 且 `range` 為數組時，當初始值格式不符而自動校正導致的開始日期表單賦值異常問題 [4d9365e]
- #### upload
  - 新增 `dataType` 屬性，用於定義服務端返回的數據類型 [58e675c]
  - 優化 多文件模式中，正在上傳中的文件會被再次觸發上傳的問題 # I7XXTW/I4C6XE [9a6b85f]
- #### code
  - 重構 主體結構，以更好地適配第三方語法高亮庫 # 1352 [ad5935c]
  - 新增 實例返回的對象，包含對當前實例進行重載等方法成員 [ad5935c]
  - 新增 `codeRender` 函數，用於重新渲染 code，譬如代碼高亮處理 # 1352
  - 新增 `highlighter` 屬性，用於指定語法高亮器，支持 `hljs,prism,shiki` 等流行庫 # 1352
  - 新增 `lang` 屬性，用於指定語言類型 # 1352
  - 新增 `langMarker` 屬性，用於是否在代碼域右上角顯示語言類型 # 1352
  - 新增 `wordWrap` 屬性，用於設置文字是否自動換行 [ad5935c]
  - 加強 `tools` 屬性，進一步提升可擴展性 [ad5935c]
  - 優化 `dark` 模式主題，與 vscode 保持一致 [ad5935c]
- #### lay
  - 新增 `lay.clipboard.writeText(options)` 方法，用於寫入剪切板（複製） [5a00d0a]
- #### 公共類
  - 新增 `layui-padding-*` 和 `layui-margin-*` 內外邊距樣式類名 [5e0d71d]

### 下載： [layui-v2.8.17.zip](https://gitee.com/layui/layui/attach_files/1523966/download)

---

<h2 id="2.8.16" class="ws-anchor">
  2.8.16
  <span class="layui-badge-rim">2023-08-30</span>
</h2>

- #### layer
  - 新增 `photos` 的 `toolbar` 屬性，用於開啟圖片旋轉 放大 縮小 還原等頭部工具欄 # 1339
  - 調整 `photos` 的 屬性名： `hideFooter → footer`，用於是否開啟底部欄
- #### table
  - 優化 初始化時的樣式渲染及多行模式的內容結構
  - 優化 `size` 為 `sm` / `lg` 時的展開狀態
  - 優化 無數據時的導出和打印功能提示 # 1337
  - 優化 數據項為禁用狀態的選中狀態 # 1328
  - 優化 `table.renderData()` 方法執行了多餘排序的問題 # 1358
- #### treeTable
  - 修復 部分操作之後 `radio` 列選中狀態丟失的問題 # 1358
  - 修復 `data` 模式下排序之後出現節點結構錯亂的問題 # 1358/I7TXXL
  - 優化 `data.cascade` 屬性，新增 `none` 可選值，即操作節點時不做任何聯動 # 1358
  - 優化 數據項為禁用狀態時的全選複選框的狀態 # 1329
  - 優化 異步加載子節點為空時的展開狀態 # 1326
- #### laydate
  - 優化 `shortcuts.value` 快捷選項的賦值屬性，支持函數類型 # 1324
- #### rate
  - 優化 代碼書寫格式 # 1343
- #### code
  - 修復 自定義工具欄出現的報錯問題 # 1342
  - 優化 複製功能，以兼容非安全域下複製失敗的問題 #1356
  - 優化 預覽區未能顯示滾動條的問題 # 1359

### 下載： [layui-v2.8.16.zip](https://gitee.com/layui/layui/attach_files/1511975/download)

---

<h2 id="2.8.15" class="ws-anchor">
  2.8.15
  <span class="layui-badge-rim">2023-08-16</span>
</h2>

- #### table
  - 新增 `expandedWidth` 表頭屬性，用於設置單元格被展開後的寬度
  - 優化 單元格內容下拉展開狀態面板，以解決此前因展開後內容不可操作等問題 # I7RS8S
  - 優化 `table.reload()` 造成 `window resize` 事件重複綁定的問題 # I7RJWY
  - 優化 多行模式在 Firefox 的內容顯示問題
- #### layer
  - 優化 開啟默認動畫彈出層後，鼠標移入按鈕出現往上偏移的問題 # I7QVVP
  - 優化 彈層右上角關閉按鈕因上個版本更新導致的主題樣式異常問題 # I7TP11
- #### dropdown
  - 新增 `customName` 屬性，用於自定義 `data` 屬性中常用的字段名稱
  - 修復 在某些特殊情況下調整瀏覽器窗口尺寸時出現的 `resize` 事件報錯問題
- #### tree
  - 新增 `customName` 屬性，用於自定義 `data` 中常用的字段名稱
- #### lay
  - 新增 `lay.style()` 方法，用於向頁面創建 style 樣式
  - 優化 `lay.position()` 方法，可讓下拉彈出元素的定位更智能

### 下載： [layui-v2.8.15.zip](https://gitee.com/layui/layui/attach_files/1499232/download)

---

因 `2.8.14` 版本存在 layer 主題樣式異常問題，`2.8.14` 已被跳過。

---

<h2 id="2.8.13" class="ws-anchor">
  2.8.13
  <span class="layui-badge-rim">2023-08-08</span>
</h2>

- #### table
  - 優化 在自定義模板中放置 `checkbox` 時對應的文字顯示異常問題 # I7LQNO
  - 優化 `totalRow` 屬性在 `table.reloadData()` 數據重載時的支持 # I7R6VY
- #### treeTable
  - 修復 執行 `treeTable.addNodes()` 增加節點導致當前節點選中狀態丟失的問題 # I7Q6IP
  - 優化 刪除節點時，對容器尺寸重新進行自動適配
- #### tree
  - 優化 容器樣式，以解決用於其他組件內部可能造成的樣式異常問題 # I7QAO3
- #### dropdown
  - **調整** `data.title` 屬性對 HTML 的轉義處理。若不轉義，可通過 `templet` 屬性實現 # I7Q6IV
- #### util
  - 重構 `util.toDateString()` 轉換日期格式字符組件，以提供更強大的佔位符支持 # 1314
  - 修復 `util.fixbar()` 組件因 `default` 屬性在 IE8 出現的保留字報錯問題

### 下載： [layui-v2.8.13.zip](https://gitee.com/layui/layui/attach_files/1490273/download)

---


<h2 id="2.8.12" class="ws-anchor">
  2.8.12
  <span class="layui-badge-rim">2023-08-01</span>
</h2>

- #### form
  - 優化 `input` 數字輸入框在前置後置結構中的樣式 # I7KTQB
- #### layer
  - 修復 設置 `scrollbar` 屬性禁用頁面滾動條時，點擊最大化再還原導致滾動條又重新出現的問題 # I7NTGX
  - 修復 彈層容器中的 `id` 值與其他彈層索引值相同時，導致關閉彈層存在衝突問題 # I7PF0O
- #### upload
  - 修復 `auto: false` 時，打開文件選擇框並點擊取消後，導致文件上傳失效的問題 # I7NU31
- #### treeTable
  - 新增 `tree.data.cascade` 屬性，用於設置複選的級聯方式，默認 `all` # 1309
  - 修復 右側固定列選中背景色沒有和主體選中狀態保持同步的問題 # I7NVCU
  - 調整 樹形轉平鋪的方法，保留節點的 `children` 信息 # 1309
  - 調整 重載時的參數拷貝，由默認深拷貝換成默認淺拷貝，以便與 table 組件保持一致 # 1309/I7NN0O
- #### tree
  - 優化 `checked` 屬性賦值機制，若初始數據源存在該屬性，才對其進行動態賦值
  - 優化 `spread` 屬性賦值機制，若初始數據源存在該屬性，則展開和收縮時，自動對其更新狀態值
- #### 其他
  - 修正 code 中部分單詞拼寫錯誤 # 1310

### 下載： [layui-v2.8.12.zip](https://gitee.com/layui/layui/attach_files/1482367/download)

---

<h2 id="2.8.11" class="ws-anchor">
  2.8.11
  <span class="layui-badge-rim">2023-07-13</span>
</h2>

- #### form
  - 修復 `radio` 標題模板中若存在圖標，選中時該圖標被強制更改的問題 # I7IERB
  - 優化 `input` 數字輸入框的精度問題 # I7I7J2
  - 修正 `verIncludelRequired` 屬性名為 `verIncludeRequired` # 1305
- #### table
  - 修復 導出統計行中若存在逗號出現的內容分隔異常問題 # I7IDA3
  - 修復 當點擊篩選顯示隱藏固定列時出現的未對齊的問題 # I7KQ0O
- #### menu
  - 修復 `menu` 標題項自定義圖標在展開收縮後被強制更改的問題 # 1303/I7JAPU
- #### tree
  - 修復 點擊複選框時未將對應的數據中的 `checked` 屬性值進行同步的問題

### 下載： [layui-v2.8.11.zip](https://gitee.com/layui/layui/attach_files/1464525/download)

---

<h2 id="2.8.10" class="ws-anchor">
  2.8.10
  <span class="layui-badge-rim">2023-07-03</span>
</h2>

- 修復 `layui.js` 在 IE 和 Safari 等「古董瀏覽器」存在一個正則零寬斷言報錯的問題 # I7HZCZ/I7I0TO

### 下載： [layui-v2.8.10.zip](https://gitee.com/layui/layui/attach_files/1455365/download)

---

<h2 id="2.8.9" class="ws-anchor">
  2.8.9
  <span class="layui-badge-rim">2023-07-03</span>
</h2>

- #### form
  - 新增 `input` 數字輸入框組件，通過動態點綴 `lay-affix="number"` 屬性開啟
  - 優化 `input,textarea` 禁用狀態時的樣式 # I7GN5Z
- #### table
  - 優化 點擊單元格出現編輯框時，不觸發行事件
- #### treeTable
  - 修復 選中和取消選中時，父節點和子節點的選中背景色未能正確同步的問題 # I7FUD6
- #### upload
  - 新增 `text` 屬性，用於自定義內部各類場景下的提示文本
- #### util
  - 重構 `countdown` 倒計時組件，採用 `options` 參數寫法，但仍對舊版兼容
  - 新增 `countdown` 的 `date,now,clock,done` 等屬性
  - 新增 `countdown` 的 `clear,reload` 等實例方法，用於清除和重置倒計時等操作

### 下載： [~~layui-v2.8.9.zip~~](https://gitee.com/layui/layui/attach_files/1454465/download)

---

<h2 id="2.8.8" class="ws-anchor">
  2.8.8
  <span class="layui-badge-rim">2023-06-20</span>
</h2>

- #### form
  - 新增 `input` 獲取焦點時的光環效果，以提升當前活動輸入框的辨別度
  - 取消 上個版本對 `select` 開啟搜索時 `value` 的改動，由於存在若干不可控的影響
- #### table
  - 新增 `colTool` 事件，點擊表頭自定義元素觸發，並返回當前列的相關信息，提升 table 的可玩性
  - 新增 `row,tool,checkbox,radio` 事件返回的 `dataCache` 屬性，可獲得當前行緩存數據，包含特定字段
- #### upload
  - 新增 `unified` 屬性，用於選擇多文件時是否統一上傳，即只發送一次請求 # I6Z171
- #### 其他
  - 優化 `layui.js,layer.js` 部分代碼細節 # 1285

### 下載： [layui-v2.8.8.zip](https://gitee.com/layui/layui/attach_files/1444541/download)

---

<h2 id="2.8.7" class="ws-anchor">
  2.8.7
  <span class="layui-badge-rim">2023-06-16</span>
</h2>

- #### form
  - ~~優化 `select` 開啟搜索時輸入狀態，將值轉移到 `placeholder`，便於輸入~~ # 1280
    <br>*注：由於存在若干影響，該項功能已在 `2.8.8` 中取消*
- #### table
  - 新增 表頭複選框的半選效果，當數據項部分選中且未全選時顯示
  - 優化 `table.setRowChecked()` 方法，新增當前行選中背景色，便於與 hover 等活動背景色區分
  - 剔除 `table.setRowChecked()` 方法中的 `selectedStyle` 屬性，因為沒有實質意義
  - 優化 表頭部分字段為 `hide` 在數據異常的情況下可能出現的表頭錯位的問題 # 1281
  - 優化 `done` 回調函數，新增參數 `origin` 用於區分重載和重新渲染數據 # 1281
  - 加強 `ignoreExport` 表頭屬性，允許指定不排除哪些字段 # 1281
- #### treeTable
  - 新增 `view.expandAllDefault` 屬性，用於設置是否默認展開全部節點 # 1281
  - 修復 開啟排序且在 `done` 回調中執行了 `expandAll` 展開全部導致死循環問題 # 1281
  - 修復 執行 `treeTable.reload(id)` 若 `id` 未匹配到對應實例時出現的報錯問題 # 1281/I7CXLN
- #### grid
  - 修復 space30 和 space32 邊距相同的問題 # I7D7YP

### 下載： [layui-v2.8.7.zip](https://gitee.com/layui/layui/attach_files/1441026/download)

---

<h2 id="2.8.6" class="ws-anchor">
  2.8.6
  <span class="layui-badge-rim">2023-06-08</span>
</h2>

- #### table
  - 新增 `table.renderData(id)` 方法，用於重新渲染數據，可搭配 `table.cache` 使用 # 1273
  - 修復 `table.hideCol(id, cols)` 第二個參數為普通對象時的異常問題 # 1270/I7AAUN
  - 修復 多級表頭在某些縮放比例的情況下出現表頭跟表體錯位問題 # 1273/I7A33T
  - 修復 `table.getTrHtml()` 方法 `tr` 節點代碼中的 `numbers` 列信息錯誤問題
  - 優化 `table setRowChecked()` 方法中標註當前選中行樣式的判斷邏輯 # 1273
- #### treeTable
  - 修復 `treeTable.expandAll()` 展開全部之後節點的摺疊狀態沒有記憶的問題 # 1273
  - 修復 無主鍵的樹表 reloadData 之後節點被展開的問題 # 1273
  - 修復 部分情況下父節點展開之後子節點中的單選複選列和其他表單元素沒有渲染的問題 1273/I7AWNV
  - 修復 初始化無數據時出現的數據報錯的問題 # 1273
- #### tab
  - 修復 刪除選項卡時，若標題欄存在其他元素，下標獲取異常的問題 # 1271/I7AO7F
  - 優化 `element.tabAdd()` 方法，第二個參數中新增 `change` 屬性支持，以支持添加即自動切換功能
  - 優化 摺疊功能，切換選項時不自動摺疊選項卡，且添加選項時若處於摺疊狀態則自動展開 # I79HUD
- #### util
  - 修復 fixbar 中添加了無效樣式問題 # I79JTH

### 下載： [layui-v2.8.6.zip](https://gitee.com/layui/layui/attach_files/1432770/download)

---

因 `2.8.5` 版本中存在一個 tab 刪除時下標的異常問題，`2.8.5` 已被跳過。

---

<h2 id="2.8.4" class="ws-anchor">
  2.8.4
  <span class="layui-badge-rim">2023-05-30</span>
</h2>

- #### form
  - 新增 `verIncludelRequired` 全局屬性，用於設置驗證規則中是否同時包含必填 # I737EW
  - 修復 checkbox 開關標題和半選圖標未垂直居中的問題 # 1255
  - 修復 checkbox 在初始設置半選時，點擊複選框時圖標未恢復成非半選狀態的問題
  - 修復 checkbox 被重新渲染時，標題模版未正確獲取的問題 # 1257
  - 修復 select 經瀏覽器翻譯成別的語言後，點擊選項出現的顯示異常問題 # 1256
  - 優化 checkbox 元素的 `lay-skin` ，當設置非內置風格時，不再強制顯示為默認風格
- #### table
  - 新增 對 table 內元素的 `lay-unrow` 屬性的識別，點擊該元素時，可阻止執行 `row` 行單擊事件
  - 修復 `table.setRowChecked()` 方法導致 `checkbox,radio` 事件失效的問題 # I73MLV/I76KBX/I78VI3
  - 修復 打印功能在 Edge 中可能出現的閃退問題 # 1264
  - 優化 `table.setRowChecked()` 方法，若未傳 `checked` 屬性，則自動對 `checkbox` 進行選中狀態值切換
  - 優化 `row` 事件機制，若目標元素為 `checkbox,radio`，則不觸發 `row` 事件
  - 優化 外層容器的高度，不再設置一個固定值，內部元素將根據 `height` 屬性值自動撐滿
  - 優化 底部邊框問題
- #### treeTable
  - 新增 節點摺疊狀態記憶功能 # 1260/I777CJ
  - 新增 `customName.icon` 屬性，用於自定義圖標的屬性名稱 # 1260/I73BQU
  - 新增 `async.format` 回調函數，用於處理異步子節點數據，優先級高於 `async.url` # 1260
  - 新增 `treeTable.reloadAsyncNode(id, index)` 方法，用於重載異步子節點 # 1260
  - 新增 `treeTable.getNodeById(id)` 方法，用於獲取節點信息集 # 1260
  - 新增 `treeTable.getNodesByFilter(id, filter, opts)` 方法，用於獲取符合過濾規則的節點信息集 # 1260
  - 修復 `isSimpleData` 模式渲染後的默認數據排序異常問題 # 1260
  - 修復 展開全部節點排序失效的問題 # 1260/I73M2K
  - 修復 摺疊葉子節點時，圖標沒有變化的問題 # 1260
  - 修復 節點選中狀態判斷異常問題 # 1260
  - 優化 `treeTable.checkStatus()` 方法，可通過設置第二個參數，用於是否返回半選狀態的數據 # 1260/I73JAW
  - 優化 重新排序和視圖內表單初始化的調用邏輯 # 1260
  - 優化 節點渲染方法 # 1260
- #### layer
  - 修復 `skin:'layui-layer-lan'` 時，導致 `btnAlign` 屬性無效的問題 # I73PD1
- #### laydate
  - 優化 `theme` 屬性，當其為數組格式，且第一個成員為 `hex` 格式主色值，則第二個成員為輔色值 # 1265
- #### upload
  - 新增 `exts` 屬性對於圖片類型時的 `.svg` 擴展名支持
- #### code
  - 優化 `copy` 屬性開啟時, 對 `tools` 屬性的初始化配置 # I72QGO
  - 優化 `preview: 'iframe'` 時的 `<iframe>` 容器，以支持背景透明

### 下載： [layui-v2.8.4.zip](https://gitee.com/layui/layui/attach_files/1422378/download)

---

<h2 id="2.8.3" class="ws-anchor">
  2.8.3
  <span class="layui-badge-rim">2023-05-15</span>
</h2>

- #### 基礎
  - 新增 `layui.debounce()` 和 `layui.throttle()`，分別用於防抖和節流 # 1252
- #### form
  - 新增 `checkbox` 的標題模板支持，可在下一個兄弟元素中加上 `lay-checkbox` 綁定 # I72HSK/I6YDGT
  - 修復 `radio` 經瀏覽器翻譯成別的語言後出現的顯示異常問題 # I6ZA12
  - 優化 `checkbox` 的邊距細節
  - 優化 `checkbox` 標籤風格的邊框瑕疵 # I70OFE
  - **調整** 內置校驗規則，僅當非空時進行校驗，避免強制攜帶必填(`required`)的校驗規則 # I72CTI
- #### table
  - 新增 `tool,checkbox,radio` 事件的 `obj.getCol()` 方法，用於獲取當前列的配置信息 # I72D2C
  - 新增 `ignoreExport` 表頭屬性，用於在表格導出時對該列進行忽略 # 1252
  - 修復 某些特殊情況，表格頁腳出現雙底線的問題 # I70BDR
  - 優化 合計行內數據超過單元格長度時，無法查看全部的問題 # I6TOP8
- #### treeTable
  - 修復 默認的節點 icon 圖標用錯問題 # 1252
  - 修復 `showIcon` 為 `false` 在某些操作之後出現圖標的問題 # 1252
  - 修復 展開全部之後再展開單個節點出現卡頓問題 # 1252
  - 修復 更新節點導致的圖標重複及數據未正常更新的問題 # 1252
  - 修復 開啟了 `sort` 屬性後出現的一些異常問題 # 1252
- #### layer
  - 新增 `hideOnClose` 屬性，用於關閉彈層時設置為隱藏，默認 `false`。須與 `id` 屬性並用 # I72L74
  - 修復 `layer.min(index)` 方法與最小化按鈕事件效果不一致的問題 # I6ZD3R
  - 優化 基礎配置信息的記錄，統一記錄在 layer 容器的 `.data('config')` 中
  - 優化 當彈層設置 `id` 並最小化後，再次點擊事件時，重新還原彈層 # I5N0QP
- #### laydate
  - 修復 點擊限制範圍外的標註日期仍然可點的問題，# I71D9C

### 下載： [layui-v2.8.3.zip](https://gitee.com/layui/layui/attach_files/1408565/download)

---

<h2 id="2.8.2" class="ws-anchor">
  2.8.2
  <span class="layui-badge-rim">2023-05-04</span>
</h2>

- #### table
  - 修復 `autoSort: true` 時，更改 `table.cache` 未同步到 `data` 屬性的問題 # 1247
  - 修復 多級表頭存在 `hide` 表頭屬性時，執行完整重載可能出現的錯位問題 # 1247/I6WX8Y
  - 修復 未開啟 `page` 屬性時底邊框缺失問題 # 1228
  - 優化 打印內容中包含過大圖片時的顯示問題
- #### treeTable
  - 修復 `checkbox,radio` 事件導致 table 組件不必要的異常提示問題 # I6Z5W5
  - 修復 執行重載並攜帶 `parseData` 和 `done` 屬性導致的渲染異常問題 # 1247
  - 修復 `treeTable.updateNode()` 方法執行無效的問題 # 1247
  - 修復 `treeTable.expandAll()` 方法隱藏所有節點導致統計欄消失的問題 # 1247
  - 修復 單元格事件中執行 `obj.update()` 方法導致樹節點特徵丟失的問題 # 1247/I6ZW2R
  - 優化 `treeTable expandAll()` 方法，支持展開所有節點 # 1247
  - 優化 內部代碼的若干細節 # 1247
  - **調整** `customName.rootId` 屬性為 `data.rootPid`
- #### layer
  - 修復 `tab` 層的樣式異常問題 # I6YS0F
- #### form
  - 優化 `checkbox` 半選狀態的樣式 # I6YXVV
- #### laydate
  - 優化 `shortcuts` 屬性機制，當點擊快捷選項時自動確認 #I6YQU6
- #### menu
  - 優化 菜單項樣式，以解決當點擊菜單邊緣時，未點擊到 `<a>` 標籤的問題
- #### transfer
  - 優化 `value` 屬性，按其順序渲染初始值列表 # 1235
- #### icon
  - 更新 `Edge` 圖標
- #### code
  - 新增 `copy` 屬性，用於開啟代碼複製功能圖標
  - 新增 `onCopy` 回調函數，用於自定義複製事件，而不觸發內置的複製操作
  - **調整** `encode` 屬性，默認 `true`，即開啟對 code 的編碼，且預覽時強制開啟

### 下載： [layui-v2.8.2.zip](https://gitee.com/layui/layui/attach_files/1396155/download)

---

<h2 id="2.8.1" class="ws-anchor">
  2.8.1
  <span class="layui-badge-rim">2023-04-25</span>
</h2>

- 修復 `table.reloadData()` 未支持 `page` 屬性的問題
- 修復 `treeTable` 點擊排序後導致樹形結構功能異常的問題 # 1232/I6YGU6
- 修復 `layer` 的 win10 風格並開啟 `icon` 屬性時信息框顯示異常問題
- 優化 `switch` 在選中前後的尺寸差異 # I6YJO4
- 優化 `colorpicker` 點擊顏色滑塊時跳動到頂部的問題

### 下載： [layui-v2.8.1.zip](https://gitee.com/layui/layui/attach_files/1387965/download)

---

<h2 id="2.8.0" class="ws-anchor">
  2.8.0
  <span class="layui-badge-rim">2023-04-24</span>
</h2>

從 `2.8.0-beta.1` 到 `rc.16`，經二十個預覽版的持續迭代，Layui 終於迎來了：`2.8.0` 正式版。
<br>同時，新域名下的 [新文檔站](https://layui.dev) 也正式上線（導讀：[Layui 新版文檔站上線初衷](/notes/2.8/news.html)），新版文檔亦開源在 [Github](https://github.com/layui/layui/tree/main/docs) 以供協同維護。

正是開發者們依然堅持的熱愛，促使了 `Layui` 這一樸實的歸來。

- #### 基礎
  - 優化 css 的構建，將原先 layer/laydate/code 的 css 統一構建到 `layui.css`，以儘量減少請求
  - 變更*主色調*為：`#16baaa` <i style="display:inline-block; vertical-align: middle; width: 16px; height: 16px; padding: 3px; margin-right: 16px; border-radius: 2px; background-color: #16baaa;"></i>*在原有的墨綠基礎上賦予了清新*
  - 新增 `18` 個字體圖標
  - 新增 grid 佈局的超大屏 `xl` 響應式支持
  - 調整 `layui.event()` 方法，當組件事件中未設定 `filter` 時則可重複執行該事件 # 1135
  - ~~剔除 layer 等部分組件的圖片資源~~，全部採用字體圖標和純 css 替代實現
  - ~~剔除 layedit 內置組件~~，詳見：[關於將在 v2.8.0 版本中正式剔除 layedit 組件的公告](https://gitee.com/layui/layui/issues/I5JSE3)
  - lay: 優化 `lay.options()` 方法，以提供更直觀的異常提示
- #### layer
  - 新增 `anim` 屬性的四個彈出方向的動畫類，可實現邊緣抽屜彈出，同時關閉時自動匹配對應的動畫
  - 新增 `skin` 屬性可選值 `layui-layer-win10` ，可設置為 Windows 10 主題風格
  - 新增 `success` 等回調的第三個參數：即當前彈層實例對象，以便操作內部方法
  - 新增 `photos` 層的私有屬性 `hideFooter`，用於控制是否隱藏圖片底部欄
  - 新增 `photos` 層底部欄的「查看原圖」功能
  - 新增 `photos` 層對 `lay-src` 屬性的支持
  - 新增 `prompt` 層的 `placeholder` 屬性 # 1136
  - 新增 `removeFocus` 屬性，用於是否移除彈層觸發元素的焦點，避免按回車鍵時重複彈出 # 1143
  - 新增 `layer.closeLast(type)` 方法，用於根據彈層類型關閉最近打開的層 # I66WI2
  - 優化 document 相關事件機制，避免全局事件疊加，以及大量彈出時可能存在的內存溢出
  - 優化 window resize 事件機制，避免事件不斷疊加 # I38C2O
  - 優化 所有圖標, 由原來的圖片改為純 css 和字體圖標
  - 優化 創建彈層的初始化邏輯，以兼容 tampermonkey 等特殊應用場景
  - 優化 內部按鈕標籤，避免頁面設置 `<base target="_blank">` 時，點擊按鈕導致的打開新頁面 # 830
  - 修復 多次調用` min/max` 方法後再執行 `restore` 出現的異常問題 # 1135/I5QP66
  - 修復 最大化後再調整窗口大小出現的異常問題 # 1135/I5ROMW
  - 修復 最大/小後若瀏覽器窗口尺寸變化，再恢復狀態後可能出現的不居中或大小異常問題 # 1135
  - 修復 最小化後再恢復後執行窗口 resize 時彈層的位置異常問題 # 1135
  - 修復 鼠標右鍵點擊彈層可以區域時導致的彈層位置大小異常的問題 # 1143
  - 調整 `prompt` 層的確認回調，支持輸入空值 # 1143/I5UO7N
  - 調整 除 `msg/load/tips` 層之外的彈出觸發時的焦點，默認移除觸發元素失去焦點 # 1143
- #### table
  - 新增 `cellMaxWidth` 屬性和表頭 `maxWidth` 屬性，以設定列的最大寬度
  - 新增 `colResized` 列拖拽寬度後的事件，並返回當前列的相關信息 # I3URH8/I3QDBI
  - 新增 `colToggled` 列篩選（顯示或隱藏）後的事件，並返回當前列的相關信息 # I3URH8
  - 新增 返回數據中的 data 成員為非對象時的渲染支持，如 `data: ["a","b","c"]`
  - 新增 `maxHeight` 屬性，用於定義表格的最大高度 # 1135/I5R6F6
  - 新增 `fieldTitle` 表頭屬性，用於定義表頭字段標題，該屬性在篩選列和導出場景中優先級高於 `title` 屬性 # 1170
  - 新增 `table.setRowChecked(id, opts)` 方法，用於設置行選中狀態 # I6CRL7
  - 新增 `table.getOptions(id)` 方法，用於獲取指定 id 對應的表格實例配置項 # 1135
  - 新增 `table.hideCol(id, cols)` 方法，用於外部設置列的顯示隱藏 # 1135/I5RUAJ
  - 新增 `rowContextmenu` 事件，用於顯示行的右鍵菜單，需設置屬性 `defaultContextmenu:false` 才生效 # 1188
  - 新增 事件返回的 `obj.setRowChecked(opts)` 方法，用於設置當前行選中狀態
  - 加強 `height` 屬性，可設置對父元素的高度自適應，如：`height: '#父元素id-差值'` # 1111
  - 修復 多級表頭模式下的頭部工具欄的篩選在重載並還原勾選後，表格存在錯位問題 # 1107 # I5L0B4
  - 修復 `size: 'sm'` 時，設置 `align: 'center'` 單元格內容未完全居中的問題 # 1107
  - 修復 document 全局事件中對當前實例引用錯誤的問題 # 1107
  - 修復 表頭 `title` 屬性存在 html 標籤時，頭工具欄篩選欄列表中存在的異常問題 # 1107
  - 修復 `width` 屬性小於 `minWidth` 時，通過拖拽列調整寬度卻以 `minWidth` 為起點寬度的問題 # 1107
  - 修復 當開啟 `even:true` 後，多行表頭也會跟著變色的問題 # 1113
  - 修復 頭工具欄篩選下拉麵板被下方表格遮擋的問題，並重新優化了表格內部層級關係 # 763
  - 修復 列寬值為百分比時，其分配的寬度超出最大和最小寬度的異常問題 # 1128 I5LM4S
  - 修復 轉換靜態表格時，若為特殊的多級表頭且存在初始主體數據時出現的錯列問題 # 1135/I5QAZM
  - 修復 `table.exportFile()` 方法導出任意數據時的某些異常問題 # 1135/I5S17X
  - 修復 統計行在重載後可能出現滾動條補丁丟失，並導致跟主體對應不上的問題 # 1150
  - 修復 多級表頭操作篩選列後可能出現的固定列高度異常問題 # 1170/I60WQ4
  - 修復 `edit` 事件中返回的 `obj.data` 中的對應字段未同步更新值的問題 # I6A6SL
  - 修復 點擊排序後導致 `scrollPos:'fixed'` 失效的問題 # I68MBC
  - 修復 設置 `align: 'center'` 表頭屬性時，打印時的合計行未能跟隨居中的問題
  - 修復 `table.resize()` 方法導致的在無數據或請求異常時的右側固定列顯示異常問題 # I6F72U
  - 優化 事件的回調參數，可返回當前實例配置項：`config`
  - 優化 `edit` 事件的核心邏輯，新增返回 `obj.reedit()` 方法，可實現編輯內容校驗不通過時重新顯示編輯
  - 優化 `edit` 事件的返回參數，新增返回 `obj.oldValue` 屬性，用於獲取字段修改前的舊值： #1107
  - 優化 `edit` 事件的返回參數，新增返回 `obj.getCol()` 方法，用於獲取當前列表頭配置信息
  - 優化 `edit` 開啟後的對應單元格在鼠標 hover 時顯示可編輯樣式
  - 優化 `radio` 事件，當返回數據中存在 `LAY_DISABLED` 狀態時不觸發
  - 優化 `templet` 表頭屬性函數時返回的數據可包含 `LAY_COL` 特定字段
  - 優化 複雜表頭細節，避免當組合表頭的父級表頭內容過長引起的錯位問題 #1107
  - 優化 表頭內容超長時可通過鼠標 hover 顯示其完整內容 #1107
  - 優化 無數據時若列超出最大寬度，也顯示橫向滾動條，以便能查看到所有表頭字段 #1110
  - 優化 過濾器,若目標元素未設 `lay-filter` 屬性值，則自動取實例 `id` 值，以減少冗餘的屬性設置
  - 優化 導出文件功能，避免內容中存在某些特殊符導致的 excel/csv 表格錯位，及避免內容被強制轉換格式
  - 優化 內部模板標籤符，避免 laytpl 全局設置的影響
  - 優化 UI 細節，以便整體視覺更為清爽。
  - **調整** `page,limit` 屬性，當 `page` 未開啟時，則默認不再向後端傳遞這兩個參數 # I6G5BO
  - **調整** 特定字段名稱。序號: `LAY_INDEX` → `LAY_NUM`；下標: `LAY_TABLE_INDEX` → `LAY_INDEX`
- #### treeTable <sup>new</sup>
  - 新增「樹形表格」組件。可視為 table 組件的樹形結構的延伸
  - 詳細用法可參考文檔（/docs/treeTable/）
- #### form
  - 新增 輸入框的動靜態點綴，可在前後綴添加圖標等任意內容。其中動態點綴內置：清空、密碼顯隱功能
  - 優化 `form.render()` 方法，若參數一傳入的 jQuery 對象指向表單域容器，則渲染該表單域中的所有表單項
  - 優化 `select` 選中時的樣式
  - 優化 `select` 開啟搜索時，在清空搜索框文本後重置選中項（而非保留上次選中的值）
  - 優化 `checkbox、radio` 對 `title` 屬性值為 HTML 內容的轉義
  - 優化 `checkbox` 的內置風格，以支持半選效果  # 1224
  - 優化 `radio` 的 `checked` 機制，可通過 `form.val()` 方法取消單選框的選中 # 1224
  - 修復 `select` 子元素中以 `<optgroup>` 標籤開頭出現的異常問題 # I5MV17
  - **調整** `checkbox` 的 `lay-skin` 屬性默認為原始風格，標籤風格值為 `tag`
  - **調整** `checkbox` 的私有屬性 `lay-text`，採用統一的 `title` 屬性替代
- #### laydate
  - 新增 `shortcuts` 屬性，用於開啟面板左側的快捷選擇功能 # 1135
  - 新增 `fullPanel` 屬性，當 `datetime` 類型且非 range 模式，可開啟日期和時間在同一面板操作 #1128
  - 新增 `theme` 屬性的多主題支持
  - 新增 `circle` 圓圈高亮的內置主題
  - 新增 `autoConfirm` 屬性，用於開啟選中目標值時即自動確認（默認 true） # 1138/I5T3GW
  - 新增 `shade` 屬性，用於開啟彈出日期面板時的遮罩，其用法同 layer 的 shade 參數 # 1149
  - 新增 `rangeLinked` 屬性，用於是否開啟日期範圍選擇時的區間聯動標註模式，默認不開啟 # 1172
  - 新增 對目標元素重新 render 覆蓋的支持 #1128
  - 新增 對目標元素上的 `lay-options` 屬性識別，可覆蓋 render 方法中的 options # 1128
  - 新增 `laydate.getInst()` 方法，可返回指定 `id` 或綁定節點上的 `lay-key` 屬性值對應的實例 # 1128
  - 新增 `laydate.unbind()` 方法，可對目標元素解除當前實例的綁定 # 1128
  - 新增 `onConfirm/onNow/onClear` 三個屬性，分別用於確認、現在、清空三個事件的回調 # I65ZQ6
  - 修復 當設置 `min/max` 後，年和月列表面板中對應的最小/大的年月值無法選中的問題 # 1128 I442FW
  - 修復 當前日期未在 `min/max` 設定的範圍內，仍能點擊現在按鈕的問題 # 573
  - 修復 當開啟 `range` 屬性，並在瀏覽器縮放後面板出現換行的問題 # 1156
- #### colorpicker
  - 新增 `cancel` 和 `close` 回調，分別用於在取消選擇和麵板關閉後觸發 # I3SJC7
  - 優化 事件處理機制，避免 document 的事件重複綁定
  - 優化 組件選擇塊的尺寸(lg/md/sm/xs)，以更好地應用於其他組件內(如 table)
  - 修復 rgba 值在 input 框中修改時會自動變成 16 進制的問題  # I5QPZZ
- #### dropdown
  - 新增 `clickScope` 屬性，用於設置觸發點擊事件的菜單範圍(如 `all` 即代表父子菜單均可觸發事件) # 3NRJD
  - 新增 `shade` 屬性，用於開啟彈出面板時的遮罩
  - 新增 `data` 中 `disabled` 屬性的支持，以禁用某一菜單項 # I6GSCD
  - 新增 對綁定元素的 `lay-options` 屬性識別，可與渲染方法的 `options` 屬性合併
  - 新增 `dropdown.reloadData(id, options)` 方法，用於僅重載數據或內容 # 1224
  - 新增 `dropdown.close(id)` 方法，用於關閉對應的實例面板 # 1138
  - 優化 `templet` 屬性，支持函數寫法
  - 優化 `click` 回調函數，當其返回 `return false` 時，點擊選項可不關閉面板 # I6DUMY
  - 優化 過濾器,若目標元素未設 `lay-filter` 屬性值，則自動取實例 `id` 值，以減少冗餘的屬性設置
  - 修正 搜索框所在 input 元素的 type 值 # 1168
  - 修復 在移動設備下，點擊其他元素無法關閉面板的問題 # 1189
  - 修復 `show: true` 時，`ready` 回調未執行的問題
- #### element
  - 新增 nav 導航菜單淺色背景主題
  - 優化 nav 導航當前選中菜單樣式
  - 修復 `element.progress()` 方法不支持更新分數值的問題 #622
- #### upload
  - 調整 表單域 file 字段的順序，以適應阿里雲/騰訊雲中的對象存儲上傳規則 # 1147
  - 修復 多上傳設置文件大小限制時，刪除超出大小的文件仍然校驗不通過的問題 # I6LR5O
- #### carousel
  - 新增 `goto` 方法，用於輪播跳轉。可通過 `var inst = carousel.render()` 的實例獲取 # 1128 I5LIWJ
  - 新增 對綁定元素的 `lay-options` 屬性識別，可與渲染方法的 `options` 屬性合併
  - 優化 `elem` 屬性，可傳入 `class` 選擇器同時綁定多個實例
- #### tree
  - 修復 `id` 屬性為長數字時的初始選中狀態在某些情況存在異常的問題 #1115
- #### slider
  - 新增 `done` 屬性，用於值完成選中時觸發的回調，與 change 不同的是滑塊拖動過程中不會觸發 # I3PZBT
  - 新增 對綁定元素的 `lay-options` 屬性識別，可與渲染方法的 `options` 屬性合併
  - 優化 `elem` 屬性，可傳入 `class` 選擇器同時綁定多個實例
  - 修復 `min` 非 0 時調用 setValue 設置值結果異常的問題 # 1174/I6446N
- #### rate
  - 新增 對綁定元素的 `lay-options` 屬性識別，可與渲染方法的 `options` 屬性合併
  - 優化 `elem` 屬性，可傳入 `class` 選擇器同時綁定多個實例
  - 優化 部分代碼存在的冗餘邏輯 # 1169
- #### code
  - 新增 `preview` 屬性，用於開啟 Code 預覽功能
  - 新增 `style/previewStyle/codeStyle` 屬性，用於設 Code 區域、預覽區域的樣式
  - 新增 `text` 屬性，用於自定義默認文本
  - 新增 `header` 屬性，用於是否開啟 Code 區域的頭部欄
  - 新增 `layout` 屬性，用於設定開啟預覽時的標籤排列方式
  - 新增 `tools` 屬性，用於開啟頭部右側區域工具欄（內置：全屏）
  - 新增 `toolsEvent` 屬性，用於自定義工具欄事件
  - 新增 `id` 屬性，設置實例的唯一索引，以便用於其他操作
  - 新增 `className` 屬性，追加實例面板的 className，以便對其自定義樣式
  - 新增 `done` 屬性，即執行 Code 預覽後的回調函數
- #### laytpl
  - 新增 模板局部自定義標籤符功能，可在 `laytpl(str, options)` 的第二個參數中設置
- #### util
  - 重構 `util.fixbar` 組件
    - 新增 `bars` 屬性，用於定義任意數量的 bar 列表信息
    - 新增 `default` 屬性，用於是否顯示默認的 bar 列表
    - 新增 `target` 屬性，用於定義插入 fixbar 節點的目標元素選擇器(默認 body)
    - 新增 `scroll` 屬性，用於設定 fixbar 最外層容器滾動條所在的元素，若不設置則取 target
    - 新增 `duration` 屬性，用於設定 top bar 等動畫時長
    - 新增 `on` 屬性，用於定義列表的任意事件
    - **調整** `showHeight` 屬性名稱為 `margin`
  - 新增 `util.openWin(options)` 方法，用於打開瀏覽器新標籤頁

### 下載： [layui-v2.8.0.zip](https://gitee.com/layui/layui/attach_files/1385823/download)

---

歷史：[2.8.0 預覽版更新日誌](https://gitee.com/layui/layui/issues/I6FHNK)

---

<h2 id="2.7.x" lay-toc="{href: '/2.7/docs/base/changelog.html'}">2.7.x</h2>

[前往查看](/2.7/docs/base/changelog.html) `2.7.x` 及更早前版本更新日誌
