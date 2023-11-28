module.exports = function (server) {
  const io = require('socket.io')(server);
  io.on('connect', (socket) => {
    console.log('a user connected');
  });

  return io;
};
