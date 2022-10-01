$(document).ready(function () {
    if (!localStorage.token == "") {
        validarSesion();
    }else{
        localStorage.numDocOrEmail = "";
        localStorage.token = "";
        location.href = "./pages/login/login.html";
    }
});

async function validarSesion() {
    const response = await fetch('http://localhost:8080/api/usuario', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
            'Authorization': 'Bearer ' + localStorage.token
        },
        body: localStorage.numDocOrEmail
    });
    if (response.status == 200) {
        let content = await response.json();
        if(content.roles[0].tipo != "ROLE_ADMIN"){
            localStorage.numDocOrEmail = "";
            localStorage.token = "";
            location.href = "./pages/login/login.html";
        }
    } else {
        localStorage.numDocOrEmail = "";
        localStorage.token = "";
        location.href = "./pages/login/login.html";
    }
}