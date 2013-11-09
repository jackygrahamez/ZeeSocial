var mongoose = require('mongoose'),
    message  = require('../models/message')(mongoose),
	account  = require('../models/account')(mongoose);

mongoose.connect('mongodb://localhost/ZeeSocial');

var db = mongoose.connection;

exports.index = function(req, res){
  res.render('index', 
		{ title: 'ZeeSocial',
		  pagename: 'home' });
};

exports.register = function(req, res) {
    var firstName = req.param('firstName', ''),
        lastName  = req.param('lastName', ''),
        email     = req.param('email', null),
        password  = req.param('password', null);

    if ( null == email || email.length < 1 || null == password || password.length < 1 ) {
      res.send(400);
      return;
    }

    account.register(email, password, firstName, lastName, function(err) {

      if (err) {
        return console.log(err);
      }

      console.log('Account was created');
      res.redirect('/');

    });
}

exports.login = function(req, res){
    var email    = req.body.email,
        password = req.body.password;

  if ( !email || !password ) {
    res.send(400);
    return;
  }

  account.login(email, password, function(doc) {

    if ( !doc ) {
      res.send(401);
      return;
    }

    console.log('login was successful');

    req.session.loggedIn  = true;
    req.session.accountId = doc._id;

    res.redirect('/' + doc.username);

  });

};

exports.home = function(req, res) {
  var url = req.params.id;
  
  if ( req.session.loggedIn && url !== 'register') {
	//console.log("home "+req.session.accountId);
  	account.findUsernameById(req.session.accountId, function(username) {	
		
	if (username.username === url) {
	    account.findByUsername({username: url}, function(doc) {
	
	    		var socket = require('./socket');
		        res.render('home', {
		          title: 'ZeeSocial',
		          user: doc,
				  pagename: 'home'
		        });
	    	});
  		}	
	else {
		res.redirect('/' +username.username);
	}
    });


  } else if( !req.session.loggedIn && url === 'register' ) {

      res.render('register', {
		  title: 'register'	,
		  pagename: 'register'});

  }  else {

    res.redirect('/');

  }

}

exports.user_check_in = function(req, res) {
    var location = req.param('location', ''),
    geolocation  = req.param('geolocation', ''),
    line_length     = req.param('line_length', '');
    
  if ( req.session.loggedIn ) {
	console.log("user logged in");
    account.findById(req.session.accountId, function(doc) {

    	if (location == null | location.length == 0) {
            res.render('user_check_in', {
                title: 'ZeeSocial',
                user: doc,
      		  	pagename: 'user_check_in',
          		checkin_status: ''
              });    		
    	}
    	else {
    		 account.checkInMethod(location, geolocation, line_length, req.session.accountId, function(err) {
    			 console.log("callback");
            if (err) {
              return console.log(err);
            }
			message.removeCheckinMessages(doc.check_in.cID, function(remove_messages_doc) {
	            res.render('user_check_in', {
	                title: 'ZeeSocial',
	                user: doc,
	      		  	pagename: 'user_check_in',
	      		  	checkin_status: 'checked in'
	              });
          	});      		                             
          });      		
    	}
    });

  } else {

    res.send(401);

  }
}

exports.user_lines = function(req, res) {

  if ( req.session.loggedIn ) {
	

	    account.findById(req.session.accountId, function(doc) {
		console.log("doc "+doc);
	    if (!doc.check_in) {
	    	cID = "";
	    } else {
	    	cID = doc.check_in.cID;
	    }	    
			account.findCurrent(cID, function(userLines) {
				console.log("user lines "+userLines);
				

	        res.render('user_lines', {
	          title: 'ZeeSocial',
	          user: doc,
			  pagename: 'user_lines',
			  lines: userLines
	        });

	    });		
	});

  } else {

    res.send(401);

  }
}

exports.user_notifications = function(req, res) {

  if ( req.session.loggedIn ) {

    account.findById(req.session.accountId, function(doc) {
    	console.log("doc "+doc);
	    if (!doc.check_in) {
	    	cID = "";
	    } else {
	    	cID = doc.check_in.cID;
	    }	
		message.findMessagesFrom(cID, function(messages_doc) {
			console.log("messages_doc "+messages_doc);
	        res.render('user_notifications', {
	          title: 'ZeeSocial',
	          user: doc,
			  pagename: 'user_notifications',
			  messages_doc: messages_doc,
			  cID: cID
	        });
    	
    	});
    });

  } else {

    res.send(401);

  }
}

