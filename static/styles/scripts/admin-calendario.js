// admin-calendario.js - Gestión del Calendario de Citas

let currentDate = new Date();
let citasData = [];

document.addEventListener('DOMContentLoaded', function() {
    cargarCitas();
    renderCalendar();
});

// Obtener las citas (usando la misma función que admin-citas.js)
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

function cargarCitas() {
    citasData = obtenerCitasEstaticas();
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Actualizar título del mes
    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    document.getElementById('calendarMonth').textContent = `${monthNames[month]} ${year}`;
    
    // Obtener el primer día del mes y el total de días
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Obtener días del mes anterior
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    
    // Agregar días del mes anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const dayNum = prevMonthLastDay - i;
        const dayDiv = createDayElement(dayNum, true, year, month - 1);
        calendarGrid.appendChild(dayDiv);
    }
    
    // Agregar días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = createDayElement(day, false, year, month);
        calendarGrid.appendChild(dayDiv);
    }
    
    // Agregar días del siguiente mes para completar la grilla
    const remainingCells = 42 - (startingDayOfWeek + daysInMonth);
    for (let day = 1; day <= remainingCells; day++) {
        const dayDiv = createDayElement(day, true, year, month + 1);
        calendarGrid.appendChild(dayDiv);
    }
}

function createDayElement(dayNum, isOtherMonth, year, month) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';
    
    if (isOtherMonth) {
        dayDiv.classList.add('other-month');
    }
    
    // Crear fecha del día
    const dayDate = new Date(year, month, dayNum);
    const dateString = formatDateToString(dayDate);
    
    // Verificar si es hoy
    const today = new Date();
    if (dayDate.toDateString() === today.toDateString()) {
        dayDiv.classList.add('today');
    }
    
    // Obtener citas del día
    const dayCitas = citasData.filter(cita => cita.fecha === dateString);
    
    // Si hay citas, agregar clase y puntos
    if (dayCitas.length > 0 && !isOtherMonth) {
        dayDiv.classList.add('has-citas');
        
        // Crear número del día
        const dayNumber = document.createElement('div');
        dayNumber.className = 'calendar-day-number';
        dayNumber.textContent = dayNum;
        dayDiv.appendChild(dayNumber);
        
        // Crear contenedor de puntos
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'calendar-day-dots';
        
        // Agregar puntos por cada cita (máximo 4 visibles)
        dayCitas.slice(0, 4).forEach(cita => {
            const dot = document.createElement('div');
            dot.className = `calendar-dot ${cita.estado}`;
            dotsContainer.appendChild(dot);
        });
        
        dayDiv.appendChild(dotsContainer);
        
        // Agregar contador si hay más de 4 citas
        if (dayCitas.length > 4) {
            const count = document.createElement('div');
            count.className = 'calendar-citas-count';
            count.textContent = `+${dayCitas.length - 4} más`;
            dayDiv.appendChild(count);
        } else if (dayCitas.length > 0) {
            const count = document.createElement('div');
            count.className = 'calendar-citas-count';
            count.textContent = `${dayCitas.length} cita${dayCitas.length > 1 ? 's' : ''}`;
            dayDiv.appendChild(count);
        }
        
        // Evento click para mostrar detalles
        dayDiv.addEventListener('click', () => showDayDetails(dayDate, dayCitas));
    } else {
        // Días sin citas
        const dayNumber = document.createElement('div');
        dayNumber.className = 'calendar-day-number';
        dayNumber.textContent = dayNum;
        dayDiv.appendChild(dayNumber);
        
        // Click para crear nueva cita en ese día
        if (!isOtherMonth) {
            dayDiv.addEventListener('click', () => nuevaCitaEnFecha(dateString));
        }
    }
    
    return dayDiv;
}

function formatDateToString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function showDayDetails(date, citas) {
    const modal = document.getElementById('dayDetailsModal');
    const title = document.getElementById('dayDetailsTitle');
    const citasContainer = document.getElementById('dayDetailsCitas');
    
    // Formatear fecha
    const dateFormatted = date.toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    title.textContent = `Citas - ${dateFormatted}`;
    
    // Ordenar citas por hora
    citas.sort((a, b) => a.hora.localeCompare(b.hora));
    
    // Renderizar citas
    citasContainer.innerHTML = '';
    citas.forEach(cita => {
        const citaDiv = document.createElement('div');
        citaDiv.className = `day-cita-item ${cita.estado}`;
        
        const estadoBadge = obtenerEstadoBadge(cita.estado);
        
        citaDiv.innerHTML = `
            <div class="day-cita-time">${cita.hora} - ${cita.tipoReunion}</div>
            <div class="day-cita-info"><strong>Municipio:</strong> ${cita.municipio}</div>
            <div class="day-cita-info"><strong>Contacto:</strong> ${cita.contacto}</div>
            <div class="day-cita-info"><strong>Email:</strong> ${cita.email}</div>
            <div class="day-cita-info"><strong>Teléfono:</strong> ${cita.telefono}</div>
            ${cita.notas ? `<div class="day-cita-info"><strong>Notas:</strong> ${cita.notas}</div>` : ''}
            <span class="day-cita-badge table-badge ${estadoBadge.class}">${estadoBadge.text}</span>
        `;
        
        citasContainer.appendChild(citaDiv);
    });
    
    modal.classList.add('active');
}

function closeDayDetails() {
    const modal = document.getElementById('dayDetailsModal');
    modal.classList.remove('active');
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

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

function todayMonth() {
    currentDate = new Date();
    renderCalendar();
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

function nuevaCitaEnFecha(fecha) {
    alert(`Crear nueva cita para el día ${fecha}

Esta funcionalidad abriría un formulario con la fecha pre-seleccionada.`);
}

function cerrarSesion() {
    fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            window.location.href = '/admin-login';
        } else {
            alert('No se pudo cerrar la sesión');
        }
    })
    .catch(err => console.error('Error al cerrar sesión:', err));
}

// Cerrar modal al hacer click fuera
document.addEventListener('click', function(e) {
    const modal = document.getElementById('dayDetailsModal');
    if (e.target === modal) {
        closeDayDetails();
    }
});

// Hacer funciones globales
window.previousMonth = previousMonth;
window.nextMonth = nextMonth;
window.todayMonth = todayMonth;
window.closeDayDetails = closeDayDetails;
window.nuevaCita = nuevaCita;
window.cerrarSesion = cerrarSesion;