module.exports = function(mongoose) {
  var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;
	
  var messageSchema = new mongoose.Schema({ 
	    cID: ObjectId,
	    fID: ObjectId,
		tID: ObjectId,
		username: { type: String},
		message: { type: String},
		time: { type: Date, expires: '24h' }
  	});
  
  var message = mongoose.model('Message', messageSchema);  
  
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

  var sendMessages = function(cID, tID, fID, username, user_message, time, callback) {
	  console.log("sendMessage method");

	    var userMessage = new message({ 
	    	cID: cID,
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