exports.user_points = function(req, res) {

	  if ( req.session.loggedIn ) {

	    account.findById(req.session.accountId, function(doc) {

	        res.render('user_points', {
	          title: 'ZeeSocial',
	          user: doc,
			  pagename: 'user_points'
	        });

	    });

	  } else {

	    res.send(401);

	  }
	}

exports.ajax = function(req, res) {
    var field1 = req.param('field1', ''),
    field2  = req.param('field2', '');
    
  if ( req.session.loggedIn ) {
	console.log("user logged in");
    account.findById(req.session.accountId, function(doc) {

    	if (field1 == null | field1 == 0) {
            res.render('ajax', {
                title: 'ZeeSocial',
                user: doc,
      		  	pagename: 'ajax'
              });    		
    	}
    	else {
    		 account.ajaxTest(field1, field2, req.session.accountId, function(err) {
    			 console.log("callback");
            if (err) {
              return console.log(err);
            }
            res.send("<p>test block</p>");
            /*
            res.render('ajax', {
                title: 'ZeeSocial',
                user: doc,
      		  	pagename: 'ajax'
              });
            */
            
          });      		
    	}
    });

  } else {

    res.send(401);

  }
}


exports.user_profile = function(req, res) {

  if ( req.session.loggedIn ) {

    account.findById(req.session.accountId, function(doc) {

        res.render('user_profile', {
          title: 'ZeeSocial',
          user: doc,
		  pagename: 'user_profile'
        });

    });

  } else {

    res.send(401);

  }
}

exports.user_message = function(req, res) {

    var user_message = req.param('message', ''),
	
    	tID = req.param('tID', ''),
    	fID = req.param('fID', req.session.accountId);
		cID = req.param('cID', tID),   
		counter = req.param('counter', 0); 
		console.log("counter " + counter); 	
	    var time = new Date();
	
    if ((cID.length > 1) && (fID.length > 1) && (tID.length > 1) && user_message.length > 0 ) {
    	account.findById(req.session.accountId, function(doc) {
    		counter = parseInt(counter) + 1;
    		message.sendMessages(cID, tID, fID, doc.name.first, user_message, time, counter, function(message_doc) {
				var ajaxMessage ="<li index='"+counter+"'>" + doc.name.first + ": " + user_message + 
				"<label>Time: </label>" +
				"<input id='time_'"+counter+" type='text' name='time' value='"+time+"' />" +
				"<label>counter: </label>" +
				"<input id='counter_'"+counter+" type='text' name='counter' value='"+counter+"' />" +
				"</li>";
    			res.send(ajaxMessage);
    		});
    	});
        return;
        
    } else if ((cID.length > 1) && (fID.length > 1) && (tID.length > 1) && user_message.length < 1 ) {
	    account.findById(req.session.accountId, function(doc) {

	    	message.findMessages(tID, fID, function(message_doc) {
    			if (message_doc[0] && message_doc[0].thread) {  			
		    	res.render('user_message', {
		          title: 'ZeeSocial',
		          user: doc,
		          message_doc: message_doc,
		          cID: cID,
		          tID: tID,
		          fID: fID,
				  pagename: 'user_message'
		        });
    			} else {
		    	  res.render('user_message', {
		          title: 'ZeeSocial',
		          user: doc,
		          message_doc: "",
		          cID: cID,
		          tID: tID,
		          fID: fID,
				  pagename: 'user_message'
		        });
    			}
	    	 });
	    });
    	return;  	
    }
    else {
    	
        res.send(401);
    	return;
    }

}


exports.inbox = function(req, res) {

  if ( req.session.loggedIn ) {

    account.findById(req.session.accountId, function(doc) {

        res.render('inbox', {
          title: 'ZeeSocial',
          user: doc
        });

    });

  } else {

    res.send(401);

  }
}
