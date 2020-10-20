const gulp = require("gulp");
const babel = require('gulp-babel');
const sass = require("gulp-sass");
const merge = require('merge-stream');
const concat = require('gulp-concat');
const rename = require("gulp-rename");
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const webp = require('gulp-webp');
const del = require('del');

var configuration = {
    paths: {
        src:{
            img: './source/img/**/*.+(png|jpg|gif|svg|webp)',
            scss: './source/scss/**/*.scss',
            js: "./source/js/**/*.js"
        },
        dist: {
            img: './assets/img',
            scss: './assets/css',
            base: './assets/js',
            js: './assets/js'
        }
    },
    files_to_concatenate:[
        {
            bundle_name: 'base.min.js',
            src:[
                './node_modules/jquery/dist/jquery.min.js',
                './node_modules/popper.js/dist/umd/popper.min.js',
                './node_modules/bootstrap/dist/js/bootstrap.min.js',
                './node_modules/flatpickr/dist/flatpickr.min.js',
                //'./source/js/glider.js'
            ]
        }
    ],
    files_to_concatenate_process:[
        {
            bundle_name: 'process.min.js',
            src:[
                './node_modules/moment/min/moment.min.js',
                './node_modules/moment/min/locales.min.js',
                './node_modules/moment-timezone/moment-timezone.js',
                './node_modules/moment-timezone/builds/moment-timezone-with-data.js',
                //'./source/js/calentim.min.js'
            ]
        }
    ]
}



function bundles(){
    return merge(
        configuration.files_to_concatenate.map(function (currentValue, index) {
            return gulp.src(currentValue.src)
                .pipe(concat(currentValue.bundle_name))
                .pipe(gulp.dest(configuration.paths.dist.base))
        })
    );
}
function bundlesProcess(){
    return merge(
        configuration.files_to_concatenate_process.map(function (currentValue, index) {
            return gulp.src(currentValue.src)
                .pipe(concat(currentValue.bundle_name))
                .pipe(gulp.dest(configuration.paths.dist.base))
        })
    );
}

function productionStyles() {
    return gulp
        .src(configuration.paths.src.scss)
        .pipe(sass({
            outputStyle: "compressed"
        }).on('error', sass.logError))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(configuration.paths.dist.scss));
}

function styles() {
    return gulp
        .src(configuration.paths.src.scss)
        .pipe(sass().on('error', sass.logError))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(configuration.paths.dist.scss))
    // .pipe(browserSync.stream());
}

function scripts() {
    return gulp
        .src(configuration.paths.src.js)
        .pipe(
            babel({
                presets: ["@babel/env"],
            })
        )
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(configuration.paths.dist.js))
    // .pipe(browserSync.stream());
}

function productionScripts() {
    return gulp
        .src(configuration.paths.src.js)
        .pipe(
            babel({
                presets: ["@babel/env"],
            })
        )
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(configuration.paths.dist.js))
}

function clean() {
    return del.sync('assets/**');
}

function imageNormal() {
    return gulp
        .src(configuration.paths.src.img)
        .pipe(gulp.dest(configuration.paths.dist.img))
}

function imageWebp() {
    return gulp
        .src(configuration.paths.src.img)
        .pipe(webp())
        .pipe(gulp.dest(configuration.paths.dist.img))
}

async function images(){
    imageNormal();
    imageWebp();
}

function css() {
    return gulp
        .src("./source/css/*.css")
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest("./assets/css"))
}

function watch() {
    gulp.watch(configuration.paths.src.img, images);

    gulp.watch(configuration.paths.src.js, scripts);
    gulp.watch(configuration.paths.src.scss, styles);
    gulp.watch("./source/css/**/*.css", css);
}

exports.live    = gulp.series(bundles, bundlesProcess, images, productionStyles, productionScripts, css);
exports.default = gulp.series(bundles, bundlesProcess, images, styles, scripts, watch, css);

