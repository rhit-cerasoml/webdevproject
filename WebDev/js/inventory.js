var inventory = [];





// inventoryModal.show();

function initInventory(){
    console.log("making inventory");
    //.style.display = 'flex';
}

const inventoryOverlay = document.querySelector("#inventoryOverlay");
var inventoryOpen = false;
function toggleInventory(){
    inventoryOpen = !inventoryOpen;
    if(inventoryOpen){
        inventoryOverlay.style.display = 'flex';
    }else{
        inventoryOverlay.style.display = 'none';
    }
}