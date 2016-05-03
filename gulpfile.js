'use strict';

const gulp = require('gulp');
const concat = require('gulp-concat');

var concatOrder = [
    'scripts/const.js',
    'scripts/hrundel.js',
    'scripts/logic.js',
    'scripts/index.js',
    'scripts/hrundelAnimation.js'
];

gulp.task('default', function () {
    return gulp.src(concatOrder)
        .pipe(concat('main.js'))
        .pipe(gulp.dest('./public/'));
});