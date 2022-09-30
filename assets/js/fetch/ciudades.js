$(document).ready(function () {

    var table = $('#tableCiudad').DataTable({
        "ajax": {
            "url": "http://localhost:8080/api/ciudad",
            "method": "GET",
            "headers": {
                "Authorization": 'Bearer ' + localStorage.token
            },
            "dataSrc": ""
        },
        "columns": [
            {"data": "idCiudad", className: "align-middle"},
            {"data": "nombre", className: "align-middle"},
            {"defaultContent": '<span class="badge bg-success text-white">Active</span>', className: "align-middle"},
            {"data": "idCiudad", className: "align-middle", "render": function (data) {
                return `
                <button class="btn btn-outline-warning text-xs btn-edit" ciudad-data="`+data+`">
                    <i class="fa-regular fa-pen-to-square"></i>
                </button>
                <button class="btn btn-outline-danger text-xs btn-delete" ciudad-data="`+data+`">
                    <i class="fa-regular fa-trash"></i>
                </button>    
                `;
            }}
        ]
    });

    class Ciudad {nombre; estado;}

    async function guardarCiudad() {
        let ciudad = new Ciudad();
        ciudad.nombre = document.getElementById("inputCiudad").value;
        ciudad.estado = document.getElementById("selectEstado").value;

        const response = await fetch('http://localhost:8080/api/ciudad', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.token
            },
            body: JSON.stringify(ciudad)
        });
        if (response.status == 201) {
            let content = await response.json();
            document.getElementById("btn-modalClose").click();
            table.ajax.reload(null, false);
            alertify.success('Agregado');
        } else {
            
        }
    }

    document.getElementById("btn-addCiudad").addEventListener("click", () => {
        guardarCiudad();
    });

    $(document).on('click', '.btn-edit', async function() {
        let idCiudad = $(this)[0].getAttribute("ciudad-data");

        const response = await fetch('http://localhost:8080/api/ciudad/'+idCiudad, {
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

    function crearEditModal(ciudad) {
        let modalEdit = "";
        modalEdit += `
        <div class="modal fade" id="modalEditCiudad" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Modificar Ciudad</h5>
                        <button type="button" class="btn-close" id="btn-modalEditClose" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="inputIdCiudad" value="`+ciudad.idCiudad+`">
                        <div class="row g-2">
                            <div class="form-floating col-md-6">
                                <input type="text" class="form-control" id="inputEditCiudad" placeholder="Ciudad" value="`+ciudad.nombre+`">
                                <label for="inputEditCiudad">Ciudad</label>
                            </div>
                            <div class="form-floating col-md-6">
                                <select class="form-select" id="selectEditEstado" aria-label="Estado">
                                    <option value="Activo" `+((ciudad.estado == "Activo")?'selected':'')+`>Activo</option>
                                    <option value="Inactivo" `+((ciudad.estado == "Inactivo")?'selected':'')+`>Inactivo</option>
                                </select>
                                <label for="selectEditEstado">Estado</label>
                            </div>
                            
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-danger" data-bs-dismiss="modal">Cerrar</button>
                        <button type="button" class="btn btn-outline-success" id="btn-editCiudad">Editar</button>
                    </div>
                </div>
            </div>
        </div>
        `;
        document.getElementById("div-edit").innerHTML = modalEdit;
        var editModal = new bootstrap.Modal(document.getElementById('modalEditCiudad'), {keyboard: false});
        editModal.show();

        document.getElementById("btn-editCiudad").addEventListener("click", () => {
            editarCiudad();
        });
    }

    async function editarCiudad() {
        let ciudad = new Ciudad();
        ciudad.nombre = document.getElementById("inputEditCiudad").value;
        ciudad.estado = document.getElementById("selectEditEstado").value;

        let idCiudad = document.getElementById("inputIdCiudad").value;
        
        const response = await fetch('http://localhost:8080/api/ciudad/'+idCiudad, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.token
            },
            body: JSON.stringify(ciudad)
        });
        if (response.status == 200) {
            let content = await response.json();
            document.getElementById("btn-modalEditClose").click();
            table.ajax.reload(null, false);
            alertify.success('Editado');
        } else {
            
        }
    }

    async function eliminarCiudad(idCiudad) {
        const response = await fetch('http://localhost:8080/api/ciudad/'+idCiudad, {
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
        let idCiudad = $(this)[0].getAttribute("ciudad-data");
        alertify.confirm("Eliminar Ciudad","¿Estas seguro de eliminar Ciudad "+idCiudad+"?",
        function(){
            eliminarCiudad(idCiudad);
        },
        function(){
            alertify.error('Cancelado');
        });
    });

});