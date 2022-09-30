$(document).ready(function () {
    validarSesion();
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
        console.log(content);
    } else {
        location.href = "./pages/login/login.html";
    }
}