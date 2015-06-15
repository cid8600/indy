/**
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */

// This gulpfile makes use of new JavaScript features.
// Babel handles this without us having to do anything. It just works.
// You can read more about the new JavaScript features here:
// https://babeljs.io/docs/learn-es2015/
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _gulpFileInclude = require('gulp-file-include');

var _gulpFileInclude2 = _interopRequireDefault(_gulpFileInclude);

var _gulpDebug = require('gulp-debug');

var _gulpDebug2 = _interopRequireDefault(_gulpDebug);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

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
  return _gulp2['default'].src(['./src/scss/*.scss', './src/scss/**/*.css']).pipe($.changed('.tmp/css', { extension: '.css' })).pipe($.sourcemaps.init()).pipe($.sass({
    precision: 10
  }).on('error', $.sass.logError)).pipe($.autoprefixer(AUTOPREFIXER_BROWSERS)).pipe(_gulp2['default'].dest('.tmp'))
  // Concatenate and minify styles
  .pipe($['if']('*.css', $.csso())).pipe($.sourcemaps.write()).pipe(_gulp2['default'].dest('./dist/css')).pipe($.size({ title: 'css' }));
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
    basepath: './src/templates'
  })).pipe(_gulp2['default'].dest('.tmp/'));
});

// Scan your HTML for assets & optimize them
_gulp2['default'].task('html', function () {
  var assets = $.useref.assets({ searchPath: '{.tmp, ./src}' });

  return _gulp2['default'].src('./src/*.html').pipe(assets)
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
  .pipe($['if']('*.html', $.minifyHtml()))
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
  (0, _runSequence2['default'])('styles', ['jshint', 'scripts', 'images', 'fonts', 'html'], 'copy', 'generate-service-worker', cb);
});

// Run PageSpeed Insights
_gulp2['default'].task('pagespeed', function (cb) {
  // Update the below URL to the public URL of your site
  (0, _psi.output)('example.com', {
    strategy: 'mobile'
  }, cb);
});

// See http://www.html5rocks.com/en/tutorials/service-worker/introduction/ for
// an in-depth explanation of what service workers are and why you should care.
// Generate a service worker file that will provide offline functionality for
// local resources. This should only be done for the 'dist' directory, to allow
// live reload to work as expected when serving from the 'app' directory.
_gulp2['default'].task('generate-service-worker', function (cb) {
  var rootDir = 'dist';

  (0, _swPrecache2['default'])({
    // Used to avoid cache conflicts when serving on localhost.
    cacheId: _packageJson2['default'].name || 'web-starter-kit',
    // URLs that don't directly map to single static files can be defined here.
    // If any of the files a URL depends on changes, then the URL's cache entry
    // is invalidated and it will be refetched.
    // Generally, URLs that depend on multiple files (such as layout templates)
    // should list all the files; a change in any will invalidate the cache.
    // In this case, './' is the top-level relative URL, and its response
    // depends on the contents of the file 'dist/index.html'.
    dynamicUrlToDependencies: {
      './': [_path2['default'].join(rootDir, 'index.html')]
    },
    staticFileGlobs: [
    // Add/remove glob patterns to match your directory setup.
    '${rootDir}/fonts/**/*.woff', '${rootDir}/images/**/*', '${rootDir}/js/**/*.js', '${rootDir}/css/**/*.css', '${rootDir}/*.{html}', '${rootDir}/data/*.{json}'],
    // Translates a static file path to the relative URL that it's served from.
    stripPrefix: _path2['default'].join(rootDir, _path2['default'].sep)
  }, function (err, swFileContents) {
    if (err) {
      cb(err);
      return;
    }

    var filepath = _path2['default'].join(rootDir, 'service-worker.js');

    _fs2['default'].writeFile(filepath, swFileContents, function (err) {
      if (err) {
        cb(err);
        return;
      }

      cb();
    });
  });
});

// Load custom tasks from the `tasks` directory
// try { require('require-dir')('tasks'); } catch (err) { console.error(err); }
// By default we use the PageSpeed Insights free (no API key) tier.
// Use a Google Developer API key if you have one: http://goo.gl/RkN0vE
// key: 'YOUR_API_KEY'
