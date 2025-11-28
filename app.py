from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import sqlite3
import os
from datetime import datetime
import json
from werkzeug.utils import secure_filename
import uuid
from flask import request, send_file
from io import BytesIO

# Intento importar reportlab para generación de PDF (opcional)
try:
    from reportlab.lib.pagesizes import A4
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    from reportlab.lib.units import mm
    REPORTLAB_AVAILABLE = True
except Exception:
    REPORTLAB_AVAILABLE = False

# importar cliente de IA (Groq) si existe
try:
    from ai_groq import analyze_with_groq
except Exception:
    analyze_with_groq = None

app = Flask(__name__)
app.secret_key = 'iuca-diagnostico-catastral-2025'  # Cambiar en producción

# Configuración de la base de datos
DATABASE = 'registros.db'

def get_db_connection():
    """Establece conexión con la base de datos SQLite"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Inicializa la base de datos con las tablas necesarias"""
    conn = get_db_connection()
    cursor = conn.cursor()
    # Leer el archivo db.sql y ejecutarlo
    with open('db.sql', 'r', encoding='utf-8') as f:
        sql_script = f.read()
        cursor.executescript(sql_script)
    conn.commit()
    conn.close()
    print("✅ Base de datos inicializada correctamente")

def check_db_connection():
    """Verifica si la conexión a la base de datos funciona"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM rol")
        count = cursor.fetchone()[0]
        conn.close()
        return True, f"Conectado - {count} roles en BD"
    except Exception as e:
        return False, f"Error: {str(e)}"

# Agregar esta ruta en app.py después de las otras rutas de admin


# ============================================
# API para Evaluaciones Catastrales
@app.route('/api/evaluacion', methods=['POST'])
def api_evaluacion():
    """Recibe y guarda una evaluación catastral en la base de datos"""
    data = request.get_json()
    if not data:
        return jsonify(success=False, message="Datos no recibidos"), 400
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO evaluaciones (
                municipio, poblacion, ultimaActualizacion, tipoCartografia, estadoPadron,
                prediosRegistrados, rezagoCatastral, sistemaCatastral, procesosCobro,
                expedientesDigitales, principalesNecesidades, prioridadPrincipal,
                comentariosAdicionales, fecha
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.get('municipio'),
            data.get('poblacion'),
            data.get('ultimaActualizacion'),
            ','.join(data.get('tipoCartografia', [])),
            data.get('estadoPadron'),
            data.get('prediosRegistrados'),
            data.get('rezagoCatastral'),
            data.get('sistemaCatastral'),
            ','.join(data.get('procesosCobro', [])),
            data.get('expedientesDigitales'),
            ','.join(data.get('principalesNecesidades', [])),
            data.get('prioridadPrincipal'),
            data.get('comentariosAdicionales'),
            data.get('fecha')
        ))
        conn.commit()
        conn.close()
        return jsonify(success=True, message="Evaluación guardada correctamente")
    except Exception as e:
        return jsonify(success=False, message=str(e)), 500

@app.route('/api/evaluaciones', methods=['GET'])
def api_evaluaciones():
    """Devuelve todas las evaluaciones guardadas en la base de datos"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM evaluaciones ORDER BY fecha DESC')
        rows = cursor.fetchall()
        conn.close()
        evaluaciones = []
        for row in rows:
            evaluaciones.append({
                'id': row['id'],
                'municipio': row['municipio'],
                'estado': row['estadoPadron'],
                'calificacion_total': calcular_calificacion(row),
                'fecha': row['fecha'],
                'poblacion': row['poblacion'],
                'ultimaActualizacion': row['ultimaActualizacion'],
                'tipoCartografia': row['tipoCartografia'],
                'prediosRegistrados': row['prediosRegistrados'],
                'rezagoCatastral': row['rezagoCatastral'],
                'sistemaCatastral': row['sistemaCatastral'],
                'procesosCobro': row['procesosCobro'],
                'expedientesDigitales': row['expedientesDigitales'],
                'principalesNecesidades': row['principalesNecesidades'],
                'prioridadPrincipal': row['prioridadPrincipal'],
                'comentariosAdicionales': row['comentariosAdicionales']
            })
        return jsonify(evaluaciones=evaluaciones)
    except Exception as e:
        return jsonify(evaluaciones=[], error=str(e)), 500

# Algoritmo para calcular la calificación total desde la fila de la BD
def calcular_calificacion(row):
    score = 0
    # Cartografía
    años = {
        'menos-1': 25, '1-3': 20, '3-5': 15,
        '5-10': 10, 'mas-10': 5, 'nunca': 0
    }

    score += años.get(row['ultimaActualizacion'], 0)

    score += años.get(row['ultimaActualizacion'], 0)
    # Padrón
    padron = {
        'actualizado': 15, 'parcial': 10,
        'desactualizado': 5, 'fisico': 3, 'inexistente': 0
    }
    score += padron.get(row['estadoPadron'], 0)
    # Tecnología
    sistema = {
        'completo': 15, 'parcial': 10,
        'basico': 5, 'no': 0
    }
    score += sistema.get(row['sistemaCatastral'], 0)
    # Digital
    expedientes = {
        'completo': 15, 'parcial': 8, 'no': 0
    }
    score += expedientes.get(row['expedientesDigitales'], 0)
    return min(score, 100)


