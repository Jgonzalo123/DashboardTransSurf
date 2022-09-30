$(document).ready(function () {
    var table = $('#tableClientes').DataTable({
        "ajax": {
            "url": "http://localhost:8080/api/usuario/cliente",
            "method": "GET",
            "headers": {
                "Authorization": 'Bearer ' + localStorage.token
            },
            "dataSrc": ""
        },
        "columns": [
            {"data": "idUsuario", className: "align-middle"},
            {"data": "documento.tipo", className: "align-middle"},
            {"data": "numDoc", className: "align-middle"},
            {"data": "nombre", className: "align-middle"},
            {"data": "apellido", className: "align-middle"},
            {"data": "email", className: "align-middle"},
            {"data": "celular", className: "align-middle"},
            {"defaultContent": '<span class="badge bg-success text-white">Active</span>', className: "align-middle"},
            {"data": "idUsuario", className: "align-middle", "render": function (data) {
                return `
                <button class="btn btn-outline-warning text-xs btn-edit" user-client="`+data+`">
                    <i class="fa-regular fa-pen-to-square"></i>
                </button>
                <button class="btn btn-outline-danger text-xs btn-delete" user-client="`+data+`">
                    <i class="fa-regular fa-trash"></i>
                </button>    
                `;
            }}
        ]
    });

    class Cliente {nombre; apellido; numDoc; fechaNacimiento; email; password; celular; estado;}

    $(document).on('click', '.btn-edit', async function() {
        let idUsuario = $(this)[0].getAttribute("user-client");

        const response = await fetch('http://localhost:8080/api/usuario/'+idUsuario, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.token
            }
        });
        if (response.status == 200) {
            let content = await response.json();
            
            crearEditModal(content);
        } else {
            
        }
    });

    function crearEditModal(cliente) {
        let modalEdit = "";
        modalEdit += `
        <div class="modal fade" id="modalEditCliente" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Editar Cliente</h5>
                        <button type="button" class="btn-close" id="btn-modalEditClose" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="inputIdUsuario" value="`+cliente.idUsuario+`">
                        <div class="row g-2">
                            <div class="form-floating col-md-6">
                                <input type="text" class="form-control" id="inputEditNombre" placeholder="Nombres" value="`+cliente.nombre+`">
                                <label for="inputNombre">Nombres</label>
                            </div>
                            <div class="form-floating col-md-6">
                                <input type="text" class="form-control" id="inputEditApellido" placeholder="Apellidos" value="`+cliente.apellido+`">
                                <label for="inputApellido">Apellidos</label>
                            </div>
                            <div class="form-floating col-md-6">
                                <select class="form-select" id="selectEditDocumento" aria-label="Tipo de Documento">
                                    <option value="1" `+((cliente.documento.idDocumento == 1)?'selected':'')+`>DNI</option>
                                    <option value="2" `+((cliente.documento.idDocumento == 2)?'selected':'')+`>CE</option>
                                </select>
                                <label for="selectDocumento">Tipo de Documento</label>
                            </div>
                            <div class="form-floating col-md-6">
                                <input type="number" class="form-control" id="inputEditNumDoc" placeholder="Numero Documento" value="`+cliente.numDoc+`">
                                <label for="inputNumDoc">Numero Documento</label>
                            </div>
                            <div class="form-floating col-md-6">
                                <input type="email" class="form-control" id="inputEditEmail" placeholder="Email" value="`+cliente.email+`">
                                <label for="inputEditEmail">Email</label>
                            </div>
                            <div class="form-floating col-md-6">
                                <select class="form-select" id="selectEditEstado" aria-label="Estado">
                                    <option value="Activo" `+((cliente.estado == "Activo")?'selected':'')+`>Activo</option>
                                    <option value="Inactivo" `+((cliente.estado == "Inactivo")?'selected':'')+`>Inactivo</option>
                                    <option value="Bloqueado" `+((cliente.estado == "Bloqueado")?'selected':'')+`>Bloqueado</option>
                                </select>
                                <label for="selectEstado">Estado</label>
                            </div>
                            <div class="form-floating col-md-6">
                                <input type="tel" class="form-control" id="inputEditCelular" placeholder="N° Celular" value="`+cliente.celular+`">
                                <label for="inputCelular">N° Celular</label>
                            </div>
                            <div class="form-floating col-md-6">
                                <input type="date" class="form-control" id="inputEditFechaNacimiento" placeholder="Fecha de Nacimiento" value="`+cliente.fechaNacimiento+`">
                                <label for="inputFechaNacimiento">Fecha de Nacimiento</label>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-danger" data-bs-dismiss="modal">Cerrar</button>
                        <button type="button" class="btn btn-outline-success" id="btn-editClient">Modificar</button>
                    </div>
                </div>
            </div>
        </div>
        `;
        document.getElementById("div-edit").innerHTML = modalEdit;
        var editModal = new bootstrap.Modal(document.getElementById('modalEditCliente'), {keyboard: false});
        editModal.show();

        document.getElementById("btn-editClient").addEventListener("click", () => {
            editarCliente();
        });
    }

    async function editarCliente() {
        let cliente = new Cliente();
        cliente.nombre = document.getElementById("inputEditNombre").value;
        cliente.apellido = document.getElementById("inputEditApellido").value;
        cliente.numDoc = document.getElementById("inputEditNumDoc").value;
        cliente.fechaNacimiento = document.getElementById("inputEditFechaNacimiento").value;
        cliente.email = document.getElementById("inputEditEmail").value;
        cliente.password = cliente.numDoc;
        cliente.celular = document.getElementById("inputEditCelular").value;
        cliente.estado = document.getElementById("selectEditEstado").value;

        let idUsuario = document.getElementById("inputIdUsuario").value;
        let doc = document.getElementById("selectEditDocumento").value;
        
        const response = await fetch('http://localhost:8080/api/usuario/cliente/'+doc+"/"+idUsuario, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.token
            },
            body: JSON.stringify(cliente)
        });
        if (response.status == 200) {
            let content = await response.json();
            document.getElementById("btn-modalEditClose").click();
            table.ajax.reload(null, false);
            alertify.success('Editado');
        } else {
            
        }
    }

    $(document).on('click', '.btn-delete', function() {
        let idUsuario = $(this)[0].getAttribute("user-client");
        alertify.confirm("Eliminar Cliente","¿Estas seguro de eliminar Cliente "+idUsuario+"?",
        function(){
            eliminarUsuario(idUsuario);
        },
        function(){
            alertify.error('Cancelado');
        });
    });

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
        } else {
            
        }
    }
});