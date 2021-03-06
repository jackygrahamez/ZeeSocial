var crypto = require('crypto');

module.exports = function(mongoose) {
	
  var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;
	
  var userSchema = new mongoose.Schema({
      email:     { type: String, unique: true },
      password:  { type: String },
      username:  { type: String},
      name: {
        first:   { type: String },
        last:    { type: String }
      },
      photoUrl:  { type: String },
      check_in: {
    	  cID: ObjectId,
    	  location: { type: String },
    	  geolocation: { type: String },
    	  line_length: { type: Number },
    	  check_in_time: { type: Date, expires: '24h' },
    	  check_in_expire_time: { type: Date, expires: '24h' }
      }
      
  });

  var account = mongoose.model('Account', userSchema);

  var login = function(email, password, callback) {
    var shaSum = crypto.createHash('sha256');
    shaSum.update(password);

    account.findOne({email:email,password:shaSum.digest('hex')},function(err,doc){
      console.log('doc ', doc);
      callback(doc);
    });

  };

 var register = function(email, password, firstName, lastName, callback) {
    var shaSum = crypto.createHash('sha256');
    shaSum.update(password);

    console.log('Registering ' + email);

    var user = new account({
      email: email,
      name: {
        first: firstName,
        last: lastName
      },
      username: firstName.toLowerCase() + '.' + lastName.toLowerCase(),
      password: shaSum.digest('hex'),
      check_in: ""
    });

    user.save(callback);
    console.log('Save command was sent');
  };
  
  var checkInMethod = function(location, geolocation, line_length, accountId, callback) {
	  	var d1 = new Date(),
	  	  	d2 = new Date(d1);	
	  	var line_length = line_length * 60 * 1000;
	  	var expireTimeStamp = parseInt(d1.getTime()) + parseInt(line_length); 
	  	d2.setTime( expireTimeStamp );

	  	console.log('model checkInMethod ' + d1 + ' ' + location + ", " + geolocation + ", " + line_length);
	    var checkIn = new Object();
	    checkIn.cID = crypto.createHash('md5').update(Math.random().toString()).digest('hex').substring(0, 24);
	    checkIn.location = location;
	    checkIn.geolocation = geolocation;
	    checkIn.line_length = line_length;
	    checkIn.check_in_time = d1;
	    checkIn.check_in_expire_time = d2;
	    
	    console.log(checkIn);
	    
	    account.update(
	    {"_id" : accountId},
	    {"$set": { check_in : checkIn }},
	        function(error, account){
	           if( error ) callback(error);
	           else callback(null, account);}
	    );
	    
	    //callback();
	  };
	  
  var findAll = function(callback) {

	    account.find( function(err,doc) {
	      callback(doc);
	    });

	  };	  
	  
  var findCurrent = function(id, callback) {
	  var now = new Date();
	  	console.log("id length "+id);
	  	if (id) {
		    account.find({'check_in.check_in_expire_time': {"$gt": now}, '_id': {'$ne': id}}, function(err,doc) {
		    		
			      callback(doc);
			    });	  		
	  	} else {
		    account.find({'check_in.check_in_expire_time': {"$gt": now}}, function(err,doc) {
			      callback(doc);
			    });		  		
	  	}


	  };	  
	  
// db.accounts.find({'check_in.check_in_expire_time': {"$lt": now}});	  
	  
  var findById = function(id, callback) {

  account.findOne({_id:id}, function(err,doc) {
      callback(doc);
  });

  };

  var findBycId = function(cID, callback) {

	  account.findOne({_id:cID}, function(err,doc) {
	      callback(doc);
	  });

	  };  
  
  var findUsernameById = function(id, callback) {

	  account.findOne({_id:id}, {_id: 0, username: 1}, function(err,doc) {
	      callback(doc);
	  });

	  };
  
  var findFirstnameById = function(id, callback) {

	  account.findOne({_id:id}, {_id: 0, name: 1}, function(err,doc) {
	      callback(doc);
	  });

	  };	  

  var findByUsername = function(id, callback) {

    account.findOne({username: id.username}, function(err,doc) {
      callback(doc);
    });

  	};
  
  var post_message = function(cID, accountId, message, username, callback) {
	    console.log("post_message");
	  	console.log("the cID " + accountId);
	  	console.log("the accountID " + accountId);
	  	console.log("username "+username);
	  	var d1 = new Date();
	    userMessage = new Object();
	    userMessage.cID = cID;
	    userMessage.oID = accountId;
	    userMessage.message = message;
	    userMessage.username = username;
	    userMessage.time = d1;
	    
	    console.log('Posting message: ' + message);

	    account.update(
	    	    {"_id" : cID},
	    	    {"$push": { 'check_in.check_in_message.message_thread' : userMessage }},
	    	        function(error, account){
	    	           if( error ) callback(error);
	    	           else callback(null, account);
	    	    });	    

  };
  
  var ajaxTest = function(field1, field2, accountId, callback) {
	    console.log("field1 " +  field1);
	  	console.log("field2 " + field2);
	  	console.log("the accountID " + accountId);

	    account.update(
	    	    {"_id" : accountId},
	    	    {"$set": { 'field1' : field1, 'field2': field2 }},
	    	        function(error, account){
	    	           if( error ) callback(error);
	    	           else callback(null, account);
	    	    });	    

};
  

  return {
    login: login,
    register: register,
    findById: findById,
    findBycId: findBycId,
    findByUsername: findByUsername,
    account: account,
    checkInMethod: checkInMethod,
    findAll: findAll,
    findCurrent: findCurrent,
    post_message: post_message,
    findUsernameById: findUsernameById,
    findFirstnameById: findFirstnameById,
    ajaxTest: ajaxTest
  }
}
