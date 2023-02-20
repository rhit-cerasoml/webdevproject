const util = require('./util');

class EntitySet {
    constructor(parent){
        this.parent = parent;
        this.Entities = {};
        this.updateQueue = {};
        this.IDGen = 0;
        //this.Entities.push(new Entity(this.requestID(), new util.vec2(100, 100), {}));
        //this.Entities.push(new Entity(this.requestID(), new util.vec2(100, 100), {}));
    }
    requestID(){
        this.IDGen++;
        return this.IDGen - 1;
    }
    request(socket, request, sender){
        if(request.A === 'S'){
            console.log("syncing entities");
            socket.send(JSON.stringify({R: [{
                T: 'E',
                A: 'S',
                D: this.Entities
            }]}));
        }else if(request.A === 'U'){
            this.Entities[request.D.id].pos = request.D.pos;
            this.updateQueue[request.D.id] = request;
        }else if(request.A === 'C'){
            const newID = this.requestID();
            this.Entities[newID] = request.D;
            request.D['id'] = newID;
            sender.ownedEntities.push(newID);
            this.parent.distribute(request);
        }
    }

    remove(id){
        delete this.Entities[id];
        this.parent.distribute({
            T: 'E',
            A: 'D',
            D: {id: id}
        });
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