# Endpoint para guardar respuestas en un archivo JSON (respuestas.json)
@app.route('/api/guardar_respuesta', methods=['POST'])
def guardar_respuesta():
    """Recibe un JSON con las respuestas y las guarda en static/scripts/respuestas.json"""
    # Intentar leer JSON si el contenido es application/json
    data = None
    try:
        if request.is_json:
            data = request.get_json()
    except Exception:
        data = None

    try:
        # Preparar ruta de uploads
        uploads_dir = os.path.join(app.root_path, 'static', 'uploads')
        os.makedirs(uploads_dir, exist_ok=True)

        saved_files = []

        # Si el request es multipart/form-data, puede contener archivos y un campo 'payload'
        if request.files:
            # payload puede venir en form (stringified JSON)
            payload_raw = request.form.get('payload')
            if payload_raw:
                try:
                    payload_data = json.loads(payload_raw)
                    # usar payload_data como data
                    data = payload_data
                except Exception:
                    pass

            for f in request.files.getlist('evidencias'):
                if f and f.filename:
                    filename = secure_filename(f.filename)
                    ext = os.path.splitext(filename)[1]
                    new_name = f"{uuid.uuid4().hex}{ext}"
                    dest = os.path.join(uploads_dir, new_name)
                    f.save(dest)
                    # guardar ruta relativa para servir desde static
                    saved_files.append(os.path.join('uploads', new_name))

        # Si no se recibieron datos por JSON ni por payload, inicializar un objeto vacío
        if data is None:
            data = {}

        # Asegurar token del usuario en sesión para privacidad
        if 'user_token' not in session:
            session['user_token'] = uuid.uuid4().hex
        data_owner = session.get('user_token')

        # Añadir metadatos mínimos
        data['_received_at'] = datetime.utcnow().isoformat() + 'Z'
        data['owner'] = data_owner
        if saved_files:
            data['evidencias_files'] = saved_files

        # Ruta al archivo dentro de static
        respuestas_path = os.path.join(app.root_path, 'static', 'scripts', 'respuestas.json')

        # Cargar contenido existente (si existe y es válido)
        if os.path.exists(respuestas_path) and os.path.getsize(respuestas_path) > 0:
            with open(respuestas_path, 'r', encoding='utf-8') as f:
                try:
                    current = json.load(f)
                    if not isinstance(current, list):
                        current = [current]
                except Exception:
                    current = []
        else:
            current = []

        current.append(data)

        # Escribir de nuevo el archivo
        with open(respuestas_path, 'w', encoding='utf-8') as f:
            json.dump(current, f, ensure_ascii=False, indent=2)

        return jsonify({'success': True, 'message': 'Guardado en respuestas.json', 'files': saved_files})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/informe', methods=['GET'])
