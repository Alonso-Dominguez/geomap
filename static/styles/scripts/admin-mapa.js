// admin-mapa.js - Mapa Administrativo con Información Detallada
let adminMap;
let currentFilter = 'todos';
let selectedMunicipality = null;

document.addEventListener('DOMContentLoaded', function() {
    verificarSesion();
    inicializarMapaAdmin();
    cargarMunicipiosEnLista();
    configurarBuscador();
});

// function verificarSesion() {
//     const adminSession = localStorage.getItem('adminSession');
//     if (!adminSession) {
//         window.location.href = '/admin-login';
//         return;
//     }
//     const admin = JSON.parse(adminSession);
//     document.getElementById('adminUserName').textContent = admin.usuario;
// }

// function cerrarSesion() {
//     if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
//         fetch('/api/logout', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' }
//         })
//         .then(() => {
//             localStorage.removeItem('adminSession');
//             window.location.href = '/admin-login';
//         });
//     }
// }

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

function inicializarMapaAdmin() {
    const bounds = [
        [21.3, -100.1],  // Norte-Oeste
        [19.5, -97.5]    // Sur-Este
    ];

    adminMap = L.map("adminMapCanvas", {
        crs: L.CRS.EPSG3857,
        minZoom: 7,
        maxZoom: 12
    }).setView([20.28, -98.96], 9);

    adminMap.setMaxBounds(bounds);

    // Cargar imagen base
    L.imageOverlay("/static/assets/hidalgo_mapa.webp", bounds).addTo(adminMap);

    // Cargar GeoJSON con municipios
    const urlHidalgoGeoJSON = "https://raw.githubusercontent.com/DenilsonBarbosa/geojson-mexico/master/hidalgo.geojson";

    fetch(urlHidalgoGeoJSON)
        .then(res => res.json())
        .then(data => {
            L.geoJSON(data, {
                style: {
                    color: "#0F1F45",
                    weight: 1.5,
                    fillColor: "#ffffff00",
                    fillOpacity: 0.0
                },
                onEachFeature: function (feature, layer) {
                    layer.on('click', function() {
                        const municipio = feature.properties.name;
                        seleccionarMunicipioPorNombre(municipio);
                    });

                    layer.bindPopup(
                        `<strong>Municipio:</strong> ${feature.properties.name}<br>
                         <button onclick="seleccionarMunicipioPorNombre('${feature.properties.name}')" 
                                 style="margin-top:8px;padding:4px 12px;background:#0F1F45;color:white;border:none;border-radius:4px;cursor:pointer;">
                             Ver Detalles
                         </button>`
                    );
                }
            }).addTo(adminMap);
        });
}

function cargarMunicipiosEnLista() {
    const evaluaciones = obtenerEvaluaciones();
    const lista = document.getElementById('municipalitiesMapList');
    lista.innerHTML = '';

    // Actualizar estadísticas
    document.getElementById('totalMunicipiosMap').textContent = evaluaciones.length;
    const promedio = evaluaciones.length > 0
        ? Math.round(evaluaciones.reduce((sum, e) => sum + e.calificacion_total, 0) / evaluaciones.length)
        : 0;
    document.getElementById('promedioMap').textContent = promedio;

    evaluaciones.forEach(e => {
        const nivel = obtenerNivelMadurez(e.calificacion_total);
        
        // Aplicar filtro
        if (currentFilter !== 'todos' && nivel !== currentFilter) {
            return;
        }

        const item = document.createElement('div');
        item.className = 'municipality-item';
        item.setAttribute('data-id', e.id);
        item.setAttribute('data-nivel', nivel);
        item.innerHTML = `
            <div class="municipality-header">
                <div class="municipality-name-sm">${e.municipio}</div>
                <div class="municipality-score-sm">${e.calificacion_total}</div>
            </div>
            <div class="municipality-state-sm">${e.estado}</div>
        `;
        
        item.addEventListener('click', () => seleccionarMunicipio(e));
        lista.appendChild(item);
    });
}

