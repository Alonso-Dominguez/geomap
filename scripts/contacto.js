// contacto.js - Formulario de Contacto
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');
    
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

    // Validación de teléfono
    const telefonoInput = document.getElementById('telefono');
    telefonoInput.addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10);
    });

    // Validación del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validar que al menos una opción de interés esté seleccionada
        const interesesSeleccionados = document.querySelectorAll('input[name="interes"]:checked');
        if (interesesSeleccionados.length === 0) {
            alert('Por favor, seleccione al menos una solución de interés');
            return;
        }

        // Recopilar datos del formulario
        const formData = {
            municipio: document.getElementById('nombreMunicipio').value,
            representante: document.getElementById('representante').value,
            area: document.getElementById('area').value,
            telefono: document.getElementById('telefono').value,
            email: document.getElementById('email').value,
            cargo: document.getElementById('cargo').value,
            intereses: Array.from(interesesSeleccionados).map(cb => cb.value),
            mensaje: document.getElementById('mensaje').value,
            fecha: new Date().toISOString()
        };

        // Guardar en localStorage
        const contactos = JSON.parse(localStorage.getItem('contactosIUCA') || '[]');
        contactos.push(formData);
        localStorage.setItem('contactosIUCA', JSON.stringify(contactos));

        // Mostrar mensaje de éxito
        form.style.display = 'none';
        successMessage.style.display = 'block';

        // Simular envío de email (en producción esto se haría con un backend)
        console.log('Datos de contacto enviados:', formData);
    });

    // Validación en tiempo real para campos requeridos
    const requiredInputs = form.querySelectorAll('[required]');
    requiredInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (!this.value && this.type !== 'checkbox') {
                this.style.borderColor = '#EF4444';
            } else if (this.value) {
                this.style.borderColor = '#B0BAE0';
            }
        });

        input.addEventListener('input', function() {
            if (this.value && this.type !== 'checkbox') {
                this.style.borderColor = '#B0BAE0';
            }
        });
    });

    // Validación de email
    const emailInput = document.getElementById('email');
    emailInput.addEventListener('blur', function() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.value)) {
            this.style.borderColor = '#EF4444';
        } else {
            this.style.borderColor = '#B0BAE0';
        }
    });
});

// Función para resetear el formulario
function resetForm() {
    const form = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');
    
    form.reset();
    form.style.display = 'block';
    successMessage.style.display = 'none';
}

// Hacer la función global
window.resetForm = resetForm;
