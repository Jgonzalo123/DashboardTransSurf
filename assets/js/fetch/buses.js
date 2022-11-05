$(document).ready(function () {
    if (!localStorage.token == "") {
        validarSesion();
    }else{
        localStorage.numDocOrEmail = "";
        localStorage.token = "";
        location.href = "../../login/login.html";
    }

    let estados = ['<span class="badge bg-success text-white">Active</span>',
                '<span class="badge bg-secondary text-white">Inactive</span>',
                '<span class="badge bg-primary text-white">Assigned</span>'];

    var table;
    function cargarRegistros() {
        table = $('#tableUnidad').DataTable({
            "ajax": {
                "url": "http://localhost:8080/api/unidad",
                "method": "GET",
                "headers": {
                    "Authorization": 'Bearer ' + localStorage.token
                },
                "dataSrc": ""
            },
            "columns": [
                {"data": "idUnidad", className: "align-middle"},
                {"data": "placa", className: "align-middle"},
                {"data": "modelo.nombre", className: "align-middle"},
                {"data": "marca.nombre", className: "align-middle"},
                {"data": "numAsientos", className: "align-middle"},
                {"data": "numPisos", className: "align-middle"},
                {"data": "estado", className: "align-middle", "render": function (data) {
                    switch(data){
                        case 'Activo':
                            return estados[0];
                        case 'Inactivo':
                            return estados[1];
                        case 'Asignado':
                            return estados[2];
                    }
                }},
                {"data": "idUnidad", className: "align-middle", "render": function (data) {
                    return `
                    <button class="btn btn-outline-warning text-xs btn-edit" unidad-data="`+data+`">
                        <i class="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn-outline-danger text-xs btn-delete" unidad-data="`+data+`">
                        <i class="fa-regular fa-trash"></i>
                    </button>    
                    `;
                }}
            ]
        });
    }

    class Unidad {idUnidad; modelo; marca; placa; numAsientos; numPisos; estado}

    document.getElementById("btn-addMarca").addEventListener('click', () => {
        guardarUnidad();
    });

    async function guardarUnidad() {
        let unidad = new Unidad();
        unidad.placa = document.getElementById("inputPlaca").value;
        unidad.numAsientos = parseInt(document.getElementById("inputNumAsientos").value);
        unidad.estado = document.getElementById("selectEstado").value;
        unidad.numPisos = (document.getElementById("checkPisos").checked)? 2 : 1;
        let idModelo = document.getElementById("selectModelo").value;
        let idMarca = document.getElementById("selectMarca").value;

        const response = await fetch('http://localhost:8080/api/unidad/'+idModelo+'/'+idMarca, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.token
            },
            body: JSON.stringify(unidad)
        });
        if (response.status == 201) {
            document.getElementById("btn-modalClose").click();
            table.ajax.reload(null, false);
            alertify.success('Agregado');
            limpiarCampos();
        } else {
            alertify.error('Unidad Existente');
        }
    }

    $(document).on('click', '.btn-edit', async function() {
        let idUnidad = $(this)[0].getAttribute("unidad-data");
        const response = await fetch('http://localhost:8080/api/unidad/'+idUnidad, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.token
            }
        });
        if (response.status == 200) {
            let content = await response.json();
            crearEditModal(content);
        }
    });

    function crearEditModal(unidad) {
        let modalEdit = "";
        modalEdit += `
        <div class="modal fade" id="modalEditUnidad" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Editar Unidad</h5>
                        <button type="button" class="btn-close" id="btn-modalEditClose" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="inputIdUnidad" value="`+unidad.idUnidad+`">
                        <div class="row g-2">
                            <div class="form-floating col-md-6">
                                <input type="text" class="form-control" id="inputEditPlaca" placeholder="Placa" value="`+unidad.placa+`">
                                <label for="inputEditPlaca">Placa</label>
                            </div>
                            <div class="col-md-6 d-flex">
                                <input type="checkbox" class="btn-check" id="checkEditPisos" `+((unidad.numPisos == 2)? 'checked': '')+` autocomplete="off">
                                <label class="btn btn-outline-secondary w-100 align-self-center" for="checkEditPisos">`+((unidad.numPisos == 2)? '2 Pisos': '1 Piso')+`</label>
                            </div>
                            <div class="form-floating col-md-6">
                                <input type="number" class="form-control" id="inputEditNumAsientos" placeholder="N° de Asientos" min="12" value="`+unidad.numAsientos+`">
                                <label for="inputEditNumAsientos">N° de Asientos</label>
                            </div>
                            <div class="form-floating col-md-6">
                                <select class="form-select" id="selectEditModelo" aria-label="Modelo">
                                </select>
                                <label for="selectEditModelo">Modelo</label>
                            </div>
                            <div class="form-floating col-md-6">
                                <select class="form-select" id="selectEditMarca" aria-label="Marca">
                                </select>
                                <label for="selectEditMarca">Marca</label>
                            </div>
                            <div class="form-floating col-md-6">
                                <select class="form-select" id="selectEditEstado" aria-label="Estado">
                                    <option value="Activo" `+((unidad.estado == "Activo")?'selected':'')+`>Activo</option>
                                    <option value="Inactivo" `+((unidad.estado == "Inactivo")?'selected':'')+`>Inactivo</option>
                                    ${(unidad.estado == "Asignado")? '<option value="Asignado" selected>Asignado</option>':''}
                                </select>
                                <label for="selectEditEstado">Estado</label>
                            </div>
                            
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-danger" data-bs-dismiss="modal">Cerrar</button>
                        <button type="button" class="btn btn-outline-success" id="btn-editUnidad">Editar</button>
                    </div>
                </div>
            </div>
        </div>
        `;
        document.getElementById("div-edit").innerHTML = modalEdit;
        var editModal = new bootstrap.Modal(document.getElementById('modalEditUnidad'), {keyboard: false});
        editModal.show();
        const selectModelo = document.getElementById("selectEditModelo");
        cargarModelos(selectModelo, unidad.modelo);
        const selectMarca = document.getElementById("selectEditMarca");
        cargarMarcas(selectMarca, unidad.marca);
        
        document.getElementById("checkEditPisos").addEventListener('change', (e) => {
            if (e.target.checked) {
                e.target.nextElementSibling. innerText = "2 Pisos";
                document.getElementById("inputNumAsientos").min = 13;
            } else {
                e.target.nextElementSibling. innerText = "1 Piso";
                document.getElementById("inputNumAsientos").min = 10;
            }
        });

        document.getElementById("btn-editUnidad").addEventListener("click", () => {
            editarUnidad();
        });
    }

    async function editarUnidad() {
        let unidad = new Unidad();
        unidad.placa = document.getElementById("inputEditPlaca").value;
        unidad.numAsientos = parseInt(document.getElementById("inputEditNumAsientos").value);
        unidad.estado = document.getElementById("selectEditEstado").value;
        unidad.numPisos = (document.getElementById("checkEditPisos").checked)? 2 : 1;
        let idModelo = document.getElementById("selectEditModelo").value;
        let idMarca = document.getElementById("selectEditMarca").value;
        let idUnidad = document.getElementById("inputIdUnidad").value;

        const response = await fetch('http://localhost:8080/api/unidad/'+idUnidad+'/'+idModelo+'/'+idMarca, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.token
            },
            body: JSON.stringify(unidad)
        });
        if (response.status == 200) {
            document.getElementById("btn-modalEditClose").click();
            table.ajax.reload(null, false);
            alertify.success('Editado');
        } else {
            alertify.error('Unidad Existente');
        }
    }

    async function eliminarUnidad(idUnidad) {
        const response = await fetch('http://localhost:8080/api/unidad/'+idUnidad, {
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
        let idUnidad = $(this)[0].getAttribute("unidad-data");
        alertify.confirm("Eliminar Unidad","¿Estas seguro de eliminar la Unidad "+idUnidad+"?",
        function(){
            eliminarUnidad(idUnidad);
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
                location.href = "../../login/login.html";
            }
            cargarRegistros();
        } else {
            localStorage.numDocOrEmail = "";
            localStorage.token = "";
            location.href = "../../login/login.html";
        }
    }

    document.querySelector('.modal-footer .btn-danger').addEventListener('click', () => {
        localStorage.clear();
        location.href = "../../login/login.html";
    });

    document.getElementById("btnAdd").addEventListener("click", async() => {
        const selectModelo = document.getElementById("selectModelo");
        cargarModelos(selectModelo);
        const selectMarca = document.getElementById("selectMarca");
        cargarMarcas(selectMarca);

        document.getElementById("checkPisos").addEventListener('change', (e) => {
            if (e.target.checked) {
                e.target.nextElementSibling. innerText = "2 Pisos";
                document.getElementById("inputNumAsientos").min = 13;
            } else {
                e.target.nextElementSibling. innerText = "1 Piso";
                document.getElementById("inputNumAsientos").min = 10;
            }
        });
    });

    async function cargarModelos(select, modelo) {
        const response = await fetch('http://localhost:8080/api/modelo', {
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
                let option = document.createElement("option");
                option.value = item.idModelo;
                option.text = item.nombre;
                if (modelo != undefined && modelo.idModelo == item.idModelo) {
                    option.selected = true;
                }
                select.add(option);
            });
        }
    }

    async function cargarMarcas(select, marca) {
        const response = await fetch('http://localhost:8080/api/marca', {
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
                let option = document.createElement("option");
                option.value = item.idMarca;
                option.text = item.nombre;
                if (marca != undefined && marca.idMarca == item.idMarca) {
                    option.selected = true;
                }
                select.add(option);
            });
        }
    }

    function limpiarCampos() {
        document.getElementById("inputPlaca").value = "";
        document.getElementById("inputNumAsientos").value = "";
        document.getElementById("selectEstado").selectedIndex = 0;
        document.getElementById("checkPisos").checked = false;
        document.getElementById("selectModelo").selectedIndex = 0;
        document.getElementById("selectMarca").selectedIndex = 0;
    }
});