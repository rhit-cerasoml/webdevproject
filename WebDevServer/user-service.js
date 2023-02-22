const fs = require('fs');

let loginTable = {};
fs.readFile('./data/logins.json', (err, buf) => {
    if(err){
        console.log(err);
    } else {
        loginTable = JSON.parse(buf.toString());
    }
});

function saveNewLogin(){
    fs.writeFile('./data/logins.json', JSON.stringify(loginTable), (err, buf) => {
        if(err){
            console.log(err);
        }
    });
}

function login(creds){
    console.log(creds);
    const entry = loginTable[creds.user];
    if(entry){
        if(entry === creds.pass){
            return creds.user;
        }else{
            return false;
        }
    }else{
        loginTable[creds.user] = creds.pass;
        saveNewLogin();
        return creds.user;
    }
}

module.exports = {
    login: login
}