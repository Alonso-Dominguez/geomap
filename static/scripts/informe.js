// Script para solicitar el informe al servidor y mostrarlo
(async function () {
    'use strict';
    const mainContainer = document.querySelector('main.report-body');
    const introContent = document.getElementById('introContent');
    const imagesGallery = document.getElementById('imagesGallery');
    const municipio = decodeURIComponent((new URLSearchParams(window.location.search)).get('municipio') || '');

    function showError(msg) {
        if (window.Thewis) window.Thewis.error(msg);
        else alert(msg);
        if (introContent) introContent.innerHTML = '<p class="text-error">' + msg + '</p>';
        else if (mainContainer) mainContainer.innerHTML = '<p class="text-error">' + msg + '</p>';
    }

    const titleEl = document.getElementById('reportTitle');
    if (titleEl && municipio) titleEl.innerText = 'Informe de Diagnóstico — ' + municipio;

    if (!municipio) {
        showError('Municipio no especificado en la URL.');
        return;
    }

    try {
        const res = await fetch('/api/informe?municipio=' + encodeURIComponent(municipio) + '&aggregate=1');
        if (!res.ok) {
            const txt = await res.text();
            showError('Error al obtener informe: ' + res.status + ' ' + txt);
            return;
        }
        const data = await res.json();

        if (data.error) {
            showError(data.error);
            return;
        }

        // Mostrar el informe (texto IA o resumen local) dentro de la sección de introducción
        if (introContent) {
            if (data.analysis_html) {
                introContent.innerHTML = '<div id="analysisText" class="analysis-text">' + data.analysis_html + '</div>';
            } else if (data.analysis_text) {
                introContent.innerHTML = '<div id="analysisText" class="analysis-text">' + data.analysis_text + '</div>';
            } else if (data.summary) {
                introContent.innerHTML = '<div id="analysisText" class="analysis-text"><pre>' + JSON.stringify(data.summary, null, 2) + '</pre></div>';
            } else if (data.analysis) {
                introContent.innerHTML = '<div id="analysisText" class="analysis-text"><pre>' + JSON.stringify(data.analysis, null, 2) + '</pre></div>';
            } else {
                introContent.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
            }
        }

        // Mostrar gráfico y puntos clave si hay summary
        const chartContainer = document.getElementById('chartContainer');
        const keyPoints = document.getElementById('keyPoints');
        const findingsContainer = document.getElementById('findingsContainer');
        const recommendationsContainer = document.getElementById('recommendationsContainer');
        const nextStepsContainer = document.getElementById('nextStepsContainer');
        const reportMeta = document.getElementById('reportMeta');

        if (data.summary) {
            const s = data.summary;
            // Header meta
            if (reportMeta) reportMeta.innerHTML = `<div><strong>${s.municipio}</strong> · ${s.count} registro(s)</div>`;

            // Intro
            if (introContent) introContent.innerHTML = `<p>${s.introduction || ''}</p>`;

            // Findings
            if (s.findings && findingsContainer) {
                findingsContainer.innerHTML = `<div class="card"><h3>Hallazgos</h3><p>${s.findings}</p></div>`;
            }

            // Recomendaciones
            if (s.recommendations && s.recommendations.length && recommendationsContainer) {
                let recHtml = '<div class="card"><h3>Recomendaciones priorizadas</h3><ol class="rec-list">';
                s.recommendations.forEach(r => {
                    const pr = r.priority || r['priority'] || 'Media';
                    const txt = r.text || r['text'] || '';
                    recHtml += `<li><span class="badge ${pr}">${pr}</span>${txt}</li>`;
                });
                recHtml += '</ol></div>';
                recommendationsContainer.innerHTML = recHtml;
            }

            // Próximos pasos
            if (s.next_steps && s.next_steps.length && nextStepsContainer) {
                let nsHtml = '<div class="card"><h3>Próximos pasos</h3><ol class="next-steps">';
                s.next_steps.forEach((n, idx) => nsHtml += `<li><strong>${idx+1}.</strong> ${n}</li>`);
                nsHtml += '</ol></div>';
                nextStepsContainer.innerHTML = nsHtml;
            }

            // Key points cards
            if (keyPoints) keyPoints.style.display = 'block';
            let kpHtml = '<h3>Puntos clave</h3><div class="key-points">';
            if (s.key_issues && s.key_issues.length) {
                s.key_issues.forEach(k => kpHtml += `<div class="kp-card"><h4>Problema</h4><p>${k}</p></div>`);
            }
            if (s.solutions && s.solutions.length) {
                s.solutions.forEach(sol => {
                    const pr = sol.priority || sol['priority'] || '';
                    const txt = sol.text || sol['text'] || '';
                    kpHtml += `<div class="kp-card"><h4>Solución (${pr})</h4><p>${txt}</p></div>`;
                });
            }
            kpHtml += '</div>';
            if (keyPoints) keyPoints.innerHTML = kpHtml;

            // Gráfico de prioridades
            const pc = s.priority_counts || {};
            const labels = Object.keys(pc);
            const values = labels.map(l => pc[l]);
            if (labels.length) {
                if (chartContainer) chartContainer.style.display = 'block';
                const chartEl = document.getElementById('priorityChart');
                const ctx = chartEl ? chartEl.getContext('2d') : null;
                if (window._priorityChart) { try { window._priorityChart.destroy(); } catch(e){} }
                window._priorityChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: { labels: labels, datasets: [{ data: values, backgroundColor: ['#ef4444','#f59e0b','#10b981','#3b82f6'] }] },
                    options: { plugins: { legend: { position: 'bottom' } }, responsive: true, maintainAspectRatio: false }
                });
            }

            // Images
            if (imagesGallery) {
                imagesGallery.innerHTML = '';
                if (data.images && data.images.length) {
                    data.images.forEach(src => {
                        const img = document.createElement('img');
                        img.src = src; img.alt = 'Evidencia'; img.loading = 'lazy';
                        imagesGallery.appendChild(img);
                    });
                }
            }
        }

        // Descargar PDF
        document.getElementById('downloadPdfBtn').addEventListener('click', async () => {
                    try {
                        const resp = await fetch('/api/informe/pdf?municipio=' + encodeURIComponent(municipio) + '&aggregate=1');
                        if (!resp.ok) {
                            const txt = await resp.text();
                            showError('Error generando reporte: ' + resp.status + ' ' + txt);
                            return;
                        }

                        // Prefer filename from Content-Disposition if provided
                        const cd = resp.headers.get('content-disposition') || '';
                        let filename = '';
                        const fnMatch = /filename\*=UTF-8''([^;\n]+)/i.exec(cd) || /filename="?([^";]+)"?/i.exec(cd);
                        if (fnMatch && fnMatch[1]) {
                            try { filename = decodeURIComponent(fnMatch[1]); } catch(e) { filename = fnMatch[1]; }
                        }

                        const contentType = resp.headers.get('content-type') || '';
                        const blob = await resp.blob();

                        // If server returned HTML (fallback), prefer .html extension
                        if (!filename) {
                            if (contentType.indexOf('html') !== -1) filename = 'informe_' + municipio + '.html';
                            else if (contentType.indexOf('pdf') !== -1) filename = 'informe_' + municipio + '.pdf';
                            else filename = 'informe_' + municipio;
                        }

                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        // If it's HTML, also offer to open in a new tab for quick preview
                        if (contentType.indexOf('html') !== -1) {
                            const openPreview = confirm('El servidor devolvió un HTML (fallback). ¿Deseas abrir una vista previa en una nueva pestaña?');
                            if (openPreview) window.open(url, '_blank');
                        }
                        window.URL.revokeObjectURL(url);
                    } catch (err) {
                        showError('Excepción generando reporte: ' + err.message);
                    }
        });

        if (window.Thewis) window.Thewis.success('Informe listo');
    } catch (err) {
        showError('Excepción al solicitar informe: ' + err.message);
    }
})();
