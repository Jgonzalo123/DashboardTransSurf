$(document).ready(function () {
    if (!localStorage.token == "") {
        validarSesion();
    }else{
        localStorage.numDocOrEmail = "";
        localStorage.token = "";
        location.href = "../../login/login.html";
    }

    let estados = ['<span class="badge bg-success text-white">Active</span>',
                    '<span class="badge bg-secondary text-white">Inactive</span>'];

    var table;
    function cargarRegistros() {
        table = $('#tableModelo').DataTable({
            "ajax": {
                "url": "http://localhost:8080/api/modelo",
                "method": "GET",
                "headers": {
                    "Authorization": 'Bearer ' + localStorage.token
                },
                "dataSrc": ""
            },
            "columns": [
                {"data": "idModelo", className: "align-middle"},
                {"data": "nombre", className: "align-middle"},
                {"data": "descripcion", className: "align-middle"},
                {"data": "estado", className: "align-middle", "render": function (data) {
                    switch(data){
                        case 'Activo':
                            return estados[0];
                        case 'Inactivo':
                            return estados[1];
                    }
                }},
                {"data": "idModelo", className: "align-middle", "render": function (data) {
                    return `
                    <button class="btn btn-outline-warning text-xs btn-edit" modelo-data="`+data+`">
                        <i class="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn-outline-danger text-xs btn-delete" modelo-data="`+data+`">
                        <i class="fa-regular fa-trash"></i>
                    </button>    
                    `;
                }}
            ]
        });
    }

    class Modelo {nombre; descripcion; estado;}

    async function guardarModelo() {
        let modelo = new Modelo();
        modelo.nombre = document.getElementById("inputModelo").value;
        modelo.descripcion = document.getElementById("areaDescripcion").value;
        modelo.estado = document.getElementById("selectEstado").value;

        const response = await fetch('http://localhost:8080/api/modelo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.token
            },
            body: JSON.stringify(modelo)
        });
        if (response.status == 201) {
            document.getElementById("btn-modalClose").click();
            table.ajax.reload(null, false);
            alertify.success('Agregado');
            limpiarCampos();
        } else {
            alertify.error('Modelo Existente');
        }
    }

    document.getElementById("btn-addModelo").addEventListener("click", () => {
        guardarModelo();
    });

    $(document).on('click', '.btn-edit', async function() {
        let idModelo = $(this)[0].getAttribute("modelo-data");

        const response = await fetch('http://localhost:8080/api/modelo/'+idModelo, {
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

    function crearEditModal(modelo) {
        let modalEdit = "";
        modalEdit += `
        <div class="modal fade" id="modalEditModelo" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Modificar Modelo</h5>
                        <button type="button" class="btn-close" id="btn-modalEditClose" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="inputIdModelo" value="`+modelo.idModelo+`">
                        <div class="row g-2">
                            <div class="form-floating col-md-6">
                                <input type="text" class="form-control" id="inputEditModelo" placeholder="Modelo" value="`+modelo.nombre+`">
                                <label for="inputEditModelo">Modelo</label>
                            </div>
                            <div class="form-floating col-md-6">
                                <select class="form-select" id="selectEditEstado" aria-label="Estado">
                                    <option value="Activo" `+((modelo.estado == "Activo")?'selected':'')+`>Activo</option>
                                    <option value="Inactivo" `+((modelo.estado == "Inactivo")?'selected':'')+`>Inactivo</option>
                                </select>
                                <label for="selectEditEstado">Estado</label>
                            </div>
                            <div class="form-floating col-12">
                                <textarea class="form-control" placeholder="Descripción" id="areaEditDescripcion">`+modelo.descripcion+`</textarea>
                                <label for="areaEditDescripcion">Descripción</label>
                              </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-danger" data-bs-dismiss="modal">Cerrar</button>
                        <button type="button" class="btn btn-outline-success" id="btn-editModelo">Modificar</button>
                    </div>
                </div>
            </div>
        </div>
        `;
        document.getElementById("div-edit").innerHTML = modalEdit;
        var editModal = new bootstrap.Modal(document.getElementById('modalEditModelo'), {keyboard: false});
        editModal.show();

        document.getElementById("btn-editModelo").addEventListener("click", () => {
            editarModelo();
        });
    }

    async function editarModelo() {
        let modelo = new Modelo();
        modelo.nombre = document.getElementById("inputEditModelo").value;
        modelo.descripcion = document.getElementById("areaEditDescripcion").value;
        modelo.estado = document.getElementById("selectEditEstado").value;

        let idModelo = document.getElementById("inputIdModelo").value;
        
        const response = await fetch('http://localhost:8080/api/modelo/'+idModelo, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.token
            },
            body: JSON.stringify(modelo)
        });
        if (response.status == 200) {
            document.getElementById("btn-modalEditClose").click();
            table.ajax.reload(null, false);
            alertify.success('Editado');
        } else {
            alertify.error('Modelo Existente');
        }
    }

    async function eliminarModelo(idModelo) {
        const response = await fetch('http://localhost:8080/api/modelo/'+idModelo, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.token
            }
        });
        if (response.status == 200) {
            alertify.success('Eliminado');
            table.ajax.reload(null, false);
        }
    }

    $(document).on('click', '.btn-delete', function() {
        let idModelo = $(this)[0].getAttribute("modelo-data");
        alertify.confirm("Eliminar Modelo","¿Estas seguro de eliminar Modelo "+idModelo+"?",
        function(){
            eliminarModelo(idModelo);
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

    function limpiarCampos() {
        document.getElementById("inputModelo").value = "";
        document.getElementById("areaDescripcion").value = "";
        document.getElementById("selectEstado").selectedIndex = 0;
    }
});