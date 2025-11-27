// resultados.js - Página de Resultados
document.addEventListener('DOMContentLoaded', function() {
    // Logo placeholder
    const logoImg = document.getElementById('logo-iuca');
    if (logoImg && !logoImg.complete) {
        logoImg.onerror = function() {
            const svgLogo = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svgLogo.setAttribute('width', '40');
            svgLogo.setAttribute('height', '40');
            svgLogo.setAttribute('viewBox', '0 0 40 40');
            svgLogo.innerHTML = '<rect width="40" height="40" fill="#0F1F45"/><text x="50%" y="50%" fill="#FFFFFF" font-weight="700" font-size="16" text-anchor="middle" dominant-baseline="middle">I</text>';
            logoImg.parentNode.replaceChild(svgLogo, logoImg);
        };
    }

    // Recuperar datos del localStorage
    const datos = JSON.parse(localStorage.getItem('evaluacionCatastral'));
    
    if (!datos) {
        // Si no hay datos, redirigir a la evaluación
        window.location.href = 'evaluacion.html';
        return;
    }

    // Mostrar información básica
    document.getElementById('municipioNombre').textContent = datos.municipio;
    const fecha = new Date(datos.fecha);
    document.getElementById('fechaDiagnostico').textContent = fecha.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Calcular puntuaciones
    const scores = calcularPuntuaciones(datos);
    
    // Actualizar calificación general
    mostrarCalificacionGeneral(scores.total);
    
    // Actualizar métricas individuales
    actualizarMetricas(scores);
    
    // Generar observaciones
    generarObservaciones(datos, scores);
    
    // Generar recomendaciones
    generarRecomendaciones(datos, scores);
    
    // Generar plan de acción
    generarPlanAccion(datos, scores);
});

function calcularPuntuaciones(datos) {
    let scoreCartografia = 0;
    let scorePadron = 0;
    let scoreTecnologia = 0;
    let scoreDigitalizacion = 0;

    // Cartografía (0-25 puntos)
    switch(datos.ultimaActualizacion) {
        case 'menos-1': scoreCartografia = 25; break;
        case '1-3': scoreCartografia = 20; break;
        case '3-5': scoreCartografia = 15; break;
        case '5-10': scoreCartografia = 10; break;
        case 'mas-10': scoreCartografia = 5; break;
        case 'nunca': scoreCartografia = 0; break;
    }
    if (datos.tipoCartografia.includes('ortofotos')) scoreCartografia += 5;
    if (datos.tipoCartografia.includes('vectorial')) scoreCartografia += 3;
    if (datos.tipoCartografia.includes('modelos3d')) scoreCartografia += 2;
    scoreCartografia = Math.min(scoreCartografia, 25);

    // Padrón (0-25 puntos)
    switch(datos.estadoPadron) {
        case 'actualizado': scorePadron = 15; break;
        case 'parcial': scorePadron = 10; break;
        case 'desactualizado': scorePadron = 5; break;
        case 'fisico': scorePadron = 3; break;
        case 'inexistente': scorePadron = 0; break;
    }
    switch(datos.rezagoCatastral) {
        case 'no': scorePadron += 10; break;
        case 'bajo': scorePadron += 7; break;
        case 'medio': scorePadron += 4; break;
        case 'alto': scorePadron += 2; break;
        case 'desconoce': scorePadron += 0; break;
    }
    scorePadron = Math.min(scorePadron, 25);

    // Tecnología (0-25 puntos)
    switch(datos.sistemaCatastral) {
        case 'completo': scoreTecnologia = 15; break;
        case 'parcial': scoreTecnologia = 10; break;
        case 'basico': scoreTecnologia = 5; break;
        case 'no': scoreTecnologia = 0; break;
    }
    if (datos.procesosCobro.includes('digital')) scoreTecnologia += 10;
    else if (datos.procesosCobro.includes('mixto')) scoreTecnologia += 5;
    scoreTecnologia = Math.min(scoreTecnologia, 25);

    // Digitalización (0-25 puntos)
    switch(datos.expedientesDigitales) {
        case 'completo': scoreDigitalizacion = 15; break;
        case 'parcial': scoreDigitalizacion = 8; break;
        case 'no': scoreDigitalizacion = 0; break;
    }
    scoreDigitalizacion += Math.min(datos.principalesNecesidades.length * 2, 10);
    scoreDigitalizacion = Math.min(scoreDigitalizacion, 25);

    const total = scoreCartografia + scorePadron + scoreTecnologia + scoreDigitalizacion;

    return {
        cartografia: scoreCartografia,
        padron: scorePadron,
        tecnologia: scoreTecnologia,
        digitalizacion: scoreDigitalizacion,
        total: total
    };
}

