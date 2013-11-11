		module.exports = function(mongoose) {
  var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;
	
  var messageSchema = new mongoose.Schema({ 
	    cID: ObjectId,
	    thread : [{
		    fID: ObjectId,
			tID: ObjectId,
			username: { type: String},
			message: { type: String},
			time: { type: Date, expires: '24h' },
			counter: { type: Number }
	    }]
  	});
  
  var message = mongoose.model('Message', messageSchema);  
  
  var findMessages = function(tID, fID, callback) {
	  console.log("findMessage "+tID+" "+fID);
	  var query = { "$or" : [
                      { "thread.fID" : fID,  
						"thread.tID" : tID} ,
                      { "thread.tID" : fID,
					    "thread.fID" : tID}
                    ]
             }
           
	  	message.find( query, function(err,doc) {

	  	  console.log("findMessages "+doc);	  	
	      callback(doc);
	    });
  };

  var sendMessages = function(cID, tID, fID, username, user_message, time, callback) {
	  console.log("user_message "+user_message);

	  	userMessage = new Object();
	  	userMessage.fID = fID;
	  	userMessage.tID = tID;
	  	userMessage.username = username;	  	
	  	userMessage.message = user_message;	  	
	  	userMessage.time = time;
	  	

	    message.update(
	    		{"_id" : cID},
	    		{"$push" : { 'thread' : userMessage }},
	    		{upsert: true},
	    		function(err,update_message_thread) {  	
		        callback(update_message_thread);
		});
	    
  	    
	    
	  console.log("sendMessages "+tID+" "+fID+" "+username+" "+user_message+" "+time);
	  	message.find( {"_id" : cID}, function(err,doc) {
	  	  console.log("sendMessages "+doc);	  	
	      callback(doc);
	    });
  };
  
  var removeCheckinMessages = function(cID, callback) {
	  console.log("removing checkin messages "+cID);
	  	message.remove( {cID: cID}, function(err,doc) {
		  	  console.log("remove "+doc);	  	
		      callback(doc);
		    });
  };

  var findMessagesFrom = function(cID, callback) {
	  console.log("findMessage "+cID);
	  message.find(	{"_id" :  cID},
			    function(err, doc) {
			        console.log(doc);
			        callback(doc);
			    }
			); 
  }; 
  
  var findNextMessage = function(cID, callback) {
	    var i;
	  	var query = { "_id" : cID }
	  	message.find(query, function(err,doc) {
	      callback(doc);
	    });
  };  
  
  return {
	message: message,
	findMessages: findMessages,
	sendMessages: sendMessages,
	findMessagesFrom: findMessagesFrom,
	removeCheckinMessages: removeCheckinMessages,
	findNextMessage: findNextMessage
  }
}
