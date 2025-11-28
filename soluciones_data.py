# Datos de las soluciones IUCA
soluciones_data = [
    {
        'id': 'cartografia',
        'number': '01',
        'title': 'Cartografía 1:1000',
        'description': 'Levantamientos aéreos fotogramétricos de alta precisión para actualización territorial',
        'icon': 'M8 40L24 8L40 40H8Z',
        'details_title': 'Nuestros Productos de Cartografía',
        'sub_items': [
            {'number': '1.1', 'title': 'Ortofoto Clásica', 'description': 'Una ortofoto es una fotografía aérea del terreno vista desde arriba, que muestra calles, casas y edificios tal como se ven desde el aire. Perfecta para visualización y análisis territorial.'},
            {'number': '1.2', 'title': 'Vectorial', 'description': 'Un vectorial es un mapa digital que usa puntos, líneas y polígonos para representar calles, terrenos y edificios, con coordenadas X, Y y Z que permiten ubicar y medir cada elemento con precisión absoluta.'}
        ]
    },
    {
        'id': 'mineria',
        'number': '02',
        'title': 'Minería Catastral',
        'description': 'Análisis exhaustivo de padrones catastrales para identificar inconsistencias y maximizar recaudación',
        'icon': 'M16 24H32M24 16V32',
        'details_title': 'Procesos de Minería Catastral',
        'details_intro': 'Cada municipio puede contratar los cuatro procesos, combinar algunos o solicitar solo uno, según sus necesidades:',
        'sub_items': [
            {'number': '2.1', 'title': 'Migración', 'description': 'Transferencia de información del mapa viejo al nuevo respetando la clave catastral. Actualizamos el mapa manteniendo el "código de barras" de cada predio, así cada terreno conserva su historial completo.'},
            {'number': '2.2', 'title': 'Cruce y Conciliación', 'description': 'Comparación integral de cartografía, actas, escrituras, bases de datos y padrones para detectar coincidencias, faltantes y errores. Luego unificamos toda la información para que el municipio tenga un único dato oficial y confiable.'},
            {'number': '2.3', 'title': 'Vinculación', 'description': 'Conexión de cada predio con su información oficial: nuevo mapa, escrituras, actas, bases de datos, padrones y clave catastral. Creamos un "expediente digital" completo para cada terreno en un solo lugar.'},
            {'number': '2.4', 'title': 'Prevaluación Masiva de Predios', 'description': 'Estimación de valor de múltiples predios usando datos como superficie, ubicación y uso de suelo. Aplicamos valores unitarios oficiales de la Ley de Ingresos para obtener un valor aproximado antes de la valuación detallada.'}
        ]
    },
    {
        'id': 'digitalizacion',
        'number': '03',
        'title': 'Digitalización y Gestión de Documentos',
        'description': 'Conversión y organización de documentos físicos en archivos digitales clasificados',
        'icon': 'M18 16H30M18 22H30M18 28H24',
        'details_title': 'Sistema de Gestión Documental',
        'details_description': 'Convertimos todos los documentos físicos (escrituras, actas, planos, oficios, etc.) en archivos digitales organizados dentro de un gestor de documentos profesional.',
        'benefits': ['Digitalización completa de documentos', 'Clasificación por clave catastral', 'Almacenamiento seguro', 'Consulta rápida y eficiente']
    },
    {
        'id': 'higienizacion',
        'number': '04',
        'title': 'Higienización de Bases de Datos',
        'description': 'Limpieza y corrección de información para bases de datos completas y confiables',
        'icon': 'M16 24L22 30L32 18',
        'details_title': 'Proceso de Higienización',
        'details_description': 'Limpiamos y corregimos toda la información municipal para que esté completa, actualizada y sin errores.',
        'steps': [
            {'number': '1', 'title': 'Eliminación de Duplicados', 'description': 'Identificamos y eliminamos registros duplicados'},
            {'number': '2', 'title': 'Corrección de Datos', 'description': 'Corregimos información mal escrita o incompleta'},
            {'number': '3', 'title': 'Actualización', 'description': 'Actualizamos información obsoleta'},
            {'number': '4', 'title': 'Estandarización', 'description': 'Unificamos nombres y formatos'}
        ]
    },
    {
        'id': 'mapa360',
        'number': '05',
        'title': 'Mapa Móvil 360°',
        'description': 'Recorridos virtuales con imágenes panorámicas de 360° de todo el municipio',
        'icon': 'M24 12V24L30 30',
        'details_title': 'Tecnología de Captura 360°',
        'details_description': 'Herramienta que permite recorrer las calles del municipio mediante imágenes panorámicas de 360° capturadas con cámara especial montada en vehículo.',
        'features': ['Visualiza fachadas, postes, banquetas y señalización', 'Documenta el estado actual de la infraestructura', 'Reduce visitas de campo', 'Registro visual confiable para comparación temporal']
    },
    {
        'id': 'sistemas',
        'number': '06',
        'title': 'Sistemas de Administración Catastral',
        'description': 'Plataformas digitales a medida para gestión integral de catastro municipal',
        'icon': 'M8 20H40',
        'details_title': 'Plataforma Integral de Gestión',
        'details_description': 'Sistemas diseñados específicamente para que cada municipio organice, consulte y actualice toda su información catastral de forma sencilla.',
        'capabilities': [
            {'title': 'Gestión de Predios', 'description': 'Control completo de propiedades y claves catastrales'},
            {'title': 'Administración de Trámites', 'description': 'Seguimiento de solicitudes y procesos'},
            {'title': 'Gestión Documental', 'description': 'Manejo centralizado de documentos y planos'},
            {'title': 'Sistema de Cobros', 'description': 'Cálculo automático y gestión de pagos'},
            {'title': 'Reportes y Analytics', 'description': 'Información en tiempo real para decisiones'},
            {'title': 'Integración Total', 'description': 'Todas las áreas en un solo sistema'}
        ]
    },
    {
        'id': 'cobro',
        'number': '07',
        'title': 'Sistema de Cobro Predial Básico',
        'description': 'Herramienta automatizada para cálculo, facturación y gestión de pagos prediales',
        'icon': 'M10 22H38',
        'details_title': 'Sistema Integral de Cobro',
        'details_description': 'Plataforma que automatiza todo el proceso de cobro predial desde el cálculo hasta el pago.',
        'two_columns': [
            {'title': 'Funciones Principales', 'items': ['Cálculo automático de adeudos', 'Gestión de recargos y actualizaciones', 'Generación de facturas', 'Creación de líneas de captura', 'Panel de control administrativo']},
            {'title': 'Formas de Pago', 'items': ['Pagos en línea', 'Pagos en ventanilla', 'Transferencias bancarias', 'Múltiples métodos de pago', 'Confirmación automática']}
        ]
    },
    {
        'id': 'sig',
        'number': '08',
        'title': 'SIG Multifinalitario',
        'description': 'Sistema de Información Geográfica que integra todas las áreas del municipio en un solo mapa',
        'icon': 'M24 8L16 16H12V32H16L24 40L32 32H36V16H32L24 8Z',
        'details_title': 'Sistema de Información Geográfica Integral',
        'details_description': 'Integra en un mismo mapa toda la información del municipio, no solo catastro. Todas las áreas trabajan con la misma base de datos.',
        'modules': ['Agua y Alcantarillado', 'Seguridad Pública', 'Obras Públicas', 'Protección Civil', 'Movilidad', 'Medio Ambiente', 'Desarrollo Urbano', 'Catastro'],
        'sig_benefits': ['Consulta territorial en segundos', 'Análisis con contexto geográfico', 'Ev ita trabajos duplicados', 'Coordinación entre áreas', 'Decisiones basadas en datos', 'Información actualizada']
    }
]