function mostrarCalificacionGeneral(score) {
    const scoreValue = document.getElementById('scoreValue');
    const scoreLevel = document.getElementById('scoreLevel');
    const scoreLevelText = document.getElementById('scoreLevelText');
    const scoreDescription = document.getElementById('scoreDescription');
    const scoreCircle = document.getElementById('scoreCircle');

    // Animar el círculo
    const circumference = 2 * Math.PI * 90;
    const offset = circumference - (score / 100) * circumference;
    
    setTimeout(() => {
        scoreCircle.style.strokeDashoffset = offset;
        scoreValue.textContent = score;
    }, 200);

    // Determinar nivel
    let nivel, nivelTexto, descripcion, badgeClass;
    if (score >= 75) {
        nivel = 'ALTO';
        nivelTexto = 'Madurez Catastral Alta';
        descripcion = 'Su municipio cuenta con una infraestructura catastral sólida. Se recomienda mantenimiento y mejoras continuas.';
        badgeClass = 'badge-high';
    } else if (score >= 50) {
        nivel = 'MEDIO';
        nivelTexto = 'Madurez Catastral Media';
        descripcion = 'Su municipio tiene una base catastral funcional pero requiere actualizaciones importantes para optimizar procesos.';
        badgeClass = 'badge-medium';
    } else if (score >= 25) {
        nivel = 'BAJO';
        nivelTexto = 'Madurez Catastral Baja';
        descripcion = 'Su municipio necesita una modernización integral del catastro para mejorar la recaudación y eficiencia.';
        badgeClass = 'badge-low';
    } else {
        nivel = 'CRÍTICO';
        nivelTexto = 'Situación Crítica';
        descripcion = 'Se requiere una transformación completa del sistema catastral. IUCA puede ayudarle a establecer las bases necesarias.';
        badgeClass = 'badge-critical';
    }

    scoreLevel.querySelector('.level-badge').textContent = nivel;
    scoreLevel.querySelector('.level-badge').className = 'level-badge ' + badgeClass;
    scoreLevelText.textContent = nivelTexto;
    scoreDescription.textContent = descripcion;
}

function actualizarMetricas(scores) {
    actualizarMetrica('Cartografia', scores.cartografia, 25);
    actualizarMetrica('Padron', scores.padron, 25);
    actualizarMetrica('Tecnologia', scores.tecnologia, 25);
    actualizarMetrica('Digitalizacion', scores.digitalizacion, 25);
}

function actualizarMetrica(nombre, valor, max) {
    const scoreElement = document.getElementById('metric' + nombre);
    const barElement = document.getElementById('bar' + nombre);
    
    const percentage = (valor / max) * 100;
    
    scoreElement.textContent = `${valor}/${max}`;
    
    setTimeout(() => {
        barElement.style.width = percentage + '%';
    }, 300);
}

function generarObservaciones(datos, scores) {
    const observationsList = document.getElementById('observationsList');
    const observaciones = [];

    if (scores.cartografia < 15) {
        observaciones.push('La cartografía municipal requiere actualización urgente. Una base cartográfica desactualizada afecta la gestión territorial y la recaudación.');
    }
    if (scores.padron < 15) {
        observaciones.push('El padrón catastral presenta inconsistencias significativas que deben ser corregidas mediante minería catastral.');
    }
    if (scores.tecnologia < 15) {
        observaciones.push('Los sistemas tecnológicos actuales son insuficientes. Se recomienda la implementación de plataformas modernas de gestión catastral.');
    }
    if (scores.digitalizacion < 15) {
        observaciones.push('La digitalización de expedientes es limitada, lo que genera ineficiencias operativas y demoras en los procesos.');
    }
    if (datos.rezagoCatastral === 'alto' || datos.rezagoCatastral === 'desconoce') {
        observaciones.push('Existe un probable rezago catastral significativo que impacta directamente en los ingresos municipales.');
    }

    if (observaciones.length === 0) {
        observaciones.push('El municipio cuenta con una base catastral sólida. Se recomienda mantenimiento preventivo y mejora continua.');
    }

    observaciones.forEach(obs => {
        const item = document.createElement('div');
        item.className = 'observation-item';
        item.innerHTML = `
            <div class="observation-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#B0BAE0" stroke-width="2"/>
                    <path d="M12 8V12M12 16H12.01" stroke="#0F1F45" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </div>
            <div class="observation-text">${obs}</div>
        `;
        observationsList.appendChild(item);
    });
}

