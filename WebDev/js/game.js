class Atlas {
    constructor(src, tSize, width){
        this.src = src;
        this.tSize = tSize;
        this.width = width;
    }

    drawTexture(id, x, y, scale){
        scale = scale ? scale : 1;
        const currentX = (id * this.tSize) % this.width;
        bufCtx.drawImage(this.src, currentX, (id * this.tSize - currentX), this.tSize, this.tSize, x, y, this.tSize * scale, this.tSize * scale);
    }
}

class Map {
    constructor(tileMap, tiles){
        this.tileMap = tileMap;
        this.tiles = tiles;
    }

    drawMap(x, y, zoom){
        if(zoom === 0){
            zoom = 1;
        }
        const tSize = this.tileMap.tSize * zoom;
        const tx = x/tSize;
        const ty = y/tSize;
        for(let xi = 0; xi < Math.floor(1920 / tSize) + 1; xi++){
            for(let yi = 0; yi < Math.floor(1920 / tSize) + 1; yi++){
                if(inBounds(this.tiles, xi + Math.floor(tx)) && inBounds(this.tiles[0], yi + Math.floor(ty))){
                    this.tileMap.drawTexture(this.tiles[xi + Math.floor(tx)][yi + Math.floor(ty)], xi * tSize - (x % tSize), yi * tSize - tSize - (y % tSize), zoom);
                }
            }
        }
    }
}

class Entity {
    constructor(data){
        this.id = data.id;
        this.pos = data.pos;
        this.frame = 0;
        this.atlas = atlases[data.atlasId];
    }

    drawEntity(xOffset, yOffset){
        this.atlas.drawTexture(this.frame, this.pos.x - xOffset, this.pos.y - yOffset)
    }
}

// Game View Canvas
const canvas = document.getElementById('gameview');
const ctx = canvas.getContext('2d');

// Configuration
// const FRAME_RATE = 10;
//const X_RES = document.getElementById('gameContainer').offsetWidth;
//const Y_RES = document.getElementById('gameContainer').offsetHeight;
const X_RES = 1920;
const Y_RES = 1080;


//textures
const overlay = document.getElementById('overlay');
const tileAtlasSrc = document.getElementById('atlas');

// Buffer
const bufCnv = document.createElement('canvas');
bufCnv.width = X_RES;
bufCnv.height = Y_RES;
canvas.width = X_RES;
canvas.height = Y_RES;
const bufCtx = bufCnv.getContext('2d');

let vx = 50.0;
let vy = 50.0;

const tileAtlas = new Atlas(tileAtlasSrc, 64, 256);

let entities = {};
const atlases = [
    tileAtlas
];

const ws = new WebSocket('ws://137.112.136.58:6660');

function assignListener(socket){
    socket.onmessage = (msg) => {
        if(msg){
            //console.log(JSON.parse(msg.data));
            const packet = JSON.parse(msg.data);
            console.log(packet);
            if(packet.R && packet.R.length != 0){
                packet.R.forEach(parseMessage);
            }
        }
    }
}

function parseMessage(packet){
    console.log(packet);
    if(packet.T === 'E'){
        if(packet.A === 'C'){
            entities[packet.D.id] = new Entity(packet.D);
        }else if(packet.A === 'U'){
            console.log(entities);
            entities[packet.D.id].pos = packet.D.pos;
        }else if(packet.A === 'S'){
            console.log(packet.D);
            for(const [k, v] in Object.entries(packet.D)){
                entities[k] = new Entity(packet.D[k]);
            }
        }
    }
}


// Start program
main();

// Initialization
function main(){
    //setInterval(drawLoop, 1000 / FRAME_RATE);
    
    ctx.imageSmoothingEnabled = false;
    bufCtx.imageSmoothingEnabled = false;
    const maparr = [[1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4], [2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1], [3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2], [4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3],
                    [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4], [2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1], [3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2], [4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3],
                    [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4], [2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1], [3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2], [4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3],
                    [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4], [2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1], [3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2], [4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3]];
    map = new Map(tileAtlas, maparr);
    //entities.push(new Entity(tileAtlas, 0, 500, 500));
    console.log("start");
    window.requestAnimationFrame(drawLoop);

    ws.onopen = function() {
        ws.send(JSON.stringify({
            R: [{
                    T: "W",
                    W: 0
                },
                {
                    T: "E",
                    A: "C",
                    D: {pos: {x: 50, y: 50}, atlasId: 0}
                },
                {
                    T: "E",
                    A: "S",
                    D: {}
                },
                {
                    T: "M",
                    A: "S",
                    D: {}
                }
            ]
        }));
    };

    assignListener(ws);


}

// draw loop
function drawLoop() {       
    clearBuffer();

    //console.log("draw");
    // draw
    // tileAtlas.drawTexture(0, 0, 0);
    // tileAtlas.drawTexture(0, 64, 64, 2);
    map.drawMap(vx, vy, 2);

    for(const [key, value] of Object.entries(entities)){
        value.drawEntity(vx, vy);
    };

    //x++;
    //entities[0].y++;
    if(keys.d && !keys.a){
        vx++;
        ws.send(JSON.stringify({R: [{
            T: 'E',
            A: 'U',
            D: {id: 0, pos: {x: vx, y: vy}}
        }]}));
    }
    if(keys.s && !keys.w){
        vy++;
        ws.send(JSON.stringify({R: [{
            T: 'E',
            A: 'U',
            D: {id: 0, pos: {x: vx, y: vy}}
        }]}));
    }
    if(keys.a && !keys.d){
        vx--;
        ws.send(JSON.stringify({R: [{
            T: 'E',
            A: 'U',
            D: {id: 0, pos: {x: vx, y: vy}}
        }]}));
    }
    if(keys.w && !keys.s){
        vy--;
        ws.send(JSON.stringify({R: [{
            T: 'E',
            A: 'U',
            D: {id: 0, pos: {x: vx, y: vy}}
        }]}));
    }

    swapBuffer();
    window.requestAnimationFrame(drawLoop);
}

// Clear the draw buffer 
function clearBuffer() {
    bufCtx.fillStyle = 'grey';
    bufCtx.fillRect(0, 0, X_RES, Y_RES);
}

function swapBuffer() {
    ctx.drawImage(bufCnv, 0, 0);
}

function inBounds(arr, val){
    return val >= 0 && val < arr.length;
}

const keys = {
    w: false,
    a: false,
    s: false,
    d: false};

window.addEventListener('keydown', keyDown, true);
function keyDown(e) {
    console.log("down: " + e.key);
    if(keys[e.key] != null){
        keys[e.key] = true;
    }
}

window.addEventListener('keyup', keyUp, true);
function keyUp(e) {
    console.log("up: " + e.key);
    if(keys[e.key] != null){
        keys[e.key] = false;
    }
}


