// Script para capturar los datos del formulario de evaluación
// Construye un objeto JSON con la misma estructura que espera DiagnosticoRequest
(function () {
    'use strict';

    const formId = 'evaluationForm';
    const storageKey = 'diagnosticoDraft';

    function getForm() {
        return document.getElementById(formId);
    }

    function collectValues(form) {
        // Campos simples
        const obj = {
            municipio: form.municipio.value.trim(),
            poblacion: form.poblacion.value,

            anioCartografia: form.anioCartografia.value,
            coberturaCartografia: form.coberturaCartografia.value,

            georreferenciacion: form.georreferenciacion.value,

            coincidencia: form.coincidencia.value,

            expedientesDigitalizados: form.expedientesDigitalizados.value,

            documentacionFisica: form.documentacionFisica.value,

            calidadBD: form.calidadBD.value,

            sistemaCobro: form.sistemaCobro.value,

            tipoSistema: form.tipoSistema.value,
            // limitacionesSistema: lista de checkboxes
            limitacionesSistema: Array.from(form.querySelectorAll('input[name="limitacionesSistema"]:checked')).map(i => i.value),

            sigMultifinalitario: form.sigMultifinalitario.value,

            realizanInspecciones: form.realizanInspecciones.value,
            documentacionInspecciones: form.documentacionInspecciones.value,

            procesosActualizacion: form.procesosActualizacion.value,

            normatividad: form.normatividad.value,

            comentariosAdicionales: form.comentariosAdicionales && form.comentariosAdicionales.value.trim() ? form.comentariosAdicionales.value.trim() : null
        };

        return obj;
    }

    function collectFiles(form) {
        const input = form.querySelector('input[name="evidencias"]');
        if (!input) return [];
        return Array.from(input.files || []);
    }

    function saveDraft(obj) {
        try {
            localStorage.setItem(storageKey, JSON.stringify(obj));
        } catch (err) {
            console.warn('No se pudo guardar borrador en localStorage', err);
        }
    }

    function loadDraft() {
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (err) {
            console.warn('Error al cargar borrador', err);
            return null;
        }
    }

    function populateForm(form, draft) {
        if (!draft) return;
        Object.keys(draft).forEach(key => {
            try {
                const el = form.elements[key];
                if (!el) return;

                if (el.length && el[0].type === 'checkbox') {
                    // NodeList of checkboxes
                    Array.from(el).forEach(cb => {
                        cb.checked = Array.isArray(draft[key]) && draft[key].includes(cb.value);
                    });
                } else if (el.type === 'checkbox') {
                    el.checked = !!draft[key];
                } else {
                    el.value = draft[key] === null ? '' : draft[key];
                }
            } catch (e) {
                // campo especial (por ejemplo checkboxes con mismo name)
                if (key === 'limitacionesSistema') {
                    const checks = form.querySelectorAll('input[name="limitacionesSistema"]');
                    Array.from(checks).forEach(cb => {
                        cb.checked = Array.isArray(draft[key]) && draft[key].includes(cb.value);
                    });
                }
            }
        });
    }

    function showMessage(msg, isError) {
        // Usar thewis si está disponible
        if (window.Thewis) {
            if (isError) window.Thewis.error(msg);
            else window.Thewis.success(msg);
            return;
        }
        if (isError) console.error(msg);
        alert(msg);
    }

    function validateForm(form) {
        // Validar campos con atributo required
        const reqs = Array.from(form.querySelectorAll('[required]'));
        for (const el of reqs) {
            if (el.type === 'checkbox') continue; // manejamos grupos aparte
            if (el.tagName === 'SELECT' || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                if (!el.value || el.value.trim() === '') {
                    return { ok: false, message: 'Por favor complete todos los campos obligatorios.' };
                }
            }
        }

        // Validar checkbox group 'limitacionesSistema' (debe tener al menos uno)
        const checks = form.querySelectorAll('input[name="limitacionesSistema"]');
        if (checks && checks.length > 0) {
            const any = Array.from(checks).some(c => c.checked);
            if (!any) return { ok: false, message: 'Seleccione al menos una limitación del sistema.' };
        }

        return { ok: true };
    }

    async function sendToEndpoint(endpoint, payload, files) {
        // Si hay archivos, enviamos FormData (payload como campo 'payload')
        let opts = {};
        if (files && files.length > 0) {
            const fd = new FormData();
            fd.append('payload', JSON.stringify(payload));
            files.forEach((f, i) => fd.append('evidencias', f, f.name));
            opts = { method: 'POST', body: fd };
        } else {
            opts = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            };
        }

        const res = await fetch(endpoint, opts);
        if (!res.ok) {
            const txt = await res.text();
            throw new Error(`Respuesta no OK: ${res.status} ${txt}`);
        }
        try {
            return await res.json();
        } catch (_) {
            return null;
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const form = getForm();
        if (!form) return;

        // Si la plantilla define data-endpoint en el form, lo usamos
        const endpoint = form.dataset && form.dataset.endpoint ? form.dataset.endpoint : (window.EVALUACION_AI_ENDPOINT || '');

        // Cargar borrador si existe
        const draft = loadDraft();
        if (draft) populateForm(form, draft);

        // Guardado automático cada cierto tiempo (opcional)
        let autosaveTimer = null;
        form.addEventListener('input', () => {
            if (autosaveTimer) clearTimeout(autosaveTimer);
            autosaveTimer = setTimeout(() => {
                const obj = collectValues(form);
                saveDraft(obj);
            }, 800);
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const valid = validateForm(form);
            if (!valid.ok) {
                showMessage(valid.message, true);
                return;
            }

            const payload = collectValues(form);

            // Guardar borrador antes de enviar
            saveDraft(payload);

            if (!endpoint) {
                showMessage('Borrador guardado localmente. Configure `data-endpoint` en el formulario para enviar a la IA.');
                // redirigir al informe local incluso si no hay endpoint
                const m = encodeURIComponent(payload.municipio || '');
                window.location.href = '/informe?municipio=' + m;
                return;
            }

            try {
                // Enviar al endpoint configurado (este endpoint guarda en respuestas.json)
                const files = collectFiles(form);
                const response = await sendToEndpoint(endpoint, payload, files);
                if (response && response.success) {
                    showMessage('Enviado y guardado correctamente.');
                } else {
                    showMessage('Guardado localmente, pero la respuesta del servidor fue inesperada.', true);
                }

                // Redirigir al informe del municipio
                const m = encodeURIComponent(payload.municipio || '');
                window.location.href = '/informe?municipio=' + m;
            } catch (err) {
                console.error(err);
                showMessage('Error al enviar los datos: ' + err.message, true);
            }
        });
    });
})();
