var crypto = require('crypto');

module.exports = function(mongoose) {

  var userSchema = new mongoose.Schema({
      email:     { type: String, unique: true },
      password:  { type: String },
      username:  { type: String},
      name: {
        first:   { type: String },
        last:    { type: String }
      },
      birthday: {
        day:     { type: Number, min: 1, max: 31, required: false },
        month:   { type: Number, min: 1, max: 12, required: false },
        year:    { type: Number }
      },
      photoUrl:  { type: String },
      biography: { type: String }
  });

  var Account = mongoose.model('Account', userSchema);

  var registerCallback = function(err) {
    if (err) {
      return console.log(err);
    };
    return console.log('Account was created');
  };

  var login = function(email, password, callback) {
    var shaSum = crypto.createHash('sha256');
    shaSum.update(password);

    Account.findOne({email:email,password:shaSum.digest('hex')},function(err,doc){
      console.log('doc ', doc)
      callback(doc);
    });

  };

 var register = function(email, password, firstName, lastName) {
    var shaSum = crypto.createHash('sha256');
    shaSum.update(password);

    console.log('Registering ' + email);

    var user = new Account({
      email: email,
      name: {
        first: firstName,
        last: lastName
      },
      username: firstName.toLowerCase() + '.' + lastName.toLowerCase(),
      password: shaSum.digest('hex')
    });
    user.save(registerCallback);
    console.log('Save command was sent');
  };

  var findById = function(id, callback) {

    Account.findOne({_id:id}, function(err,doc) {
      callback(doc);
    });

  };

  var findByUsername = function(id, callback) {

    Account.findOne({username: id.username}, function(err,doc) {
      callback(doc);
    });

  };

  return {
    login: login,
    register: register,
    findById: findById,
    findByUsername: findByUsername,
    Account: Account
  }
}
