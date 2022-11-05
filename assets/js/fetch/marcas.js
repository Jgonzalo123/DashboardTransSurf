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
        table = $('#tableMarca').DataTable({
            "ajax": {
                "url": "http://localhost:8080/api/marca",
                "method": "GET",
                "headers": {
                    "Authorization": 'Bearer ' + localStorage.token
                },
                "dataSrc": ""
            },
            "columns": [
                {"data": "idMarca", className: "align-middle"},
                {"data": "nombre", className: "align-middle"},
                {"data": "estado", className: "align-middle", "render": function (data) {
                    switch(data){
                        case 'Activo':
                            return estados[0];
                        case 'Inactivo':
                            return estados[1];
                    }
                }},
                {"data": "idMarca", className: "align-middle", "render": function (data) {
                    return `
                    <button class="btn btn-outline-warning text-xs btn-edit" marca-data="`+data+`">
                        <i class="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn-outline-danger text-xs btn-delete" marca-data="`+data+`">
                        <i class="fa-regular fa-trash"></i>
                    </button>    
                    `;
                }}
            ]
        });
    }

    class Marca {nombre; estado;}

    async function guardarMarca() {
        let marca = new Marca();
        marca.nombre = document.getElementById("inputMarca").value;
        marca.estado = document.getElementById("selectEstado").value;

        const response = await fetch('http://localhost:8080/api/marca', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.token
            },
            body: JSON.stringify(marca)
        });
        if (response.status == 201) {
            document.getElementById("btn-modalClose").click();
            table.ajax.reload(null, false);
            alertify.success('Agregado');
            limpiarCampos();
        } else {
            alertify.error('Marca Existente');
        }
    }

    document.getElementById("btn-addMarca").addEventListener("click", () => {
        guardarMarca();
    });

    $(document).on('click', '.btn-edit', async function() {
        let idMarca = $(this)[0].getAttribute("marca-data");

        const response = await fetch('http://localhost:8080/api/marca/'+idMarca, {
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

    function crearEditModal(marca) {
        let modalEdit = "";
        modalEdit += `
        <div class="modal fade" id="modalEditMarca" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Modificar Marca</h5>
                        <button type="button" class="btn-close" id="btn-modalEditClose" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="inputIdMarca" value="`+marca.idMarca+`">
                        <div class="row g-2">
                            <div class="form-floating col-md-6">
                                <input type="text" class="form-control" id="inputEditMarca" placeholder="Marca" value="`+marca.nombre+`">
                                <label for="inputEditMarca">Marca</label>
                            </div>
                            <div class="form-floating col-md-6">
                                <select class="form-select" id="selectEditEstado" aria-label="Estado">
                                    <option value="Activo" `+((marca.estado == "Activo")?'selected':'')+`>Activo</option>
                                    <option value="Inactivo" `+((marca.estado == "Inactivo")?'selected':'')+`>Inactivo</option>
                                </select>
                                <label for="selectEditEstado">Estado</label>
                            </div>
                            
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-danger" data-bs-dismiss="modal">Cerrar</button>
                        <button type="button" class="btn btn-outline-success" id="btn-editMarca">Modificar</button>
                    </div>
                </div>
            </div>
        </div>
        `;
        document.getElementById("div-edit").innerHTML = modalEdit;
        var editModal = new bootstrap.Modal(document.getElementById('modalEditMarca'), {keyboard: false});
        editModal.show();

        document.getElementById("btn-editMarca").addEventListener("click", () => {
            editarMarca();
        });
    }

    async function editarMarca() {
        let marca = new Marca();
        marca.nombre = document.getElementById("inputEditMarca").value;
        marca.estado = document.getElementById("selectEditEstado").value;

        let idMarca = document.getElementById("inputIdMarca").value;
        
        const response = await fetch('http://localhost:8080/api/marca/'+idMarca, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.token
            },
            body: JSON.stringify(marca)
        });
        if (response.status == 200) {
            document.getElementById("btn-modalEditClose").click();
            table.ajax.reload(null, false);
            alertify.success('Editado');
        } else {
            alertify.error('Marca Existente');
        }
    }

    async function eliminarMarca(idMarca) {
        const response = await fetch('http://localhost:8080/api/marca/'+idMarca, {
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
        let idMarca = $(this)[0].getAttribute("marca-data");
        alertify.confirm("Eliminar Marca","¿Estas seguro de eliminar Marca "+idMarca+"?",
        function(){
            eliminarMarca(idMarca);
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

    function limpiarCampos() {
        document.getElementById("inputMarca").value = "";
        document.getElementById("selectEstado").selectedIndex = 0;
    }
});