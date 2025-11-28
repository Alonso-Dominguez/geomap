// admin-municipios.js - Lista de Municipios
document.addEventListener('DOMContentLoaded', function() {
    // Verificar sesión
    verificarSesion();
    
    // Cargar datos
    cargarFiltros();
    cargarMunicipios();
    
    // Event listeners para filtros
    document.getElementById('searchFilter').addEventListener('input', aplicarFiltros);
    document.getElementById('estadoFilterList').addEventListener('change', aplicarFiltros);
    document.getElementById('nivelFilter').addEventListener('change', aplicarFiltros);
    document.getElementById('sortFilter').addEventListener('change', aplicarFiltros);
});

function verificarSesion() {
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    const admin = JSON.parse(adminSession);
    document.getElementById('adminUserName').textContent = admin.usuario;
}

function cerrarSesion() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        // Llamar a la API del servidor para cerrar sesión
        fetch('/api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Sesión cerrada en el servidor:', data.message);
        })
        .catch(error => {
            console.error('Error al cerrar sesión en el servidor:', error);
        })
        .finally(() => {
            // Limpiar localStorage y redirigir
            localStorage.removeItem('adminSession');
            window.location.href = '/admin-login';
        });
    }
}

function cargarFiltros() {
    // Llenar select de estados
    const evaluaciones = obtenerTodasEvaluaciones();
    const estados = [...new Set(evaluaciones.map(e => e.estado))].sort();
    
    const select = document.getElementById('estadoFilterList');
    estados.forEach(estado => {
        const option = document.createElement('option');
        option.value = estado;
        option.textContent = estado;
        select.appendChild(option);
    });
}

function cargarMunicipios() {
    let evaluaciones = obtenerTodasEvaluaciones();
    
    // Aplicar ordenamiento por defecto
    evaluaciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    mostrarMunicipios(evaluaciones);
}

