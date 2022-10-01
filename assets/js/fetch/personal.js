$(document).ready(function () {
    if (!localStorage.token == "") {
        validarSesion();
    }else{
        localStorage.numDocOrEmail = "";
        localStorage.token = "";
        location.href = "../login/login.html";
    }

    let estados = ['<span class="badge bg-success text-white">Active</span>',
                    '<span class="badge bg-secondary text-white">Inactive</span>',
                    '<span class="badge bg-danger text-white">Block</span>'];

    var table;

    function cargarRegistros() {
        table = $('#tablePersonal').DataTable({
            "ajax": {
                "url": "http://localhost:8080/api/usuario/personal",
                "method": "GET",
                "headers": {
                    "Authorization": 'Bearer ' + localStorage.token
                },
                "dataSrc": ""
            },
            "columns": [
                {"data": "idUsuario", className: "align-middle"},
                {"data": "roles[0].tipo", className: "align-middle"},
                {"data": "documento.tipo", className: "align-middle"},
                {"data": "numDoc", className: "align-middle"},
                {"data": "nombre", className: "align-middle"},
                {"data": "apellido", className: "align-middle"},
                {"data": "celular", className: "align-middle"},
                {"data": "estado", className: "align-middle", "render": function (data) {
                    switch(data){
                        case 'Activo':
                            return estados[0];
                        case 'Inactivo':
                            return estados[1];
                        case 'Bloqueado':
                            return estados[2];
                    }
                }},
                {"data": "idUsuario", className: "align-middle", "render": function (data) {
                    return `
                    <button class="btn btn-outline-warning text-xs btn-edit" user-personal="`+data+`">
                        <i class="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn-outline-danger text-xs btn-delete" user-personal="`+data+`">
                        <i class="fa-regular fa-trash"></i>
                    </button>    
                    `;
                }}
            ]
        });
    }
    

    class Personal {nombre; apellido; numDoc; fechaNacimiento; email; password; celular; estado;}

    async function guardarPersonal() {
        let personal = new Personal();
        personal.nombre = document.getElementById("inputNombre").value;
        personal.apellido = document.getElementById("inputApellido").value;
        personal.numDoc = document.getElementById("inputNumDoc").value;
        personal.fechaNacimiento = document.getElementById("inputFechaNacimiento").value;
        personal.email = personal.numDoc + "@transsurf.com";
        personal.password = personal.numDoc;
        personal.celular = document.getElementById("inputCelular").value;
        personal.estado = document.getElementById("selectEstado").value;

        let doc = document.getElementById("selectDocumento").value;
        let rol = document.getElementById("selectRol").value;
        const response = await fetch('http://localhost:8080/api/usuario/personal/'+doc+"/"+rol, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.token
            },
            body: JSON.stringify(personal)
        });
        if (response.status == 201) {
            document.getElementById("btn-modalClose").click();
            table.ajax.reload(null, false);
            alertify.success('Agregado');
        } else {
            let content = await response.text();
            alertify.error(content);
        }
    }

    document.getElementById("btn-addPersonal").addEventListener("click", () => {
        guardarPersonal();
    });
    

    $(document).on('click', '.btn-edit', async function() {
        let idUsuario = $(this)[0].getAttribute("user-personal");

        const response = await fetch('http://localhost:8080/api/usuario/'+idUsuario, {
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

    $(document).on('click', '.btn-delete', function() {
        let idUsuario = $(this)[0].getAttribute("user-personal");
        alertify.confirm("Eliminar Usuario","¿Estas seguro de eliminar Usuario "+idUsuario+"?",
        function(){
            eliminarUsuario(idUsuario);
        },
        function(){
            alertify.error('Cancelado');
        });
    });

    function crearEditModal(personal) {
        let modalEdit = "";
        modalEdit += `
        <div class="modal fade" id="modalEditPersonal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Editar Empleado</h5>
                        <button type="button" class="btn-close" id="btn-modalEditClose" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="inputIdUsuario" value="`+personal.idUsuario+`">
                        <div class="row g-2">
                            <div class="form-floating col-md-6">
                                <input type="text" class="form-control" id="inputEditNombre" placeholder="Nombres" value="`+personal.nombre+`">
                                <label for="inputNombre">Nombres</label>
                            </div>
                            <div class="form-floating col-md-6">
                                <input type="text" class="form-control" id="inputEditApellido" placeholder="Apellidos" value="`+personal.apellido+`">
                                <label for="inputApellido">Apellidos</label>
                            </div>
                            <div class="form-floating col-md-6">
                                <select class="form-select" id="selectEditDocumento" aria-label="Tipo de Documento">
                                    <option value="1" `+((personal.documento.idDocumento == 1)?'selected':'')+`>DNI</option>
                                    <option value="2" `+((personal.documento.idDocumento == 2)?'selected':'')+`>CE</option>
                                </select>
                                <label for="selectDocumento">Tipo de Documento</label>
                            </div>
                            <div class="form-floating col-md-6">
                                <input type="number" class="form-control" id="inputEditNumDoc" placeholder="Numero Documento" value="`+personal.numDoc+`">
                                <label for="inputNumDoc">Numero Documento</label>
                            </div>
                            <div class="form-floating col-md-6">
                                <select class="form-select" id="selectEditRol" aria-label="Rol">
                                    <option value="1" `+((personal.roles[0].idRol == 1)?'selected':'')+`>Admin</option>
                                    <option value="3" `+((personal.roles[0].idRol == 3)?'selected':'')+`>Counter</option>
                                    <option value="4" `+((personal.roles[0].idRol == 4)?'selected':'')+`>Driver</option>
                                    <option value="5" `+((personal.roles[0].idRol == 5)?'selected':'')+`>Operator</option>
                                </select>
                                <label for="selectRol">Rol</label>
                            </div>
                            <div class="form-floating col-md-6">
                                <select class="form-select" id="selectEditEstado" aria-label="Estado">
                                    <option value="Activo" `+((personal.estado == "Activo")?'selected':'')+`>Activo</option>
                                    <option value="Inactivo" `+((personal.estado == "Inactivo")?'selected':'')+`>Inactivo</option>
                                    <option value="Bloqueado" `+((personal.estado == "Bloqueado")?'selected':'')+`>Bloqueado</option>
                                </select>
                                <label for="selectEstado">Estado</label>
                            </div>
                            <div class="form-floating col-md-6">
                                <input type="tel" class="form-control" id="inputEditCelular" placeholder="N° Celular" value="`+personal.celular+`">
                                <label for="inputCelular">N° Celular</label>
                            </div>
                            <div class="form-floating col-md-6">
                                <input type="date" class="form-control" id="inputEditFechaNacimiento" placeholder="Fecha de Nacimiento" value="`+personal.fechaNacimiento+`">
                                <label for="inputFechaNacimiento">Fecha de Nacimiento</label>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-danger" data-bs-dismiss="modal">Cerrar</button>
                        <button type="button" class="btn btn-outline-success" id="btn-editPersonal">Modificar</button>
                    </div>
                </div>
            </div>
        </div>
        `;
        document.getElementById("div-edit").innerHTML = modalEdit;
        var editModal = new bootstrap.Modal(document.getElementById('modalEditPersonal'), {keyboard: false});
        editModal.show();

        document.getElementById("btn-editPersonal").addEventListener("click", () => {
            editarPersonal();
        });
    }

    async function editarPersonal() {
        let personal = new Personal();
        personal.nombre = document.getElementById("inputEditNombre").value;
        personal.apellido = document.getElementById("inputEditApellido").value;
        personal.numDoc = document.getElementById("inputEditNumDoc").value;
        personal.fechaNacimiento = document.getElementById("inputEditFechaNacimiento").value;
        personal.email = personal.numDoc + "@transsurf.com";
        personal.password = personal.numDoc;
        personal.celular = document.getElementById("inputEditCelular").value;
        personal.estado = document.getElementById("selectEditEstado").value;

        let idUsuario = document.getElementById("inputIdUsuario").value;
        let doc = document.getElementById("selectEditDocumento").value;
        let rol = document.getElementById("selectEditRol").value;
        
        const response = await fetch('http://localhost:8080/api/usuario/personal/'+doc+"/"+rol+"/"+idUsuario, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.token
            },
            body: JSON.stringify(personal)
        });
        if (response.status == 200) {
            document.getElementById("btn-modalEditClose").click();
            table.ajax.reload(null, false);
            alertify.success('Editado');
        } else {
            let content = await response.text();
            alertify.error(content);
        }
    }

    async function eliminarUsuario(idUsuario) {
        const response = await fetch('http://localhost:8080/api/usuario/'+idUsuario, {
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
});


