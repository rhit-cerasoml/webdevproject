const world = require('./world');
const login = require('./user-service');

const socketListeners = [];
class SocketListener{
    constructor(socket){
        this.socket = socket;
        this.queue = [];
        this.ownedEntities = [];
        this.loginListener = this.awaitLogin.bind(this);
        socket.on('message', this.loginListener);
        socket.on('close', () => {
            this.socketListeners = socketListeners.filter(s => s != this);
            this.ownedEntities.forEach((e) => {
                this.world.removeEntity(e);
            });
        })
        this.world;
    }

    awaitLogin(msg){
        const req = JSON.parse(msg);
        const user = login.login(req);
        if(user) {
            this.user = user;
            this.socket.removeEventListener('message', this.loginListener);
            delete this.loginListener;
            this.socket.on('message', (msg) => {
                const reqs = JSON.parse(msg);
                this.parseRequests(reqs);
            });
            this.socket.removeEventListener('message', this.loginListener);
            delete this.loginListener;
            this.socket.send(JSON.stringify({
                user: this.user,
                success: true
            }));
        }else{
            this.socket.send(JSON.stringify({
                success: false
            }));
        }
    }

    parseRequests(reqs) {
        if(reqs.R){
            reqs.R.forEach(req => {
                this.parseRequest(req);
            });
        }
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