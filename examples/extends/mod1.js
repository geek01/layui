/**
  擴充套件模組，且依賴 mod2
**/
layui.define('mod2', function(exports){
  var $ = layui.jquery;
  
  console.log(layui.mod2, layui.layer, layui.form)
  
  exports('mod1', {
    name: 'mod1'
  })
});