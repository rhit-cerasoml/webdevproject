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

    entityRequest(socket, request, sender){
        this.entitySet.request(socket, request, sender);
    }

    distribute(packet){
        this.sockets.forEach((s) => {
            s.queueRequest(packet);
        });
    }

    removeEntity(id){
        this.entitySet.remove(id);
    }

    queueEntityUpdates(){
        for(const o in this.entitySet.updateQueue){
            this.distribute(this.entitySet.updateQueue[o]);
            delete this.entitySet.updateQueue[o];
        }
    }
}

module.exports = {
    get: getWorld,
    make: makeWorld
}