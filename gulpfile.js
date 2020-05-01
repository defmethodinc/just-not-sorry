const gulp = require('gulp');
const jasmineBrowser = require('gulp-jasmine-browser');
const watch = require('gulp-watch');
const open = require('gulp-open');

const filesForTest = [
    'src/Warnings.js',
    'src/WarningChecker.js',
    'src/HighlightGenerator.js',
    'src/JustNotSorry.js',
    'spec/lib/jquery-2.1.4.min.js',
    'spec/lib/jasmine-jquery.js',
    'spec/**/*Spec.js'
];

const port = 8888;

gulp.task('jasmine-browser', function() {
    return gulp.src(filesForTest)
        .pipe(watch(filesForTest))
        .pipe(jasmineBrowser.specRunner())
        .pipe(jasmineBrowser.server({port}));
});

gulp.task('jasmine-headless-chrome', function () {
    return gulp.src(filesForTest)
        .pipe(jasmineBrowser.specRunner({console: true}))
        .pipe(jasmineBrowser.headless({driver: 'chrome'}));
});
