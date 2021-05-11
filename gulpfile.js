
/*!
 * layui Build
*/

var pkg = require('./package.json');
var inds = pkg.independents;

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var minify = require('gulp-minify-css');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var header = require('gulp-header');
var del = require('del');
var gulpif = require('gulp-if');
var minimist = require('minimist');
var zip = require('gulp-zip');

//獲取參數
var argv = require('minimist')(process.argv.slice(2), {
  default: {
    ver: 'all'
  }
})

//註釋
,note = [
  '/*! <%= pkg.realname %> v<%= pkg.version %> | Released under the <%= pkg.license %> license */\n <%= js %>'
  ,{pkg: pkg, js: ';'}
]

//模塊
,mods = 'lay,laytpl,laypage,laydate,jquery,layer,util,element,upload,dropdown,slider,colorpicker,form,tree,transfer,table,carousel,rate,flow,layedit,code'

//發行版本目錄
,releaseDir = './release/zip/layui-v' + pkg.version
,release = releaseDir + '/layui'

//目標木
,destDir = function(ver){
  return ver ? release : function(){
    return argv.rc ? 'rc' : 'dist'
  }();
}

//任務
,task = {
  //聚合 JS 文件
  alljs: function(ver){
    var src = [
      './src/**/{layui,layui.all,'+ mods +'}.js'
    ]
    ,dir = destDir(ver);

    return gulp.src(src).pipe(uglify({
      output: {
        ascii_only: true //escape Unicode characters in strings and regexps
      }
    }))
      .pipe(concat('layui.js', {newLine: ''}))
      .pipe(header.apply(null, note))
    .pipe(gulp.dest('./'+ dir));
  }

  //壓縮 css 文件
  ,mincss: function(ver){
    var src = [
      './src/css/**/*.css'
      ,'!./src/css/**/font.css'
    ]
    ,dir = destDir(ver)
    ,noteNew = JSON.parse(JSON.stringify(note));

    noteNew[1].js = '';

    return gulp.src(src).pipe(minify({
      compatibility: 'ie7'
    })) //.pipe(header.apply(null, noteNew))
    .pipe(gulp.dest('./'+ dir +'/css'));
  }

  //複製iconfont文件
  ,font: function(ver){
    var dir = destDir(ver);

    return gulp.src('./src/font/*')
    .pipe(rename({}))
    .pipe(gulp.dest('./'+ dir +'/font'));
  }

  //複製組件可能所需的非css和js資源
  ,mv: function(ver){
    var src = ['./src/**/*.{png,jpg,gif,html,mp3,json}']
    ,dir = destDir(ver);

    gulp.src(src).pipe(rename({}))
    .pipe(gulp.dest('./'+ dir));
  }

  //複製發行的引導文件
  ,release: function(){
    gulp.src('./release/doc/**/*')
      .pipe(replace('http://local.res.layui.com/layui/dist/', 'layui/'))
    .pipe(gulp.dest(releaseDir));
  }
};

//清理
gulp.task('clear', function(cb) {
  return del(['./'+ (argv.rc ? 'rc' : 'dist') +'/*'], cb);
});
gulp.task('clearRelease', function(cb) {
  return del([releaseDir], cb);
});

gulp.task('alljs', task.alljs);
gulp.task('mincss', task.mincss);
gulp.task('font', task.font);
gulp.task('mv', task.mv);
gulp.task('release', task.release);

//完整任務 gulp
gulp.task('default', ['clear'], function(){ //rc 版：gulp --rc
  for(var key in task){
    task[key]();
  }
});

//發行版 gulp rls
gulp.task('rls', ['clearRelease'], function(){ // gulp rls
  for(var key in task){
    task[key]('release');
  }
});

//打包 layer 獨立版
gulp.task('layer', function(){
  var dir = './release/layer';

  gulp.src('./src/css/modules/layer/default/*')
  .pipe(gulp.dest(dir + '/src/theme/default'));

  return gulp.src('./src/modules/layer.js')
  .pipe(gulp.dest(dir + '/src'));
});


//打包 layDate 獨立版
gulp.task('laydate', function(){
  //發行目錄
  var dir = './release/laydate'

  //註釋
  ,notes = [
    '/*! \n * <%= title %> \n * <%= license %> Licensed \n */ \n\n'
    ,{title: 'layDate 日期與時間組件', license: 'MIT'}
  ];

  //合併所依賴的 css 文件
  gulp.src('./src/css/modules/laydate/default/{font,laydate}.css')
    .pipe(concat('laydate.css', {newLine: '\n\n'}))
  .pipe(gulp.dest(dir + '/src/theme/default'));

  //合併所依賴的 js 文件
  return gulp.src(['./src/modules/{lay,laydate}.js'])
    .pipe(concat('laydate.js', {newLine: ''}))
    .pipe(header.apply(null, notes))
  .pipe(gulp.dest(dir + '/src'));
});










