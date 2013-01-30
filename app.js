var _ = require('lodash');

// Default environment variables in process.env
_.defaults(process.env, {
  NODE_ENV: 'development',
  TZ: 'UTC',
  database: 'localhost:27017/domotica',
  port: 3000
});

var session = require('./api/session'),
    system = require('./api/system'),
    user = require('./api/user');

// Create Server
var server = require('socket.io').listen(parseInt(process.env.port));
server.set('log level', 1);
server.sockets.on('connection', function (client) {
  // General
  console.log('client connected');
  client.on('error', function (error) {
    console.error(error);
  });
  client.on('disconnect', function () {
    console.log('client disconnected');
  });

  // Session
  client.on('session.login', call(session.login));
  client.on('session.logout', call(session.logout));

  // System
  client.on('get.systems', call(system.index));
  client.on('get.system', call(system.read));
  client.on('create.system', call(system.create));
  client.on('update.system', call(system.update));
  client.on('delete.system', call(system.delete));

  // Users
  client.on('get.users', call(user.index));
  client.on('get.user', call(user.read));
  client.on('create.user', call(user.create));
  client.on('update.user', call(user.update));

  function call(fn) {
    return function (params, next) {
      if (session.validate(client) === false) {
        client.emit('error', 'SESSION_EXPIRED');
        return next('SESSION_EXPIRED');
      }

      fn(params, client, function (error, data) {
        if (error) client.emit('error', error);
        return next(error, data);
      }, server);
    };
  }
});