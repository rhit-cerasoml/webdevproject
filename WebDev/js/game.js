class Atlas {
    constructor(src, tSize, width){
        this.src = src;
        this.tSize = tSize;
        this.width = width;
    }

    drawTexture(id, x, y, scale){
        scale = scale ? scale : 1;
        const currentX = (id * this.tSize) % this.width;
        bufCtx.drawImage(this.src, currentX, (id * this.tSize - currentX) / (this.width / this.tSize), this.tSize, this.tSize, x, y, this.tSize * scale, this.tSize * scale);
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
                if(inBounds(this.tiles[0], xi + Math.floor(tx)) && inBounds(this.tiles, yi + Math.floor(ty))){
                    this.tileMap.drawTexture(this.tiles[yi + Math.floor(ty)][xi + Math.floor(tx)], xi * tSize - ((x % tSize + tSize) % tSize), yi * tSize - ((y % tSize + tSize) % tSize), zoom);
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
        this.scale = data.scale ? data.scale : 1;
        this.animationState = data.state;
        this.atlas = atlases[data.atlasId];
    }

    drawEntity(xOffset, yOffset){
        this.atlas.drawTexture(this.frame, this.pos.x - xOffset, this.pos.y - yOffset, this.scale);
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

let vx = 0.0;
let vy = 0.0;

const tileAtlas = new Atlas(tileAtlasSrc, 64, 256);
let character = null;

let entities = {};
const atlases = [
    tileAtlas,
    new Atlas(document.querySelector("#stormhead"), 120, 1200)
];


function assignListener(socket){
    socket.onmessage = (msg) => {
        if(msg){
            //console.log(JSON.parse(msg.data));
            const packet = JSON.parse(msg.data);
            if(packet.R && packet.R.length != 0){
                packet.R.forEach(parseMessage);
            }
        }
    }
}

function parseMessage(packet){
    //console.log(packet);
    if(packet.T === 'I') {
        
    } if(packet.T === 'E'){
        if(packet.A === 'C'){
            entities[packet.D.id] = new Entity(packet.D);
            if(!character && packet.D.character){
                character = entities[packet.D.id];
            }
        }else if(packet.A === 'U'){
            if(!(packet.D.id === character.id) || packet.D.force){
                entities[packet.D.id].pos = packet.D.pos;
            }
        }else if(packet.A === 'S'){
            entities = {};
            for(const o in packet.D){
                entities[o] = new Entity(packet.D[o]);
            }
        }else if(packet.A === 'D'){
            delete entities[packet.D.id];
        }
    }
}


// Start program

// Initialization
function initGame(){
    ctx.imageSmoothingEnabled = false;
    bufCtx.imageSmoothingEnabled = false;
    /*const maparr = [[5, 5, 5, 5, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4], [5, 9, 9, 5, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1], [6, 16, 16, 4, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2], [6, 17, 17, 4, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3],
                    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], [2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1], [3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2], [4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3],
                    [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4], [2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1], [3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2], [4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3],
                    [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4], [2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1], [3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2], [4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3]];
    */
   const maparr = [[0, 1, 2, 3],
                    [4, 5, 6, 7],
                    [8, 9, 10, 11],
                    [12, 13, 14, 15],
                    [16, 17, 18, 19]];
    map = new Map(tileAtlas, maparr);
    ws.send(JSON.stringify({
        R: [{
                T: "W",
                W: 0
            },
            {
                T: "E",
                A: "C",
                D: {pos: {x: vx, y: vy}, atlasId: 1, character: true, scale: 4.0, state: 0}
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
            },
            {
                T: "I",
                A: "S",
                D: {}
            },
        ]
    }));
    initInventory();
    assignListener(ws);
    window.requestAnimationFrame(drawLoop);
    window.addEventListener('keydown', keyDown, true);
    window.addEventListener('keyup', keyUp, true);
}


function keyDown(e) {
    if(keys[e.key] != null){
        keys[e.key] = true;
    }
}


function keyUp(e) {
    if(keys[e.key] != null){
        keys[e.key] = false;
        if(e.key === 'w' || e.key === 'a' || e.key === 's' || e.key === 'd'){
            ws.send(JSON.stringify({R: [{
                T: 'E',
                A: 'U',
                D: {id: character.id, pos: character.pos, force: true}
            }]}));
        }
    }
}

// draw loop
function drawLoop() {       
    clearBuffer();

    //console.log("draw");
    // draw
    // tileAtlas.drawTexture(0, 0, 0);
    // tileAtlas.drawTexture(0, 64, 64, 2);
    if(character){
        vx = character.pos.x - X_RES / 2;
        vy = character.pos.y - Y_RES / 2;
        map.drawMap(vx, vy, 2);
    }

    for(const [key, value] of Object.entries(entities)){
        value.drawEntity(vx, vy);
    };

    //x++;
    //entities[0].y++;
    if(keys.d && !keys.a){
        character.pos.x+=5;
        ws.send(JSON.stringify({R: [{
            T: 'E',
            A: 'U',
            D: {id: character.id, pos: character.pos}
        }]}));
    }
    if(keys.s && !keys.w){
        character.pos.y+=5;
        ws.send(JSON.stringify({R: [{
            T: 'E',
            A: 'U',
            D: {id: character.id, pos: character.pos}
        }]}));
    }
    if(keys.a && !keys.d){
        character.pos.x-=5;
        ws.send(JSON.stringify({R: [{
            T: 'E',
            A: 'U',
            D: {id: character.id, pos: character.pos}
        }]}));
    }
    if(keys.w && !keys.s){
        character.pos.y-=5;
        ws.send(JSON.stringify({R: [{
            T: 'E',
            A: 'U',
            D: {id: character.id, pos: character.pos}
        }]}));
    }

    swapBuffer();
    window.requestAnimationFrame(drawLoop);
}

// Clear the draw buffer 
function clearBuffer() {
    bufCtx.fillStyle = '#191714';
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




