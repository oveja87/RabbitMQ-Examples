This is an example of a Remote Procedure Call between a node.js application as a client and a java application as server. 

The node.js client sends a request message with an unique correlationId to a server over a rpc_queue. The correlationId is used to send the response back to the right client.

The java server is waiting for a request from a client. It can be running on a remote computer. More servers can be started, if there is more power needed. 

To receive a response at the client, there is send a 'callback' queue address with the request. There is a single callback queue per client. The correlationId property now matches the response with the request. 

Within the node.js application, the client communicates with the node.js server by using a socket. If the user sends a message from the browser,  an event is triggered which sends the request to the server. If the node server receives a message from the java application, another event is triggered which sends the response back to the browser and displays it in real time.

The node.js application is built with express.

Run the RPC:
First start one or more of the java applications by running rabbitmq-client.jar and RPCServer.java.
After that you can start the node.js application on http://localhost:3000. The node application can be installed with npm.

Use:
This example can be used to send requests from a node.js application to a java application which can handle CPU-intensive tasks. While the java application is calculating the result, the user can send more requests or do ohter things while he is waiting for the response. The response is displayed in the browser as soon it has arrived in real time. This can be useful for example to convert data linke images, video or sounds in other formats.

