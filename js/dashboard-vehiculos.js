let allVehicles = [];
let userRole = null;

// Import the auth service
import { me } from './service/authService.js';

// Obtiene información del usuario autenticado usando el servicio de auth
async function getUserInfo() {
    try {
        const userInfo = await me();
        console.log('User info received:', userInfo); // Debug log
        
        if (userInfo.authenticated && userInfo.instructor && userInfo.instructor.role) {
            userRole = userInfo.instructor.role;
            console.log('User role set to:', userRole); // Debug log
            handleSidebarVisibility();
            updateSidebarTitle();
            return userInfo.instructor;
        }
        return null;
    } catch (error) {
        console.error('Error al obtener información del usuario:', error);
        return null;
    }
}

// Actualiza el título del sidebar según el rol
function updateSidebarTitle() {
    const sidebarTitle = document.getElementById('sidebar-title');
    const workOrdersSidebarTitle = document.getElementById('work-orders-sidebar-title');
    
    if (sidebarTitle && userRole) {
        if (userRole === 'Animador') {
            sidebarTitle.textContent = 'Pendientes de Revisión';
        } else if (userRole === 'Coordinador') {
            sidebarTitle.textContent = 'En Revisión';
        }
    }
    
    if (workOrdersSidebarTitle && userRole) {
        if (userRole === 'Animador') {
            workOrdersSidebarTitle.textContent = 'Órdenes para Animador';
        } else if (userRole === 'Coordinador') {
            workOrdersSidebarTitle.textContent = 'Órdenes para Coordinador';
        } else {
            workOrdersSidebarTitle.textContent = 'Órdenes Pendientes';
        }
    }
}

// Controla la visibilidad del sidebar según el rol
function handleSidebarVisibility() {
    const sidebar = document.querySelector('.panel-lateral');
    const mainContent = document.querySelector('.contenido-principal');
    const contenidoLayout = document.querySelector('.contenido-layout');
    
    console.log('Handling sidebar visibility for role:', userRole); // Debug log
    
    if (userRole === 'Docente') {
        if (sidebar) {
            sidebar.style.display = 'none';
            console.log('Sidebar hidden for Docente'); // Debug log
        }
        if (contenidoLayout) {
            contenidoLayout.style.gridTemplateColumns = '1fr';
        }
        if (mainContent) {
            mainContent.style.width = '100%';
            mainContent.style.maxWidth = '100%';
        }
    } else {
        if (sidebar) {
            sidebar.style.display = 'block';
            console.log('Sidebar shown for role:', userRole); // Debug log
        }
        if (contenidoLayout) {
            contenidoLayout.style.gridTemplateColumns = '';
        }
        if (mainContent) {
            mainContent.style.width = '';
            mainContent.style.maxWidth = '';
        }
    }
}

// Function to convert status ID to readable text
function getStatusText(statusId) {
    switch(statusId) {
        case 1:
            return 'En espera de aprobación del animador';
        case 2:
            return 'En espera de aprobación del coordinador';
        case 3:
            return 'Vehículo aprobado';
        case 4:
            return 'Vehículo rechazado';
        default:
            return 'Estado desconocido';
    }
}

// Function to get status class for styling
function getStatusClass(statusId) {
    switch(statusId) {
        case 1:
        case 2:
            return 'estado-pendiente';
        case 3:
            return 'estado-completado';
        case 4:
            return 'estado-rechazado';
        default:
            return 'estado-pendiente';
    }
}

