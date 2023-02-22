var ws = new WebSocket('ws://137.112.215.165:6660');

var loginModal = new bootstrap.Modal(document.getElementById('loginDropModal'), {
    keyboard: false,
    backdrop: 'static',
    focus: true
});

loginModal.show();

document.getElementById('loginButton').onclick = () => {
    const username = document.getElementById('loginInputUsername').value;
    const password = document.getElementById('loginInputPassword').value;
    if(username.length < 3){
        alert("username is too short!");
        return;
    }
    if(password.length < 5){
        alert("password is too short!");
        return;
    }
    ws.send(JSON.stringify({user: username, pass: password}));
    const loginListener = (res) => {
        const result = JSON.parse(res.data);
        console.log(result);
        if(result.success){
            console.log("Logged in as " + result.user);
            loginModal.hide();
            ws.removeEventListener('message', loginListener);
            initGame();
        }else{
            alert("invalid login");
        }
    };
    ws.addEventListener('message', loginListener);
};