function seleccionarMunicipio(evaluacion) {
    selectedMunicipality = evaluacion;

    // Actualizar clase activa en la lista
    document.querySelectorAll('.municipality-item').forEach(item => {
        item.classList.remove('active');
        if (parseInt(item.getAttribute('data-id')) === evaluacion.id) {
            item.classList.add('active');
        }
    });

    // Ocultar panel vacío y mostrar panel de detalles
    document.getElementById('infoPanelEmpty').style.display = 'none';
    document.getElementById('municipalityDetailPanel').style.display = 'block';

    // Llenar información
    document.getElementById('detailMunicipioNombre').textContent = evaluacion.municipio;
    document.getElementById('detailMunicipioEstado').textContent = evaluacion.estado;
    document.getElementById('detailMunicipioScore').textContent = evaluacion.calificacion_total;

    // Métricas (calculadas aproximadamente)
    const cart = Math.floor(evaluacion.calificacion_total * 0.25);
    const pad = Math.floor(evaluacion.calificacion_total * 0.25);
    const tec = Math.floor(evaluacion.calificacion_total * 0.25);
    const dig = Math.floor(evaluacion.calificacion_total * 0.25);

    document.getElementById('detailCartografia').textContent = `${cart} / 25`;
    document.getElementById('detailPadron').textContent = `${pad} / 25`;
    document.getElementById('detailTecnologia').textContent = `${tec} / 25`;
    document.getElementById('detailDigitalizacion').textContent = `${dig} / 25`;
// Información adicional
const fecha = new Date(evaluacion.fecha).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});
document.getElementById('detailFecha').textContent = fecha;

const nivel = obtenerNivelMadurez(evaluacion.calificacion_total);
document.getElementById('detailNivel').textContent = nivel.toUpperCase();
document.getElementById('detailPoblacion').textContent = evaluacion.poblacion || 'No especificada';

