/**
 * @file karma自動化測試配置
 * @author fe.xiaowu@gmail.com
 */

var url = require('url');

/**
 * mock一個server供測試使用
 *
 * @param  {Object}   req  request
 * @param  {Object}   res  response
 * @param  {Function} next 下一路由
 *
 * @example
 * 請求 /api/mock 參數如:
 *     timeout - 超時時間, 默認 0
 *     statusCode - 狀態碼, 默認 200
 *     response - 響應內容, 默認 {}
 *     dataType - 響應格式, 默認 json
 */
var httpServer = function (req, res, next) {
    if (req.url.indexOf('/api/mock') === -1) {
        return next();
    }

    var data = url.parse(req.url, true).query;

    setTimeout(function () {
        res.statusCode = data.statusCode || 200;
        res.setHeader('content-type', data.contentType || 'json');
        res.end(data.response || '{}');
    }, data.timeout || 0);
};

/**
 * 源文件
 *
 * @type {Array}
 */
var sourceFileMap = [
    'src/layui.js',
    'src/lay/modules/jquery.js',
    'src/lay/modules/carousel.js',
    'src/lay/modules/code.js',
    'src/lay/modules/element.js',
    'src/lay/modules/flow.js',
    'src/lay/modules/form.js',
    'src/lay/modules/laydate.js',
    'src/lay/modules/layedit.js',
    'src/lay/modules/layer.js',
    'src/lay/modules/laypage.js',
    'src/lay/modules/laytpl.js',
    'src/lay/modules/table.js',
    'src/lay/modules/tree.js',
    'src/lay/modules/upload.js',
    'src/lay/modules/util.js',
    'src/lay/modules/mobile/zepto.js',
    'src/lay/modules/mobile/layer-mobile.js',
    'src/lay/modules/mobile/upload-mobile.js'
];

/**
 * 測試覆蓋率文件, 要忽略 jquery.js、zepto.js
 *
 * @type {Object}
 */
var coverageFileMap = {};
sourceFileMap.filter(function (uri) {
    return !/(jquery|zepto)\.js$/.test(uri);
}).forEach(function (uri) {
    coverageFileMap[uri] = ['coverage'];
});

module.exports = function (config) {
    return {
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        // Important: 下列數組中文件將『逆序載入』
        frameworks: ['mocha', 'chai', 'chai-sinon'],


        // list of files / patterns to load in the browser
        files: sourceFileMap.concat('test/**/*.js').concat({
            pattern: 'src/css/**/*',
            included: false
        }, {
            pattern: 'src/font/**/*',
            included: false
        }, {
            pattern: 'src/images/**/*',
            included: false
        }),


        // list of files to exclude
        exclude: [],

        client: {
            mocha: {
                // mocha測試超時6秒
                timeout: 1000 * 6
            }
        },


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: coverageFileMap,


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: [
            'mocha'
            // 'coverage'
        ],

        coverageReporter: {
            // specify a common output directory
            dir: '.',
            reporters: [
                // { type: 'html', subdir: 'report-html' },
                {
                    type: 'lcov',
                    subdir: 'coverage'
                },
                {
                    type: 'text-summary'
                }
            ]
        },


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        // Note: 如果要調試Karma，請設置為DEBUG
        logLevel: config.LOG_INFO,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [
            'PhantomJS'
        ],


        // enable / disable watching file and executing tests whenever any file changes
        // Note: 代碼改動自動運行測試，需要singleRun為false
        autoWatch: false,

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        // 腳本調用請設為 true
        singleRun: true,

        middleware: ['httpServer'],

        plugins: ['karma-*', {
            'middleware:httpServer': [
                'factory', function () {
                    return httpServer;
                }
            ]
        }]
    };
};