// Renderiza la tabla de vehículos
function renderVehiclesTable(vehicles) {
    // Update allVehicles only if we're rendering all vehicles (not filtered results)
    const searchInput = document.getElementById('buscarRegistro');
    const statusFilter = document.getElementById('filtroEstado');
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const statusValue = statusFilter ? statusFilter.value : 'all';
    
    // Only update allVehicles if no filters are active (showing complete dataset)
    if (searchTerm === '' && statusValue === 'all') {
        allVehicles = vehicles;
    }
    
    const tbody = document.querySelector('.tabla-moderna tbody');
    if (!tbody) {
        console.error('No se encontró el tbody de la tabla de vehículos. Verifica que exista .tabla-moderna y su <tbody>.');
        return;
    }
    tbody.innerHTML = '';
    if (!Array.isArray(vehicles) || vehicles.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11" style="text-align:center;">No se encontraron vehículos.</td></tr>`;
        return;
    }
    vehicles.forEach(vehicle => {
        const estudiante = (vehicle.studentName || '-') + ' ' + (vehicle.studentLastName || '');
        let imgSrc = vehicle.vehicleImage;
        if (!imgSrc || imgSrc === 'null' || imgSrc === null) {
            imgSrc = 'imgs/default-car.png';
        }
        
        // Convert status to readable text
        const statusText = getStatusText(vehicle.idStatus);
        const statusClass = getStatusClass(vehicle.idStatus);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <input type="checkbox" class="checkbox-row">
            </td>
            <td>${vehicle.plateNumber || '-'}</td>
            <td>${vehicle.brand || '-'}</td>
            <td>${vehicle.model || '-'}</td>
            <td>${vehicle.typeName || '-'}</td>
            <td>
                <span class="estado-badge ${statusClass}">${statusText}</span>
            </td>
            <td>${estudiante.trim() || '-'}</td>
            <td>${vehicle.ownerName || '-'}</td>
            <td>${vehicle.ownerPhone || '-'}</td>
            <td>
                <img src="${imgSrc}" alt="Imagen" class="vehiculo-img" style="width:40px;height:40px;border-radius:6px;border:1px solid #ccc;">
            </td>
            <td>
                <div class="acciones-vehiculo" style="display:flex;gap:8px;">
                    <button class="btn-accion" title="Ver detalles" onclick="showVehicleModal(${vehicle.vehicleId})">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Renderiza vehículos pendientes en la tarjeta-sidebar
function renderSidebarPendingVehicles(vehicles) {
    const lista = document.querySelector('.tarjeta-sidebar .lista-registros');
    const badge = document.querySelector('.tarjeta-sidebar .badge-contador');
    if (!lista) return;
    
    console.log('Rendering sidebar for role:', userRole, 'with vehicles:', vehicles.length); // Debug log
    
    // Filtra vehículos según el rol del usuario
    let pendientes = [];
    if (userRole === 'Animador') {
        pendientes = vehicles.filter(v => v.idStatus === 1);
        console.log('Animador - vehicles with status 1:', pendientes.length); // Debug log
    } else if (userRole === 'Coordinador') {
        pendientes = vehicles.filter(v => v.idStatus === 2);
        console.log('Coordinador - vehicles with status 2:', pendientes.length); // Debug log
    }
    // Para 'Docente' no se muestran vehículos pendientes (sidebar oculto)
    
    if (badge) badge.textContent = pendientes.length;
    lista.innerHTML = '';
    
    if (pendientes.length === 0) {
        lista.innerHTML = '<div style="text-align:center;color:#888;">No hay vehículos pendientes.</div>';
        return;
    }
    
    pendientes.forEach(vehicle => {
        // Get vehicle image or default
        let imgSrc = vehicle.vehicleImage;
        if (!imgSrc || imgSrc === 'null' || imgSrc === null) {
            imgSrc = 'imgs/default-car.png';
        }
        
        const div = document.createElement('div');
        div.className = 'item-registro';
        div.innerHTML = `
            <img src="${imgSrc}" alt="Vehículo" class="vehiculo-imagen" onerror="this.src='imgs/default-car.png'">
            <div class="info-vehiculo">
                <span class="placa-vehiculo">${vehicle.plateNumber || 'Sin placa'}</span>
                <span class="servicio-vehiculo">${vehicle.model || 'Modelo no especificado'}</span>
                <span class="fecha-vehiculo">${vehicle.brand || 'Marca no especificada'}</span>
            </div>
            <div class="acciones-vehiculo">
                <button class="btn-opciones" title="Más opciones">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </div>
        `;
        
        // Abrir modal al hacer clic en el div, excepto si se hace clic en el botón de opciones
        div.addEventListener('click', function(e) {
            if (!e.target.closest('.btn-opciones')) {
                showVehicleModal(vehicle.vehicleId);
            }
        });
        
        lista.appendChild(div);
    });
}

// Obtiene todos los vehículos
function fetchAllVehicles() {
    fetch('https://sgma-66ec41075156.herokuapp.com/api/vehicles/getAllVehicles', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .then(data => {
        let vehicles = [];
        if (data && data.data && Array.isArray(data.data.content)) {
            vehicles = data.data.content;
        }
        
        // Always update allVehicles with fresh data
        allVehicles = vehicles;
        
        // Apply current filters after updating data
        applyFilters();
        
        renderSidebarPendingVehicles(vehicles);
    })
    .catch(err => {
        console.error('Error al obtener vehículos:', err);
        allVehicles = [];
        renderVehiclesTable([]);
        renderSidebarPendingVehicles([]);
    });
}

let selectedVehicleId = null;

// Add print function for vehicle report
window.imprimirReporteVehiculo = function() {
    // Get current date for the report
    const currentDate = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Get the vehicle data
    const vehicle = allVehicles.find(v => v.vehicleId === selectedVehicleId);
    if (!vehicle) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo obtener la información del vehículo para imprimir.'
            });
        } else {
            alert('Error: No se pudo obtener la información del vehículo');
        }
        return;
    }
    
    // Get image source
    const imageSrc = vehicle.vehicleImage && vehicle.vehicleImage !== 'null' ? vehicle.vehicleImage : 'imgs/default-car.png';
    
    // Convert status to readable text for print
    const statusText = getStatusText(vehicle.idStatus);
    
    // Create print content
    const printContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reporte de Vehículo - ${vehicle.plateNumber}</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Arial', sans-serif;
                    margin: 0;
                    padding: 20px;
                    color: #333;
                    line-height: 1.6;
                    background: white;
                }
                
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 3px solid #e74c3c;
                    padding-bottom: 20px;
                }
                
                .header h1 {
                    color: #e74c3c;
                    margin: 0;
                    font-size: 28px;
                    font-weight: 700;
                }
                
                .header p {
                    color: #666;
                    margin: 10px 0 0 0;
                    font-size: 16px;
                }
                
                .header .date {
                    color: #888;
                    margin: 5px 0 0 0;
                    font-size: 14px;
                }
                
                .content {
                    display: grid;
                    grid-template-columns: 1fr 300px;
                    gap: 30px;
                    margin-bottom: 30px;
                }
                
                .vehicle-info h2 {
                    color: #2d3748;
                    margin-bottom: 20px;
                    font-size: 20px;
                    border-bottom: 2px solid #e2e8f0;
                    padding-bottom: 10px;
                }
                
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                }
                
                .info-item {
                    margin-bottom: 15px;
                    padding: 10px;
                    background: #f7fafc;
                    border-left: 4px solid #e74c3c;
                    border-radius: 4px;
                }
                
                .info-item strong {
                    color: #2d3748;
                    display: block;
                    margin-bottom: 5px;
                }
                
                .info-item span {
                    color: #4a5568;
                    font-size: 16px;
                }
                
                .image-section {
                    text-align: center;
                }
                
                .image-section h3 {
                    color: #2d3748;
                    margin-bottom: 15px;
                    font-size: 18px;
                }
                
                .vehicle-image {
                    width: 100%;
                    max-width: 280px;
                    height: auto;
                    border: 2px solid #e2e8f0;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                
                .owner-info {
                    margin-bottom: 30px;
                }
                
                .owner-info h2 {
                    color: #2d3748;
                    margin-bottom: 20px;
                    font-size: 20px;
                    border-bottom: 2px solid #e2e8f0;
                    padding-bottom: 10px;
                }
                
                .owner-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                }
                
                .owner-item {
                    margin-bottom: 15px;
                    padding: 10px;
                    background: #f7fafc;
                    border-left: 4px solid #48bb78;
                    border-radius: 4px;
                }
                
                .status-item {
                    border-left-color: #4299e1 !important;
                }
                
                .owner-item strong {
                    color: #2d3748;
                    display: block;
                    margin-bottom: 5px;
                }
                
                .owner-item span {
                    color: #4a5568;
                    font-size: 16px;
                }
                
                .status-item span {
                    font-weight: 600;
                }
                
                .footer {
                    border-top: 2px solid #e2e8f0;
                    padding-top: 20px;
                    text-align: center;
                    color: #718096;
                    font-size: 12px;
                }
                
                .footer p {
                    margin: 0;
                }
                
                .footer .contact {
                    margin: 5px 0 0 0;
                }
                
                @media print {
                    body {
                        margin: 0;
                        padding: 15px;
                    }
                    
                    .container {
                        padding: 0;
                    }
                    
                    @page {
                        margin: 1cm;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>REPORTE DE VEHÍCULO</h1>
                    <p>Sistema de Gestión de Mantenimiento Automotriz</p>
                    <p class="date">Fecha de generación: ${currentDate}</p>
                </div>
                
                <div class="content">
                    <div class="vehicle-info">
                        <h2>Información del Vehículo</h2>
                        <div class="info-grid">
                            <div class="info-item">
                                <strong>Placa:</strong>
                                <span>${vehicle.plateNumber || 'No especificada'}</span>
                            </div>
                            <div class="info-item">
                                <strong>Marca:</strong>
                                <span>${vehicle.brand || 'No especificada'}</span>
                            </div>
                            <div class="info-item">
                                <strong>Modelo:</strong>
                                <span>${vehicle.model || 'No especificado'}</span>
                            </div>
                            <div class="info-item">
                                <strong>Tipo:</strong>
                                <span>${vehicle.typeName || 'No especificado'}</span>
                            </div>
                        </div>
                    </div>
                    <div class="image-section">
                        <h3>Imagen del Vehículo</h3>
                        <img src="${imageSrc}" class="vehicle-image" alt="Imagen del vehículo" onerror="this.style.display='none'">
                    </div>
                </div>
                
                <div class="owner-info">
                    <h2>Información del Propietario y Estado</h2>
                    <div class="owner-grid">
                        <div class="owner-item">
                            <strong>Estudiante:</strong>
                            <span>${((vehicle.studentName || '') + ' ' + (vehicle.studentLastName || '')).trim() || 'No asignado'}</span>
                        </div>
                        <div class="owner-item">
                            <strong>Propietario:</strong>
                            <span>${vehicle.ownerName || 'No especificado'}</span>
                        </div>
                        <div class="owner-item">
                            <strong>Teléfono del Propietario:</strong>
                            <span>${vehicle.ownerPhone || 'No especificado'}</span>
                        </div>
                        <div class="owner-item status-item">
                            <strong>Estado:</strong>
                            <span>${statusText}</span>
                        </div>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Este reporte fue generado automáticamente por el Sistema de Gestión de Mantenimiento Automotriz</p>
                    <p class="contact">Para más información, contacte al administrador del sistema</p>
                </div>
            </div>
            
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                        setTimeout(function() {
                            window.close();
                        }, 100);
                    }, 500);
                };
            </script>
        </body>
        </html>
    `;
    
    // Open new window and write content
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
    } else {
        alert('Por favor, permita ventanas emergentes para imprimir el reporte.');
    }
};

window.showVehicleModal = function(vehicleId) {
    const modal = document.getElementById('modalVehiculo');
    modal.classList.add('activo');
    selectedVehicleId = vehicleId;
    const vehicle = allVehicles.find(v => v.vehicleId === vehicleId);
    const tabVehiculo = document.getElementById('tab-vehiculo');
    if (vehicle && tabVehiculo) {
        const imageSrc = vehicle.vehicleImage && vehicle.vehicleImage !== 'null' ? vehicle.vehicleImage : 'imgs/default-car.png';
        
        // Convert status to readable text for modal
        const statusText = getStatusText(vehicle.idStatus);
        
        tabVehiculo.innerHTML = `
            <div class="modal-vehiculo-imagen-container">
                <h4>Imagen del Vehículo</h4>
                <img src="${imageSrc}" class="modal-vehiculo-imagen imagen-vehiculo" alt="Imagen del vehículo">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:24px;">
                <div>
                    <div class="detalle-item">
                        <strong>Placa:</strong>
                        <div class="detalle-valor">${vehicle.plateNumber || '-'}</div>
                    </div>
                    <div class="detalle-item">
                        <strong>Marca:</strong>
                        <div class="detalle-valor">${vehicle.brand || '-'}</div>
                    </div>
                    <div class="detalle-item">
                        <strong>Modelo:</strong>
                        <div class="detalle-valor">${vehicle.model || '-'}</div>
                    </div>
                    <div class="detalle-item">
                        <strong>Tipo:</strong>
                        <div class="detalle-valor">${vehicle.typeName || '-'}</div>
                    </div>
                </div>
                <div>
                    <div class="detalle-item">
                        <strong>Estado:</strong>
                        <div class="detalle-valor">${statusText}</div>
                    </div>
                    <div class="detalle-item">
                        <strong>Estudiante:</strong>
                        <div class="detalle-valor">${(vehicle.studentName || '-') + ' ' + (vehicle.studentLastName || '')}</div>
                    </div>
                    <div class="detalle-item">
                        <strong>Propietario:</strong>
                        <div class="detalle-valor">${vehicle.ownerName || '-'}</div>
                    </div>
                    <div class="detalle-item">
                        <strong>Tel. Propietario:</strong>
                        <div class="detalle-valor">${vehicle.ownerPhone || '-'}</div>
                    </div>
                </div>
            </div>
        `;
    } else if (tabVehiculo) {
        tabVehiculo.innerHTML = '<div style="color:#888;text-align:center;">No se encontraron datos del vehículo.</div>';
    }
}

// Evento para el botón Aprobar
const btnAprobar = document.querySelector('.btn-modal.primario');
if (btnAprobar) {
    btnAprobar.addEventListener('click', function() {
        if (selectedVehicleId && userRole) {
            // Determina el nuevo estado según el rol del usuario
            let newStatusValue;
            if (userRole === 'Animador') {
                newStatusValue = 2;
            } else if (userRole === 'Coordinador') {
                newStatusValue = 3;
            } else {
                // Si no es Animador ni Coordinador, no debería poder aprobar
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Sin permisos',
                        text: 'No tienes permisos para aprobar vehículos.'
                    });
                } else {
                    alert('No tienes permisos para aprobar vehículos');
                }
                return;
            }

            console.log(`Updating vehicle ${selectedVehicleId} to status ${newStatusValue} for role ${userRole}`);

            fetch(`https://sgma-66ec41075156.herokuapp.com/api/vehicles/updateStatusVehicle/${selectedVehicleId}?newStatus=${newStatusValue}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(res => res.json())
            .then(data => {
                // Mostrar SweetAlert de éxito
                const successMessage = userRole === 'Animador' 
                    ? 'El vehículo ha sido enviado a revisión del coordinador.' 
                    : 'El vehículo ha sido aprobado completamente.';
                
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Aprobado',
                        text: successMessage
                    });
                } else {
                    alert(successMessage);
                }
                document.getElementById('modalVehiculo').classList.remove('activo');
                fetchAllVehicles();
            })
            .catch(err => {
                console.error('Error al aprobar vehículo:', err);
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo aprobar el vehículo.'
                    });
                } else {
                    alert('Error al aprobar vehículo');
                }
            });
        }
    });
}