// Centrar mapa en el municipio (si está disponible)
// adminMap.setView([lat, lng], 11);
}
function seleccionarMunicipioPorNombre(nombreMunicipio) {
const evaluaciones = obtenerEvaluaciones();
const evaluacion = evaluaciones.find(e =>
e.municipio.toLowerCase().includes(nombreMunicipio.toLowerCase())
);
if (evaluacion) {
    seleccionarMunicipio(evaluacion);
    
    // Scroll al item en la lista
    const item = document.querySelector(`[data-id="${evaluacion.id}"]`);
    if (item) {
        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
} else {
    alert(`No se encontró información de evaluación para ${nombreMunicipio}`);
}
}
function configurarBuscador() {
const searchInput = document.getElementById('searchMapMunicipios');
searchInput.addEventListener('input', function(e) {
const searchTerm = e.target.value.toLowerCase();
const items = document.querySelectorAll('.municipality-item');
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
function filtrarPorNivel(nivel) {
currentFilter = nivel;
// Actualizar tabs activos
document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.classList.remove('active');
});
event.target.classList.add('active');

// Recargar lista con filtro
cargarMunicipiosEnLista();
}
function zoomInMap() {
adminMap.zoomIn();
}
function zoomOutMap() {
adminMap.zoomOut();
}
function resetMapView() {
adminMap.setView([20.28, -98.96], 9);
}
function verDiagnosticoCompleto() {
if (selectedMunicipality) {
alert('Ver diagnóstico completo de ${selectedMunicipality.municipio}\n\nEn producción, esto abriría una vista detallada con todo el diagnóstico.');
// En producción: window.location.href = /resultados?id=${selectedMunicipality.id};
}
}
function generarReporteMunicipio() {
if (selectedMunicipality) {
alert('Generando reporte PDF para ${selectedMunicipality.municipio}\n\nEn producción, esto generaría y descargaría un PDF con toda la información.');
}
}
function programarCita() {
if (selectedMunicipality) {
alert('Programar cita con ${selectedMunicipality.municipio}\n\nEn producción, esto abriría el formulario de citas prellenado.');
// En producción: window.location.href = /admin-citas?municipio=${selectedMunicipality.municipio};
}
}
function exportarDatosMapa() {
    // Obtener todas las evaluaciones del mapa
    const evaluaciones = obtenerEvaluaciones();
    
    if (evaluaciones.length === 0) {
        alert('No hay datos para exportar');
        return;
    }
    
    // Definir los encabezados del CSV
    const headers = ['ID', 'Municipio', 'Estado', 'Población', 'Calificación Total', 'Nivel de Madurez', 'Fecha de Evaluación'];
    
    // Crear filas del CSV
    const rows = evaluaciones.map(eval => [
        eval.id,
        eval.municipio,
        eval.estado,
        eval.poblacion || 'N/A',
        eval.calificacion_total,
        obtenerNivelMadurez(eval.calificacion_total),
        new Date(eval.fecha).toLocaleDateString('es-MX')
    ]);
    
    // Generar CSV
    generarYDescargarCSV(headers, rows, 'mapa_municipios_' + new Date().toISOString().slice(0, 10) + '.csv');
}

// Función auxiliar para generar y descargar CSV
function generarYDescargarCSV(headers, rows, nombreArchivo) {
    // Crear contenido CSV con formato adecuado
    let csvContent = headers.map(header => `"${header}"`).join(',') + '\n';
    
    rows.forEach(row => {
        csvContent += row.map(cell => {
            // Escapar comillas y envolver celdas en comillas
            const cellStr = String(cell).replace(/"/g, '""');
            return `"${cellStr}"`;
        }).join(',') + '\n';
    });
    
    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', nombreArchivo);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
function obtenerEvaluaciones() {
const guardadas = JSON.parse(localStorage.getItem('evaluacionCatastral') || 'null');
const ejemplos = [
{ id: 1, municipio: 'Tulancingo', estado: 'Hidalgo', calificacion_total: 67, fecha: '2025-01-20T10:00:00', poblacion: '50,000 - 100,000' },
{ id: 2, municipio: 'Pachuca', estado: 'Hidalgo', calificacion_total: 82, fecha: '2025-01-18T14:30:00', poblacion: '100,000 - 500,000' },
{ id: 3, municipio: 'Huejutla', estado: 'Hidalgo', calificacion_total: 45, fecha: '2025-01-15T09:15:00', poblacion: '50,000 - 100,000' },
{ id: 4, municipio: 'Tizayuca', estado: 'Hidalgo', calificacion_total: 58, fecha: '2025-01-12T16:45:00', poblacion: '100,000 - 500,000' },
{ id: 5, municipio: 'Mineral de la Reforma', estado: 'Hidalgo', calificacion_total: 75, fecha: '2025-01-10T11:20:00', poblacion: '100,000 - 500,000' }
];
if (guardadas) {
    const evaluacion = {
        id: Date.now(),
        municipio: guardadas.municipio,
        estado: guardadas.estado || 'Hidalgo',
        calificacion_total: calcularCalificacion(guardadas),
        fecha: guardadas.fecha,
        poblacion: guardadas.poblacion
    };
    return [evaluacion, ...ejemplos];
}

return ejemplos;
}
function calcularCalificacion(datos) {
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
// Hacer funciones globales
window.cerrarSesion = cerrarSesion;
window.filtrarPorNivel = filtrarPorNivel;
window.zoomInMap = zoomInMap;
window.zoomOutMap = zoomOutMap;
window.resetMapView = resetMapView;
window.verDiagnosticoCompleto = verDiagnosticoCompleto;
window.generarReporteMunicipio = generarReporteMunicipio;
window.programarCita = programarCita;
window.exportarDatosMapa = exportarDatosMapa;
window.seleccionarMunicipioPorNombre = seleccionarMunicipioPorNombre;