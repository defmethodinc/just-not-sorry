const gulp = require('gulp');
const jasmineBrowser = require('gulp-jasmine-browser');
const watch = require('gulp-watch');
const open = require('gulp-open');
var webpack = require('webpack-stream');

const filesForTest = [
  'src/Warnings.js',
  'src/WarningChecker.js',
  'src/HighlightGenerator.js',
  'src/JustNotSorry.js',
  'spec/lib/jquery-2.1.4.min.js',
  'spec/lib/jasmine-jquery.js',
  'spec/**/*Spec.js',
];

const port = 8888;

gulp.task('jasmine-browser', function () {
  var JasminePlugin = require('gulp-jasmine-browser/webpack/jasmine-plugin');
  var plugin = new JasminePlugin();
  return gulp
    .src(filesForTest)
    .pipe(
      webpack({
        watch: true,
        output: { filename: 'spec.js' },
        mode: 'development',
        plugins: [plugin],
      })
    )
    .pipe(jasmineBrowser.specRunner())
    .pipe(jasmineBrowser.server({ whenReady: plugin.whenReady, port }));
});

gulp.task('jasmine-headless-chrome', function () {
  return gulp
    .src(filesForTest)
    .pipe(
      webpack({
        output: { filename: 'spec.js' },
        mode: 'development',
      })
    )
    .pipe(jasmineBrowser.specRunner({ console: true }))
    .pipe(jasmineBrowser.headless({ driver: 'chrome' }));
});