// Evento para el botón Rechazar
const btnRechazar = document.querySelector('.btn-modal.secundario');
if (btnRechazar) {
    btnRechazar.addEventListener('click', function() {
        if (selectedVehicleId && userRole) {
            // Solo Animador y Coordinador pueden rechazar vehículos
            if (userRole !== 'Animador' && userRole !== 'Coordinador') {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Sin permisos',
                        text: 'No tienes permisos para rechazar vehículos.'
                    });
                } else {
                    alert('No tienes permisos para rechazar vehículos');
                }
                return;
            }

            // Confirmar la acción de rechazo
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: '¿Estás seguro?',
                    text: 'Esta acción rechazará permanentemente el vehículo.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#e74c3c',
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: 'Sí, rechazar',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        executeReject();
                    }
                });
            } else {
                if (confirm('¿Estás seguro de que quieres rechazar este vehículo?')) {
                    executeReject();
                }
            }

            function executeReject() {
                console.log(`Rejecting vehicle ${selectedVehicleId} by ${userRole}`);

                fetch(`https://sgma-66ec41075156.herokuapp.com/api/vehicles/updateStatusVehicle/${selectedVehicleId}?newStatus=4`, {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(res => res.json())
                .then(data => {
                    // Mostrar SweetAlert de éxito
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            icon: 'success',
                            title: 'Vehículo Rechazado',
                            text: 'El vehículo ha sido rechazado exitosamente.'
                        });
                    } else {
                        alert('El vehículo ha sido rechazado exitosamente');
                    }
                    document.getElementById('modalVehiculo').classList.remove('activo');
                    fetchAllVehicles();
                })
                .catch(err => {
                    console.error('Error al rechazar vehículo:', err);
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'No se pudo rechazar el vehículo.'
                        });
                    } else {
                        alert('Error al rechazar vehículo');
                    }
                });
            }
        }
    });
}

