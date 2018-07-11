/* REQUIRED PACKAGES */

const gulp = require('gulp'); //require gulp

/* REQUIRED PACKAGES FOR STYLING */
const sass = require('gulp-sass'); //require gulp-sass for sass compiling
const cleanCSS = require('gulp-clean-css'); //require gulp clean css for css minification

/* REQUIRED PACKAGES FOR SCRIPTS */
const uglify = require('gulp-uglify'); //require gulp uglify to minify js
const concat = require('gulp-concat'); //require gulp concat to join js files
const rename = require('gulp-rename'); //require gulp rename to rename scripts
const sourcemaps = require('gulp-sourcemaps'); //create a source map
const babel = require('gulp-babel'); //require bable for es6 compatability

/* REQUIRED PACKAGES FOR IMAGES */
const imagemin = require('gulp-imagemin'); //require gulp imagemin for minifying images
const cache = require('gulp-cache'); //require gulp cache for cacing minifid images

/* REQUIRED PACKAGES FOR LIVE RELOADING */
const browserSync = require('browser-sync').create(); //require browser sync for live reloading
const connect = require('gulp-connect-php'); //require gulp connect php for creating a php

//clean up html
const htmlbeautify = require('gulp-html-beautify');
//cleaning up
const del = require('del'); //delete a directory
const runSequence = require('run-sequence');  //run tasks when we want them


/* SOURCE FILES */
const scssSourceDirectory = 'app/scss/*.scss';
const cssSourceDirectory = 'app/css/*.css';
const scriptsSourceDirectory = 'app/scripts/**/*.js';
const imagesSourceDirectory = 'app/assets/**/*.+(png|jpg|jpeg|gif|svg)';
const fontsSourceDirectory = 'app/css/fonts/**/*';
const phpSourceDirectory = './app/**/*.php';
const htmlSourceDirectory = './app/**/*.html';

/* OUTPUT FILES */
const scssOutputDirectory = 'app/css';
const cssOutputDirectory = 'dist/css';
const scriptsOutputDirectory = 'dist/js';
const imagesOutputDirectory = 'dist/assets';
const fontsOutputDirectory = 'dist/css/fonts';
const phpOutputDirectory = 'dist';
const htmlOutputDirectory = 'dist';


const swallowError = function(error){
  console.log(error.toString())  //log error in the console
  this.emit('end')
}

//compile sass within the app/scss directory and output it to app/css
gulp.task('sass', () => {
	return gulp.src(scssSourceDirectory)
		.pipe(sass())
		.on('error', swallowError)
		.pipe(gulp.dest(scssOutputDirectory))
		.pipe(browserSync.reload({
			stream: true
		}))
		.on('end', () => console.log('sass compiled...'))
})


//minify the created css and output it the dist directory
gulp.task('minify-css', () => {
	return gulp.src(cssSourceDirectory)
		.pipe(cleanCSS({compatibility: 'ie8'}))
		.pipe(gulp.dest(cssOutputDirectory))
		.on('end', () => console.log('css minifid...'))
});


//compile the javascript from e66, minify the javascript and output the javascript to the dist directory
gulp.task('scripts', () => {
	return gulp.src(scriptsSourceDirectory)
		 .pipe(sourcemaps.init())
		 .pipe(babel({
			presets: ['env']
		}))
		.pipe(concat('scripts.js'))
		.pipe(rename('scripts.min.js'))
		.pipe(uglify())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(scriptsOutputDirectory))
		.on('end', () => console.log('scripts compiled, minfied and moved...'))
});


//minify images within the assets folder and output them to the dist dirctory 
gulp.task('images', () => {
	return gulp.src(imagesSourceDirectory)
		.pipe(cache(imagemin({
			interlaced: true
		})))
		.pipe(gulp.dest(imagesOutputDirectory))
		.on('end', () => { console.log('images minified and moved...') })
})


//move fonts over from the app directory to the dist directory
gulp.task('fonts', () => {
	return gulp.src(fontsSourceDirectory)
		.pipe(gulp.dest(fontsOutputDirectory))
		.on('end', () => { console.log('fonts moved...') })
})


//set up php connection server at port 3000
gulp.task('php', () => {
    connect.server({ 
    	base: 'app', 
    	port: 3000, 
    	keepalive: true
    });
});


//set up the browser sync settings using the php settings
gulp.task('browserSync',['php'], () => {
    browserSync.init({
        proxy: '127.0.0.1:3000',
        port: 3000,
        open: true,
        notify: false
    });
});


//move the php from the app directory to the dist directory
gulp.task('phpbeautify', () => {
  gulp.src(phpSourceDirectory)
	.pipe(gulp.dest(phpOutputDirectory))
	.on('end', () => console.log('php moved...'))
});


//move the html from the app directory to the dist directory
gulp.task('htmlbeautify', () => {
  var options = {
	indentSize: 2
  };
  gulp.src(htmlSourceDirectory)
	.pipe(htmlbeautify(options))
	.pipe(gulp.dest(htmlOutputDirectory))
	.on('end', () => console.log('html moved and compressed...'))
});


//delete the dist directory before build
gulp.task('clean:dist', () => {
	return del.sync('dist');
})


/* GULP WATCH TASKS */
//watch all of the scss, html, js and the php for changes and reload the files
gulp.task('default', ['browserSync', 'sass'], () => {
	console.log('watching files...');
	gulp.watch(scssSourceDirectory, ['sass']) //watch for sass changes
	gulp.watch(htmlSourceDirectory, browserSync.reload)
	gulp.watch(scriptsSourceDirectory, browserSync.reload)
	gulp.watch(phpSourceDirectory).on('change', () => {
		browserSync.reload();
	});
});


/* GULP BUILD PROJECT */
//delete the dist directory and run all of the tasks
gulp.task('build', (callback) => {
	console.log('building files...');
	runSequence('clean:dist',
		['sass', 'minify-css', 'scripts', 'images', 'fonts', 'htmlbeautify', 'phpbeautify'],
		callback
	)
});
