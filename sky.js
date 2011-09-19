
var http = require('http');
var fs = require('fs');
var url_parse = require('url').parse;
var async = require('async');
var exec = require('child_process').exec;
var filename = 'live.jpg';

var downloadFile = function(url, callback) {
  var url = url_parse(url);
  var options = {
    host: url.hostname,
    port: url.port,
    path: url.pathname
  }

  http.get(options, function(res) {
    
    var tmp_file = "tmp/" + filename;
    var file = fs.createWriteStream(tmp_file);
    res.on('data', function (chunk) {
        file.write(chunk);
    });

    res.on('end', function() {
      file.end();
      if(callback) callback(tmp_file);
    });

  });
}

module.exports = {

  saveColors: function(options) {
    var url = options.url, 
        color_file = options.file
        keep = options.keep || 10

    async.parallel({
      color_sets: function(callback) {
        var color_set = JSON.parse(fs.readFileSync(color_file));
        callback(null, color_set);
      },
      new_colors: function(callback) {
        downloadFile(url, function(image_file){
          var cmd = 'convert ' + image_file + ' -resize 1x10! txt:-';
          var child = exec(cmd, function(err, stdout, stderr) {
            var new_colors = stdout.split("\n").slice(1, -1).map(function(line) {
              return line.match(/#[^\s]+/)[0];
            });
            callback(null, new_colors);
          });
        });
      }
    }, function(err, results) {
      
      var color_sets = results.color_sets
      color_sets.unshift(results.new_colors);
      color_sets = color_sets.slice(0, keep);

      fs.writeFile(color_file, JSON.stringify(color_sets), function(err) {
        if(err) throw err;
        console.log(color_file + ' saved');
        if(options.onRefresh) options.onRefresh(color_sets);
      });
    });
    
  }
  
}