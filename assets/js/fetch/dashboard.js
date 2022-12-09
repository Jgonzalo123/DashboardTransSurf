$(document).ready(function () {
    if (!localStorage.token == "") {
        validarSesion();
    }else{
        localStorage.numDocOrEmail = "";
        localStorage.token = "";
        location.href = "./pages/login/login.html";
    }

    firstIndicators();

});

async function firstIndicators() {
    await fetch('http://localhost:8080/api/indicador/first', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.token
        }
    }).then(res => res.json())
    .then(resp => {
        document.querySelector("#indEmpleados").innerText = resp.numEmpleados;
        document.querySelector("#indProgramaciones").innerText = resp.numProgramaciones;
        document.querySelector("#indIngreso").innerText = "S/"+(resp.ingresoMes).toFixed(2);
        document.querySelector("#indCiudades").innerText = resp.ciudades;
    });
}

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
        const pass = (content.roles[0].idRol == 1)? true : (content.roles[1].idRol == 1)? true : false;
        if(!pass){
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

document.querySelector('.modal-footer .btn-danger').addEventListener('click', () => {
    localStorage.clear();
    location.href = "./pages/login/login.html";
});