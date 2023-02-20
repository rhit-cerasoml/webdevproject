const ws = require('ws');
const util = require('./util');
const world = require('./world');
const connectionService = require('./connection-service');

const entities = [];

const server = new ws.Server({
    port:6660
});

server.on('connection', (socket) => {
    const listener = new connectionService.SocketListener(socket);
    connectionService.socketListeners.push(listener);
});

world.make({});

setInterval(connectionService.updateTick, 20);






