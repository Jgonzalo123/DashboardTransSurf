$(document).ready(function () {
    if (!localStorage.token == "") {
        validarSesion();
    }else{
        localStorage.numDocOrEmail = "";
        localStorage.token = "";
        location.href = "../login/login.html";
    }

    let estados = ['<span class="badge bg-success text-white">Active</span>',
                    '<span class="badge bg-secondary text-white">Inactive</span>'];   

    var table;

    function cargarRegistros() {
        table = $('#tableProgramacion').DataTable({
            "ajax": {
                "url": "http://localhost:8080/api/programacion",
                "method": "GET",
                "headers": {
                    "Authorization": 'Bearer ' + localStorage.token
                },
                "dataSrc": ""
            },
            "columns": [
                {"data": "idProgramacion", className: "align-middle"},
                {"data": "unidad.placa", className: "align-middle"},
                {"data": "origen.ciudad.nombre", className: "align-middle"},
                {"data": "destino.ciudad.nombre", className: "align-middle"},
                {"data": "fecha", className: "align-middle", "render": function(data) {
                    let fecha = new Date(data);
                    const time = fecha.toLocaleString([],{
                        day:"2-digit",
                        month:"2-digit",
                        year:"numeric"
                    });

                    return time;
                }},
                {"data": "fecha", className: "align-middle", "render": function(data) {
                    let fecha = new Date(data);
                    const time = fecha.toLocaleString([],{
                        hour:"2-digit",
                        minute:"2-digit"
                    });
                    return time;
                }},
                {"data": "costo", className: "align-middle", "render": function (data) {
                    return 'S/'+ (Math.round(data * 100) / 100).toFixed(2);
                }},
                {"data": "estado", className: "align-middle", "render": function (data) {
                    switch(data){
                        case 'Activo':
                            return estados[0];
                        case 'Inactivo':
                            return estados[1];
                    }
                }},
                {"data": "idProgramacion", className: "align-middle", "render": function (data) {
                    return `
                    <button class="btn btn-outline-warning text-xs btn-edit" prog-data="`+data+`">
                        <i class="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn-outline-danger text-xs btn-delete" prog-data="`+data+`">
                        <i class="fa-regular fa-trash"></i>
                    </button>    
                    `;
                }}
            ]
        });
    }

    class Programacion {idProgramacion; unidad; origen; destino; fecha; costo; estado}

    document.getElementById("btn-addProgramacion").addEventListener('click', () => {
        guardarProgramacion();
    });

    async function guardarProgramacion() {
        let programacion = new Programacion();
        programacion.fecha = new Date(document.getElementById("inputFecha").value);
        programacion.costo = document.getElementById("inputCosto").value;
        programacion.estado = document.getElementById("selectEstado").value;

        let idUnidad = document.getElementById("selectUnidad").value;
        let idOrigen = document.getElementById("selectOrigen").value;
        let idDestino = document.getElementById("selectDestino").value;
        let idUsuarios = [parseInt(document.getElementById("selectDriver").value), parseInt(document.getElementById("selectOperator").value)];

        const response = await fetch('http://localhost:8080/api/programacion/'+idUnidad+'/'+idOrigen+'/'+idDestino+'/'+idUsuarios, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.token
            },
            body: JSON.stringify(programacion)
        });
        if (response.status == 201) {
            document.getElementById("btn-modalClose").click();
            table.ajax.reload(null, false);
            alertify.success('Agregado');
            limpiarCampos();
        } else {
            // alertify.error('Unidad Existente');
        }
    }

    $(document).on('click', '.btn-edit', async function() {
        let idProgramacion = $(this)[0].getAttribute("prog-data");
        const response1 = await fetch('http://localhost:8080/api/programacion/'+idProgramacion, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.token
            }
        });
        const response2 = await fetch('http://localhost:8080/api/tripulacion/'+idProgramacion, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.token
            }
        });
        let programacion = await response1.json();
        let tripulacion = await response2.json();
        crearEditModal(programacion,tripulacion);
    });

    function crearEditModal(programacion,tripulacion) {
        let modalEdit = "";
        const vfecha = new Date(new Date(programacion.fecha).toString().split('GMT')[0]+' UTC').toISOString().split('.')[0];
        modalEdit += `
        <div class="modal fade" id="modalEditProgramacion" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Editar Programación</h5>
                        <button type="button" class="btn-close" id="btn-modalEditClose" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="inputIdProgramacion" value="`+programacion.idProgramacion+`">
                        <div class="row g-2">
                            <div class="form-floating col-md-6">
                                <select class="form-select" id="selectEditUnidad" aria-label="Unidad">
                                </select>
                                <label for="selectEditUnidad">Unidad</label>
                            </div>
                            <div class="form-floating col-md-6">
                                <input type="datetime-local" class="form-control" id="inputEditFecha" placeholder="Fecha de Salida" value="`+vfecha+`">
                                <label for="inputEditFecha">Fecha de Salida</label>
                            </div>
                            <div class="form-floating col-md-6">
                                <select class="form-select" id="selectEditOrigen" aria-label="Origen">
                                </select>
                                <label for="selectEditOrigen">Origen</label>
                            </div>
                            <div class="form-floating col-md-6">
                                <select class="form-select" id="selectEditDestino" aria-label="Destino" disabled>
                                </select>
                                <label for="selectEditDestino">Destino</label>
                            </div>
                            <div class="form-floating col-md-6">
                                <select class="form-select" id="selectEditDriver" aria-label="Driver">
                                </select>
                                <label for="selectEditDriver">Driver</label>
                            </div>
                            <div class="form-floating col-md-6">
                                <select class="form-select" id="selectEditOperator" aria-label="Operator">
                                </select>
                                <label for="selectEditOperator">Operator</label>
                            </div>
                            <div class="form-floating col-md-6">
                                <input type="number" class="form-control" id="inputEditCosto" placeholder="Costo" min="0" step="0.10" value="`+programacion.costo+`">
                                <label for="inputEditCosto">Costo</label>
                            </div>
                            <div class="form-floating col-md-6">
                                <select class="form-select" id="selectEditEstado" aria-label="Estado">
                                    <option value="Activo" `+((programacion.estado == "Activo")?'selected':'')+`>Activo</option>
                                    <option value="Inactivo" `+((programacion.estado == "Inactivo")?'selected':'')+`>Inactivo</option>
                                </select>
                                <label for="selectEditEstado">Estado</label>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-danger" data-bs-dismiss="modal">Cerrar</button>
                        <button type="button" class="btn btn-outline-success" id="btn-editProgramacion">Editar</button>
                    </div>
                </div>
            </div>
        </div>
        `;
        document.getElementById("div-edit").innerHTML = modalEdit;
        var editModal = new bootstrap.Modal(document.getElementById('modalEditProgramacion'), {keyboard: false});
        editModal.show();

        const selectUnidad = document.getElementById("selectEditUnidad");
        cargarUnidades(selectUnidad, programacion.unidad);
        const selectOrigen = document.getElementById("selectEditOrigen");
        cargarCiudades(selectOrigen, programacion.origen.ciudad);
        const selectDestino = document.getElementById("selectEditDestino");
        cargarCiudades(selectDestino, programacion.destino.ciudad);
        
        const users = tripulacion.map((trip) => trip.usuario);

        const selectDriver = document.getElementById("selectEditDriver");
        cargarDrivers(selectDriver, users[0]);
        const selectOperator = document.getElementById("selectEditOperator");
        cargarOperators(selectOperator, users[1]);

        const fecha = document.getElementById("inputEditFecha");
        fecha.min = new Date().toISOString().slice(0,new Date().toISOString().lastIndexOf(":"));

        document.getElementById("selectEditOrigen").addEventListener("change",async(e) => {
            const idCiudad = e.target.value;
            const select = document.getElementById("selectEditDestino");
            select.disabled = false;
            actualizarDestinos(idCiudad, select);
        })

        document.getElementById("btn-editProgramacion").addEventListener("click", () => {
            editarProgramacion();
        });
    }

    async function editarProgramacion() {
        let programacion = new Programacion();
        programacion.fecha = new Date(document.getElementById("inputEditFecha").value);
        programacion.costo = document.getElementById("inputEditCosto").value;
        programacion.estado = document.getElementById("selectEditEstado").value;

        let idUnidad = document.getElementById("selectEditUnidad").value;
        let idOrigen = document.getElementById("selectEditOrigen").value;
        let idDestino = document.getElementById("selectEditDestino").value;
        let idUsuarios = [parseInt(document.getElementById("selectEditDriver").value), parseInt(document.getElementById("selectEditOperator").value)];
        let idProgramacion = document.getElementById("inputIdProgramacion").value;

        const response = await fetch('http://localhost:8080/api/programacion/'+idProgramacion+'/'+idUnidad+'/'+idOrigen+'/'+idDestino+'/'+idUsuarios, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.token
            },
            body: JSON.stringify(programacion)
        });
        if (response.status == 200) {
            document.getElementById("btn-modalEditClose").click();
            table.ajax.reload(null, false);
            alertify.success('Editado');
        } else {
            //alertify.error('Unidad Existente');
        }
    }

    async function eliminarProgramacion(idProgramacion) {
        const response = await fetch('http://localhost:8080/api/programacion/'+idProgramacion, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.token
            }
        });
        if (response.status == 200) {
            alertify.success('Eliminado');
            table.ajax.reload(null, false);
        } else {
            
        }
    }

    $(document).on('click', '.btn-delete', function() {
        let idProgramacion = $(this)[0].getAttribute("prog-data");
        alertify.confirm("Eliminar Programacion","¿Estas seguro de eliminar la Programacion "+idProgramacion+"?",
        function(){
            eliminarProgramacion(idProgramacion);
        },
        function(){
            alertify.error('Cancelado');
        });
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
                location.href = "../login/login.html";
            }
            cargarRegistros();
        } else {
            localStorage.numDocOrEmail = "";
            localStorage.token = "";
            location.href = "../login/login.html";
        }
    }

    document.querySelector('.modal-footer .btn-danger').addEventListener('click', () => {
        localStorage.clear();
        location.href = "../login/login.html";
    });

    document.getElementById("btnAdd").addEventListener("click", async() => {
        const selectUnidad = document.getElementById("selectUnidad");
        cargarUnidades(selectUnidad);
        const selectOrigen = document.getElementById("selectOrigen");
        cargarCiudades(selectOrigen);
        const selectDriver = document.getElementById("selectDriver");
        cargarDrivers(selectDriver);
        const selectOperator = document.getElementById("selectOperator");
        cargarOperators(selectOperator);
        const fecha = document.getElementById("inputFecha");
        fecha.min = new Date().toISOString().slice(0,new Date().toISOString().lastIndexOf(":"));
    });

    async function cargarUnidades(select, unidad) {
        const response = await fetch('http://localhost:8080/api/unidad', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.token
            }
        });
        if (response.status == 200) {
            let content = await response.json();
            select.innerHTML = "";
            select.innerHTML = `<option disabled ${(unidad == undefined)?'selected':''}>Selecione Unidad</option>`;
            content.forEach((item) => {
                if (item.estado != "Inactivo" && item.estado != "Asignado") {
                    let option = document.createElement("option");
                    option.value = item.idUnidad;
                    option.text = item.placa;
                    if (unidad != undefined && unidad.idUnidad == item.idUnidad) {
                        option.selected = true;
                    }
                    select.add(option);
                } else if (unidad != undefined && unidad.idUnidad == item.idUnidad && unidad.estado == "Asignado") {
                    let option = document.createElement("option");
                    option.value = unidad.idUnidad;
                    option.text = unidad.placa;
                    option.selected = true;
                    select.add(option);
                }
            });
        }
    }

    async function cargarCiudades(select, ciudad) {
        const response = await fetch('http://localhost:8080/api/ciudad', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.token
            }
        });
        if (response.status == 200) {
            let content = await response.json();
            select.innerHTML = "";
            select.innerHTML = `<option disabled ${(ciudad == undefined)?'selected':''}>Selecione Ciudad</option>`;
            content.forEach((item) => {
                if (item.estado != "Inactivo") {
                    let option = document.createElement("option");
                    option.value = item.idCiudad;
                    option.text = item.nombre;
                    if (ciudad != undefined && ciudad.idCiudad == item.idCiudad) {
                        option.selected = true;
                    }
                    select.add(option);
                }
            });
        }
    }

    async function cargarDrivers(select, driver) {
        const response = await fetch('http://localhost:8080/api/usuario/driver', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.token
            }
        });
        if (response.status == 200) {
            let content = await response.json();
            select.innerHTML = `<option disabled ${(driver == undefined)?'selected':''}>Selecione Driver</option>`;
            content.forEach((item) => {
                if (item.estado != "Inactivo" && item.estado != "Bloqueado" && item.estado != "Asignado") {
                    let option = document.createElement("option");
                    option.value = item.idUsuario;
                    option.text = item.numDoc + " - " + item.apellido;
                    if (driver != undefined && driver.idUsuario == item.idUsuario) {
                        option.selected = true;
                    }
                    select.add(option);
                } else if (driver != undefined && driver.idUsuario == item.idUsuario && driver.estado == "Asignado") {
                    let option = document.createElement("option");
                    option.value = item.idUsuario;
                    option.text = item.numDoc + " - " + item.apellido;
                    option.selected = true;
                    select.add(option);
                }
            });
        }
    }

    async function cargarOperators(select, operator) {
        const response = await fetch('http://localhost:8080/api/usuario/operator', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.token
            }
        });
        if (response.status == 200) {
            let content = await response.json();
            select.innerHTML = `<option disabled ${(operator == undefined)?'selected':''}>Selecione Operator</option>`;
            content.forEach((item) => {
                if (item.estado != "Inactivo" && item.estado != "Bloqueado" && item.estado != "Asignado") {
                    let option = document.createElement("option");
                    option.value = item.idUsuario;
                    option.text = item.numDoc + " - " + item.apellido;
                    if (operator != undefined && operator.idUsuario == item.idUsuario) {
                        option.selected = true;
                    }
                    select.add(option);
                } else if (operator != undefined && operator.idUsuario == item.idUsuario && operator.estado == "Asignado") {
                    let option = document.createElement("option");
                    option.value = item.idUsuario;
                    option.text = item.numDoc + " - " + item.apellido;
                    option.selected = true;
                    select.add(option);
                }
            });
        }
    }

    document.getElementById("selectOrigen").addEventListener("change",async(e) => {
        const idCiudad = e.target.value;
        const select = document.getElementById("selectDestino");
        select.disabled = false;
        actualizarDestinos(idCiudad, select);
    })

    async function actualizarDestinos(idCiudad, select) {
        const response = await fetch('http://localhost:8080/api/ciudad', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.token
            }
        });
        if (response.status == 200) {
            let content = await response.json();
            select.innerHTML = "";
            content.forEach((item) => {
                if (item.idCiudad != idCiudad && item.estado != "Inactivo") {
                    let option = document.createElement("option");
                    option.value = item.idCiudad;
                    option.text = item.nombre;
                    select.add(option);
                }
            });
        }
    }

    function limpiarCampos() {
        document.getElementById("inputFecha").value = "";
        document.getElementById("inputCosto").value = "";
        document.getElementById("selectEstado").selectedIndex = 0;
    }
});