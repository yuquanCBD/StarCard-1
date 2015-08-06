var io = require('socket.io')();

var cnt = 0;

io.on('connection', function (_socket) {
    console.log(_socket.id + ': connection');
    cnt ++;
    _socket.emit('login', {cnt : cnt, userid : '1234567'});
    _socket.on('message', function (msg) {
        console.log('Message Received: ', msg);
        _socket.broadcast.emit('message', msg);
    });

    io.socket_id = _socket.id;
});

exports.listen = function (_server) {
    return io.listen(_server);
};

module.exports = io;