// Variables globales para órdenes de trabajo
let allWorkOrders = [];
let selectedWorkOrderId = null;
let workOrderSeleccionada = null;

// Obtiene órdenes de trabajo según el rol del instructor
function fetchWorkOrdersByRole() {
    console.log('Ejecutando fetchWorkOrdersByRole para rol:', userRole);
    
    let endpoint = '';
    if (userRole === 'Animador') {
        endpoint = 'https://sgma-66ec41075156.herokuapp.com/api/workOrders/getWorkOrdersByStatus1';
    } else if (userRole === 'Coordinador') {
        endpoint = 'https://sgma-66ec41075156.herokuapp.com/api/workOrders/getWorkOrdersByStatus2';
    } else {
        console.log('Rol no válido para órdenes de trabajo:', userRole);
        renderSidebarWorkOrders([]);
        return;
    }

    fetch(endpoint, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => {
        console.log('Respuesta recibida de órdenes de trabajo:', res);
        return res.json();
    })
    .then(data => {
        console.log('Datos de órdenes de trabajo:', data);
        
        let workOrders = [];
        if (data && data.workOrders && Array.isArray(data.workOrders)) {
            workOrders = data.workOrders;
        }
        
        allWorkOrders = workOrders;
        renderSidebarWorkOrders(workOrders);
    })
    .catch(err => {
        console.error('Error al obtener órdenes de trabajo:', err);
        allWorkOrders = [];
        renderSidebarWorkOrders([]);
    });
}

