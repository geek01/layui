const path = require('path');
const gulp = require('gulp');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const replace = require('gulp-replace');
const header = require('gulp-header');
const sourcemaps = require('gulp-sourcemaps');
const zip = require('gulp-zip');
const del = require('del');
const minimist = require('minimist');
const yargs = require('yargs');
const pkg = require('./package.json');

// 基礎配置
const config = {
  // 頭部註釋
  comment: [
    '/** v<%= pkg.version %> | <%= pkg.license %> Licensed */<%= js %>',
    {pkg: pkg, js: ';'}
  ],
  // 全部模塊
  modules: 'lay,laytpl,laypage,laydate,jquery,layer,util,dropdown,slider,colorpicker,element,upload,form,table,treeTable,tree,transfer,carousel,rate,flow,code'
};

// 獲取參數
const argv = minimist(process.argv.slice(2), {
  default: {
    vs: pkg.version
  }
});

const rlsFileName = `${pkg.name}-v${argv.vs}`; // 發行文件名
const rlsDest = `./release/zip/${rlsFileName}/${pkg.name}`; // 發行目標路徑
const rlsDirname = path.dirname(rlsDest); // 發行目錄名

// 複製目標路徑
const copyDest = argv.dest
  ? path.join(argv.dest, (argv.vs ? '/' + argv.vs : ''))
: rlsDest;

// 打包目標路徑
const dest = './dist';

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
  .pipe(sourcemaps.write('.'))
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
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest(dest +'/css'));
};

// files
const files = () => {
  let src = ['./src/**/*.{eot,svg,ttf,woff,woff2,html,json,png,jpg,gif}'];
  return gulp.src(src)
  .pipe(gulp.dest(dest));
};

// clean
const clean = () => {
  return del([dest]);
};

// 默認任務
exports.default = gulp.series(clean, gulp.parallel(js, css, files));

// 複製 dist 目錄到指定路徑
exports.cp = gulp.series(() => del(copyDest), () => {
  const src = `${dest}/**/*`;

  // 複製 css js
  gulp.src(`${src}.{css,js}`)
  .pipe(replace(/\n\/(\*|\/)\#[\s\S]+$/, '')) // 過濾 css,js 的 map 特定註釋
  .pipe(gulp.dest(copyDest));

  // 複製其他文件
  return gulp.src([
    src,
    `!${src}.{css,js,map}` // 過濾 map 文件
  ])
  .pipe(replace(/\n\/(\*|\/)\#[\s\S]+$/, '')) // 過濾 css,js 的 map 特定註釋
  .pipe(gulp.dest(copyDest));
});

// 發行
exports.release = gulp.series(
  () => del([rlsDirname]), // 清理髮行目錄
  () => { // 生成說明
    return gulp.src('./release/introduce/**/*')
    .pipe(replace(/[^'"]+(\/layui\.css)/, 'layui/css$1')) // 替換 css 引入路徑中的本地 path
    .pipe(replace(/[^'"]+(\/layui\.js)/, 'layui$1')) // 替換 js 引入路徑中的本地 path
    .pipe(gulp.dest(rlsDirname)) // 用於本地
    .pipe(gulp.dest('./examples/introduce')); // 用於 Github actions
  },
  exports.cp, // 複製 dist 目錄文件
  () => { // 生成 ZIP 壓縮包
    const base = path.dirname(rlsDirname);
    return gulp.src(rlsDirname + '/**/*', {
      base: base
    })
    .pipe(zip(`${rlsFileName}.zip`))
    .pipe(gulp.dest(base))
  }
);

// helper
exports.help = () => {
  let usage = '\nUsage: gulp [options] tasks';
  let parser = yargs.usage(usage, {
    dest: {
      type: 'string',
      desc: '自定義輸出路徑'
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
    '  release  發行任務',
    '  cp  將 dist 目錄複製一份到參數 --dest 指向的目錄'
  ].join('\n'), '\n\nExamples:\n  gulp cp --dest ./v', '\n');
  return gulp.src('./');
};
