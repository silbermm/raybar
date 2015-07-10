var gulp = require('gulp');
var path = require('path');
var webpack = require('webpack-stream');
var $ = require('gulp-load-plugins');

// This is a relatively simple config. We'll add more stuff later.
var webpackConfig = {
    debug: true,
    watch: true,
    // this is the "entry" file of your app. Think of it as your Angular "app.js" file.
    entry: "./app/modules/index.js",     
    // this is the will-be-outputted file you'll reference in your index.html file
    output: {
        filename: "bundle.js",          
    },
    module: {
        loaders: [
           // nothing here yet! We'll add more stuff in Part 2
        ]
    },
    plugins: [
        
    ]
};
                                   
// this tells gulp to take the index.js file and send it to Webpack along with the config and put the resulting files in dist/
gulp.task("webpack", function() {
    return gulp.src('app/modules/index.js')
    .pipe( webpack(webpackConfig) )
    .pipe(gulp.dest('dist/'));
});

gulp.task("copyIndex", function() {
   return gulp.src('index.html')
   .pipe(gulp.dest('dist/'));
});

gulp.task('server', function(cb) {
   var spawn = require('child_process').spawn;
   var log = function(data){ console.log("[Divshot] " + data.toString().trim()); };

 var server = spawn('divshot', ['server', '--port', '3000']);

 server.on('error', function(error) { console.log(error.stack) });
});

// this should look familiar: start the server
gulp.task('serve', ['connect'], function () {
  require('opn')('http://localhost:9000');
});

// this is a somewhat fancy bit of URL rewriting to make the SPA 
// basically, it rewrites all requests so that the server sends the index page
// and lets the angular client-side routing take over
gulp.task('connect', function () {
  var connect = require('connect');
  var app = connect()
    .use(require('connect-livereload')({ port: 35729 }))
    .use(require('connect-modrewrite')([
      '!(\\..+)$ / [L]',
    ]))
    //.use(connect.static('dist'))
    //.use(connect.directory('dist'));

  require('http').createServer(app)
    .listen(9000)
    .on('listening', function () {
      console.log('Started connect web server on http://localhost:9000');
    });
});

gulp.task('watch', ['connect', 'server'], function () {
  var server = $.livereload();

  // watch for changes
  gulp.watch([
    'dist/bundle.js',
    'dist/index.html'
  ]).on('change', function (file) {
    server.changed(file.path);
  });

  // run webpack whenever the source files changes
  // this next set of watches tells gulp to run webpack 
  // whenever the source files change and copy the new index html over
  gulp.watch('app/modules/**/*', ['webpack']);
  gulp.watch('index.html', ['copyIndex']);
});

// this tells gulp to combine my Angular dependencies and to output the vendor.js file into the dist/ folder
gulp.task("vendor", function() {
  return gulp.src([
    'app/bower_components/angular-ui-router/release/angular-ui-router.min.js',
    'app/bower_components/angular/angular.min.js',
    'app/bower_components/angular-animate/angular-animate.min.js',
  ])
  .pipe( $.order([
    'angular/angular.min.js',
    'angular-ui-router/release/angular-ui-router.min.js',
    'angular-animate/angular-animate.min.js',
  ], {base: './app/bower_components'}))
  .pipe( $.concat('vendor.js'))
  .pipe( $.size() )
  .pipe(gulp.dest('dist/'))
});