def api_informe():
    """Genera un informe para un municipio: filtra respuestas por municipio y llama a IA si está configurada.
    Query params: municipio
    """
    municipio = request.args.get('municipio', '').strip()
    # Por defecto se genera un resumen agregado para el municipio (aggregate=True).
    aggregate = request.args.get('aggregate', '1') in ('1', 'true', 'yes')
    if not municipio:
        return jsonify({'error': 'Parámetro municipio requerido'}), 400

    respuestas_path = os.path.join(app.root_path, 'static', 'scripts', 'respuestas.json')
    if not os.path.exists(respuestas_path):
        return jsonify({'error': 'No hay respuestas registradas aún.'}), 404

    try:
        with open(respuestas_path, 'r', encoding='utf-8') as f:
            all_data = json.load(f) or []
    except Exception as e:
        return jsonify({'error': 'Error leyendo respuestas: ' + str(e)}), 500

    # Filtrar por municipio (case-insensitive) y por propietario (session token)
    owner_token = session.get('user_token')
    # Si aggregate=True se incluyen todos los registros del municipio (global),
    # en caso contrario filtramos por owner para privacidad.
    if aggregate:
        filtered = [r for r in all_data if isinstance(r, dict)
                    and r.get('municipio')
                    and r.get('municipio').strip().lower() == municipio.strip().lower()]
    else:
        if not owner_token:
            return jsonify({'error': 'No se ha identificado al usuario en la sesión.'}), 403
        filtered = [r for r in all_data if isinstance(r, dict)
                    and r.get('municipio')
                    and r.get('municipio').strip().lower() == municipio.strip().lower()
                    and r.get('owner') == owner_token]

    if not filtered:
        return jsonify({'error': f'No hay registros para el municipio "{municipio}".'}), 404

    # Prioridad: si existe GROQ client, usarlo; si no, usar AI_ANALYSIS_URL si está
    payload = {'municipio': municipio, 'responses': filtered}

    # Preferir ai_groq if available and GROQ_API_KEY is set
    groq_key = os.environ.get('GROQ_API_KEY')
    if analyze_with_groq and groq_key:
        try:
            groq_resp = analyze_with_groq(payload)
            # groq_resp puede contener {'json': parsed} o {'text': text} o {'raw': ...}
            analysis_text = None
            if isinstance(groq_resp, dict):
                if 'json' in groq_resp:
                    # Convertir el JSON estructurado a texto legible
                    try:
                        p = groq_resp['json']
                        # Si la IA devolvió JSON estructurado, usarlo como summary
                        summary = p if isinstance(p, dict) else None
                        intro = p.get('introduction') if isinstance(p, dict) else None
                        reasons = p.get('reasons') if isinstance(p, dict) else None
                        recs = p.get('recommendations') if isinstance(p, dict) else None
                        parts = []
                        if intro:
                            parts.append(str(intro))
                        if reasons:
                            parts.append('\nCausas:\n' + '\n'.join(['- ' + r for r in reasons]))
                        if recs:
                            parts.append('\nRecomendaciones:\n' + '\n'.join(['- ' + r for r in recs]))
                        analysis_text = '\n'.join(parts)
                    except Exception:
                        analysis_text = str(groq_resp['json'])
                elif 'text' in groq_resp:
                    analysis_text = groq_resp['text']
                elif 'raw' in groq_resp:
                    analysis_text = str(groq_resp['raw'])
                else:
                    analysis_text = str(groq_resp)
            else:
                analysis_text = str(groq_resp)

            # Construir lista de imágenes (convertir backslashes a slashes)
            images = []
            for r in filtered:
                for p in r.get('evidencias_files', []) or []:
                    p_conv = p.replace('\\', '/').lstrip('/\\')
                    images.append('/static/' + p_conv)

            # Crear una versión HTML simple a partir del texto para mejor presentación
            if analysis_text:
                # doble salto -> párrafo
                html_body = ''.join([f'<p>{line.strip()}</p>' for line in analysis_text.split('\n\n') if line.strip()])
                analysis_html = f"<div class='report-card'>{html_body}</div>"
            else:
                analysis_html = ''

            resp_obj = {'analysis_text': analysis_text, 'analysis_html': analysis_html, 'images': images}
            if 'summary' in locals() and summary:
                resp_obj['summary'] = summary
            return jsonify(resp_obj)
        except Exception as e:
            summary = generate_summary(filtered)
            text = summary_to_text(summary)
            images = summary.get('images', [])
            return jsonify({'warning': 'Error llamando a Groq: ' + str(e), 'analysis_text': text, 'analysis_html': summary_to_html(summary), 'images': images, 'summary': summary}), 200

    ai_url = os.environ.get('AI_ANALYSIS_URL')
    if ai_url:
        try:
            import requests
            r = requests.post(ai_url, json=payload, timeout=30)
            r.raise_for_status()
            return jsonify(r.json())
        except Exception as e:
            summary = generate_summary(filtered)
            text = summary_to_text(summary)
            images = summary.get('images', [])
            return jsonify({'warning': 'Error llamando a IA: ' + str(e), 'analysis_text': text, 'analysis_html': summary_to_html(summary), 'images': images, 'summary': summary}), 200

# No hay IA configurada: generar resumen local simple
    summary = generate_summary(filtered)
    text = summary_to_text(summary)
    html = summary_to_html(summary)
    images = summary.get('images', [])
    return jsonify({'analysis_text': text, 'analysis_html': html, 'images': images, 'summary': summary}), 200