// Renderiza órdenes de trabajo en la lista lateral
function renderSidebarWorkOrders(workOrders) {
    const lista = document.getElementById('work-orders-list');
    const badge = document.getElementById('work-orders-badge');
    
    if (!lista) return;
    
    if (badge) badge.textContent = workOrders.length;
    lista.innerHTML = '';
    
    if (workOrders.length === 0) {
        lista.innerHTML = '<div style="text-align:center;color:#888;">No hay órdenes pendientes.</div>';
        return;
    }
    
    workOrders.forEach(workOrder => {
        let imgSrc = workOrder.workOrderImage;
        if (!imgSrc || imgSrc === 'null' || imgSrc === null || imgSrc === 'sin_imagen') {
            imgSrc = 'imgs/default-car.png';
        }
        
        const div = document.createElement('div');
        div.className = 'item-registro';
        div.__workOrderData = workOrder;
        div.innerHTML = `
            <img src="${imgSrc}" alt="Orden" class="vehiculo-imagen" onerror="this.src='imgs/default-car.png'">
            <div class="info-vehiculo">
                <span class="placa-vehiculo">Orden #${workOrder.workOrderId}</span>
                <span class="servicio-vehiculo">${workOrder.vehiclePlateNumber || 'Sin placa'}</span>
                <span class="fecha-vehiculo">${workOrder.moduleName || 'Sin módulo'}</span>
            </div>
            <div class="acciones-vehiculo">
                <button class="btn-opciones" title="Más opciones">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </div>
        `;
        
        div.addEventListener('click', function(e) {
            if (!e.target.closest('.btn-opciones')) {
                showWorkOrderModal(workOrder.workOrderId);
            }
        });
        
        lista.appendChild(div);
    });
}

// Convierte ID de estado de orden a texto legible
function getWorkOrderStatusText(statusId) {
    switch(statusId) {
        case 1:
            return 'En aprobación del animador';
        case 2:
            return 'En aprobación del coordinador';
        case 3:
            return 'Aprobado - En progreso';
        case 4:
            return 'Completado';
        case 5:
            return 'Rechazado';
        case 6:
            return 'Atrasado';
        default:
            return 'Estado desconocido';
    }
}

