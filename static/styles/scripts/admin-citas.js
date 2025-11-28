// admin-citas.js - Gestión de Citas
document.addEventListener('DOMContentLoaded', function() {
    // // Verificar sesión
    // verificarSesion();
    
    // Cargar citas
    cargarCitas();
    cargarEstadisticas();
    
    // Event listeners para filtros
    document.getElementById('searchCitas').addEventListener('input', aplicarFiltros);
    document.getElementById('estadoFilter').addEventListener('change', aplicarFiltros);
    document.getElementById('fechaFilter').addEventListener('change', aplicarFiltros);
    document.getElementById('sortCitas').addEventListener('change', aplicarFiltros);
});

// function verificarSesion() {
//     const adminSession = localStorage.getItem('adminSession');
//     if (!adminSession) {
//         window.location.href = 'admin-login.html';
//         return;
//     }
    
//     const admin = JSON.parse(adminSession);
//     document.getElementById('adminUserName').textContent = admin.usuario;
// }

// function cerrarSesion() {
//     if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
//         localStorage.removeItem('adminSession');
//         window.location.href = 'admin-login.html';
//     }
// }

// Datos estáticos de ejemplo de citas
function obtenerCitasEstaticas() {
    return [
        {
            id: 1,
            fecha: '2025-01-28',
            hora: '10:00',
            municipio: 'Pachuca de Soto',
            contacto: 'Ing. Roberto Martínez',
            telefono: '7711234567',
            email: 'roberto.martinez@pachuca.gob.mx',
            tipoReunion: 'Presentación de servicios',
            estado: 'confirmada',
            notas: 'Interesados en actualización cartográfica'
        },
        {
            id: 2,
            fecha: '2025-01-28',
            hora: '14:30',
            municipio: 'Tulancingo de Bravo',
            contacto: 'Lic. Ana García',
            telefono: '7759876543',
            email: 'ana.garcia@tulancingo.gob.mx',
            tipoReunion: 'Seguimiento de propuesta',
            estado: 'confirmada',
            notas: 'Segunda reunión - revisión de cotización'
        },
        {
            id: 3,
            fecha: '2025-01-29',
            hora: '09:00',
            municipio: 'Mineral de la Reforma',
            contacto: 'Arq. Carlos Sánchez',
            telefono: '7712345678',
            email: 'carlos.sanchez@reforma.gob.mx',
            tipoReunion: 'Demostración de sistema',
            estado: 'pendiente',
            notas: 'Requieren ver el sistema de gestión catastral'
        },
        {
            id: 4,
            fecha: '2025-01-29',
            hora: '11:30',
            municipio: 'Tizayuca',
            contacto: 'Ing. Patricia López',
            telefono: '7798765432',
            email: 'patricia.lopez@tizayuca.gob.mx',
            tipoReunion: 'Consultoría técnica',
            estado: 'pendiente',
            notas: 'Dudas sobre proceso de modernización'
        },
        {
            id: 5,
            fecha: '2025-01-30',
            hora: '10:00',
            municipio: 'Huejutla de Reyes',
            contacto: 'Lic. Miguel Hernández',
            telefono: '7891234567',
            email: 'miguel.hernandez@huejutla.gob.mx',
            tipoReunion: 'Presentación de servicios',
            estado: 'confirmada',
            notas: 'Primer contacto - diagnóstico inicial'
        },
        {
            id: 6,
            fecha: '2025-01-30',
            hora: '15:00',
            municipio: 'Actopan',
            contacto: 'Ing. Laura Torres',
            telefono: '7721234567',
            email: 'laura.torres@actopan.gob.mx',
            tipoReunion: 'Firma de contrato',
            estado: 'confirmada',
            notas: 'Firma de contrato para minería catastral'
        },
        {
            id: 7,
            fecha: '2025-02-03',
            hora: '09:30',
            municipio: 'Tula de Allende',
            contacto: 'Arq. Fernando Ramírez',
            telefono: '7731234567',
            email: 'fernando.ramirez@tula.gob.mx',
            tipoReunion: 'Presentación de servicios',
            estado: 'pendiente',
            notas: 'Interesados en actualización cartográfica'
        },
        {
            id: 8,
            fecha: '2025-02-05',
            hora: '11:00',
            municipio: 'Ixmiquilpan',
            contacto: 'Lic. Gabriela Mendoza',
            telefono: '7591234567',
            email: 'gabriela.mendoza@ixmiquilpan.gob.mx',
            tipoReunion: 'Seguimiento de propuesta',
            estado: 'pendiente',
            notas: 'Revisión de propuesta económica'
        },
        {
            id: 9,
            fecha: '2025-01-22',
            hora: '10:00',
            municipio: 'Tepeji del Río',
            contacto: 'Ing. Ricardo Morales',
            telefono: '7611234567',
            email: 'ricardo.morales@tepeji.gob.mx',
            tipoReunion: 'Seguimiento de proyecto',
            estado: 'completada',
            notas: 'Proyecto de digitalización completado'
        },
        {
            id: 10,
            fecha: '2025-01-20',
            hora: '14:00',
            municipio: 'Zempoala',
            contacto: 'Lic. Sandra Vázquez',
            telefono: '7431234567',
            email: 'sandra.vazquez@zempoala.gob.mx',
            tipoReunion: 'Consultoría técnica',
            estado: 'completada',
            notas: 'Asesoría sobre sistema de cobro'
        },
        {
            id: 11,
            fecha: '2025-01-15',
            hora: '09:00',
            municipio: 'Tepeapulco',
            contacto: 'Ing. Jorge Castillo',
            telefono: '7451234567',
            email: 'jorge.castillo@tepeapulco.gob.mx',
            tipoReunion: 'Presentación de servicios',
            estado: 'cancelada',
            notas: 'Cancelada por el cliente - reprogramar'
        },
        {
            id: 12,
            fecha: '2025-02-10',
            hora: '10:30',
            municipio: 'Apan',
            contacto: 'Arq. Monica Ruiz',
            telefono: '7481234567',
            email: 'monica.ruiz@apan.gob.mx',
            tipoReunion: 'Demostración de sistema',
            estado: 'pendiente',
            notas: 'Interesados en sistema de gestión catastral'
        }
    ];
}

