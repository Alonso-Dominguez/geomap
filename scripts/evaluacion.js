// evaluacion.js - Formulario de Evaluación
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('evaluationForm');
    const progressBar = document.getElementById('progressBar');
    
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

    // Actualizar barra de progreso basada en scroll
    function updateProgressBar() {
        const formSections = document.querySelectorAll('.form-section');
        let completedSections = 0;
        
        formSections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            if (rect.top < windowHeight * 0.5) {
                completedSections++;
            }
        });
        
        const progress = (completedSections / formSections.length) * 100;
        progressBar.style.width = progress + '%';
    }

    window.addEventListener('scroll', updateProgressBar);
    updateProgressBar();

    // Validación y guardado del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Recopilar datos del formulario
        const formData = {
            municipio: document.getElementById('municipio').value,
            poblacion: document.getElementById('poblacion').value,
            ultimaActualizacion: document.getElementById('ultimaActualizacion').value,
            tipoCartografia: Array.from(document.querySelectorAll('input[name="tipoCartografia"]:checked')).map(cb => cb.value),
            estadoPadron: document.getElementById('estadoPadron').value,
            prediosRegistrados: document.getElementById('prediosRegistrados').value,
            rezagoCatastral: document.querySelector('input[name="rezagoCatastral"]:checked')?.value,
            sistemaCatastral: document.getElementById('sistemaCatastral').value,
            procesosCobro: Array.from(document.querySelectorAll('input[name="procesosCobro"]:checked')).map(cb => cb.value),
            expedientesDigitales: document.querySelector('input[name="expedientesDigitales"]:checked')?.value,
            principalesNecesidades: Array.from(document.querySelectorAll('input[name="principalesNecesidades"]:checked')).map(cb => cb.value),
            prioridadPrincipal: document.getElementById('prioridadPrincipal').value,
            comentariosAdicionales: document.getElementById('comentariosAdicionales').value,
            fecha: new Date().toISOString()
        };

        // Guardar en localStorage
        localStorage.setItem('evaluacionCatastral', JSON.stringify(formData));

        // Redirigir a resultados
        window.location.href = 'resultados.html';
    });

    // Validación en tiempo real para campos requeridos
    const requiredInputs = form.querySelectorAll('[required]');
    requiredInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.style.borderColor = '#EF4444';
            } else {
                this.style.borderColor = '#B0BAE0';
            }
        });

        input.addEventListener('input', function() {
            if (this.value) {
                this.style.borderColor = '#B0BAE0';
            }
        });
    });

    // Validación de teléfono (solo números)
    const telefonoInput = document.getElementById('telefono');
    if (telefonoInput) {
        telefonoInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10);
        });
    }
});
