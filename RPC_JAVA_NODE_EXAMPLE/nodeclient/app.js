 /**
 * Module dependencies.
 */

 var express = require('express')
  , app = express()
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , nib = require('nib')
  , stylus = require('stylus')
  , amqp = require('amqp')
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);



 function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
 }


//configure express
 app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(stylus.middleware({ src: __dirname + '/public', compile: compile}));
  io.set('log level', 1); 
 });

//Server initialise
server.listen(3000);
console.log("Server is listening on http://localhost/3000");

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/index', routes.index);
app.get('/about', routes.about);

//socket.io
io.on('connection', function (socket) {
  console.log("emitting event from server");

//Client
  var connection = amqp.createConnection({host:'127.0.0.1'});
   
  var rpc = new (require('./amqprpc.js'))(connection);
   
  connection.on("ready", function(){
    console.log("connection ready");

    socket.on('send message', function (msg) {

      console.log(msg);
      
      rpc.makeRequest('rpc_queue', msg, function response(err, response){
        if(err){
          console.error(err);        
        }
        else{
          console.log("response", response);
          io.sockets.emit('receive message', {message:msg, response:response});
        }
      }); 

      console.log("requested message "+ msg + " on RabbitMQ");
    });
   
  });
   
});