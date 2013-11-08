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

	  	message.find( function(err,doc) {

	  	  console.log("findMessages "+doc);	  	
	      callback(doc);
	    });	

  };
	  
  return {
	message: message,
	findMessages: findMessages
  }
}