// Muestra el modal de detalles de la orden de trabajo
window.showWorkOrderModal = function(workOrderId) {
    const modal = document.getElementById('modalWorkOrder');
    modal.classList.add('activo');
    modal.removeAttribute('aria-hidden');
    
    document.body.classList.add('modal-open');
    
    selectedWorkOrderId = workOrderId;
    
    const workOrder = allWorkOrders.find(wo => wo.workOrderId === workOrderId);
    workOrderSeleccionada = workOrder;
    
    const workOrderContent = document.getElementById('work-order-content');
    
    if (workOrder && workOrderContent) {
        const imageSrc = workOrder.workOrderImage && workOrder.workOrderImage !== 'null' && workOrder.workOrderImage !== 'sin_imagen' 
            ? workOrder.workOrderImage 
            : 'imgs/default-car.png';
        
        const statusText = getWorkOrderStatusText(workOrder.idStatus);
        
        workOrderContent.innerHTML = `
            <div class="modal-vehiculo-imagen-container">
                <h4>Imagen de la Orden de Trabajo</h4>
                <img src="${imageSrc}" class="modal-vehiculo-imagen imagen-vehiculo" alt="Imagen de la orden">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:24px;">
                <div>
                    <div class="detalle-item"><strong>Orden ID:</strong> <div class="detalle-valor">#${workOrder.workOrderId}</div></div>
                    <div class="detalle-item"><strong>Estado:</strong> <div class="detalle-valor">${statusText}</div></div>
                    <div class="detalle-item"><strong>Vehículo:</strong> <div class="detalle-valor">${workOrder.vehiclePlateNumber || '-'}</div></div>
                    <div class="detalle-item"><strong>Marca/Modelo:</strong> <div class="detalle-valor">${workOrder.vehicleBrand || '-'} ${workOrder.vehicleModel || '-'}</div></div>
                </div>
                <div>
                    <div class="detalle-item"><strong>Módulo:</strong> <div class="detalle-valor">${workOrder.moduleName || '-'}</div></div>
                    <div class="detalle-item"><strong>Código Módulo:</strong> <div class="detalle-valor">${workOrder.moduleCode || '-'}</div></div>
                    <div class="detalle-item"><strong>Tiempo Estimado:</strong> <div class="detalle-valor">${workOrder.estimatedTime || '-'} horas</div></div>
                    <div class="detalle-item"><strong>Año:</strong> <div class="detalle-valor">${workOrder.vehicleYear || 'No especificado'}</div></div>
                </div>
            </div>
            ${workOrder.description ? `
                <div style="margin-top:20px;">
                    <div class="detalle-item"><strong>Descripción del Trabajo:</strong></div>
                    <div style="padding:15px;background:#f7fafc;border-radius:8px;margin-top:8px;border-left:4px solid #42A5F5;">
                        <p style="margin:0;line-height:1.5;color:#2d3748;">${workOrder.description}</p>
                    </div>
                </div>
            ` : ''}
            <div style="margin-top:20px;padding:15px;background:#f7fafc;border-radius:8px;border:1px solid #e2e8f0;">
                <div class="detalle-item"><strong>Información Adicional:</strong></div>
                <div style="margin-top:10px;display:grid;grid-template-columns:1fr 1fr;gap:15px;">
                    <div><strong>Estado Nombre:</strong> ${workOrder.statusName || '-'}</div>
                    <div><strong>ID Vehículo:</strong> ${workOrder.vehicleId || '-'}</div>
                </div>
            </div>
        `;
    } else if (workOrderContent) {
        workOrderContent.innerHTML = '<div style="color:#888;text-align:center;">No se encontraron los datos de la orden.</div>';
    }
}

