'use strict';

var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var del = require('del');
var gulp = require('gulp');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');

var dir = {
  dist: './dist',
  src: './src'
};

gulp.task('clean', function () {
  del.sync([ dir.dist ]);
});

gulp.task('build', [ 'clean', 'compile-css', 'compile-js' ]);

gulp.task('compile-css', function () {
  return gulp.src(dir.src + '/css/*.css')
    .pipe(gulp.dest(dir.dist))
});

gulp.task('compile-js', function () {
  var bundle = browserify('./src/js/index.js').bundle();

  return bundle
    .pipe(source('htmlcg-framework.js'))
    .pipe(buffer())
    .pipe(gulp.dest(dir.dist))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(dir.dist));
});

gulp.task('default', [ 'build' ]);
