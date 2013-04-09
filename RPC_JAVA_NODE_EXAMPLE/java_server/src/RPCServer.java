import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.QueueingConsumer;
import com.rabbitmq.client.AMQP.BasicProperties;
  
public class RPCServer {
  
  private static final String RPC_QUEUE_NAME = "rpc_queue";
  
  private static String watch(String message) throws InterruptedException{
    String answer = "";
    if(message.equals("Wer bist du?") || message.equals("Who are you?")){
    	answer = "Maurice";
    }if(message.equals("Wer ist mein Vater?") || message.equals("Who is my father?")){
    	answer = "Darth Vader";
    }if(message.startsWith("What is the answer to ") || 
    		message.startsWith("How many ") || 
    		message.startsWith("How much ") || 
    		message.startsWith("Wieviel") || 
    		message.startsWith("Wie viel")){
    	answer = "42";
    }else if(message.startsWith("Wann ") || 
    		message.startsWith("Welch") || 
    		message.startsWith("Warum ") || 
    		message.startsWith("Wo") || 
    		message.startsWith("Was ") || 
    		message.startsWith("Wer ") || 
    		message.startsWith("Wes") || 
    		message.startsWith("Wie")|| 
    		message.startsWith("What ")|| 
    		message.startsWith("Why ") || 
    		message.startsWith("Which ") || 
    		message.startsWith("When ") || 
    		message.startsWith("Where ") || 
    		message.startsWith("What ") || 
    		message.startsWith("Who") || 
    		message.startsWith("How")){
    	answer = "I don't know.";
    }else if(message.startsWith("Der ") || 
    		message.startsWith("Die") || 
    		message.startsWith("Das ") || 
    		message.startsWith("Ein ") || 
    		message.startsWith("Eine ") || 
    		message.startsWith("Dies") || 
    		message.startsWith("He ") || 
    		message.startsWith("She ") || 
    		message.startsWith("It ") || 
    		message.startsWith("The ") || 
    		message.startsWith("This ") || 
    		message.startsWith("That ")){
    	answer = "This is not a question!";
    }else{
	    boolean r = Math.random() < 0.5;
	    if(r){
	    	answer = "YES";
	    }else{
	    	answer = "NO";
	    }
	
    }
	Thread.sleep(3000);
    return answer;
  }
    
  public static void main(String[] argv) {
    Connection connection = null;
    Channel channel = null;
    try {
      ConnectionFactory factory = new ConnectionFactory();
      factory.setHost("localhost");
  
      connection = factory.newConnection();
      channel = connection.createChannel();
      
      channel.queueDeclare(RPC_QUEUE_NAME, false, false, false, null);
  
      channel.basicQos(1);
  
      QueueingConsumer consumer = new QueueingConsumer(channel);
      channel.basicConsume(RPC_QUEUE_NAME, false, consumer);
  
      System.out.println(" [x] Awaiting RPC requests");
  
      while (true) {
        String response = null;
        
        QueueingConsumer.Delivery delivery = consumer.nextDelivery();
        
        BasicProperties props = delivery.getProperties();
        BasicProperties replyProps = new BasicProperties
                                         .Builder()
                                         .correlationId(props.getCorrelationId())
                                         .build();
        
        try {
          String message = new String(delivery.getBody(),"UTF-8");
  
          System.out.println(" [.] " + message);
          response = "" + watch(message);
        }
        catch (Exception e){
          System.out.println(" [.] " + e.toString());
          response = "";
        }
        finally {
          channel.basicPublish( "", props.getReplyTo(), replyProps, response.getBytes("UTF-8"));
  
          channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
        }
      }
    }
    catch (Exception e) {
      e.printStackTrace();
    }
    finally {
      if (connection != null) {
        try {
          connection.close();
        }
        catch (Exception ignore) {}
      }
    }
  }
}