def generate_summary(responses):
    """
    Genera un informe narrativo de diagnóstico a partir de las respuestas filtradas.
    Devuelve un dict con claves narrativas: introduction, findings, key_issues,
    recommendations, risks, next_steps, images.
    """
    municipio = responses[0].get('municipio')
    count = len(responses)

    # Recolectar conteos por campo para detectar tendencias
    field_counts = {}
    images = []
    for r in responses:
        for k, v in r.items():
            if k.startswith('_') or k in ('owner',):
                continue
            if k == 'evidencias_files' and isinstance(v, list):
                for p in v:
                    p_conv = p.replace('\\', '/').lstrip('/\\')
                    images.append('/static/' + p_conv)
                continue
            if isinstance(v, list):
                for it in v:
                    field_counts.setdefault(k, {})[it] = field_counts.setdefault(k, {}).get(it, 0) + 1
            else:
                field_counts.setdefault(k, {})[v] = field_counts.setdefault(k, {}).get(v, 0) + 1

    def top_value(k):
        counts = field_counts.get(k, {})
        if not counts:
            return None, 0
        top = max(counts.items(), key=lambda x: x[1])
        return top[0], top[1]

    # Introducción
    introduction = f"Informe diagnóstico para el municipio {municipio}. Se analizaron {count} formulario(s)."

    # Hallazgos: sintetizar algunos campos clave si existen
    findings_parts = []
    tv, tvc = top_value('calidadBD')
    if tv:
        findings_parts.append(f"Calidad de la base de datos: predominan respuestas que indican '{tv}' ({tvc} de {count}).")
    tv, tvc = top_value('coberturaCartografia')
    if tv:
        findings_parts.append(f"Cobertura de cartografía predominante: '{tv}' ({tvc} de {count}).")
    tv, tvc = top_value('georreferenciacion')
    if tv:
        findings_parts.append(f"Estado de georreferenciación: '{tv}' ({tvc} de {count}).")
    tv, tvc = top_value('expedientesDigitalizados')
    if tv:
        findings_parts.append(f"Nivel de expedientes digitalizados: '{tv}' ({tvc} de {count}).")
    tv, tvc = top_value('documentacionFisica')
    if tv:
        findings_parts.append(f"Organización de la documentación física: '{tv}' ({tvc} de {count}).")
    # Limitaciones del sistema (lista)
    lims = field_counts.get('limitacionesSistema', {})
    if lims:
        lim_list = ', '.join(lims.keys())
        findings_parts.append(f"Limitaciones reportadas del sistema: {lim_list}.")

    findings = ' '.join(findings_parts) if findings_parts else 'No se identificaron hallazgos claros a partir de los datos.'

    # Key issues: map frequent problematic values to human-readable issues
    key_issues = []
    def add_issue(cond, text):
        if cond and text not in key_issues:
            key_issues.append(text)

    # Example heuristics
    tv, _ = top_value('calidadBD')
    add_issue(tv in ('muchos-errores', 'errores'), 'La calidad de la base de datos presenta múltiples errores y requiere limpieza de datos.')
    tv, _ = top_value('expedientesDigitalizados')
    add_issue(tv in ('menos-30', '0-30', 'no'), 'Baja digitalización de expedientes; gran parte de la información permanece en papel.')
    tv, _ = top_value('georreferenciacion')
    add_issue(tv in ('geo-no-vinculada', 'no', 'incompleta'), 'Georreferenciación incompleta o no vinculada a registros catastrales.')
    tv, _ = top_value('documentacionFisica')
    add_issue(tv and 'desorden' in str(tv).lower(), 'Documentación física desorganizada; dificulta auditoría y trazabilidad.')
    lims_keys = list(field_counts.get('limitacionesSistema', {}).keys())
    add_issue('no-cartografia' in lims_keys, 'Falta cartografía digital disponible.')
    tv, _ = top_value('tipoSistema')
    add_issue(tv in ('no-sistema', 'no-sistema'), 'No existe un sistema catastral centralizado.')

    # Recomendaciones priorizadas
    recommendations = []
    # Alta prioridad
    if 'La calidad de la base de datos presenta múltiples errores y requiere limpieza de datos.' in key_issues:
        recommendations.append({'priority': 'Alta', 'text': 'Iniciar un programa de limpieza y validación de la base de datos catastral; identificar y corregir registros erróneos.'})
    if 'Baja digitalización de expedientes; gran parte de la información permanece en papel.' in key_issues:
        recommendations.append({'priority': 'Alta', 'text': 'Plan de digitalización de expedientes: priorizar por fecha/valor, escanear y almacenar con metadatos.'})
    if 'Georreferenciación incompleta o no vinculada a registros catastrales.' in key_issues:
        recommendations.append({'priority': 'Alta', 'text': 'Vincular la cartografía con los registros catastrales y establecer procesos de georreferenciación estandarizados.'})
    if 'Documentación física desorganizada; dificulta auditoría y trazabilidad.' in key_issues:
        recommendations.append({'priority': 'Media', 'text': 'Ordenar y catalogar expedientes físicos; establecer un índice y política de custodia.'})
    if 'Falta cartografía digital disponible.' in key_issues:
        recommendations.append({'priority': 'Alta', 'text': 'Actualizar o generar cartografía digital priorizando zonas críticas.'})
    if 'No existe un sistema catastral centralizado.' in key_issues:
        recommendations.append({'priority': 'Media', 'text': 'Evaluar e implementar un sistema catastral interoperable (SIG) con acceso controlado para operativos y administración.'})

    # Add generic recommendations if none specific
    if not recommendations:
        recommendations.append({'priority': 'Media', 'text': 'Realizar una revisión técnica general y planificar acciones correctivas priorizadas.'})

    # Risks
    risks = 'Si no se actúa, existe riesgo de decisiones basadas en datos incompletos, pérdida de ingresos y mayor costo de corrección futura.'

    # Next steps (concise actionable items)
    next_steps = []
    next_steps.append('Realizar inventario y priorización de expedientes y capas cartográficas.')
    next_steps.append('Ejecutar un piloto de digitalización en una zona representativa.')
    next_steps.append('Plan de limpieza de la base de datos con reglas de validación.')
    next_steps.append('Definir requerimientos para un sistema SIG o mejorar el existente.')

    # Calcular conteos de prioridad para recomendaciones y soluciones (para gráficos)
    priority_counts = {}
    for r in recommendations:
        pr = r.get('priority', 'Media')
        priority_counts[pr] = priority_counts.get(pr, 0) + 1
    for s in [item for item in [
        {'priority': x.get('priority')} for x in [
            {'priority': 'Alta'}, {'priority': 'Alta'}, {'priority': 'Alta'}, {'priority': 'Media'}
        ]
    ]]:
        # nota: las 'solutions' están definidas arriba estáticamente; ya incluyen prioridades
        pass

    return {
        'municipio': municipio,
        'count': count,
        'introduction': introduction,
        'findings': findings,
        'key_issues': key_issues,
        'solutions': [
            {'title': 'Programa de calidad de datos', 'text': 'Implementar proceso de limpieza, validación y normalización de la base de datos catastral.', 'priority': 'Alta'},
            {'title': 'Plan de digitalización', 'text': 'Digitalizar expedientes priorizados y almacenar con metadatos y control de versiones.', 'priority': 'Alta'},
            {'title': 'Proyecto de georreferenciación', 'text': 'Vincular cartografía con registros y estandarizar flujos de actualización geográfica.', 'priority': 'Alta'},
            {'title': 'Orden y custodia documental', 'text': 'Catalogar y organizar la documentación física; definir políticas de custodia y acceso.', 'priority': 'Media'}
        ],
        'recommendations': recommendations,
        'risks': risks,
        'next_steps': next_steps,
        'images': images,
        'priority_counts': priority_counts
    }


