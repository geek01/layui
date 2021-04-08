/**
  擴展模塊，只依賴內置模塊
**/

layui.define(function(exports){
  console.log('mod2.js')

  exports('mod2', {
    name: 'mod2'
  })
});