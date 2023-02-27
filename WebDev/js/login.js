var ws = new WebSocket('ws://127.0.0.1:6660');

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
        if(result.success){
            console.log("Logged in as " + result.user);
            loginModal.hide();
            setTimeout(() => {
                ws.removeEventListener('message', loginListener);
                initGame();
            }, 500);
        }else{
            alert("invalid login");
        }
    };
    ws.addEventListener('message', loginListener);
};

