// evaluacion.js - Formulario de Evaluación
document.addEventListener('DOMContentLoaded', async function() {
    const form = document.getElementById('evaluationForm');
    const progressBar = document.getElementById('progressBar');
    const dynamicContainer = document.getElementById('dynamicQuestions');
    // Cargar preguntas del cuestionario y renderizar
    try {
        const res = await fetch('/api/cuestionario');
        if (res.ok) {
            const data = await res.json();
            const preguntas = data.preguntas || [];
            renderDynamicQuestions(preguntas, dynamicContainer);
        }
    } catch (e) {
        console.warn('No se pudieron cargar preguntas dinámicas:', e);
    }
    
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

    // Recopila de forma genérica los inputs del formulario
    function collectFormData(formElement) {
        const data = {};
        const elements = Array.from(formElement.querySelectorAll('input, select, textarea'));
        const grouped = {};
        elements.forEach(el => {
            const name = el.name || el.id;
            if (!name) return;
            if (el.type === 'checkbox') {
                (grouped[name] = grouped[name] || []).push(el.checked ? el.value : null);
            } else if (el.type === 'radio') {
                if (el.checked) data[name] = el.value;
            } else {
                data[name] = el.value;
            }
        });
        // Convert checkbox grouped
        Object.keys(grouped).forEach(k => { const arr = grouped[k].filter(Boolean); if (arr.length) data[k] = arr; });
        return data;
    }

    // Validación y guardado del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = collectFormData(form);
        formData.fecha = new Date().toISOString();

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

function renderDynamicQuestions(preguntas, container) {
    if (!container) return;
    container.innerHTML = '';
    preguntas.forEach((p, idx) => {
        const section = document.createElement('div');
        section.className = 'form-section';
        const title = document.createElement('h2');
        title.className = 'form-section-title';
        title.innerHTML = `<span class="section-number">${String(idx + 2).padStart(2,'0')}</span> ${p.titulo}`;
        section.appendChild(title);

        const group = document.createElement('div');
        group.className = 'form-group';
        // Render by type
        if (p.tipo === 'select') {
            const sel = document.createElement('select');
            sel.className = 'form-select';
            sel.id = p.id; sel.name = p.id; sel.required = true;
            const optEmpty = document.createElement('option'); optEmpty.value = ''; optEmpty.textContent = 'Seleccione una opción'; sel.appendChild(optEmpty);
            (p.options || []).forEach(o => { const opt = document.createElement('option'); opt.value = o.value; opt.textContent = o.label || o.value; sel.appendChild(opt); });
            group.appendChild(sel);
        } else if (p.tipo === 'checkbox') {
            const wrapper = document.createElement('div'); wrapper.className = 'checkbox-group';
            (p.options || []).forEach(o => {
                const label = document.createElement('label'); label.className = 'checkbox-label';
                const cb = document.createElement('input'); cb.type = 'checkbox'; cb.name = p.id; cb.value = o.value;
                label.appendChild(cb); label.appendChild(document.createTextNode(' ' + (o.label || o.value)));
                wrapper.appendChild(label);
            });
            group.appendChild(wrapper);
        } else if (p.tipo === 'text') {
            const inp = document.createElement('input'); inp.type = 'text'; inp.className = 'form-input'; inp.name = p.id; inp.id = p.id;
            group.appendChild(inp);
        } else {
            // default to select
            const sel = document.createElement('select'); sel.className = 'form-select'; sel.id = p.id; sel.name = p.id; sel.required = true;
            const optEmpty = document.createElement('option'); optEmpty.value = ''; optEmpty.textContent = 'Seleccione una opción'; sel.appendChild(optEmpty);
            (p.options || []).forEach(o => { const opt = document.createElement('option'); opt.value = o.value; opt.textContent = o.label || o.value; sel.appendChild(opt); });
            group.appendChild(sel);
        }
        section.appendChild(group);
        container.appendChild(section);
    });
}
