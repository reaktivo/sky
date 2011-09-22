
/**
 * Module dependencies.
 */

var express = require('express');
var expose = require('express-expose');

var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);


// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

var fs = require('fs');
var sky = require('./sky');
require('./mootools-1.4.0');

var webcam_url = 'http://webcamsdemexico.net/cancun1/live.jpg';
//var webcam_url = 'http://warp2.playa.info/twopalmscam/image.jpg?r=69478972';
var colors_file = 'colors.json';

var color_sets = [];

var refreshColors = function() {
  sky.saveColors({
    url: webcam_url, 
    file: colors_file, 
    keep: 20,
    onRefresh: function(new_color_sets) {
      io.sockets.emit('refreshColors', new_color_sets);
      color_sets = new_color_sets;
    }
 })
};

io.sockets.on('connection', function(socket) {
  socket.on('colorEnter', function(color_id) {
    io.sockets.emit('colorEnter', color_id);
  });
  socket.on('colorLeave', function(color_id) {
    io.sockets.emit('colorLeave', color_id);
  });
});

// one screen shot every hour, every day
refreshColors.periodical(1000 * 60 * 60);
refreshColors();

app.get('/', function(req, res){
  res.expose({color_sets: color_sets});
  res.render('index');
});

app.listen(9999);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);