def summary_to_text(summary: dict) -> str:
    """Convierte el dict de summary en un texto narrativo plano apto para mostrar o leer en voz."""
    parts = []
    intro = summary.get('introduction')
    if intro:
        parts.append(intro)

    findings = summary.get('findings')
    if findings:
        parts.append('\nHallazgos:\n' + findings)

    key_issues = summary.get('key_issues') or []
    if key_issues:
        parts.append('\nProblemas clave:')
        for idx, k in enumerate(key_issues, 1):
            parts.append(f"{idx}. {k}")

    recs = summary.get('recommendations') or []
    if recs:
        parts.append('\nRecomendaciones priorizadas:')
        # Orden simple: Alta -> Media -> Baja
        priority_order = {'Alta': 1, 'Media': 2, 'Baja': 3}
        try:
            recs_sorted = sorted(recs, key=lambda r: priority_order.get(r.get('priority'), 99))
        except Exception:
            recs_sorted = recs
        for idx, r in enumerate(recs_sorted, 1):
            pr = r.get('priority', '')
            txt = r.get('text', str(r))
            parts.append(f"{idx}. [{pr}] {txt}")

    risks = summary.get('risks')
    if risks:
        parts.append('\nRiesgos:\n' + risks)

    next_steps = summary.get('next_steps') or []
    if next_steps:
        parts.append('\nPróximos pasos:')
        for idx, s in enumerate(next_steps, 1):
            parts.append(f"{idx}. {s}")

    images = summary.get('images') or []
    if images:
        parts.append('\nImágenes de evidencia:')
        for p in images:
            parts.append(f"- {p}")

    return '\n'.join(parts)


def summary_to_html(summary: dict) -> str:
    """Convierte el summary en HTML limpio y estructurado para la UI y para el HTML fallback del PDF."""
    html_parts = []
    html_parts.append(f"<div class='report-card'><h2>Informe diagnóstico - {summary.get('municipio','')}</h2>")
    html_parts.append(f"<p class='muted'>{summary.get('introduction','')}</p>")

    findings = summary.get('findings')
    if findings:
        html_parts.append("<section><h3>Hallazgos</h3>")
        html_parts.append(f"<p>{findings}</p>")
        html_parts.append("</section>")

    key_issues = summary.get('key_issues') or []
    if key_issues:
        html_parts.append("<section><h3>Problemas clave</h3><ul>")
        for k in key_issues:
            html_parts.append(f"<li>{k}</li>")
        html_parts.append("</ul></section>")

    sols = summary.get('solutions') or []
    if sols:
        html_parts.append("<section><h3>Soluciones recomendadas</h3><div class='solutions'>")
        for s in sols:
            html_parts.append("<div class='solution'><h4>" + (s.get('title') or '') + "</h4>")
            html_parts.append("<p><strong>Prioridad:</strong> " + (s.get('priority') or '') + "</p>")
            html_parts.append("<p>" + (s.get('text') or '') + "</p></div>")
        html_parts.append("</div></section>")

    recs = summary.get('recommendations') or []
    if recs:
        html_parts.append("<section><h3>Recomendaciones priorizadas</h3><ol>")
        # sort by priority
        order = {'Alta': 1, 'Media': 2, 'Baja': 3}
        try:
            recs_sorted = sorted(recs, key=lambda r: order.get(r.get('priority'), 99))
        except Exception:
            recs_sorted = recs
        for r in recs_sorted:
            html_parts.append(f"<li>[{r.get('priority','')}] {r.get('text','')}</li>")
        html_parts.append("</ol></section>")

    next_steps = summary.get('next_steps') or []
    if next_steps:
        html_parts.append("<section><h3>Próximos pasos</h3><ol>")
        for s in next_steps:
            html_parts.append(f"<li>{s}</li>")
        html_parts.append("</ol></section>")

    risks = summary.get('risks')
    if risks:
        html_parts.append("<section><h3>Riesgos</h3>")
        html_parts.append(f"<p>{risks}</p>")
        html_parts.append("</section>")

    images = summary.get('images') or []
    if images:
        html_parts.append("<section><h3>Imágenes de evidencia</h3><div class='image-gallery'>")
        for p in images:
            html_parts.append(f"<img src=\"{p}\" style=\"max-width:220px;margin:8px;border-radius:6px;\"/>")
        html_parts.append("</div></section>")

    html_parts.append("</div>")
    return '\n'.join(html_parts)