function cargarEstadisticas() {
    const citas = obtenerCitasEstaticas();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    // Total de citas del mes actual
    const mesActual = hoy.getMonth();
    const citasMes = citas.filter(c => new Date(c.fecha).getMonth() === mesActual);
    document.getElementById('totalCitas').textContent = citasMes.length;
    
    // Citas pendientes
    const pendientes = citas.filter(c => c.estado === 'pendiente').length;
    document.getElementById('citasPendientes').textContent = pendientes;
    
    // Citas confirmadas
    const confirmadas = citas.filter(c => c.estado === 'confirmada').length;
    document.getElementById('citasConfirmadas').textContent = confirmadas;
    
    // Citas de hoy
    const citasHoy = citas.filter(c => {
        const fechaCita = new Date(c.fecha);
        return fechaCita.toDateString() === hoy.toDateString();
    }).length;
    document.getElementById('citasHoy').textContent = citasHoy;
}

function cargarCitas() {
    let citas = obtenerCitasEstaticas();
    
    // Ordenar por fecha (próximas primero)
    citas.sort((a, b) => {
        const fechaA = new Date(a.fecha + ' ' + a.hora);
        const fechaB = new Date(b.fecha + ' ' + b.hora);
        return fechaA - fechaB;
    });
    
    mostrarCitas(citas);
}

