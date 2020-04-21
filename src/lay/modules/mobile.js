/**

 @Name：layui 移動模組入口 | 構建後則為移動模組集合
 @Author：賢心
 @License：MIT

 */


if(!layui['layui.mobile']){
  layui.config({
    base: layui.cache.dir + 'lay/modules/mobile/'
  }).extend({
    'layer-mobile': 'layer-mobile'
    ,'zepto': 'zepto'
    ,'upload-mobile': 'upload-mobile'
    ,'layim-mobile': 'layim-mobile'
  });
}

layui.define([
  'layer-mobile'
  ,'zepto'
  ,'layim-mobile'
], function(exports){
  exports('mobile', {
    layer: layui['layer-mobile'] //彈層
    ,layim: layui['layim-mobile'] //WebIM
  });
});