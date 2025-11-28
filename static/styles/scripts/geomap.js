// geomap.js - Mapa Interactivo de México
document.addEventListener('DOMContentLoaded', function() {
    cargarMunicipiosEnMapa();
    configurarBusqueda();
    actualizarContadores();
});

function cargarMunicipiosEnMapa() {
    const evaluaciones = obtenerTodasEvaluaciones();
    const lista = document.getElementById('mapMunicipalitiesList');
    lista.innerHTML = '';
    
    evaluaciones.forEach(e => {
        const nivel = obtenerNivelMadurez(e.calificacion_total);
        const markerClass = obtenerMarkerClass(nivel);
        
        const item = document.createElement('div');
        item.className = 'map-municipality-item';
        item.setAttribute('data-id', e.id);
        item.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span class="legend-marker ${markerClass}"></span>
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #0F1F45;">${e.municipio}</div>
                    <div style="font-size: 0.85rem; color: #6b7280;">${e.estado}</div>
                </div>
                <div style="font-weight: 700; color: #0F1F45; font-size: 1.1rem;">${e.calificacion_total}</div>
            </div>
        `;
        
        item.addEventListener('click', () => {
            seleccionarMunicipio(e);
            // Remover active de todos
            document.querySelectorAll('.map-municipality-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
        
        lista.appendChild(item);
    });
}

function seleccionarMunicipio(evaluacion) {
    const panel = document.getElementById('mapInfoPanel');
    const content = document.getElementById('panelContent');
    
    const nivel = obtenerNivelMadurez(evaluacion.calificacion_total);
    const badgeClass = obtenerBadgeClass(nivel);
    const fecha = new Date(evaluacion.fecha).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    content.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
            <h2 style="font-size: 1.5rem; color: #0F1F45; margin-bottom: 0.5rem;">${evaluacion.municipio}</h2>
            <p style="color: #6b7280; margin-bottom: 1rem;">${evaluacion.estado}</p>
            <span class="table-badge ${badgeClass}">${nivel.toUpperCase()}</span>
        </div>
        
        <div style="background: linear-gradient(135deg, #0F1F45 0%, #1a2f5a 100%); padding: 2rem; border-radius: 8px; text-align: center; margin-bottom: 1.5rem;">
            <div style="color: rgba(255,255,255,0.8); font-size: 0.9rem; margin-bottom: 0.5rem;">Calificación General</div>
            <div style="color: white; font-size: 3rem; font-weight: 700;">${evaluacion.calificacion_total}</div>
            <div style="color: rgba(255,255,255,0.9); font-size: 0.95rem;">de 100 puntos</div>
        </div>
        
        <div style="background: #f9fafb; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <h3 style="font-size: 1.1rem; margin-bottom: 1rem; color: #0F1F45;">Métricas por Área</h3>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #6b7280;">Cartografía</span>
                    <strong style="color: #0F1F45;">${Math.floor(evaluacion.calificacion_total * 0.25)}/25</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #6b7280;">Padrón Catastral</span>
                    <strong style="color: #0F1F45;">${Math.floor(evaluacion.calificacion_total * 0.25)}/25</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #6b7280;">Tecnología</span>
                    <strong style="color: #0F1F45;">${Math.floor(evaluacion.calificacion_total * 0.25)}/25</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #6b7280;">Digitalización</span>
                    <strong style="color: #0F1F45;">${Math.floor(evaluacion.calificacion_total * 0.25)}/25</strong>
                </div>
            </div>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <div style="color: #6b7280; font-size: 0.85rem; margin-bottom: 0.25rem;">Fecha de evaluación</div>
            <div style="color: #1f2937; font-weight: 500;">${fecha}</div>
        </div>
        
        <button class="btn btn-primary btn-full" onclick="verDetalleCompleto(${evaluacion.id})">
            Ver Diagnóstico Completo
        </button>
    `;
    
    panel.style.display = 'block';
}

function cerrarInfoPanel() {
    document.getElementById('mapInfoPanel').style.display = 'none';
    document.querySelectorAll('.map-municipality-item').forEach(i => i.classList.remove('active'));
}

function configurarBusqueda() {
    const searchInput = document.getElementById('mapSearch');
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.map-municipality-item');
        
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    });
}

