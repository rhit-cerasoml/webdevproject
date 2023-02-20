const world = require('./world');

const socketListeners = [];
class SocketListener{
    constructor(socket){
        this.socket = socket;
        this.queue = [];
        this.ownedEntities = [];
        socket.on('message', (msg) => {
            const reqs = JSON.parse(msg);
            this.parseRequests(reqs, msg.origin);
        });
        socket.on('close', () => {
            socket = socketListeners.filter(s => s == this);
            this.ownedEntities.forEach((e) => {
                this.world.removeEntity(e);
            });
        })
        this.world;
    }

    parseRequests(reqs) {
        reqs.R.forEach(req => {
            this.parseRequest(req);
        });
    }
    
    parseRequest(req){
        console.log(req);
        if(req.T === 'W'){
            world.get(req.W).track(this);
            this.world = world.get(req.W);
        }
        if(req.T === 'E'){
            this.world.entityRequest(this.socket, req, this);
        }
    }

    queueRequest(request){
        this.queue.push(request);
    }

    packetResponses(){
        if(this.world){
            this.world.queueEntityUpdates();
        }
        if(this.queue.length != 0){
            this.socket.send(JSON.stringify({
                R: this.queue
            }));
            this.queue = [];
        }
    }
}

function updateTick(){
    socketListeners.forEach((sl) => {
        sl.packetResponses();
    });
}

module.exports = {
    SocketListener: SocketListener,
    socketListeners: socketListeners,
    updateTick: updateTick
};