function aplicarFiltros() {
    let citas = obtenerCitasEstaticas();
    
    // Filtro de búsqueda
    const searchTerm = document.getElementById('searchCitas').value.toLowerCase();
    if (searchTerm) {
        citas = citas.filter(c =>
            c.municipio.toLowerCase().includes(searchTerm) ||
            c.contacto.toLowerCase().includes(searchTerm) ||
            c.telefono.includes(searchTerm) ||
            c.email.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filtro de estado
    const estadoFiltro = document.getElementById('estadoFilter').value;
    if (estadoFiltro) {
        citas = citas.filter(c => c.estado === estadoFiltro);
    }
    
    // Filtro de fecha
    const fechaFiltro = document.getElementById('fechaFilter').value;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaFiltro === 'hoy') {
        citas = citas.filter(c => {
            const fechaCita = new Date(c.fecha);
            return fechaCita.toDateString() === hoy.toDateString();
        });
    } else if (fechaFiltro === 'semana') {
        const finSemana = new Date(hoy);
        finSemana.setDate(hoy.getDate() + 7);
        citas = citas.filter(c => {
            const fechaCita = new Date(c.fecha);
            return fechaCita >= hoy && fechaCita <= finSemana;
        });
    } else if (fechaFiltro === 'mes') {
        const mesActual = hoy.getMonth();
        citas = citas.filter(c => new Date(c.fecha).getMonth() === mesActual);
    } else if (fechaFiltro === 'proximas') {
        citas = citas.filter(c => new Date(c.fecha) >= hoy);
    }
    
    // Ordenamiento
    const sortValue = document.getElementById('sortCitas').value;
    switch(sortValue) {
        case 'fecha-asc':
            citas.sort((a, b) => new Date(a.fecha + ' ' + a.hora) - new Date(b.fecha + ' ' + b.hora));
            break;
        case 'fecha-desc':
            citas.sort((a, b) => new Date(b.fecha + ' ' + b.hora) - new Date(a.fecha + ' ' + a.hora));
            break;
        case 'municipio-asc':
            citas.sort((a, b) => a.municipio.localeCompare(b.municipio));
            break;
        case 'estado-asc':
            citas.sort((a, b) => a.estado.localeCompare(b.estado));
            break;
    }
    
    mostrarCitas(citas);
}

function mostrarCitas(citas) {
    const tbody = document.getElementById('citasTableBody');
    tbody.innerHTML = '';
    
    if (citas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 3rem; color: #6b7280;">No se encontraron citas</td></tr>';
        return;
    }
    
    citas.forEach(cita => {
        const fecha = new Date(cita.fecha);
        const fechaFormateada = fecha.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        
        const estadoBadge = obtenerEstadoBadge(cita.estado);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>#${cita.id}</strong></td>
            <td>
                <div style="font-weight: 600;">${fechaFormateada}</div>
                <div style="font-size: 0.85rem; color: #6b7280;">${cita.hora}</div>
            </td>
            <td>
                <div style="font-weight: 600;">${cita.municipio}</div>
            </td>
            <td>
                <div style="font-weight: 500;">${cita.contacto}</div>
                <div style="font-size: 0.85rem; color: #6b7280;">${cita.email}</div>
            </td>
            <td>${cita.telefono}</td>
            <td><span style="font-size: 0.9rem;">${cita.tipoReunion}</span></td>
            <td><span class="table-badge ${estadoBadge.class}">${estadoBadge.text}</span></td>
            <td>
                <div class="table-actions-cell">
                    <button class="btn-icon" onclick="verDetalleCita(${cita.id})" title="Ver detalle">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 3C4 3 1 8 1 8C1 8 4 13 8 13C12 13 15 8 15 8C15 8 12 3 8 3Z" stroke="currentColor" stroke-width="2"/>
                            <circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                    <button class="btn-icon" onclick="editarCita(${cita.id})" title="Editar">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M11 2L14 5L5 14H2V11L11 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="btn-icon" onclick="eliminarCita(${cita.id})" title="Eliminar" style="color: #EF4444;">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 4H13M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6 7V11M10 7V11M4 4H12V13C12 13.5523 11.5523 14 11 14H5C4.44772 14 4 13.5523 4 13V4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Mostrar paginación simple
    mostrarPaginacion(citas.length);
}

function obtenerEstadoBadge(estado) {
    const badges = {
        'pendiente': { text: 'PENDIENTE', class: 'badge-low' },
        'confirmada': { text: 'CONFIRMADA', class: 'badge-high' },
        'completada': { text: 'COMPLETADA', class: 'badge-medium' },
        'cancelada': { text: 'CANCELADA', class: 'badge-critical' }
    };
    return badges[estado] || { text: estado.toUpperCase(), class: 'badge-low' };
}

function mostrarPaginacion(total) {
    const pagination = document.getElementById('paginationCitas');
    pagination.innerHTML = '';
    
    const totalPages = Math.ceil(total / 10);
    
    if (totalPages > 1) {
        // Botón anterior
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn';
        prevBtn.textContent = '« Anterior';
        prevBtn.disabled = true;
        pagination.appendChild(prevBtn);
        
        // Páginas
        for (let i = 1; i <= Math.min(totalPages, 5); i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = 'pagination-btn' + (i === 1 ? ' active' : '');
            pageBtn.textContent = i;
            pagination.appendChild(pageBtn);
        }
        
        // Botón siguiente
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn';
        nextBtn.textContent = 'Siguiente »';
        nextBtn.disabled = totalPages === 1;
        pagination.appendChild(nextBtn);
    }
}

function verDetalleCita(id) {
    const citas = obtenerCitasEstaticas();
    const cita = citas.find(c => c.id === id);
    
    if (cita) {
        const fecha = new Date(cita.fecha);
        const fechaFormateada = fecha.toLocaleDateString('es-MX', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        alert(`DETALLE DE CITA #${cita.id}

📅 Fecha: ${fechaFormateada}
⏰ Hora: ${cita.hora}

🏛️ Municipio: ${cita.municipio}
👤 Contacto: ${cita.contacto}
📧 Email: ${cita.email}
📱 Teléfono: ${cita.telefono}

📋 Tipo de reunión: ${cita.tipoReunion}
📊 Estado: ${cita.estado.toUpperCase()}

📝 Notas:
${cita.notas || 'Sin notas adicionales'}

En la versión completa, se abriría un modal con toda la información y opciones para confirmar, reprogramar o cancelar la cita.`);
    }
}

function editarCita(id) {
    alert(`Editar cita #${id}\n\nEsta funcionalidad abriría un formulario para modificar los detalles de la cita.`);
}

function eliminarCita(id) {
    if (confirm(`¿Está seguro de que desea eliminar la cita #${id}?\n\nEsta acción no se puede deshacer.`)) {
        alert(`Cita #${id} eliminada correctamente.\n\nEn la versión completa, esto eliminaría la cita de la base de datos.`);
        cargarCitas();
    }
}

function nuevaCita() {
    alert(`NUEVA CITA

Esta funcionalidad abriría un formulario para programar una nueva cita con los siguientes campos:

• Municipio
• Contacto
• Teléfono
• Email
• Fecha y hora
• Tipo de reunión
• Notas adicionales

El sistema enviaría automáticamente un correo de confirmación.`);
}

function exportarCitas() {
    alert(`EXPORTAR CITAS

Esta funcionalidad permitiría exportar el listado de citas en:

• Excel (.xlsx)
• PDF
• CSV

Incluiría todos los detalles y podría filtrarse por fecha, estado, etc.`);
}

function vistaCalendario() {
    alert(`VISTA DE CALENDARIO

Esta funcionalidad mostraría las citas en un calendario interactivo donde:

• Se pueden ver todas las citas del mes
• Click en un día para ver citas programadas
• Arrastrar y soltar para reprogramar
• Diferentes colores según el estado
• Vista mensual, semanal y diaria

Esta vista facilitaría la gestión visual de todas las citas.`);
}

// Hacer funciones globales
window.cerrarSesion = cerrarSesion;
window.verDetalleCita = verDetalleCita;
window.editarCita = editarCita;
window.eliminarCita = eliminarCita;
window.nuevaCita = nuevaCita;
window.exportarCitas = exportarCitas;
window.vistaCalendario = vistaCalendario;