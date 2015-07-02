// This gulpfile makes use of new JavaScript features.
// Babel handles this without us having to do anything. It just works.
// You can read more about the new JavaScript features here:
// https://babeljs.io/docs/learn-es2015/
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _gulpFileInclude = require('gulp-file-include');

var _gulpFileInclude2 = _interopRequireDefault(_gulpFileInclude);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _gulp = require('gulp');

var _gulp2 = _interopRequireDefault(_gulp);

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

var _runSequence = require('run-sequence');

var _runSequence2 = _interopRequireDefault(_runSequence);

var _browserSync = require('browser-sync');

var _browserSync2 = _interopRequireDefault(_browserSync);

var _swPrecache = require('sw-precache');

var _swPrecache2 = _interopRequireDefault(_swPrecache);

var _gulpLoadPlugins = require('gulp-load-plugins');

var _gulpLoadPlugins2 = _interopRequireDefault(_gulpLoadPlugins);

var _psi = require('psi');

var _packageJson = require('./package.json');

var _packageJson2 = _interopRequireDefault(_packageJson);

var $ = (0, _gulpLoadPlugins2['default'])();
var reload = _browserSync2['default'].reload;

// Lint JavaScript
_gulp2['default'].task('jshint', function () {
  return _gulp2['default'].src('./src/js/*.js').pipe(reload({ stream: true, once: true })).pipe($.jshint()).pipe($.jshint.reporter('jshint-stylish')).pipe($['if'](!_browserSync2['default'].active, $.jshint.reporter('fail')));
});

// Optimize images
_gulp2['default'].task('images', function () {
  return _gulp2['default'].src('./src/images/**/*').pipe($.cache($.imagemin({
    progressive: true,
    interlaced: true
  }))).pipe(_gulp2['default'].dest('./dist/images')).pipe($.size({ title: 'images' }));
});

// Copy all files at the root level (app)
_gulp2['default'].task('copy', function () {
  return _gulp2['default'].src(['./src/*', '!./src/scss', 'node_modules/apache-server-configs/dist/.htaccess'], {
    dot: true
  }).pipe(_gulp2['default'].dest('./dist')).pipe($.size({ title: 'copy' }));
});

// Copy web fonts to dist
_gulp2['default'].task('fonts', function () {
  return _gulp2['default'].src(['./src/fonts/*']).pipe(_gulp2['default'].dest('./dist/fonts')).pipe($.size({ title: 'fonts' }));
});

// Compile and automatically prefix stylesheets
_gulp2['default'].task('styles', function () {
  var AUTOPREFIXER_BROWSERS = ['ie >= 10', 'ie_mob >= 10', 'ff >= 30', 'chrome >= 34', 'safari >= 7', 'opera >= 23', 'ios >= 7', 'android >= 4.4', 'bb >= 10'];

  // For best performance, don't add Sass partials to `gulp.src`
  return _gulp2['default'].src(['./src/scss/*.scss', './src/scss/**/*.css']).pipe($.changed('.tmp/css/', { extension: '.css' })).pipe($.sourcemaps.init()).pipe($.sass({
    precision: 10
  }).on('error', $.sass.logError)).pipe($.autoprefixer(AUTOPREFIXER_BROWSERS)).pipe(_gulp2['default'].dest('.tmp'))
  // Concatenate and minify styles
  .pipe($['if']('*.css', $.csso()))
  // .pipe($.sourcemaps.write())
  .pipe(_gulp2['default'].dest('./dist/css')).pipe($.size({ title: 'css' }));
});

// Concatenate and minify JavaScript
_gulp2['default'].task('scripts', function () {
  return _gulp2['default'].src(['./src/js/main.js']).pipe($.concat('main.min.js')).pipe($.uglify({ preserveComments: 'some' }))
  // Output files
  .pipe(_gulp2['default'].dest('./dist/js')).pipe($.size({ title: 'scripts' }));
});

_gulp2['default'].task('fileinclude', function () {
  _gulp2['default'].src(['./src/index.html']).pipe((0, _gulpFileInclude2['default'])({
    prefix: '@@',
    basepath: '@file'
  })).pipe(_gulp2['default'].dest('.tmp/'));
});

_gulp2['default'].task('build', function () {

  (0, _runSequence2['default'])('styles', ['scripts', 'images', 'fonts']);
  _gulp2['default'].src(['src/index.html']).pipe((0, _gulpFileInclude2['default'])({
    prefix: '@@',
    basepath: '@file'
  })).pipe(_gulp2['default'].dest('dist/'));
});

// Scan your HTML for assets & optimize them
_gulp2['default'].task('html', function () {
  var assets = $.useref.assets({ searchPath: '{.tmp, ./src}' });

  _gulp2['default'].src('./src/partialviews/*.html').pipe(_gulp2['default'].dest('./dist/partialviews/'));

  _gulp2['default'].src('./src/*.html').pipe((0, _gulpFileInclude2['default'])({
    prefix: '@@',
    basepath: '@file'
  })).pipe(assets)
  // Remove any unused CSS
  // Note: If not using the Style Guide, you can delete it from
  // the next line to only include styles your project uses.
  .pipe($['if']('*.css', $.uncss({
    html: ['./dist/index.html'],
    // CSS Selectors for UnCSS to ignore
    ignore: []
  })))

  // Concatenate and minify styles
  // In case you are still using useref build blocks
  .pipe($['if']('*.css', $.csso())).pipe(assets.restore()).pipe($.useref())

  // Minify any HTML
  .pipe($['if']('*.html', $.minifyHtml({
    empty: false,
    cdata: false,
    comments: false,
    conditionals: true,
    spare: false,
    quotes: true,
    loose: true
  })))
  // Output files
  .pipe(_gulp2['default'].dest('./dist')).pipe($.size({ title: 'html' }));
});

// Clean output directory
_gulp2['default'].task('clean', function () {
  return (0, _del2['default'])(['.tmp', './dist/*', '!dist/.git'], { dot: true });
});

// Watch files for changes & reload
_gulp2['default'].task('serve', ['styles', 'fileinclude'], function () {
  (0, _browserSync2['default'])({
    notify: true,
    // Customize the BrowserSync console logging prefix
    logPrefix: 'Indy',
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    https: false,
    server: ['.tmp', './src']
  });

  _gulp2['default'].watch(['.tmp/*.html'], reload);
  _gulp2['default'].watch(['./src/**/*.html'], ['fileinclude', reload]);
  _gulp2['default'].watch(['./src/scss/**/*.{scss, css}'], ['styles', reload]);
  _gulp2['default'].watch(['./src/js/**/*.js'], ['jshint']);
  _gulp2['default'].watch(['./src/images/**/*'], reload);
});

// Build and serve the output from the dist build
_gulp2['default'].task('serve:dist', ['default'], function () {
  (0, _browserSync2['default'])({
    notify: false,
    logPrefix: 'Indy',
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    https: false,
    server: './dist'
  });
});

// Build production files, the default task
_gulp2['default'].task('default', ['clean'], function (cb) {
  (0, _runSequence2['default'])('styles',
  // 'jshint',
  'fileinclude', ['scripts', 'images', 'fonts'], 'copy',
  //, 'generate-service-worker',
  cb);
});
