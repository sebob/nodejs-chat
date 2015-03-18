var app = require('http').createServer(handler),
  io = require('socket.io').listen(app),
  parser = new require('xml2json'),
  fs = require('fs'),
  ip = 0;

// creating the server ( localhost:8000 )
app.listen(8000);

console.log('server listening on localhost:8000');

var http = require('http');
var net = require('net');
var sockets = [];

var s = net.Server(function(socket) {
    
    sockets.push(socket);
    socket.key = socket.remoteAddress + ":" + socket.remotePort;

    socket.on('data', function(data) {
        for(var i = 0; i < sockets.length; i++) {
            if(sockets[i] == socket) {continue;}
            sockets[i].write(data.toString());
        }
        
        
        io.sockets.emit('notification', {"host": socket.key, "msg": data.toString()});
    });
    
    socket.on('end', function(d) {
        var i = sockets.indexOf(socket);
        delete sockets[i];
        console.log('client disconnected');
    });
    
    // creating a new websocket to keep the content updated without any AJAX request
});
s.listen(8888);

// on server started we can load our client.html page
function handler(req, res) {
  //ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  fs.readFile(__dirname + '/client.html', function(err, data) {
    if (err) {
      console.log(err);
      res.writeHead(500);
      return res.end('Error loading client.html');
    }
    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function(socket) {
    console.log('send notification...');
    io.sockets.emit('notification', {"host": "127.0.0.1", "msg": "Witam - chat log"});
});
