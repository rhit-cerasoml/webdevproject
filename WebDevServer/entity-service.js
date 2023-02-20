const util = require('./util');

class EntitySet {
    constructor(parent){
        this.parent = parent;
        this.Entities = {};
        this.IDGen = 0;
        //this.Entities.push(new Entity(this.requestID(), new util.vec2(100, 100), {}));
        //this.Entities.push(new Entity(this.requestID(), new util.vec2(100, 100), {}));
    }
    requestID(){
        this.IDGen++;
        return this.IDGen - 1;
    }
    request(socket, request){
        if(request.A === 'S'){
            console.log("syncing entities");
            socket.send(JSON.stringify({R: [{
                T: 'E',
                A: 'S',
                D: this.Entities
            }]}));
        }else if(request.A === 'U'){
            this.Entities[request.D.id].pos = request.D.pos;
            this.parent.distribute(request);
        }else if(request.A === 'C'){
            const newID = this.requestID();
            this.Entities[newID] = request.D;
            request.D['id'] = newID;
            this.parent.distribute(request);
        }
    }
}


class Entity {
    constructor(id, pos, data){
        this.id = id;
        this.pos = pos;
        this.data = data;
    }
}

module.exports = {
    EntitySet: EntitySet,
    Entity: Entity
}