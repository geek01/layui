/**

 @Name：用於打包聚合版，該文件不會存在於構建後的目錄

 */

layui.define(function(exports){
  var cache = layui.cache;
  layui.config({
    dir: cache.dir.replace(/lay\/dest\/$/, '')
  });
  exports('layui.all', layui.v);
});