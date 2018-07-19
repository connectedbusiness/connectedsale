'use strict';

var gulp = require('gulp'),
    connect = require('gulp-connect'),
    clean = require('gulp-clean'),
    size = require('gulp-size'),
    merge = require('merge-stream'),
    jshint = require('gulp-jshint'),
    gutil = require('gulp-util'),
    concat = require('gulp-concat'),
    uglifyjs = require('gulp-uglify'),
    uglifycss = require('gulp-uglifycss'),
    less = require('gulp-less'),
    copy = require('gulp-copy'),
    run = require('run-sequence'),
    gulpif = require('gulp-if'),
    isRelease = gutil.env.release,
    isDebug = gutil.env.debug;

var paths = {
  less: {
    pickup: 'app/css/style-pickup.less',
    flat: 'app/css/style-flat.less',
    custom: 'app/css/custom.less'
  },
  css: {
   app: 'app/css',
   fontawesome: {
    font: [
      'app/css/font/fontawesome-webfont.*',
      'app/css/FontAwesome.otf'
    ],
    main: 'app/css/font-awesome.min.css'
   },
   jmobile: {
    images: [
      'app/css/images/**/*.png',
      'app/css/images/**/*.gif'
    ],
    main: 'app/css/jquery.mobile-1.1.0.css'
   },
   datetimepicker: {
    images: [
      'app/css/datetimepicker/images/**/*.png',
      'app/css/datetimepicker/images/**/*.gif'
    ],
    main: 'app/css/datetimepicker/jquery-ui.css'
   },
   pickup: 'app/css/style-pickup.css',
   dialog: 'app/css/dialog/jquery.ui.dialog.css',
   flat: 'app/css/style-flat.css',
   custom: 'app/css/custom.css'
  },
  font: 'app/font/Lato/Lato-Light.ttf',
  js: 'app/js/**/*.js',
  html: [
    'app/template/**/*.html',
    'app/index.html',
    'app/desktop.html'
  ],
  cordova: [
    'app/cordova.js',
    'app/cordova_plugins.js'
  ],
  img: [
    'app/img/**/*.png',
    'app/img/**/*.ico',
    'app/img/**/*.jpg'
  ],
  config: 'app/web.config',
  debug: {
    main: 'debug',
    js: 'debug/js',
    css: {
      main: 'debug/css',
      dialog: 'debug/css/dialog',
      picker: {
        main: 'debug/css/datetimepicker',
        img: 'debug/css/datetimepicker/images'
      },
      img: 'debug/css/images',
      font: 'debug/css/font/'
    },
    font: {
      lato: 'debug/font/Lato'
    },
    template: 'debug/template',
    img: 'debug/img'
  },
  release: {
    main: 'release',
    js: 'release/js',
    css: {
      main: 'release/css',
      dialog: 'release/css/dialog',
      picker: {
        main: 'release/css/datetimepicker',
        img: 'release/css/datetimepicker/images'
      },
      img: 'release/css/images',
      font: 'release/css/font'
    },
    font: {
      lato: 'release/font/Lato'
    },
    template: 'release/template',
    img: 'release/img'
  }
};

var condition = (isRelease) ? true : false;

