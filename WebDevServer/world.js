const Entity = require('./entity-service');

const worlds = [];
function getWorld(id){
    return worlds[id];
}

function makeWorld(data){
    worlds.push(new World(data));
    return worlds.length;
}

class World{
    constructor(data, connection){
        this.entitySet = new Entity.EntitySet(this);
        this.connection = connection;
        this.sockets = [];
    }

    track(socket){
        this.sockets.push(socket);
    }

    entityRequest(socket, request){
        this.entitySet.request(socket, request);
    }

    distribute(packet){
        this.sockets.forEach((s) => {
            s.queueRequest(packet);
        });
    }
}

module.exports = {
    get: getWorld,
    make: makeWorld
}