def _build_pdf_bytes(summary: dict, analysis_text: str, image_paths: list, municipio: str) -> bytes:
    """Construye un PDF en bytes con un formato limpio usando reportlab.
    Si reportlab no está disponible, lanza RuntimeError.
    """
    if not REPORTLAB_AVAILABLE:
        raise RuntimeError('reportlab no está disponible en el entorno. Instale la dependencia.')

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4,
                            rightMargin=18*mm, leftMargin=18*mm,
                            topMargin=18*mm, bottomMargin=18*mm)
    styles = getSampleStyleSheet()
    normal = styles['Normal']
    h1 = ParagraphStyle('h1', parent=styles['Heading1'], alignment=0, fontSize=18)
    h2 = ParagraphStyle('h2', parent=styles['Heading2'], alignment=0, fontSize=14)

    elems = []
    elems.append(Paragraph(f'Informe de Diagnóstico - {municipio}', h1))
    elems.append(Spacer(1, 6))

    elems.append(Paragraph('Introducción', h2))
    elems.append(Paragraph(summary.get('introduction', ''), normal))
    elems.append(Spacer(1, 6))

    elems.append(Paragraph('Resumen de hallazgos', h2))
    elems.append(Paragraph(summary.get('findings', analysis_text or ''), normal))
    elems.append(Spacer(1, 8))

    key_issues = summary.get('key_issues', [])
    if key_issues:
        elems.append(Paragraph('Problemas clave', h2))
        for k in key_issues:
            elems.append(Paragraph(f'• {k}', normal))
        elems.append(Spacer(1, 8))

    sols = summary.get('solutions', [])
    if sols:
        elems.append(Paragraph('Soluciones recomendadas', h2))
        for s in sols:
            title = s.get('title') or s.get('text')
            pr = s.get('priority', '')
            elems.append(Paragraph(f'<b>{title}</b> [{pr}]', normal))
            elems.append(Paragraph(s.get('text', ''), normal))
            elems.append(Spacer(1, 4))
        elems.append(Spacer(1, 8))

    recs = summary.get('recommendations', [])
    if recs:
        elems.append(Paragraph('Recomendaciones priorizadas', h2))
        for r in recs:
            elems.append(Paragraph(f'• [{r.get("priority","")}] {r.get("text","")}', normal))
        elems.append(Spacer(1, 8))

    next_steps = summary.get('next_steps', [])
    if next_steps:
        elems.append(Paragraph('Próximos pasos', h2))
        for idx, s in enumerate(next_steps, 1):
            elems.append(Paragraph(f'{idx}. {s}', normal))
        elems.append(Spacer(1, 8))

    risks = summary.get('risks')
    if risks:
        elems.append(Paragraph('Riesgos', h2))
        elems.append(Paragraph(risks, normal))
        elems.append(Spacer(1, 8))

    if image_paths:
        elems.append(Paragraph('Imágenes de evidencia', h2))
        for p in image_paths:
            try:
                img = RLImage(p)
                max_width = (A4[0] - 36*mm)
                if img.drawWidth > max_width:
                    scale = max_width / img.drawWidth
                    img.drawWidth = img.drawWidth * scale
                    img.drawHeight = img.drawHeight * scale
                elems.append(img)
                elems.append(Spacer(1, 6))
            except Exception:
                elems.append(Paragraph(f'Imagen no disponible: {p}', normal))

    doc.build(elems)
    buffer.seek(0)
    return buffer.read()


