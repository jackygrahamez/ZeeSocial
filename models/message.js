		module.exports = function(mongoose) {
  var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;
	
  var messageSchema = new mongoose.Schema({ 
	    cID: ObjectId,
	    fID: ObjectId,
		tID: ObjectId,
		username: { type: String},
		message: { type: String},
		time: { type: Date, expires: '24h' },
		counter: { type: Number }
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

  var sendMessages = function(cID, tID, fID, username, user_message, time, counter, callback) {
	  console.log("sendMessage method");
	    var userMessage = new message({ 
	    	cID: cID,
			fID: fID,
			tID: tID,
			username: username,
			message: user_message,
			time: time,
			counter: counter
	  	});
	    console.log(userMessage);
	    userMessage.save(callback);

	  console.log("sendMessages "+tID+" "+fID+" "+username+" "+user_message+" "+time);
	  	message.find( function(err,doc) {

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
	  message.aggregate(
			    { $group: { _id: { fID: "$fID", username: "$username" } } },
			    function(err, doc) {
			        console.log(doc);
			        callback(doc);
			    }
			); 
  }; 
  
  var findNextMessage = function(cID, counter, callback) {
	  var nextCount = counter + 1;
	  message.findOne( { cID: cID, counter: nextCount },
			    function(err, doc) {
			        console.log(doc);
			        callback(doc);
			    }
			); 
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
