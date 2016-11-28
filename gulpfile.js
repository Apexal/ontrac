const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const minifyCSS = require('gulp-minify-css');

gulp.task('pre', ['scripts', 'styles']);

gulp.task('scripts', () => {
    return gulp.src('./client/js/**/*.js')
        .pipe(concat('script.js'))
        //.pipe(uglify())
        .pipe(gulp.dest('./client/public/js'));
});

gulp.task('styles', function() {
  return gulp.src('./client/css/*.css')
    .pipe(concat('style.css'))
    .pipe(minifyCSS())
    .pipe(gulp.dest('client/public/css'));
});

gulp.task('default', ['scripts', 'styles'], () => {
  // watch for JS changes
  gulp.watch('./client/js/**/*.js', ['scripts']);

  // watch for CSS changes
  gulp.watch('./client/css/*.css', ['styles']);
});