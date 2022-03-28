/**

 @Name：layui 移動模塊入口 | 構建後則為移動模塊集合
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