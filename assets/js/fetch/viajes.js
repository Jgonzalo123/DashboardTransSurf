$(document).ready(function () {
    if (!localStorage.token == "") {
        validarSesion();
    }else{
        localStorage.numDocOrEmail = "";
        localStorage.token = "";
        location.href = "../login/login.html";
    }

    let estados = ['<span class="badge bg-info text-dark">Disponible</span>',
                    '<span class="badge bg-success text-white">En Curso</span>',
                    '<span class="badge bg-warning text-dark">Finalizado</span>'];

    var table;

    function cargarRegistros() {
        table = $('#tableViajes').DataTable({
            "dom": 'Bfrtip',
            buttons: [
                'excel', 'pdf', 'print'
            ],
            "ajax": {
                "url": "http://localhost:8080/api/programacion",
                "method": "GET",
                "headers": {
                    "Authorization": 'Bearer ' + localStorage.token
                },
                "dataSrc": ""
            },
            "columns": [
                {"data": "fecha", className: "align-middle"},
                {"data": "hora", className: "align-middle", "render": function(data) {
                    return data.substring(0,5);
                }},
                {"data": "unidad.placa", className: "align-middle"},
                {"data": "origen.ciudad.nombre", className: "align-middle"},
                {"data": "destino.ciudad.nombre", className: "align-middle"},
                {"data": "estado", className: "align-middle", "render": function (data) {
                    switch(data){
                        case 'Activo':
                            return estados[0];
                        case 'En Curso':
                            return estados[1];
                        case 'Finalizado':
                            return estados[2];
                    }
                }},
                {"data": {"idProgramacion": "idProgramacion", "estado": "estado"}, className: "align-middle", "render": function (data) {
                    return `
                    ${(data.estado == "Finalizado")? "": 
                    `<button class="btn btn-outline-success text-xs btn-edit" prog-data="`+data.idProgramacion+`">
                        <i class="fa-light fa-spinner fa-spin-pulse"></i>
                    </button>`}
                    <button class="btn btn-outline-dark text-xs btn-reg" prog-data="`+data.idProgramacion+`">
                        <i class="fa-regular fa-file"></i>
                    </button>    
                    `;
                }}
            ]
        });
    }

    $(document).on('click', '.btn-edit', function() {
        let idProgramacion = $(this)[0].getAttribute("prog-data");
        const modal = `
        <div class="modal fade" id="modalEstado" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5" id="exampleModalLabel">Actualizar Estado</h1>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ¿Seguro de actualizar el estado del viaje?
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-success" id="btnState">Actualizar</button>
                    </div>
                </div>
            </div>
        </div>
        `;

        document.getElementById("div-edit").innerHTML = modal;
        const stateModal = new bootstrap.Modal(document.getElementById('modalEstado'), {keyboard: false});
        stateModal.show();

        document.getElementById("btnState").addEventListener("click", async() => {
            await actualizarProgramacion(idProgramacion);
            stateModal.hide();
        });
    });

    $(document).on('click', '.btn-reg', async function() {
        let idProgramacion = $(this)[0].getAttribute("prog-data");
        const modal = `
        <div class="modal fade" id="modalRegistro" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-xl modal-fullscreen-md-down">
                <div class="modal-content">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5" id="exampleModalLabel">Registro de Pasajeros</h1>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="table-responsive">
                            <table class="table" id="tableReg">
                                <thead class="table-dark">
                                    <tr>
                                        <th>Asiento</th>
                                        <th>N° Documento</th>
                                        <th>Apellidos</th>
                                        <th>Nombres</th>
                                        <th>Correo</th>
                                        <th>N° Celular</th>
                                        <th>Registro</th>
                                    </tr>
                                </thead>
                                <tbody id="regViaje">
                                    <tr>
                                        <th>1</th>
                                        <td>12345678</td>
                                        <td>Apellido</td>
                                        <td>Nombre</td>
                                        <td>Correo@correo.com</td>
                                        <td>
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" role="switch">
                                            <label class="form-check-label">Abordo</label>
                                        </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Cerrar</button>
                        <button type="button" class="btn btn-success" id="btnReg">Generar</button>
                    </div>
                </div>
            </div>
        </div>
        `;

        document.getElementById("div-edit").innerHTML = modal;
        const stateModal = new bootstrap.Modal(document.getElementById('modalRegistro'), {keyboard: false});
        document.querySelector("#regViaje").innerHTML = await rellenarRegistro(idProgramacion);
        stateModal.show();

        document.querySelector("#btnReg").addEventListener('click', () => {
            const table2excel = new Table2Excel();
            table2excel.export(document.querySelector("#tableReg"));
        });
    });

    async function rellenarRegistro(idProgramacion) {
        let contenido = "";
        await fetch('http://localhost:8080/api/reserva/getList/'+idProgramacion, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.token
            }
        }).then(res => res.json())
        .then(resp => {
            resp.forEach(item => {
                const asientoProg = item.asientoProgramacion;
                const usuario = item.usuario;
                contenido += `
                <tr>
                    <th>${asientoProg.asiento.numAsiento}</th>
                    <td>${usuario.numDoc}</td>
                    <td>${usuario.apellido}</td>
                    <td>${usuario.nombre}</td>
                    <td>${usuario.email}</td>
                    <td>${usuario.celular}</td>
                    <td>
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" role="switch">
                        <label class="form-check-label">Abordo</label>
                    </div>
                    </td>
                </tr>
                `;
            });
        });

        return contenido;
    }

    async function actualizarProgramacion(idProgramacion) {
        await fetch('http://localhost:8080/api/programacion/state/'+idProgramacion, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.token
            }
        }).then(res => (res.status == 200)? table.ajax.reload(null, false): alertify.error('Fallo actualización'));
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

});