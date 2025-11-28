// admin-cuestionario.js - carga y renderiza el listado de preguntas y permite añadir nuevas
(function () {
  async function fetchPreguntas() {
    const res = await fetch('/api/cuestionario');
    if (!res.ok) return [];
    const data = await res.json();
    return data.preguntas || [];
  }

  function createLabel(text) {
    const l = document.createElement('div');
    l.style.fontWeight = '600';
    l.style.marginTop = '0.5rem';
    l.textContent = text;
    return l;
  }

  function crearInputOption(value = '', label = '') {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-edit-row';
    wrapper.style.display = 'flex';
    wrapper.style.gap = '0.5rem';

    const inpVal = document.createElement('input');
    inpVal.type = 'text';
    inpVal.className = 'form-input';
    inpVal.placeholder = 'value';
    inpVal.value = value;
    inpVal.style.flex = '1';

    const inpLabel = document.createElement('input');
    inpLabel.type = 'text';
    inpLabel.className = 'form-input';
    inpLabel.placeholder = 'label';
    inpLabel.value = label;
    inpLabel.style.flex = '2';

    const btnRem = document.createElement('button');
    btnRem.className = 'btn btn-secondary';
    btnRem.textContent = 'Eliminar opción';
    btnRem.onclick = () => wrapper.remove();

    wrapper.appendChild(inpVal);
    wrapper.appendChild(inpLabel);
    wrapper.appendChild(btnRem);
    return wrapper;
  }

  function crearCartaPregunta(p) {
    const card = document.createElement('div');
    card.className = 'question-card';
    card.setAttribute('data-id', p.id);

    const title = document.createElement('div');
    title.className = 'question-title';
    title.textContent = p.titulo;

    const meta = document.createElement('div');
    meta.className = 'question-meta';
    meta.textContent = 'Tipo: ' + (p.tipo === 'checkbox' ? 'Selección múltiple' : p.tipo || 'select');

    const optionsList = document.createElement('div');
    optionsList.className = 'question-options';
    optionsList.style.display = 'flex';
    optionsList.style.flexDirection = 'column';
    optionsList.style.gap = '0.25rem';
    if (Array.isArray(p.options)) {
      p.options.forEach(o => {
        const opt = document.createElement('div');
        opt.className = 'question-option-item';
        opt.textContent = o.label || o.value || '';
        opt.style.color = 'var(--text-light)';
        optionsList.appendChild(opt);
      });
    }

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '0.5rem';

    const btnEdit = document.createElement('button');
    btnEdit.className = 'btn btn-secondary';
    btnEdit.textContent = 'Editar';
    btnEdit.onclick = () => enterEditMode(card, p);

    const btnDelete = document.createElement('button');
    btnDelete.className = 'btn btn-secondary';
    btnDelete.textContent = 'Eliminar';
    btnDelete.onclick = () => deletePregunta(p.id, card);

    actions.appendChild(btnEdit);
    actions.appendChild(btnDelete);

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(optionsList);
    card.appendChild(actions);

    return card;
  }

  async function savePregunta(id, titulo, tipo, options) {
    const payload = { id, titulo, tipo, options };
    const res = await fetch('/api/cuestionario/' + encodeURIComponent(id), {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    return res.ok ? res.json() : { success: false, message: 'HTTP ' + res.status };
  }

  async function createPregunta(payload) {
    const res = await fetch('/api/cuestionario', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    return res.ok ? res.json() : { success: false, message: 'HTTP ' + res.status };
  }

  async function deletePregunta(id, card) {
    if (!confirm('¿Eliminar esta pregunta? Esta acción no se puede deshacer.')) return;
    const res = await fetch('/api/cuestionario/' + encodeURIComponent(id), { method: 'DELETE' });
    const data = await res.json();
    if (data.success) card.remove(); else alert('Error eliminando: ' + (data.message || ''));
  }

  function enterEditMode(card, p) {
    card.innerHTML = '';
    const id = p.id;

    const titleInp = document.createElement('input'); titleInp.type = 'text'; titleInp.className = 'form-input'; titleInp.value = p.titulo || '';
    const tipoSel = document.createElement('select'); tipoSel.className = 'form-select'; ['select', 'checkbox', 'text'].forEach(t => { const o = document.createElement('option'); o.value = t; o.textContent = t; if (p.tipo === t) o.selected = true; tipoSel.appendChild(o); });

    const optsContainer = document.createElement('div'); optsContainer.style.display = 'flex'; optsContainer.style.flexDirection = 'column'; optsContainer.style.gap = '0.5rem';
    if (Array.isArray(p.options)) p.options.forEach(o => optsContainer.appendChild(crearInputOption(o.value, o.label)));

    const btnAddOption = document.createElement('button'); btnAddOption.className = 'btn btn-secondary'; btnAddOption.textContent = 'Añadir opción'; btnAddOption.onclick = (e) => { e.preventDefault(); optsContainer.appendChild(crearInputOption()); };
    const btnSave = document.createElement('button'); btnSave.className = 'btn btn-primary'; btnSave.textContent = 'Guardar'; btnSave.onclick = async (e) => {
      e.preventDefault(); const optionRows = Array.from(optsContainer.querySelectorAll('.option-edit-row')); const options = optionRows.map(r => { const inputs = r.querySelectorAll('input'); return { value: inputs[0].value || '', label: inputs[1].value || inputs[0].value || '' }; }).filter(o => o.value || o.label);
      const result = await savePregunta(id, titleInp.value.trim(), tipoSel.value, options);
      if (result.success) renderAll(); else alert('Error guardando: ' + (result.message || ''));
    };
    const btnCancel = document.createElement('button'); btnCancel.className = 'btn btn-secondary'; btnCancel.textContent = 'Cancelar'; btnCancel.onclick = (e) => { e.preventDefault(); renderAll(); };

    card.appendChild(createLabel('Titulo')); card.appendChild(titleInp);
    card.appendChild(createLabel('Tipo')); card.appendChild(tipoSel);
    card.appendChild(createLabel('Opciones')); card.appendChild(optsContainer);
    card.appendChild(btnAddOption);
    const actions = document.createElement('div'); actions.style.display = 'flex'; actions.style.gap = '0.5rem'; actions.appendChild(btnSave); actions.appendChild(btnCancel); card.appendChild(actions);
  }

  async function renderAll() {
    const container = document.getElementById('questionsList'); if (!container) return; container.innerHTML = '';
    const preguntas = await fetchPreguntas(); preguntas.forEach(p => container.appendChild(crearCartaPregunta(p)));
  }

  // Add button + add-form behavior
  document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('questionsList'); if (!container) return;
    let addBtn = document.getElementById('addPreguntaBtn'); if (!addBtn) {
      addBtn = document.createElement('button'); addBtn.id = 'addPreguntaBtn'; addBtn.className = 'btn btn-primary'; addBtn.textContent = 'Añadir pregunta'; addBtn.style.marginBottom = '1rem';
      addBtn.onclick = function showForm() {
        if (document.getElementById('addPreguntaForm')) return;
        const form = document.createElement('div'); form.id = 'addPreguntaForm'; form.className = 'question-card'; form.style.border = '2px solid var(--primary)';
        const idInp = document.createElement('input'); idInp.type = 'text'; idInp.className = 'form-input'; idInp.placeholder = 'ID único (ej: preguntaNueva)';
        const titleInp = document.createElement('input'); titleInp.type = 'text'; titleInp.className = 'form-input'; titleInp.placeholder = 'Texto de la pregunta';
        const tipoSel = document.createElement('select'); tipoSel.className = 'form-select'; ['select', 'checkbox', 'text'].forEach(t => { const o = document.createElement('option'); o.value = t; o.textContent = t; tipoSel.appendChild(o); });
        const optsContainer = document.createElement('div'); optsContainer.style.display = 'flex'; optsContainer.style.flexDirection = 'column'; optsContainer.style.gap = '0.5rem';
        const btnAddOption = document.createElement('button'); btnAddOption.className = 'btn btn-secondary'; btnAddOption.textContent = 'Añadir opción'; btnAddOption.onclick = (e) => { e.preventDefault(); optsContainer.appendChild(crearInputOption()); };
        const btnSave = document.createElement('button'); btnSave.className = 'btn btn-primary'; btnSave.textContent = 'Guardar'; btnSave.onclick = async (e) => {
          e.preventDefault(); const id = idInp.value.trim(); const titulo = titleInp.value.trim(); const tipo = tipoSel.value; if (!id || !titulo) return alert('ID y texto requeridos'); let options = [];
          if (tipo !== 'text') { const rows = Array.from(optsContainer.querySelectorAll('.option-edit-row')); options = rows.map(r => { const inputs = r.querySelectorAll('input'); return { value: inputs[0].value || '', label: inputs[1].value || inputs[0].value || '' }; }).filter(o => o.value || o.label); if (options.length === 0) return alert('Agrega al menos una opción'); }
          const payload = { id, titulo, tipo, options }; const res = await createPregunta(payload); if (res.success) { form.remove(); renderAll(); } else alert('Error: ' + (res.message || ''));
        };
        const btnCancel = document.createElement('button'); btnCancel.className = 'btn btn-secondary'; btnCancel.textContent = 'Cancelar'; btnCancel.onclick = (e) => { e.preventDefault(); form.remove(); };
        form.appendChild(createLabel('ID único')); form.appendChild(idInp); form.appendChild(createLabel('Texto de la pregunta')); form.appendChild(titleInp); form.appendChild(createLabel('Tipo de pregunta')); form.appendChild(tipoSel);
        form.appendChild(createLabel('Opciones (si aplica)')); form.appendChild(optsContainer); form.appendChild(btnAddOption);
        const actions = document.createElement('div'); actions.style.display = 'flex'; actions.style.gap = '0.5rem'; actions.appendChild(btnSave); actions.appendChild(btnCancel); form.appendChild(actions);
        container.parentElement.insertBefore(form, container);
      };
      container.parentElement.insertBefore(addBtn, container);
    }
    renderAll();
  });

  // Export
  window.renderPreguntasAdmin = renderAll;
})();

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