@app.route('/api/informe/pdf', methods=['GET'])
def api_informe_pdf():
    municipio = request.args.get('municipio', '').strip()
    aggregate = request.args.get('aggregate', '1') in ('1', 'true', 'yes')
    if not municipio:
        return jsonify({'error': 'Parámetro municipio requerido'}), 400

    respuestas_path = os.path.join(app.root_path, 'static', 'scripts', 'respuestas.json')
    if not os.path.exists(respuestas_path):
        return jsonify({'error': 'No hay respuestas registradas aún.'}), 404

    try:
        with open(respuestas_path, 'r', encoding='utf-8') as f:
            all_data = json.load(f) or []
    except Exception as e:
        return jsonify({'error': 'Error leyendo respuestas: ' + str(e)}), 500

    owner_token = session.get('user_token')
    if aggregate:
        filtered = [r for r in all_data if isinstance(r, dict)
                    and r.get('municipio')
                    and r.get('municipio').strip().lower() == municipio.strip().lower()]
    else:
        if not owner_token:
            return jsonify({'error': 'No se ha identificado al usuario en la sesión.'}), 403
        filtered = [r for r in all_data if isinstance(r, dict)
                    and r.get('municipio')
                    and r.get('municipio').strip().lower() == municipio.strip().lower()
                    and r.get('owner') == owner_token]

    if not filtered:
        return jsonify({'error': f'No hay registros para el municipio "{municipio}".'}), 404

    summary = generate_summary(filtered)
    text = summary_to_text(summary)

    image_fs_paths = []
    for p in summary.get('images', []):
        rel = p.replace('/static/', '').lstrip('/\\')
        fs = os.path.join(app.root_path, 'static', rel.replace('/', os.sep))
        if os.path.exists(fs):
            image_fs_paths.append(fs)

    # Si reportlab está disponible, generamos PDF; si no, devolvemos un HTML descargable como fallback.
    if REPORTLAB_AVAILABLE:
        try:
            pdf_bytes = _build_pdf_bytes(summary, text, image_fs_paths, municipio)
        except Exception as e:
            return jsonify({'error': 'No se pudo generar PDF: ' + str(e)}), 500
        return send_file(BytesIO(pdf_bytes), mimetype='application/pdf', as_attachment=True, download_name=f'informe_{municipio}.pdf')
    else:
        # Generar HTML bonito como fallback y devolverlo como archivo descargable
        html = summary_to_html(summary)
        html_bytes = html.encode('utf-8')
        return send_file(BytesIO(html_bytes), mimetype='text/html', as_attachment=True, download_name=f'informe_{municipio}.html')

# ============================================
# RUTAS PÚBLICAS
@app.route('/register')
def register():
    """Formulario de registro de usuario"""
    return render_template('register.html')
# ============================================

@app.route('/')
def index():
    """Página principal / Landing page"""
    db_status, db_message = check_db_connection()
    return render_template('index.html', 
                         db_connected=db_status, 
                         db_message=db_message)

@app.route('/evaluacion')
def evaluacion():
    """Formulario de evaluación catastral"""
    return render_template('evaluacion.html')


@app.route('/informe')
def informe():
    """Página que muestra el informe (cliente pedirá /api/informe para datos)."""
    # Construir una línea de acceso similar al log de Flask
    addr = request.remote_addr or '127.0.0.1'
    ts = datetime.utcnow().strftime('%d/%b/%Y %H:%M:%S')
    qs = ('?' + request.query_string.decode()) if request.query_string else ''
    # Suponemos HTTP/1.1 y status 200 (la plantilla abrirá la consulta al API después)
    access_log = f"{addr} - - [{ts}] \"{request.method} {request.path}{qs} HTTP/1.1\" 200 -"
    return render_template('informe.html', access_log=access_log)

@app.route('/resultados')
def resultados():
    """Página de resultados del diagnóstico"""
    return render_template('resultados.html')

@app.route('/contacto')
def contacto():
    """Formulario de contacto"""
    return render_template('contacto.html')

@app.route('/geomap')
def geomap():
    """Mapa geográfico de municipios"""
    return render_template('geomap.html')

# ============================================
# RUTAS DE ADMINISTRACIÓN
# ============================================

@app.route('/admin-login')
def admin_login():
    """Página de login del administrador"""
    return render_template('admin-login.html')

@app.route('/admin-dashboard')
def admin_dashboard():
    """Dashboard principal del administrador"""
    if 'admin_logged_in' not in session:
        return redirect(url_for('admin_login'))
    return render_template('admin-dashboard.html')

@app.route('/admin-municipios')
def admin_municipios():
    """Lista de municipios evaluados"""
    if 'admin_logged_in' not in session:
        return redirect(url_for('admin_login'))
    return render_template('admin-municipios.html')


@app.route('/admin-citas')
def admin_citas():
    """Página de gestión de citas"""
    if 'admin_logged_in' not in session:
        return redirect(url_for('admin_login'))
    return render_template('admin-citas.html')

@app.route('/admin-mapa')
def admin_mapa():
    """Mapa administrativo con información detallada de municipios"""
    if 'admin_logged_in' not in session:
        return redirect(url_for('admin_login'))
    return render_template('admin-mapa.html')

