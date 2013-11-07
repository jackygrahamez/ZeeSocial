
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    http = require('http'),
    path = require('path');

var app    = express();
var server = http.createServer(app);
global.io  = require('socket.io').listen(server);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/:id', routes.home);
app.get('/:username/inbox/', routes.inbox);

app.get('/:username/user_check_in/', routes.user_check_in);
app.post('/:username/user_check_in/', routes.user_check_in);

app.get('/:username/user_lines/', routes.user_lines);
app.get('/:username/user_points/', routes.user_points);
app.get('/:username/user_profile/', routes.user_profile);

app.get('/:username/user_message/', routes.user_message);
app.post('/:username/user_message/', routes.user_message);

app.get('/:username/user_notifications/', routes.user_notifications);
app.post('/:username/user_notifications/', routes.user_notifications);

app.get('/:username/ajax', routes.ajax);
app.post('/:username/ajax', routes.ajax);

app.post('/login', routes.login);
app.post('/register', routes.register);



server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

