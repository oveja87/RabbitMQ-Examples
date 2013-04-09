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
 });


//Server initialise
server.listen(app.get('port'));

 app.configure('development', function(){
  app.use(express.errorHandler());
 });

 app.get('/', routes.index);
 app.get('/index', routes.index);
 app.get('/users', user.list);
 app.get('/about', routes.about);


//rabbitMQ

 // create connection with amqp
var conn = amqp.createConnection({ host: 'localhost' });
conn.on('ready', setup);

// define the exchange
var exchange;
function setup() {
            exchange = conn.exchange('my_exchange1', 
                             {'type': 'fanout', durable: false}, 
                              exchangeSetup);
}

// define the queue
var queue;
var deadQueue;
function exchangeSetup() {
    queue = conn.queue('my_queue1', {durable: false, exclusive: false},queueSetup);
    queue.on('queueBindOk', function() { onQueueReady(exchange); });
}

// subscribe on queue and bind exchange and q
function queueSetup() {
             queue.bind(exchange.name, 'my_queue1');
}

// queue ready event
function onQueueReady(exchange){
            console.log("queue binding done...........................");
}

app.post('/test', function(req, res){
  var myText = req.body.myText;
  exchange.publish('my_queue1', {data:myText});
  console.log("publish done on RabbitMQ........"+req.body.myText);
  res.redirect('/');
});
    
console.log("Starting ... AMQP");