gulp.task('lint', function () {
  return gulp.src(paths.js)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('connect', function () {
  connect.server({
    root: [paths.debug.main],
    port: 9000,
    livereload: true
  });
});

gulp.task('less', function () {
  return gulp.src([
    paths.less.flat,
    paths.less.pickup,
    paths.less.custom
  ])
  .pipe(less())
  .pipe(size())
  .pipe(uglifycss())
  .pipe(gulpif(condition, gulp.dest(paths.release.css.main), gulp.dest(paths.debug.css.main)))
  .pipe(gulp.dest(paths.css.app));
});

gulp.task('css', ['less', 'images', 'font'], function () {
  var dialog = gulp.src(paths.css.dialog)
                  .pipe(size())
                  .pipe(connect.reload())
                  .pipe(uglifycss())
                  .pipe(gulpif(condition, gulp.dest(paths.release.css.dialog), gulp.dest(paths.debug.css.dialog)));
  var fontawesome = gulp.src(paths.css.fontawesome.main)
                      .pipe(size())
                      .pipe(connect.reload())
                      .pipe(uglifycss())
                      .pipe(gulpif(condition, gulp.dest(paths.release.css.main), gulp.dest(paths.debug.css.main)));
  var jmobile = gulp.src(paths.css.jmobile.main)
                  .pipe(size())
                  .pipe(connect.reload())
                  .pipe(uglifycss())
                  .pipe(gulpif(condition, gulp.dest(paths.release.css.main), gulp.dest(paths.debug.css.main)));
  var datepicker = gulp.src(paths.css.datetimepicker.main)
                      .pipe(size())
                      .pipe(connect.reload())
                      .pipe(uglifycss())
                      .pipe(gulpif(condition, gulp.dest(paths.release.css.main+'/datetimepicker'), gulp.dest(paths.debug.css.main+'/datetimepicker')));
  return merge(dialog, fontawesome, jmobile, datepicker);
});

gulp.task('images', function () {
  var jmobile = gulp.src([
    paths.css.jmobile.images[0],
    paths.css.jmobile.images[1]])
                .pipe(size())
                .pipe(gulpif(condition, gulp.dest(paths.release.css.img), gulp.dest(paths.debug.css.img)));
  var datepicker = gulp.src([
    paths.css.datetimepicker.images[0],
    paths.css.datetimepicker.images[1]])
                .pipe(size())
                .pipe(gulpif(condition, gulp.dest(paths.release.css.picker.img), gulp.dest(paths.debug.css.picker.img))); //gulp.dest(paths.css_dest+'/datetimepicker/images'));
  var img = gulp.src([ paths.img[0], paths.img[1] ])
                .pipe(size())
                .pipe(gulpif(condition, gulp.dest(paths.release.img), gulp.dest(paths.debug.img))); //gulp.dest(paths.img_dest));

  return merge(jmobile, datepicker, img);
});

gulp.task('js', function () {
  return gulp.src(paths.js)
        .pipe(size())
        .pipe(gulpif(condition, uglifyjs()))
        .pipe(connect.reload())
        .pipe(gulpif(condition, gulp.dest(paths.release.js), gulp.dest(paths.debug.js))); // gulp.dest(paths.js_dest));;
});

gulp.task('cordova', function () {
  return gulp.src(paths.cordova)
        .pipe(size())
        .pipe(gulpif(condition, uglifyjs()))
        .pipe(connect.reload())
        .pipe(gulpif(condition, gulp.dest(paths.release.main), gulp.dest(paths.debug.main)));
});

gulp.task('html', function () {
  var index = gulp.src([ paths.html[1], paths.html[2] ])
                  .pipe(size())
                  .pipe(connect.reload())
                  .pipe(gulpif(condition,gulp.dest(paths.release.main), gulp.dest(paths.debug.main)));

  var template = gulp.src(paths.html[0])
                      .pipe(size())
                      .pipe(connect.reload())
                      .pipe(gulpif(condition, gulp.dest(paths.release.template), gulp.dest(paths.debug.template)));

	var config = gulp.src(paths.config)
											.pipe(size())
											.pipe(connect.reload())
                      .pipe(gulpif(condition, gulp.dest(paths.release.main), gulp.dest(paths.debug.main)));

  return merge(index, template, config);
});

gulp.task('font', function () {
  var font = gulp.src(paths.font)
              .pipe(size())
              .pipe(gulpif(condition, gulp.dest(paths.release.font.lato), gulp.dest(paths.debug.font.lato))); //gulp.dest(paths.font_dest+'/Lato'));

  var fontawesome = gulp.src([
    paths.css.fontawesome.font[0],
    paths.css.fontawesome.font[1]
  ])
  .pipe(size())
  .pipe(gulpif(condition, gulp.dest(paths.release.css.font), gulp.dest(paths.debug.css.font))); //gulp.dest(paths.css_dest+ '/font'));

  return merge(font, fontawesome);
});

gulp.task('bundle', ['css', 'js', 'cordova', 'html'], function () {
  return gulp.src([
    paths.html[1],
    paths.config
    ])
  .pipe(gulpif(condition, gulp.dest(paths.release.main), gulp.dest(paths.debug.main)));
});

gulp.task('clean', function () {
  return gulp.src(paths.debug.main, {read: false})
              .pipe(clean());
});

gulp.task('watch', ['html', 'bundle', 'connect'], function () {
  //var env = 'debug';
  gulp.watch(paths.js, ['js']);
  gulp.watch(paths.html, ['html']);
  gulp.watch(paths.css.flat, ['css']);
});

gulp.task('build', function (production) {
  console.log(production);
});
