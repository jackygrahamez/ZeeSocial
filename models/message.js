module.exports = function(mongoose) {
  console.log("exporting message model");
  var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;
	
  var messageSchema = new mongoose.Schema({ 
		fID: ObjectId,
		tID: ObjectId,
		username: { type: String},
		message: { type: String},
		time: { type: Date, expires: '24h' }
  	});
  console.log("messageSchema "+messageSchema);
  
  var message = mongoose.model('Message', messageSchema);  
  console.log("message "+message);
  
  var findMessages = function(tID, fID, callback) {
	  console.log("findMessage "+tID+" "+fID);
	  var query = { "$or" : [
                      { "fID" : fID,  
						"tID" : tID} ,
                      { "tID" : fID,
					    "fID" : tID}
                    ]
             }
           
	  	message.find( query, function(err,doc) {

	  	  console.log("findMessages "+doc);	  	
	      callback(doc);
	    });
  };

  var sendMessages = function(tID, fID, username, user_message, time, callback) {
	  console.log("sendMessage method");

	    var userMessage = new message({ 
			fID: fID,
			tID: tID,
			username: username,
			message: user_message,
			time: time
	  	});
	    console.log(userMessage);
	    userMessage.save(callback);

	  console.log("sendMessages "+tID+" "+fID+" "+username+" "+user_message+" "+time);
	  	message.find( function(err,doc) {

	  	  console.log("sendMessages "+doc);	  	
	      callback(doc);
	    });
  };

  
  return {
	message: message,
	findMessages: findMessages,
	sendMessages: sendMessages
  }
}
