var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var inject = require('gulp-inject');
var angularFilesort = require('gulp-angular-filesort');
var config = require('./gulp.config')();

var paths = {
  sass: ['./scss/**/*.scss'],
  javascript: [
    './www/**/*.js',
    '!./www/lib/**'
  ],
  css: [
    './www/**/*.css',
    '!./www/css/ionic.app*.css',
    '!./www/lib/**'
  ]
};

gulp.task('wiredep', function() {
  'use strict';
  var options = config.getWiredepDefaultOptions();
  var wiredep = require('wiredep').stream;
  return gulp
    .src('./www/index.html')
    .pipe(wiredep(options))
    .pipe(gulp.dest('./www'));
});

gulp.task('inject', ['wiredep'], function() {
  'use strict';
  return gulp.src('./www/index.html')
    .pipe(inject(
      gulp.src(paths.javascript).pipe(angularFilesort()), {
        relative: true
      }))
    .pipe(gulp.dest('./www'))
    .pipe(inject(
      gulp.src(paths.css, {
        read: false
      }), {
        relative: true
      }))
    .pipe(gulp.dest('./www'));
});

gulp.task('default', ['sass', 'wiredep', 'inject']);

gulp.task('sass', function(done) {
  'use strict';
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({
      extname: '.min.css'
    }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  'use strict';
  gulp.watch(paths.sass, ['sass']);
  gulp.watch([
     paths.javascript,
     paths.css
   ], ['inject']);
});

gulp.task('install', ['git-check'], function() {
  'use strict';
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  'use strict';
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:',
      gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') +
      '\' again.'
    );
    process.exit(1);
  }
  done();
});
