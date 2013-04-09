var amqp = require('amqp')
, crypto = require('crypto')
 
var TIMEOUT=10000; 
 
exports = module.exports = AmqpRpc;
 
function AmqpRpc(connection){
	var self = this;
	this.connection = connection;
	this.requests = {}; //store request in wait for response
	this.response_queue = false; 
}
 
AmqpRpc.prototype.makeRequest = function(queue_name, content, callback){
	
	var self = this;

	//generate unique correlation id
	var correlationId = crypto.randomBytes(16).toString('hex');

	//create a timeout for what should happen if we don't get a response
	var tId = setTimeout(function(cId){
		callback(new Error("timeout " + cId));
		//delete entry
		delete self.requests[cId];
	}, TIMEOUT, correlationId);
	 
	//create request entry to store in hash
	var entry = {
		callback:callback,
		timeout: tId
	};
	self.requests[correlationId]=entry;
	
	//response queue 
	self.setupResponseQueue(function(){
		//put the request on a queue
		self.connection.publish(queue_name, content, {correlationId:correlationId, replyTo:self.response_queue });
	});
}
 
 
AmqpRpc.prototype.setupResponseQueue = function(next){

	if(this.response_queue) return next();
	 
	var self = this;

	//create queue,  '' generates random ID
	self.connection.queue('', {exclusive:true}, function(queue){

		//store name
		self.response_queue = queue.name;

		//subscribe to messages
		queue.subscribe(function(message, headers, deliveryInfo, m){
			//get the correlationId
			var correlationId = m.correlationId;
			//is it a response to a pending request
			if(correlationId in self.requests){
				
				var entry = self.requests[correlationId]; //retreive the request entry

				clearTimeout(entry.timeout);  //clear timeout
				
				delete self.requests[correlationId]; //delete entry from hash

				entry.callback(null, message.data.toString());
			}
		});
		return next();
	});
}