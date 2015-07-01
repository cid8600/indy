// This gulpfile makes use of new JavaScript features.
// Babel handles this without us having to do anything. It just works.
// You can read more about the new JavaScript features here:
// https://babeljs.io/docs/learn-es2015/
import fileinclude from 'gulp-file-include';
import fs from 'fs';
import path from 'path';
import gulp from 'gulp';
import del from 'del';
import runSequence from 'run-sequence';
import browserSync from 'browser-sync';
import swPrecache from 'sw-precache';
import gulpLoadPlugins from 'gulp-load-plugins';
import {output as pagespeed} from 'psi';
import pkg from './package.json';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

// Lint JavaScript
gulp.task('jshint', () => {
  return gulp.src('./src/js/*.js')
    .pipe(reload({stream: true, once: true}))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

// Optimize images
gulp.task('images', () => {
  return gulp.src('./src/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('./dist/images'))
    .pipe($.size({title: 'images'}));
});

// Copy all files at the root level (app)
gulp.task('copy', () => {
  return gulp.src([
    './src/*',
    '!./src/scss',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest('./dist'))
    .pipe($.size({title: 'copy'}));
});

// Copy web fonts to dist
gulp.task('fonts', () => {
  return gulp.src(['./src/fonts/*'])
    .pipe(gulp.dest('./dist/fonts'))
    .pipe($.size({title: 'fonts'}));
});

// Compile and automatically prefix stylesheets
gulp.task('styles', () => {
  const AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ];

  // For best performance, don't add Sass partials to `gulp.src`
  return gulp.src([
    './src/scss/*.scss',
    './src/scss/**/*.css'
  ])
    .pipe($.changed('.tmp/css/', {extension: '.css'}))
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      precision: 10
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp'))
    // Concatenate and minify styles
    .pipe($.if('*.css', $.csso()))
    // .pipe($.sourcemaps.write())
    .pipe(gulp.dest('./dist/css'))
    .pipe($.size({title: 'css'}));
});

// Concatenate and minify JavaScript
gulp.task('scripts', () => {
  return gulp.src(['./src/js/main.js'])
    .pipe($.concat('main.min.js'))
    .pipe($.uglify({preserveComments: 'some'}))
    // Output files
    .pipe(gulp.dest('./dist/js'))
    .pipe($.size({title: 'scripts'}));
});

gulp.task('fileinclude', () => {
  gulp.src(['./src/index.html'])

    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('.tmp/'));
});

gulp.task('build', () => {
  gulp.src(['src/index.html'])

    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('dist/'));
});


// Scan your HTML for assets & optimize them
gulp.task('html', () => {
  const assets = $.useref.assets({searchPath: '{.tmp, ./src}'});

  gulp.src('./src/partialviews/*.html').pipe(gulp.dest('./dist/partialviews/'));


    gulp.src('./src/*.html')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(assets)
    // Remove any unused CSS
    // Note: If not using the Style Guide, you can delete it from
    // the next line to only include styles your project uses.
    .pipe($.if('*.css', $.uncss({
      html: [
        './dist/index.html'
      ],
      // CSS Selectors for UnCSS to ignore
      ignore: []
    })))

    // Concatenate and minify styles
    // In case you are still using useref build blocks
    .pipe($.if('*.css', $.csso()))
    .pipe(assets.restore())
    .pipe($.useref())

    // Minify any HTML
    .pipe($.if('*.html', $.minifyHtml({
      empty: false,
      cdata: false,
      comments: false,
      conditionals: true,
      spare: false,
      quotes: true,
      loose: true
    })))
    // Output files
    .pipe(gulp.dest('./dist'))
    .pipe($.size({title: 'html'}));
});

// Clean output directory
gulp.task('clean', () => del(['.tmp', './dist/*', '!dist/.git'], {dot: true}));

// Watch files for changes & reload
gulp.task('serve', ['styles', 'fileinclude'], () => {
  browserSync({
    notify: true,
    // Customize the BrowserSync console logging prefix
    logPrefix: 'Indy',
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    https: false,
    server: ['.tmp', './src']
  });

  gulp.watch(['.tmp/*.html'], reload);
  gulp.watch(['./src/**/*.html'], ['fileinclude', reload]);
  gulp.watch(['./src/scss/**/*.{scss, css}'], ['styles', reload]);
  gulp.watch(['./src/js/**/*.js'], ['jshint']);
  gulp.watch(['./src/images/**/*'], reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], () => {
  browserSync({
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
gulp.task('default', ['clean'], cb => {
  runSequence(
    'styles',
    // 'jshint',
    'fileinclude',
    [ 'scripts', 'images', 'fonts', 'html'],
    'copy',
    //, 'generate-service-worker',
    cb);
});