// Función genérica para actualizar el estado de una orden de trabajo
async function updateOrderStatus(orderId, newStatus) {
    const response = await fetch(`https://sgma-66ec41075156.herokuapp.com/api/workOrders/${orderId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ idStatus: newStatus })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el estado');
    }

    return response.json();
}

// Función para cerrar modales
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('activo');
        modal.removeAttribute('aria-hidden');
        document.body.classList.remove('modal-open');
    }
}

// Event listeners para el modal de órdenes de trabajo
function bindWorkOrderEventListeners() {
    // Cierre del Modal de órdenes de trabajo
    const btnCerrarWorkOrderModal = document.getElementById('btn-cerrar-work-order-modal');
    if (btnCerrarWorkOrderModal) {
        btnCerrarWorkOrderModal.addEventListener('click', () => {
            closeModal('modalWorkOrder');
        });
    }

    const modalWorkOrderOverlay = document.getElementById('modalWorkOrder');
    if (modalWorkOrderOverlay) {
        modalWorkOrderOverlay.addEventListener('click', function(e) {
            if (e.target === modalWorkOrderOverlay) {
                closeModal('modalWorkOrder');
            }
        });
    }

    // Botón de aprobar orden
    const btnAprobarOrden = document.getElementById('btn-aprobar-orden');
    if (btnAprobarOrden) {
        btnAprobarOrden.addEventListener('click', async function() {
            if (!workOrderSeleccionada) return;
            
            try {
                const newStatus = userRole === 'Animador' ? 2 : 3;
                await updateOrderStatus(workOrderSeleccionada.workOrderId, newStatus);
                
                if (typeof Swal !== 'undefined') {
                    await Swal.fire({
                        icon: 'success',
                        title: '¡Éxito!',
                        text: 'Orden de trabajo aprobada exitosamente',
                        customClass: {
                            popup: 'swal-custom-popup',
                            title: 'swal-custom-title',
                            content: 'swal-custom-content',
                            confirmButton: 'swal-custom-confirm-button'
                        }
                    });
                } else {
                    alert('Orden de trabajo aprobada exitosamente');
                }
                
                await fetchWorkOrdersByRole();
                closeModal('modalWorkOrder');
                
            } catch (err) {
                console.error('Error al aprobar la orden de trabajo:', err);
                
                if (typeof Swal !== 'undefined') {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Error al aprobar la orden de trabajo: ' + err.message,
                        customClass: {
                            popup: 'swal-custom-popup',
                            title: 'swal-custom-title',
                            content: 'swal-custom-content',
                            confirmButton: 'swal-custom-confirm-button'
                        }
                    });
                } else {
                    alert('Error al aprobar la orden de trabajo');
                }
            }
        });
    }

    // Botón de rechazar orden
    const btnRechazarOrden = document.getElementById('btn-rechazar-orden');
    if (btnRechazarOrden) {
        btnRechazarOrden.addEventListener('click', async function() {
            if (!workOrderSeleccionada) return;
            
            let shouldReject = false;
            if (typeof Swal !== 'undefined') {
                const result = await Swal.fire({
                    icon: 'question',
                    title: '¿Rechazar orden?',
                    text: '¿Estás seguro de que deseas rechazar esta orden de trabajo?',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, rechazar',
                    cancelButtonText: 'Cancelar',
                    customClass: {
                        popup: 'swal-custom-popup',
                        title: 'swal-custom-title',
                        content: 'swal-custom-content',
                        confirmButton: 'swal-custom-confirm-button',
                        cancelButton: 'swal-custom-cancel-button'
                    }
                });
                shouldReject = result.isConfirmed;
            } else {
                shouldReject = confirm('¿Estás seguro de que deseas rechazar esta orden de trabajo?');
            }

            if (shouldReject) {
                try {
                    await updateOrderStatus(workOrderSeleccionada.workOrderId, 5);
                    
                    if (typeof Swal !== 'undefined') {
                        await Swal.fire({
                            icon: 'success',
                            title: '¡Éxito!',
                            text: 'Orden de trabajo rechazada exitosamente',
                            customClass: {
                                popup: 'swal-custom-popup',
                                title: 'swal-custom-title',
                                content: 'swal-custom-content',
                                confirmButton: 'swal-custom-confirm-button'
                            }
                        });
                    } else {
                        alert('Orden de trabajo rechazada exitosamente');
                    }
                    
                    await fetchWorkOrdersByRole();
                    closeModal('modalWorkOrder');
                    
                } catch (err) {
                    console.error('Error al rechazar la orden:', err);
                    
                    if (typeof Swal !== 'undefined') {
                        await Swal.fire({
                            icon: 'error',
                            title: 'Error',  
                            text: 'Error al rechazar la orden: ' + err.message,
                            customClass: {
                                popup: 'swal-custom-popup',
                                title: 'swal-custom-title',
                                content: 'swal-custom-content',
                                confirmButton: 'swal-custom-confirm-button'
                            }
                        });
                    } else {
                        alert('Error al rechazar la orden');
                    }
                }
            }
        });
    }
}

// Function to rebind event listeners after DOM replacement
function bindEventListeners() {
    // Rebind close modal event
    const btnCerrarModal = document.querySelector('.btn-cerrar-modal');
    if (btnCerrarModal) {
        btnCerrarModal.addEventListener('click', function() {
            const modal = document.getElementById('modalVehiculo');
            modal.classList.remove('activo');
        });
    }
    
    // Rebind print button event
    const btnImprimir = document.getElementById('btn-imprimir-reporte');
    if (btnImprimir) {
        btnImprimir.addEventListener('click', function() {
            if (selectedVehicleId) {
                imprimirReporteVehiculo();
            } else {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Sin selección',
                        text: 'No hay un vehículo seleccionado para imprimir.'
                    });
                } else {
                    alert('No hay un vehículo seleccionado para imprimir');
                }
            }
        });
    }
    
    // Rebind search input event
    const searchInput = document.getElementById('buscarRegistro');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            applyFilters();
        });
    }
    
    // Rebind status filter event
    const statusFilter = document.getElementById('filtroEstado');
    if (statusFilter) {
        statusFilter.addEventListener('change', function(e) {
            applyFilters();
        });
    }
    
    // Rebind modal outside click event
    const modalVehiculo = document.getElementById('modalVehiculo');
    if (modalVehiculo) {
        modalVehiculo.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('activo');
            }
        });
    }

    // Rebind approve button event
    const btnAprobar = document.querySelector('.btn-modal.primario');
    if (btnAprobar) {
        btnAprobar.addEventListener('click', function() {
            if (selectedVehicleId && userRole) {
                let newStatusValue;
                if (userRole === 'Animador') {
                    newStatusValue = 2;
                } else if (userRole === 'Coordinador') {
                    newStatusValue = 3;
                } else {
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Sin permisos',
                            text: 'No tienes permisos para aprobar vehículos.'
                        });
                    } else {
                        alert('No tienes permisos para aprobar vehículos');
                    }
                    return;
                }

                fetch(`https://sgma-66ec41075156.herokuapp.com/api/vehicles/updateStatusVehicle/${selectedVehicleId}?newStatus=${newStatusValue}`, {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(res => res.json())
                .then(data => {
                    const successMessage = userRole === 'Animador' 
                        ? 'El vehículo ha sido enviado a revisión del coordinador.' 
                        : 'El vehículo ha sido aprobado completamente.';
                    
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            icon: 'success',
                            title: 'Aprobado',
                            text: successMessage
                        });
                    } else {
                        alert(successMessage);
                    }
                    document.getElementById('modalVehiculo').classList.remove('activo');
                    fetchAllVehicles();
                })
                .catch(err => {
                    console.error('Error al aprobar vehículo:', err);
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'No se pudo aprobar el vehículo.'
                        });
                    } else {
                        alert('Error al aprobar vehículo');
                    }
                });
            }
        });
    }

    // Rebind reject button event
    const btnRechazar = document.querySelector('.btn-modal.secundario');
    if (btnRechazar) {
        btnRechazar.addEventListener('click', function() {
            if (selectedVehicleId && userRole) {
                if (userRole !== 'Animador' && userRole !== 'Coordinador') {
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Sin permisos',
                            text: 'No tienes permisos para rechazar vehículos.'
                        });
                    } else {
                        alert('No tienes permisos para rechazar vehículos');
                    }
                    return;
                }

                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: '¿Estás seguro?',
                        text: 'Esta acción rechazará permanentemente el vehículo.',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#e74c3c',
                        cancelButtonColor: '#6c757d',
                        confirmButtonText: 'Sí, rechazar',
                        cancelButtonText: 'Cancelar'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            executeRejectAfterRestore();
                        }
                    });
                } else {
                    if (confirm('¿Estás seguro de que quieres rechazar este vehículo?')) {
                        executeRejectAfterRestore();
                    }
                }

                function executeRejectAfterRestore() {
                    fetch(`https://sgma-66ec41075156.herokuapp.com/api/vehicles/updateStatusVehicle/${selectedVehicleId}?newStatus=4`, {
                        method: 'PUT',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (typeof Swal !== 'undefined') {
                            Swal.fire({
                                icon: 'success',
                                title: 'Vehículo Rechazado',
                                text: 'El vehículo ha sido rechazado exitosamente.'
                            });
                        } else {
                            alert('El vehículo ha sido rechazado exitosamente');
                        }
                        document.getElementById('modalVehiculo').classList.remove('activo');
                        fetchAllVehicles();
                    })
                    .catch(err => {
                        console.error('Error al rechazar vehículo:', err);
                        if (typeof Swal !== 'undefined') {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'No se pudo rechazar el vehículo.'
                            });
                        } else {
                            alert('Error al rechazar vehículo');
                        }
                    });
                }
            }
        });
    }
}