# ============================================
# API ENDPOINTS
@app.route('/api/register', methods=['POST'])
def api_register():
    """Registra un nuevo usuario en la base de datos"""
    try:
        data = request.get_json() if request.is_json else request.form
        usuario = data.get('usuario')
        email = data.get('email')
        password = data.get('password')
        if not usuario or not email or not password:
            return jsonify({'success': False, 'message': 'Todos los campos son obligatorios.'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        # Crear tabla de usuarios si no existe
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS usuarios_ga (
                id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario VARCHAR(100) UNIQUE,
                email VARCHAR(100) UNIQUE,
                password VARCHAR(200),
                fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        # Verificar si el usuario o email ya existen
        cursor.execute('SELECT id_usuario FROM usuarios_ga WHERE usuario = ? OR email = ?', (usuario, email))
        if cursor.fetchone():
            conn.close()
            return jsonify({'success': False, 'message': 'El usuario o correo ya existe.'}), 409
        # Insertar usuario
        cursor.execute('INSERT INTO usuarios_ga (usuario, email, password) VALUES (?, ?, ?)', (usuario, email, password))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Usuario registrado correctamente.'})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500
# ============================================

@app.route('/api/login', methods=['POST'])
def api_login():
    """Endpoint para autenticación de administrador"""
    data = request.get_json()
    usuario_input = data.get('usuario')
    password = data.get('password')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id_usuario, usuario, email FROM usuarios_ga WHERE (usuario = ? OR email = ?) AND password = ?
    ''', (usuario_input, usuario_input, password))
    user = cursor.fetchone()
    conn.close()

    if user:
        session['admin_logged_in'] = True
        session['admin_usuario'] = user['usuario']
        session['admin_email'] = user['email']
        return jsonify({
            'success': True,
            'message': 'Login exitoso',
            'redirect': '/admin-dashboard'
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Credenciales incorrectas'
        }), 401

@app.route('/api/logout', methods=['POST'])
def api_logout():
    """Endpoint para cerrar sesión"""
    session.clear()
    return jsonify({'success': True, 'message': 'Sesión cerrada'})

# @app.route('/api/evaluacion', methods=['POST'])
# def api_evaluacion():
#     """Guarda una evaluación catastral"""
#     try:
#         data = request.get_json()
        
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         # Insertar resultados en la base de datos
#         cursor.execute('''
#             INSERT INTO resultados_ga (pdf, calificacion, resultados_preguntas)
#             VALUES (?, ?, ?)
#         ''', (None, data.get('calificacion_total', 0), json.dumps(data)))
        
#         resultado_id = cursor.lastrowid
#         conn.commit()
#         conn.close()
        
#         return jsonify({
#             'success': True,
#             'message': 'Evaluación guardada',
#             'id': resultado_id
#         })
#     except Exception as e:
#         return jsonify({
#             'success': False,
#             'message': f'Error al guardar: {str(e)}'
#         }), 500

@app.route('/api/contacto', methods=['POST'])
def api_contacto():
    """Guarda un mensaje de contacto"""
    try:
        data = request.get_json()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Crear tabla de contactos si no existe
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS contactos_ga (
                id_contacto INTEGER PRIMARY KEY AUTOINCREMENT,
                municipio VARCHAR(100),
                representante VARCHAR(100),
                area VARCHAR(100),
                telefono VARCHAR(20),
                email VARCHAR(100),
                cargo VARCHAR(100),
                intereses TEXT,
                mensaje TEXT,
                fecha DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            INSERT INTO contactos_ga 
            (municipio, representante, area, telefono, email, cargo, intereses, mensaje)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.get('municipio'),
            data.get('representante'),
            data.get('area'),
            data.get('telefono'),
            data.get('email'),
            data.get('cargo'),
            json.dumps(data.get('intereses', [])),
            data.get('mensaje')
        ))
        
        contacto_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Contacto guardado',
            'id': contacto_id
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al guardar: {str(e)}'
        }), 500

@app.route('/api/municipios', methods=['GET'])
def api_municipios():
    """Obtiene lista de municipios desde la base de datos"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT m.id_municipio, m.nombre_m, e.nombre_e 
            FROM municipio_ga m
            JOIN estado_ga e ON m.id_estado = e.id_estado
            ORDER BY m.nombre_m
        ''')
        
        municipios = []
        for row in cursor.fetchall():
            municipios.append({
                'id': row[0],
                'nombre': row[1],
                'estado': row[2]
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'municipios': municipios
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@app.route('/api/estados', methods=['GET'])
def api_estados():
    """Obtiene lista de estados desde la base de datos"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT id_estado, nombre_e FROM estado_ga ORDER BY nombre_e')
        
        estados = []
        for row in cursor.fetchall():
            estados.append({
                'id': row[0],
                'nombre': row[1]
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'estados': estados
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@app.route('/api/db-status', methods=['GET'])
def api_db_status():
    """Verifica el estado de la conexión a la base de datos"""
    db_status, db_message = check_db_connection()
    return jsonify({
        'connected': db_status,
        'message': db_message
    })

# ============================================
# MANEJO DE ERRORES
# ============================================

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(e):
    return render_template('500.html'), 500

# ============================================
# INICIALIZACIÓN
# ============================================

if __name__ == '__main__':
    # Verificar si existe la base de datos, si no, crearla
    if not os.path.exists(DATABASE):
        print("🔧 Base de datos no encontrada. Inicializando...")
        init_db()
    else:
        print("✅ Base de datos encontrada")
    
    # Verificar conexión
    db_status, db_message = check_db_connection()
    if db_status:
        print(f"✅ {db_message}")
    else:
        print(f"❌ {db_message}")
    
    # Iniciar el servidor Flask
    print("🚀 Iniciando servidor Flask...")
    print("📍 Servidor disponible en: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)