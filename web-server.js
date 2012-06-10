var exec = require('child_process').exec,
    http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs")
    port = process.argv[2] || 8888;

function serveFilename(filename, response) {
  path.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }

    fs.readFile(filename, "binary", function(err, file) {
      if (err) {        
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }
  
      if (filename.match(/\.html$/))
        mimeType = "text/html";
      else if (filename.match(/\.js$/))
        mimeType = "application/javascript";
      else if (filename.match(/\.css$/))
        mimeType = "text/css";
      else if (filename.match(/\.otf$/))
        mimeType = "font/opentype";
      else
        mimeType = "text/plain";
  
      response.writeHead(200, {"Content-Type": mimeType});
      response.write(file, "binary");
      response.end();
    });
  });
}

http.createServer(function(request, response) {
  console.log(request.url);
  var uri = url.parse(request.url).pathname,
    filename = path.join(process.cwd(), "output", uri),
    mimeType;
  
  if (filename.match(/\.js$/)) {
    var coffeeFilename = filename.replace('.js', '.coffee');
    path.exists(coffeeFilename, function(exists) {
      if (exists) {
        // -c means compile
        var command = '/usr/local/bin/coffee -c ' + coffeeFilename;
        child = exec(command, function(error, stdout, stderr) {
          //console.log('stdout: ' + stdout);
          //console.log('stderr: ' + stderr);
          if (error !== null) {
            console.log('error execing ' + command + ': ' + error);
          }
          serveFilename(filename, response);
        });
      } else {
        serveFilename(filename, response);
      }
    });
  } else {
    if (request.url == '/') {
      serveFilename(filename + "/index.html", response);
    } else if (!request.url.match(/\./)) {
      serveFilename(filename + ".html", response);
    } else {
      serveFilename(filename, response);
    }
  }
}).listen(parseInt(port, 10));

console.log("Static file server running at\n  => http://localhost:" +
  port + "/\nCTRL + C to shutdown");
