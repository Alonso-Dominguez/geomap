from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import sqlite3
import os
from datetime import datetime
import json

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