function generarRecomendaciones(datos, scores) {
    const recommendationsList = document.getElementById('recommendationsList');
    const recomendaciones = [];

    if (scores.cartografia < 20) {
        recomendaciones.push({
            titulo: 'Actualización Cartográfica',
            descripcion: 'Levantamiento aéreo fotogramétrico para generar ortofotos de alta resolución, modelos 3D y cartografía vectorial actualizada del municipio.'
        });
    }

    if (scores.padron < 20 || datos.rezagoCatastral !== 'no') {
        recomendaciones.push({
            titulo: 'Minería Catastral',
            descripcion: 'Análisis exhaustivo del padrón catastral para identificar inconsistencias, duplicados, omisiones y oportunidades de incremento en la recaudación.'
        });
    }

    if (scores.tecnologia < 20) {
        recomendaciones.push({
            titulo: 'Sistema de Gestión Catastral',
            descripcion: 'Implementación de plataforma integral para la administración catastral con módulos de consulta, actualización y gestión de predios.'
        });
    }

    if (datos.procesosCobro.includes('ventanilla') || datos.procesosCobro.includes('mixto')) {
        recomendaciones.push({
            titulo: 'Sistema de Cobro Automatizado',
            descripcion: 'Plataforma digital de cobro con integración bancaria, pagos en línea y generación automática de recibos y estados de cuenta.'
        });
    }

    if (scores.digitalizacion < 15) {
        recomendaciones.push({
            titulo: 'Digitalización de Expedientes',
            descripcion: 'Gestor documental para la digitalización, indexación y consulta ágil de expedientes catastrales históricos y actuales.'
        });
    }

    if (datos.principalesNecesidades.includes('verificacion-predios')) {
        recomendaciones.push({
            titulo: 'Verificaciones en Campo',
            descripcion: 'Servicio de inspección y verificación física de predios con tecnología GPS y captura de evidencia fotográfica georreferenciada.'
        });
    }

    if (recomendaciones.length === 0) {
        recomendaciones.push({
            titulo: 'Consultoría de Optimización',
            descripcion: 'Asesoría especializada para optimizar procesos existentes y mantener la excelencia en la gestión catastral municipal.'
        });
    }

    recomendaciones.forEach(rec => {
        const item = document.createElement('div');
        item.className = 'recommendation-item';
        item.innerHTML = `
            <div class="recommendation-header">
                <div class="recommendation-icon">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="14" fill="#B0BAE0" opacity="0.3"/>
                        <path d="M16 10V16L20 18" stroke="#0F1F45" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </div>
                <h3 class="recommendation-title">${rec.titulo}</h3>
            </div>
            <p class="recommendation-description">${rec.descripcion}</p>
        `;
        recommendationsList.appendChild(item);
    });
}

function generarPlanAccion(datos, scores) {
    const phase1List = document.getElementById('phase1List');
    const phase2List = document.getElementById('phase2List');
    const phase3List = document.getElementById('phase3List');

    const fase1 = [];
    const fase2 = [];
    const fase3 = [];

    if (scores.total < 50) {
        fase1.push('Diagnóstico detallado de la situación actual del catastro');
        fase1.push('Análisis de minería catastral para identificar oportunidades inmediatas');
        fase2.push('Actualización cartográfica mediante levantamiento aéreo');
        fase2.push('Implementación de sistema básico de gestión catastral');
        fase3.push('Digitalización completa de expedientes');
        fase3.push('Capacitación del personal en nuevas herramientas');
    } else if (scores.total < 75) {
        fase1.push('Evaluación de sistemas actuales y plan de mejora');
        fase1.push('Actualización de cartografía en zonas prioritarias');
        fase2.push('Integración de módulos faltantes en sistema catastral');
        fase2.push('Verificación en campo de predios con inconsistencias');
        fase3.push('Automatización completa de procesos de cobro');
        fase3.push('Implementación de portal ciudadano de consultas');
    } else {
        fase1.push('Auditoría de calidad de datos catastrales');
        fase1.push('Optimización de procesos existentes');
        fase2.push('Actualización tecnológica de plataformas');
        fase2.push('Implementación de analítica avanzada de datos');
        fase3.push('Desarrollo de aplicaciones móviles para inspectores');
        fase3.push('Integración con sistemas estatales y federales');
    }

    fase1.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        phase1List.appendChild(li);
    });

    fase2.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        phase2List.appendChild(li);
    });

    fase3.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        phase3List.appendChild(li);
    });
}

// Función para exportar a PDF (simulada)
function exportarPDF() {
    alert('Funcionalidad de exportación a PDF.\n\nEn la versión completa, este botón generaría un archivo PDF con todo el diagnóstico, recomendaciones y plan de acción.\n\nPor ahora, puede usar la función de imprimir del navegador (Ctrl+P) y seleccionar "Guardar como PDF".');
    window.print();
}

// Hacer la función global
window.exportarPDF = exportarPDF;
