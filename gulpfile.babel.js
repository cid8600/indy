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

  gulp.src('./src/images')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('.tmp/css/images'))
    .pipe($.size({title: 'images'}));

    gulp.src('.tmp/css/images')
    .pipe(gulp.dest('.dist/css/images'))
    .pipe($.size({title: 'images'}));

});

// Copy all files at the root level (app)
gulp.task('deploy', () => {

  gulp.src(['.tmp/*']).pipe(gulp.dest('./dist/'))
    .pipe($.size({title: 'deploy'}));

  gulp.src(['./src/fonts/*'], {
    dot: true
  }).pipe(gulp.dest('./dist/css/fonts/'))
  .pipe($.size({title: 'fonts'}));

  gulp.src(['./src/images/**/*'], {
    dot: true
  }).pipe(gulp.dest('./dist/css/images/'))
  .pipe($.size({title: 'images'}));

  gulp.src(['.tmp/index.html'], {
    dot: true
  }).pipe(gulp.dest('./dist'))
  .pipe($.size({title: 'html'}));

});

// Copy web fonts to dist
gulp.task('fonts', () => {
  return gulp.src(['./src/fonts/*'])
    .pipe(gulp.dest('./dist/css/fonts'))
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
    .pipe($.changed('.tmp/', {extension: '.css'}))
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      precision: 10
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/css'))
    // Concatenate and minify styles
    .pipe($.if('*.css', $.csso()))
    // .pipe($.sourcemaps.write())
    .pipe(gulp.dest('./dist/css'))
    .pipe($.size({title: 'css'}));
});

// Concatenate and minify JavaScript
gulp.task('scripts', () => {
  return gulp.src(['./src/js/vendor/jquery-1.11.3.min.js', './src/js/vendor/jquery-throttle-debounce-min.js', './src/js/vendor/flipclock.min.js',
    './src/js/vendor/Base64.min.js', './src/js/vendor/fb.js', './src/js/vendor/videojs/video.dev.js', './src/js/vendor/videojs/vjs.youtube.js', './src/js/app.js'])
    .pipe($.concat('main.js'))
    .pipe(gulp.dest('.tmp/js/'))
    .pipe($.uglify({preserveComments: 'some'}))
    // Output files
    .pipe(gulp.dest('./dist/js/'))
    .pipe($.size({title: 'scripts'}));
});

gulp.task('fileinclude', () => {

  gulp.src('./src/*.html')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    })
    .pipe(gulp.dest('.tmp/')));
});

gulp.task('build', () => {
  runSequence(['deploy']);
});


// Scan your HTML for assets & optimize them
gulp.task('html', () => {
  const assets = $.useref.assets({searchPath: '{.tmp, ./src}'});

  // gulp.src('./src/partialviews/*.html').pipe(gulp.dest('./dist/partialviews/'));


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
      empty: true,
      cdata: false,
      comments: false,
      conditionals: true,
      spare: false,
      quotes: true,
      loose: true
    })))
    // Output files
    .pipe(gulp.dest('./dist/'))
    .pipe($.size({title: 'html'}));
});

// Clean output directory
gulp.task('clean', () => del(['.tmp', './dist/*', '!dist/.git'], {dot: true}));

// Watch files for changes & reload
gulp.task('serve', ['clean', 'styles', 'scripts'], () => {

    gulp.src('./src/*.html')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    })).pipe(gulp.dest('.tmp/'));

  browserSync({
    notify: true,
    // Customize the BrowserSync console logging prefix
    logPrefix: 'Indy',
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    https: false,
    server: ['.tmp/', './src']
  });

  gulp.watch(['./src/*.html'], ['html', reload]);
  gulp.watch(['./src/scss/**/*.{scss, css}'], ['styles', reload]);
  gulp.watch(['./src/js/*.js'], ['jshint']);
  gulp.watch(['./src/images/**/*'], reload);
  gulp.watch(['./src/fonts/*'], reload);

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
gulp.task('default', ['clean'], () => {
  runSequence(['styles','scripts','images', 'fonts', 'html']);
});