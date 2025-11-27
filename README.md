# Asistente Inteligente de Diagnóstico Catastral - IUCA

## 📋 Descripción del Proyecto

Sistema web minimalista y ejecutivo diseñado para diagnosticar rápidamente el estado del catastro municipal mediante un cuestionario dinámico, generando recomendaciones personalizadas y planes de acción.

## 🎨 Paleta de Colores IUCA

- **#0F1F45** - Azul Navy (Primary)
- **#B8C4CC** - Gris Azulado Claro (Secondary)
- **#FFFFFF** - Blanco (Background)
- **#B0BAE0** - Azul Lavanda (Accent)

## 📁 Estructura del Proyecto

```
iuca-diagnostico/
│
├── index.html              # Landing page principal
├── evaluacion.html         # Formulario de evaluación catastral
├── resultados.html         # Página de resultados del diagnóstico
├── contacto.html           # Formulario de contacto
│
├── styles/
│   └── main.css           # Estilos globales minimalistas
│
├── scripts/
│   ├── main.js            # JavaScript de landing page
│   ├── evaluacion.js      # Lógica de formulario de evaluación
│   ├── resultados.js      # Generación de diagnóstico
│   └── contacto.js        # Validación de contacto
│
├── assets/
│   └── logo-iuca.png      # Logo de IUCA
│
└── README.md              # Este archivo
```

## 🌟 Características Principales

### 1. Landing Page (index.html)

- Hero section con estadísticas clave
- Grid de características del sistema
- Soluciones IUCA con diseño minimalista
- Call-to-action destacado
- Footer corporativo

### 2. Formulario de Evaluación (evaluacion.html)

- 5 secciones organizadas:
  1. Información General
  2. Estado de la Cartografía
  3. Padrón Catastral
  4. Sistemas y Tecnología
  5. Necesidades Específicas
- Barra de progreso dinámica
- Validación en tiempo real
- Guardado automático en localStorage

### 3. Resultados del Diagnóstico (resultados.html)

- Calificación circular animada (0-100 puntos)
- Índice de Madurez Catastral con 4 niveles
- Desglose de métricas por área
- Observaciones personalizadas
- Recomendaciones basadas en diagnóstico
- Plan de acción en 3 fases
- Estimación de impacto
- Exportación a PDF

### 4. Formulario de Contacto (contacto.html)

- Diseño en dos columnas
- Información de contacto de IUCA
- Campos obligatorios:
  - Nombre del municipio
  - Representante
  - Área/Departamento
  - Número de contacto
  - Email
- Validación de email y teléfono
- Mensaje de confirmación

## 🚀 Cómo Usar

1. **Abrir el sitio**: Abre `index.html` en tu navegador
2. **Iniciar diagnóstico**: Haz clic en "Iniciar Diagnóstico"
3. **Completar evaluación**: Responde las 5 secciones del formulario
4. **Ver resultados**: El sistema calculará automáticamente el diagnóstico
5. **Solicitar propuesta**: Usa el formulario de contacto para más información

## 💡 Funcionalidades Técnicas

- **Responsive Design**: Adaptable a móviles, tablets y desktop
- **Almacenamiento Local**: Los datos se guardan en localStorage
- **Animaciones Suaves**: Transiciones CSS para mejor UX
- **Validación de Formularios**: Validación en tiempo real
- **Algoritmo de Puntuación**: Calcula madurez catastral basada en respuestas
- **Generación Dinámica**: Observaciones y recomendaciones personalizadas

## 🎯 Algoritmo de Puntuación

El sistema calcula un puntaje de 0 a 100 basado en:

1. **Cartografía (25 puntos)**:

   - Antigüedad de actualización
   - Tipo de cartografía disponible

2. **Padrón (25 puntos)**:

   - Estado del padrón
   - Nivel de rezago catastral

3. **Tecnología (25 puntos)**:

   - Sistema catastral digitalizado
   - Procesos de cobro

4. **Digitalización (25 puntos)**:
   - Expedientes digitales
   - Cantidad de necesidades identificadas

### Niveles de Madurez:

- **75-100**: Alta - Base sólida, mantenimiento preventivo
- **50-74**: Media - Base funcional, requiere actualizaciones
- **25-49**: Baja - Necesita modernización integral
- **0-24**: Crítica - Requiere transformación completa

## 🔧 Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Diseño minimalista con variables CSS
- **JavaScript (Vanilla)**: Sin dependencias externas
- **Google Fonts**: Tipografía Inter
- **SVG**: Iconografía personalizada

## 📱 Compatibilidad

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Responsive (Mobile, Tablet, Desktop)

## 👥 Información de Contacto

**Instituto Universitario de Ciencias Ambientales (IUCA)**

- **Contacto**: María Fernanda Gayosso Lucio
- **Email**: fernanda.gayosso@sigsa.com.mx
- **Teléfono**: 555 436 0762
- **Horario**: Lun - Vie: 9:00 AM - 6:00 PM

## 📄 Licencia

© 2025 Instituto Universitario de Ciencias Ambientales (IUCA). Todos los derechos reservados.

---

**Desarrollado para el Hackathon - Asistente Inteligente de Diagnóstico Catastral**