// Function to apply all active filters
function applyFilters() {
    const searchInput = document.getElementById('buscarRegistro');
    const statusFilter = document.getElementById('filtroEstado');
    
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const statusValue = statusFilter ? statusFilter.value : 'all';
    
    let filteredVehicles = [...allVehicles]; // Create a copy to avoid modifying original
    
    // Apply search filter
    if (searchTerm.length > 0) {
        filteredVehicles = filteredVehicles.filter(vehicle => {
            const plateMatch = (vehicle.plateNumber || '').toLowerCase().includes(searchTerm);
            const brandMatch = (vehicle.brand || '').toLowerCase().includes(searchTerm);
            const modelMatch = (vehicle.model || '').toLowerCase().includes(searchTerm);
            const typeMatch = (vehicle.typeName || '').toLowerCase().includes(searchTerm);
            const studentNameMatch = (vehicle.studentName || '').toLowerCase().includes(searchTerm);
            const studentLastNameMatch = (vehicle.studentLastName || '').toLowerCase().includes(searchTerm);
            const ownerMatch = (vehicle.ownerName || '').toLowerCase().includes(searchTerm);
            const phoneMatch = (vehicle.ownerPhone || '').toLowerCase().includes(searchTerm);
            const statusMatch = getStatusText(vehicle.idStatus).toLowerCase().includes(searchTerm);
            
            return plateMatch || brandMatch || modelMatch || typeMatch || 
                   studentNameMatch || studentLastNameMatch || ownerMatch || 
                   phoneMatch || statusMatch;
        });
    }
    
    // Apply status filter
    if (statusValue !== 'all') {
        const allowedStatuses = statusValue.split(',').map(s => parseInt(s.trim()));
        filteredVehicles = filteredVehicles.filter(vehicle => {
            return allowedStatuses.includes(vehicle.idStatus);
        });
    }
    
    // Render the filtered results
    const tbody = document.querySelector('.tabla-moderna tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    if (!Array.isArray(filteredVehicles) || filteredVehicles.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11" style="text-align:center;">No se encontraron vehículos.</td></tr>`;
        return;
    }
    
    filteredVehicles.forEach(vehicle => {
        const estudiante = (vehicle.studentName || '-') + ' ' + (vehicle.studentLastName || '');
        let imgSrc = vehicle.vehicleImage;
        if (!imgSrc || imgSrc === 'null' || imgSrc === null) {
            imgSrc = 'imgs/default-car.png';
        }
        
        // Convert status to readable text
        const statusText = getStatusText(vehicle.idStatus);
        const statusClass = getStatusClass(vehicle.idStatus);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <input type="checkbox" class="checkbox-row">
            </td>
            <td>${vehicle.plateNumber || '-'}</td>
            <td>${vehicle.brand || '-'}</td>
            <td>${vehicle.model || '-'}</td>
            <td>${vehicle.typeName || '-'}</td>
            <td>
                <span class="estado-badge ${statusClass}">${statusText}</span>
            </td>
            <td>${estudiante.trim() || '-'}</td>
            <td>${vehicle.ownerName || '-'}</td>
            <td>${vehicle.ownerPhone || '-'}</td>
            <td>
                <img src="${imgSrc}" alt="Imagen" class="vehiculo-img" style="width:40px;height:40px;border-radius:6px;border:1px solid #ccc;">
            </td>
            <td>
                <div class="acciones-vehiculo" style="display:flex;gap:8px;">
                    <button class="btn-accion" title="Ver detalles" onclick="showVehicleModal(${vehicle.vehicleId})">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Add event listener for print button
document.addEventListener('DOMContentLoaded', function() {
    bindEventListeners();
    
    // Initialize search functionality
    const searchInput = document.getElementById('buscarRegistro');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            applyFilters();
        });
    }
    
    // Initialize status filter functionality
    const statusFilter = document.getElementById('filtroEstado');
    if (statusFilter) {
        statusFilter.addEventListener('change', function(e) {
            applyFilters();
        });
    }
});

document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded, getting user info...'); // Debug log
    await getUserInfo();
    console.log('User info obtained, fetching vehicles...'); // Debug log
    fetchAllVehicles();
    fetchWorkOrdersByRole(); // Cargar órdenes de trabajo según el rol
    
    // Bind all event listeners
    bindEventListeners();
    bindWorkOrderEventListeners();
});