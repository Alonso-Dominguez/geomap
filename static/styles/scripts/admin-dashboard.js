// admin-dashboard.js - Dashboard de Administrador
document.addEventListener('DOMContentLoaded', function() {
    // Verificar sesión
    verificarSesion();
    
    // Cargar datos del dashboard
    cargarEstadisticas();
    cargarGraficoEstados();
    cargarDistribucionMadurez();
    cargarEvaluacionesRecientes();
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
        localStorage.removeItem('adminSession');
        window.location.href = 'admin-login.html';
    }
}

function cargarEstadisticas() {
    // Obtener todas las evaluaciones
    const evaluaciones = obtenerTodasEvaluaciones();
    
    // Total de municipios
    document.getElementById('totalMunicipios').textContent = evaluaciones.length;
    
    // Promedio general
    const promedio = evaluaciones.length > 0
        ? Math.round(evaluaciones.reduce((sum, e) => sum + e.calificacion_total, 0) / evaluaciones.length)
        : 0;
    document.getElementById('promedioGeneral').textContent = promedio;
    
    // Estados cubiertos
    const estados = new Set(evaluaciones.map(e => e.estado));
    document.getElementById('estadosCubiertos').textContent = estados.size;
    
    // Evaluaciones este mes
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const evaluacionesMes = evaluaciones.filter(e => new Date(e.fecha) >= inicioMes).length;
    document.getElementById('evaluacionesMes').textContent = evaluacionesMes;
}

function cargarGraficoEstados() {
    const evaluaciones = obtenerTodasEvaluaciones();
    const estadoCounts = {};
    
    evaluaciones.forEach(e => {
        estadoCounts[e.estado] = (estadoCounts[e.estado] || 0) + 1;
    });
    
    // Top 5 estados
    const topEstados = Object.entries(estadoCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const container = document.getElementById('municipiosPorEstado');
    container.innerHTML = '';
    
    const maxValue = Math.max(...topEstados.map(e => e[1]));
    
    topEstados.forEach(([estado, count]) => {
        const percentage = (count / maxValue) * 100;
        
        const item = document.createElement('div');
        item.className = 'horizontal-bar-item';
        item.innerHTML = `
            <div class="bar-label">
                <span class="bar-name">${estado}</span>
                <span class="bar-value">${count} municipios</span>
            </div>
            <div class="bar-track">
                <div class="bar-fill" style="width: ${percentage}%"></div>
            </div>
        `;
        container.appendChild(item);
    });
}

function cargarDistribucionMadurez() {
    const evaluaciones = obtenerTodasEvaluaciones();
    
    const distribucion = {
        critico: evaluaciones.filter(e => e.calificacion_total < 25).length,
        bajo: evaluaciones.filter(e => e.calificacion_total >= 25 && e.calificacion_total < 50).length,
        medio: evaluaciones.filter(e => e.calificacion_total >= 50 && e.calificacion_total < 75).length,
        alto: evaluaciones.filter(e => e.calificacion_total >= 75).length
    };
    
    document.getElementById('donutTotal').textContent = evaluaciones.length;
    document.getElementById('legendCritical').textContent = distribucion.critico;
    document.getElementById('legendLow').textContent = distribucion.bajo;
    document.getElementById('legendMedium').textContent = distribucion.medio;
    document.getElementById('legendHigh').textContent = distribucion.alto;
    
    // Actualizar el gráfico donut con conic-gradient
    const total = evaluaciones.length;
    if (total > 0) {
        const degrees = {
            critico: (distribucion.critico / total) * 360,
            bajo: (distribucion.bajo / total) * 360,
            medio: (distribucion.medio / total) * 360,
            alto: (distribucion.alto / total) * 360
        };
        
        let deg = 0;
        let gradient = 'conic-gradient(';
        
        if (distribucion.critico > 0) {
            gradient += `#EF4444 ${deg}deg ${deg + degrees.critico}deg, `;
            deg += degrees.critico;
        }
        if (distribucion.bajo > 0) {
            gradient += `#F59E0B ${deg}deg ${deg + degrees.bajo}deg, `;
            deg += degrees.bajo;
        }
        if (distribucion.medio > 0) {
            gradient += `#3B82F6 ${deg}deg ${deg + degrees.medio}deg, `;
            deg += degrees.medio;
        }
        if (distribucion.alto > 0) {
            gradient += `#10B981 ${deg}deg ${deg + degrees.alto}deg`;
        }
        
        gradient += ')';
        
        const donutSegments = document.querySelector('.donut-segments');
        if (donutSegments) {
            donutSegments.style.background = gradient;
        }
    }
}

function cargarEvaluacionesRecientes() {
    const evaluaciones = obtenerTodasEvaluaciones()
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 5);
    
    const tbody = document.getElementById('recentEvaluationsTable');
    tbody.innerHTML = '';
    
    evaluaciones.forEach(e => {
        const fecha = new Date(e.fecha).toLocaleDateString('es-MX');
        const nivel = obtenerNivelMadurez(e.calificacion_total);
        const badgeClass = obtenerBadgeClass(nivel);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${e.municipio}</td>
            <td>${e.estado}</td>
            <td><strong>${e.calificacion_total}</strong></td>
            <td><span class="table-badge ${badgeClass}">${nivel.toUpperCase()}</span></td>
            <td>${fecha}</td>
            <td>
                <div class="table-actions-cell">
                    <button class="btn-icon" onclick="verDetalle('${e.id}')" title="Ver detalle">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 3C4 3 1 8 1 8C1 8 4 13 8 13C12 13 15 8 15 8C15 8 12 3 8 3Z" stroke="currentColor" stroke-width="2"/>
                            <circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function obtenerTodasEvaluaciones() {
    // Obtener evaluaciones guardadas + crear algunas de ejemplo
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
        { id: 8, municipio: 'Querétaro', estado: 'Querétaro', calificacion_total: 88, fecha: '2025-01-03T12:00:00' }
    ];
}

function calcularCalificacionDesdeGuardado(datos) {
    // Simplificado - usar el algoritmo completo de resultados.js sería ideal
    let score = 0;
    
    // Cartografía
    const años = {
        'menos-1': 25, '1-3': 20, '3-5': 15,
        '5-10': 10, 'mas-10': 5, 'nunca': 0
    };
    score += años[datos.ultimaActualizacion] || 0;
    
    // Padrón
    const padron = {
        'actualizado': 15, 'parcial': 10,
        'desactualizado': 5, 'fisico': 3, 'inexistente': 0
    };
    score += padron[datos.estadoPadron] || 0;
    
    // Tecnología
    const sistema = {
        'completo': 15, 'parcial': 10,
        'basico': 5, 'no': 0
    };
    score += sistema[datos.sistemaCatastral] || 0;
    
    // Digital
    const expedientes = {
        'completo': 15, 'parcial': 8, 'no': 0
    };
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
    // Redirigir a página de detalle (puede crearse más adelante)
    alert(`Ver detalle del municipio ID: ${id}\n\nEsta funcionalidad abrirá una vista detallada con toda la información del diagnóstico.`);
}

// Búsqueda en tiempo real
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchMunicipio');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#recentEvaluationsTable tr');
            
            rows.forEach(row => {
                const municipio = row.cells[0].textContent.toLowerCase();
                const estado = row.cells[1].textContent.toLowerCase();
                
                if (municipio.includes(searchTerm) || estado.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
});

// Hacer funciones globales
window.cerrarSesion = cerrarSesion;
window.verDetalle = verDetalle;
