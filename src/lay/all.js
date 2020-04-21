/**

 @Name：用於打包PC完整版，即包含layui.js和所有模塊的完整合並（該文件不會存在於構建後的目錄）
 @Author：賢心
 @License：LGPL

 */

layui.define(function(exports){
  var cache = layui.cache;
  layui.config({
    dir: cache.dir.replace(/lay\/dest\/$/, '')
  });
  exports('layui.all', layui.v);
});