function actualizarContadores() {
    const evaluaciones = obtenerTodasEvaluaciones();
    
    const contadores = {
        alto: evaluaciones.filter(e => e.calificacion_total >= 75).length,
        medio: evaluaciones.filter(e => e.calificacion_total >= 50 && e.calificacion_total < 75).length,
        bajo: evaluaciones.filter(e => e.calificacion_total >= 25 && e.calificacion_total < 50).length,
        critico: evaluaciones.filter(e => e.calificacion_total < 25).length
    };
    
    document.getElementById('countAlto').textContent = contadores.alto;
    document.getElementById('countMedio').textContent = contadores.medio;
    document.getElementById('countBajo').textContent = contadores.bajo;
    document.getElementById('countCritico').textContent = contadores.critico;
}

function mostrarInstrucciones() {
    alert(`INSTRUCCIONES DEL MAPA INTERACTIVO

1. BUSCAR MUNICIPIOS
   - Usa la barra de búsqueda en el sidebar
   - Escribe el nombre del municipio o estado

2. VER INFORMACIÓN
   - Haz clic en cualquier municipio de la lista
   - Se abrirá un panel con el diagnóstico

3. NAVEGAR EL MAPA
   - Usa los controles de zoom (+/-)
   - Click en "Reset" para volver a la vista original

4. LEYENDA DE COLORES
   🟢 Verde - Alto (75-100)
   🔵 Azul - Medio (50-74)
   🟡 Amarillo - Bajo (25-49)
   🔴 Rojo - Crítico (0-24)

5. VER DETALLES
   - Click en "Ver Diagnóstico Completo"
   - Accede al análisis detallado`);
}

function zoomIn() {
    alert('Función de zoom in - En desarrollo\n\nEsta funcionalidad acercará el mapa para ver detalles.');
}

function zoomOut() {
    alert('Función de zoom out - En desarrollo\n\nEsta funcionalidad alejará el mapa para ver más área.');
}

function resetMap() {
    cerrarInfoPanel();
    alert('Mapa restaurado a la vista original');
}

function verDetalleCompleto(id) {
    alert(`Redirigiendo al diagnóstico completo del municipio ID: ${id}\n\nEsta funcionalidad abriría la página de resultados detallados.`);
    // En producción: window.location.href = `resultados.html?id=${id}`;
}

function obtenerTodasEvaluaciones() {
    const guardadas = JSON.parse(localStorage.getItem('evaluacionCatastral') || 'null');
    const ejemplos = [
        { id: 1, municipio: 'Tulancingo', estado: 'Hidalgo', calificacion_total: 67, fecha: '2025-01-20T10:00:00' },
        { id: 2, municipio: 'Pachuca', estado: 'Hidalgo', calificacion_total: 82, fecha: '2025-01-18T14:30:00' },
        { id: 3, municipio: 'Huejutla', estado: 'Hidalgo', calificacion_total: 45, fecha: '2025-01-15T09:15:00' },
        { id: 4, municipio: 'Tizayuca', estado: 'Hidalgo', calificacion_total: 58, fecha: '2025-01-12T16:45:00' },
        { id: 5, municipio: 'Mineral de la Reforma', estado: 'Hidalgo', calificacion_total: 75, fecha: '2025-01-10T11:20:00' },
        { id: 6, municipio: 'Toluca', estado: 'Estado de México', calificacion_total: 78, fecha: '2025-01-08T10:00:00' },
        { id: 7, municipio: 'Ecatepec', estado: 'Estado de México', calificacion_total: 52, fecha: '2025-01-05T15:30:00' },
        { id: 8, municipio: 'Querétaro', estado: 'Querétaro', calificacion_total: 88, fecha: '2025-01-03T12:00:00' }
    ];
    
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

function obtenerMarkerClass(nivel) {
    const classes = {
        'alto': 'marker-high',
        'medio': 'marker-medium',
        'bajo': 'marker-low',
        'crítico': 'marker-critical'
    };
    return classes[nivel] || 'marker-low';
}

function cerrarSesion() {
    fetch('/api/logout', {
        method: 'POST',
        credentials: 'include', // importante si usas cookies/sesiones
        headers: {
        'Content-Type': 'application/json'
        }
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
        // Redirige al login o a donde tú quieras
        window.location.href = '/admin-login';
        } else {
        alert('No se pudo cerrar la sesión');
        }
    })
    .catch(err => console.error('Error al cerrar sesión:', err));
}

// Hacer funciones globales
window.cerrarInfoPanel = cerrarInfoPanel;
window.mostrarInstrucciones = mostrarInstrucciones;
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
window.resetMap = resetMap;
window.verDetalleCompleto = verDetalleCompleto;
