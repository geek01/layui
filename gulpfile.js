const pkg = require('./package.json');
const gulp = require('gulp');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const header = require('gulp-header');
const footer = require('gulp-footer');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const minimist = require('minimist');
const yargs = require('yargs');

// 基礎配置
const config = {
  // 註釋
  comment: [
    '/** v<%= pkg.version %> | <%= pkg.license %> Licensed */<%= js %>',
    {pkg: pkg, js: ';'}
  ],
  // 模塊
  modules: 'lay,laytpl,laypage,laydate,jquery,layer,util,dropdown,slider,colorpicker,element,upload,form,table,treeTable,tree,transfer,carousel,rate,flow,code'
};

// 獲取參數
const argv = require('minimist')(process.argv.slice(2), {
  default: {
    version: pkg.version
  }
});

// 前置目錄
const dir = {
  rls: './release/zip/layui-v' + pkg.version
};

// 輸出目錄
const dest = ({
  dist: './dist',
  rls: dir.rls + '/layui'
}[argv.dest || 'dist'] || argv.dest) + (argv.vs ? '/'+ pkg.version : '');

// js
const js = () => {
  let src = [
    './src/**/{layui,layui.all,'+ config.modules +'}.js'
  ];
  return gulp.src(src)
  .pipe(sourcemaps.init())
  .pipe(uglify({
    output: {
      ascii_only: true // escape Unicode characters in strings and regexps
    },
    ie: true
  }))
  .pipe(concat('layui.js', {newLine: ''}))
  .pipe(header.apply(null, config.comment))
  .pipe(sourcemaps.write(''))
  .pipe(gulp.dest(dest));
};

// css
const css = () => {
  let src = [
    './src/css/**/{layui,*}.css'
  ];
  return gulp.src(src)
  .pipe(sourcemaps.init())
  .pipe(cleanCSS({
    compatibility: 'ie8'
  }))
  .pipe(concat('layui.css', {newLine: ''}))
  .pipe(sourcemaps.write(''))
  .pipe(gulp.dest(dest +'/css'));
};

// files
const files = () => {
  let src = ['./src/**/*.{eot,svg,ttf,woff,woff2,html,json,png,jpg,gif}'];
  return gulp.src(src)
  .pipe(gulp.dest(dest));
};

// cp
const cp = () => {
  const basePath = './dist/**/*';

  // 複製 css js
  gulp.src(`${basePath}.{css,js}`)
  .pipe(replace(/\n\/(\*|\/)\#[\s\S]+$/, '')) // 過濾 css 和 js 的 map 特定註釋
  .pipe(gulp.dest(dest));

  // 複製其他文件
  return gulp.src([
    basePath,
    `!${basePath}.{css,js,map}` // 過濾 map 文件
  ])
  .pipe(replace(/\n\/(\*|\/)\#[\s\S]+$/, '')) // 過濾 css 和 js 的 map 特定註釋
  .pipe(gulp.dest(dest));
};

// release
const rls = () => {
  return gulp.src('./release/doc/**/*')
  .pipe(replace(/[^'"]+(\/layui\.css)/, 'layui/css$1')) // 替換 css 引入路徑中的本地 path
  .pipe(replace(/[^'"]+(\/layui\.js)/, 'layui$1')) // 替換 js 引入路徑中的本地 path
  .pipe(gulp.dest(dir.rls));
};

// clean
const clean = cb => {
  return del([dest], {
    force: true
  });
};
const cleanRLS = cb => {
  return del([dir.rls]);
};

// Define all task
exports.js = js;
exports.css = css;
exports.files = files;
exports.default = gulp.series(clean, gulp.parallel(js, css, files)); // default task
exports.cp = gulp.series(clean, cp);
exports.rls = gulp.series(cleanRLS, rls); // release task

// layer task
exports.layer = () => { // gulp layer
  let dest = './release/layer';

  gulp.src('./src/css/modules/layer.css')
  .pipe(gulp.dest(dest + '/src'));

  return gulp.src('./src/modules/layer.js')
  .pipe(gulp.dest(dest + '/src'));
};

// laydate task
exports.laydate = () => { // gulp laydate
  let dest = './release/laydate/'; // 發行目錄
  let comment = [ // 註釋
    '\n/** \n * <%= title %> \n * <%= license %> Licensed \n */ \n\n'
    ,{title: 'laydate 日期與時間組件（單獨版）', license: 'MIT'}
  ];

  // css
  gulp.src('./src/css/modules/laydate.css')
  .pipe(gulp.dest(dest + 'src'));

  // js
  return gulp.src(['./src/layui.js', './src/modules/{lay,laydate}.js'])
  .pipe(replace('win.layui =', 'var layui =')) // 將 layui 替換為局部變量
  .pipe(replace('}(window); // gulp build: layui-footer', '')) // 替換 layui.js 的落腳
  .pipe(replace(';!function(window){ // gulp build: lay-header', '')) // 替換 lay.js 的頭部
  .pipe(replace('}(window, window.document); // gulp build: lay-footer', '')) // 替換 lay.js 的落腳
  .pipe(concat('laydate.js', {newLine: ''}))
  .pipe(replace(';!function(window, document){ // gulp build: laydate-header', '')) // 替換 laydate.js 的頭部
  .pipe(header.apply(null, comment)) // 追加頭部
  .pipe(gulp.dest(dest + 'src'));
};

// helper
exports.help = () => {
  let usage = '\nUsage: gulp [options] tasks';
  let parser = yargs.usage(usage, {
    dest: {
      type: 'string',
      desc: '定義輸出目錄，可選項：dist（默認）、rls、任意路徑'
    },
    vs: {
      type: 'boolean',
      desc: '生成一個帶版本號的文件夾'
    }
  });

  parser.showHelp(console.log);
  console.log([
    'Tasks:',
    '  default  默認任務',
    '  rls  發行任務',
    '  cp  將 dist 目錄複製一份到參數 --dest 指向的目錄'
  ].join('\n'), '\n\nExamples:\n  gulp cp --dest ./v --vs', '\n');
  return gulp.src('./');
};