function aplicarFiltros() {
    let evaluaciones = obtenerTodasEvaluaciones();
    
    // Filtro de búsqueda
    const searchTerm = document.getElementById('searchFilter').value.toLowerCase();
    if (searchTerm) {
        evaluaciones = evaluaciones.filter(e =>
            e.municipio.toLowerCase().includes(searchTerm) ||
            e.estado.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filtro de estado
    const estadoFiltro = document.getElementById('estadoFilterList').value;
    if (estadoFiltro) {
        evaluaciones = evaluaciones.filter(e => e.estado === estadoFiltro);
    }
    
    // Filtro de nivel
    const nivelFiltro = document.getElementById('nivelFilter').value;
    if (nivelFiltro) {
        evaluaciones = evaluaciones.filter(e => obtenerNivelMadurez(e.calificacion_total) === nivelFiltro);
    }
    
    // Ordenamiento
    const sortValue = document.getElementById('sortFilter').value;
    switch(sortValue) {
        case 'fecha-desc':
            evaluaciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            break;
        case 'fecha-asc':
            evaluaciones.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
            break;
        case 'calificacion-desc':
            evaluaciones.sort((a, b) => b.calificacion_total - a.calificacion_total);
            break;
        case 'calificacion-asc':
            evaluaciones.sort((a, b) => a.calificacion_total - b.calificacion_total);
            break;
        case 'nombre-asc':
            evaluaciones.sort((a, b) => a.municipio.localeCompare(b.municipio));
            break;
    }
    
    mostrarMunicipios(evaluaciones);
}

function mostrarMunicipios(evaluaciones) {
    const grid = document.getElementById('municipalitiesGrid');
    grid.innerHTML = '';
    
    if (evaluaciones.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #6b7280;">No se encontraron municipios</p>';
        return;
    }
    
    evaluaciones.forEach(e => {
        const nivel = obtenerNivelMadurez(e.calificacion_total);
        const badgeClass = obtenerBadgeClass(nivel);
        const fecha = new Date(e.fecha).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const card = document.createElement('div');
        card.className = 'municipality-card';
        card.onclick = () => verDetalle(e.id);
        card.innerHTML = `
            <div class="municipality-header">
                <div>
                    <div class="municipality-name">${e.municipio}</div>
                    <div class="municipality-state">${e.estado}</div>
                </div>
                <div class="municipality-score">${e.calificacion_total}</div>
            </div>
            <div class="municipality-metrics">
                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                    <span style="color: #6b7280;">Nivel:</span>
                    <span class="table-badge ${badgeClass}">${nivel.toUpperCase()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                    <span style="color: #6b7280;">Cartografía:</span>
                    <strong>${Math.floor(e.calificacion_total * 0.25)}/25</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                    <span style="color: #6b7280;">Padrón:</span>
                    <strong>${Math.floor(e.calificacion_total * 0.25)}/25</strong>
                </div>
            </div>
            <div class="municipality-date">Evaluado el ${fecha}</div>
        `;
        grid.appendChild(card);
    });
    
    // Paginación simple
    mostrarPaginacion(evaluaciones.length);
}

function mostrarPaginacion(total) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    const totalPages = Math.ceil(total / 9);
    
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

function obtenerTodasEvaluaciones() {
    // Reutilizar la función del dashboard
    const guardadas = JSON.parse(localStorage.getItem('evaluacionCatastral') || 'null');
    const ejemplos = obtenerEjemplos();
    
    if (guardadas) {
        const evaluacion = {
            id: Date.now(),
            municipio: guardadas.municipio,
            estado: guardadas.estado || 'Hidalgo',
            calificacion_total: calcularCalificacionDesdeGuardado(guardadas),
            fecha: guardadas.fecha
        };
        return [evaluacion, ...ejemplos];
    }
    
    return ejemplos;
}

function obtenerEjemplos() {
    return [
        { id: 1, municipio: 'Tulancingo', estado: 'Hidalgo', calificacion_total: 67, fecha: '2025-01-20T10:00:00' },
        { id: 2, municipio: 'Pachuca', estado: 'Hidalgo', calificacion_total: 82, fecha: '2025-01-18T14:30:00' },
        { id: 3, municipio: 'Huejutla', estado: 'Hidalgo', calificacion_total: 45, fecha: '2025-01-15T09:15:00' },
        { id: 4, municipio: 'Tizayuca', estado: 'Hidalgo', calificacion_total: 58, fecha: '2025-01-12T16:45:00' },
        { id: 5, municipio: 'Mineral de la Reforma', estado: 'Hidalgo', calificacion_total: 75, fecha: '2025-01-10T11:20:00' },
        { id: 6, municipio: 'Toluca', estado: 'Estado de México', calificacion_total: 78, fecha: '2025-01-08T10:00:00' },
        { id: 7, municipio: 'Ecatepec', estado: 'Estado de México', calificacion_total: 52, fecha: '2025-01-05T15:30:00' },
        { id: 8, municipio: 'Querétaro', estado: 'Querétaro', calificacion_total: 88, fecha: '2025-01-03T12:00:00' },
        { id: 9, municipio: 'Tepeji del Río', estado: 'Hidalgo', calificacion_total: 63, fecha: '2025-01-01T09:00:00' }
    ];
}

function calcularCalificacionDesdeGuardado(datos) {
    let score = 0;
    const años = { 'menos-1': 25, '1-3': 20, '3-5': 15, '5-10': 10, 'mas-10': 5, 'nunca': 0 };
    score += años[datos.ultimaActualizacion] || 0;
    const padron = { 'actualizado': 15, 'parcial': 10, 'desactualizado': 5, 'fisico': 3, 'inexistente': 0 };
    score += padron[datos.estadoPadron] || 0;
    const sistema = { 'completo': 15, 'parcial': 10, 'basico': 5, 'no': 0 };
    score += sistema[datos.sistemaCatastral] || 0;
    const expedientes = { 'completo': 15, 'parcial': 8, 'no': 0 };
    score += expedientes[datos.expedientesDigitales] || 0;
    return Math.min(score, 100);
}

function obtenerNivelMadurez(score) {
    if (score >= 75) return 'alto';
    if (score >= 50) return 'medio';
    if (score >= 25) return 'bajo';
    return 'crítico';
}

function obtenerBadgeClass(nivel) {
    const classes = {
        'alto': 'badge-high',
        'medio': 'badge-medium',
        'bajo': 'badge-low',
        'crítico': 'badge-critical'
    };
    return classes[nivel] || 'badge-low';
}

function verDetalle(id) {
    alert(`Ver detalle completo del municipio ID: ${id}\n\nEsta funcionalidad abrirá una vista con todo el diagnóstico.`);
}

function exportarListado() {
    alert('Exportar listado a Excel o PDF\n\nEsta funcionalidad generaría un archivo con todos los municipios y sus calificaciones.');
}

// Hacer funciones globales
window.cerrarSesion = cerrarSesion;
window.verDetalle = verDetalle;
window.exportarListado = exportarListado;
