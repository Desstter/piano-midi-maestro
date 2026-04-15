# 🎹 Piano MIDI Maestro

**Tu maestro personal de piano interactivo**

Una aplicación web completa para aprender piano con tu teclado MIDI de 32 teclas. Incluye modos de juego para notas, acordes, escalas e intervalos, con teoría musical integrada y múltiples temas visuales.

---

## ✨ Características

### 🎮 Modos de Juego

1. **Reconocimiento de Notas**
   - Aprende a identificar y tocar notas individuales
   - Sistema de niveles progresivo
   - Feedback instantáneo

2. **Acordes**
   - Practica acordes mayores, menores, 7ª, disminuidos, aumentados y más
   - 9 tipos diferentes de acordes
   - Ayudas visuales en el piano

3. **Escalas**
   - Domina escalas mayores, menores, pentatónicas, blues y más
   - 8 tipos de escalas diferentes
   - Practica tocando en secuencia

4. **Intervalos**
   - Identifica distancias entre notas
   - Desde unísono hasta octava completa
   - Intervalos armónicos y melódicos

### 🎨 Temas Visuales

- **Moderno**: Diseño minimalista y limpio
- **Colorido**: Estilo gamificado con colores vibrantes
- **Clásico**: Inspirado en pianos vintage con textura de papel

### 🎵 Sistema de Notación

- **Notación Latina**: Do, Re, Mi, Fa, Sol, La, Si
- **Notación Anglosajona**: C, D, E, F, G, A, B
- **Ambas**: Muestra las dos notaciones simultáneamente

### 📊 Sistema de Progreso

- Racha de respuestas correctas
- Porcentaje de precisión
- Sistema de niveles
- Estadísticas guardadas localmente

### 🔊 Sistema de Audio Realista

- **Sonidos de piano real** usando samples de Salamander Grand Piano
- **Reproducción en tiempo real** con latencia < 15ms
- **Funciona como un piano de verdad**: suena al tocar tu MIDI o al hacer click en el piano virtual
- **Pitch-shifting inteligente** para todas las notas
- **Sensibilidad a velocity** (intensidad de pulsación)
- **Polifonía ilimitada** (múltiples notas simultáneas)
- **Carga automática** en segundo plano
- **Sin dependencias externas** - todo implementado con Web Audio API

---

## 🚀 Cómo Usar

### Requisitos

1. **Navegador web moderno** que soporte Web MIDI API:
   - Google Chrome (recomendado)
   - Microsoft Edge
   - Opera

2. **Teclado MIDI** de 32 teclas (o más)
   - Conectado vía USB

3. **Servidor web local** (XAMPP, WAMP, etc.)

### Instalación

1. Coloca los archivos en tu directorio web:
   ```
   C:\xampp\htdocs\midi\
   ```

2. Conecta tu teclado MIDI al PC

3. Abre tu navegador y navega a:
   ```
   http://localhost/midi/
   ```

4. Permite el acceso MIDI cuando el navegador lo solicite

5. ¡Comienza a practicar!

---

## 📖 Guía de Uso

### Primera Vez

1. **Conecta tu MIDI**: Asegúrate de que tu teclado esté conectado antes de abrir la app
2. **Selecciona un modo**: Usa los botones en la barra lateral
3. **Configura tus preferencias**: Click en el botón ⚙️ para:
   - Cambiar tema visual
   - Seleccionar notación (Latina/Anglosajona)
   - Activar modo cronometrado
   - Configurar avance automático

### Controles

- **💡 Mostrar Ayudas**: Activa/desactiva las pistas visuales
- **🔊 Reproducir Nota**: Escucha el desafío actual
- **Siguiente ➡️**: Genera un nuevo desafío

### Consejos

- **Empieza con el modo Notas** para familiarizarte con el piano
- **Usa las ayudas visuales** hasta sentirte cómodo
- **Practica regularmente** para mejorar tu precisión
- **Lee la teoría musical** en el panel inferior de cada modo
- **Aumenta el nivel gradualmente** - cada modo se adapta a tu progreso

---

## 🎼 Teoría Musical Incluida

### Notas
Aprende las 12 notas musicales, teclas blancas y negras, sostenidos y bemoles.

### Acordes
- Mayor, Menor, Séptima
- Mayor Séptima, Menor Séptima
- Disminuido, Aumentado
- Suspendido 2 y 4

### Escalas
- Mayor, Menor Natural
- Menor Armónica, Menor Melódica
- Pentatónica Mayor y Menor
- Blues, Cromática

### Intervalos
Desde unísono (0 semitonos) hasta octava (12 semitonos), incluyendo el famoso tritono.

---

## 🛠️ Tecnologías

- **HTML5** - Estructura
- **CSS3** - Estilos y animaciones
- **JavaScript Vanilla** - Lógica de la aplicación
- **Web MIDI API** - Comunicación con dispositivo MIDI
- **Web Audio API** - Reproducción de audio realista con samples
- **Canvas API** - Renderizado del piano virtual interactivo
- **LocalStorage** - Persistencia de datos

---

## 📁 Estructura del Proyecto

```
midi/
├── index.html                      # Página principal
├── README.md                       # Documentación
├── css/
│   ├── styles.css                  # Estilos base
│   └── themes/
│       ├── modern.css              # Tema moderno
│       ├── colorful.css            # Tema colorido
│       └── classic.css             # Tema clásico
├── js/
│   ├── app.js                      # Aplicación principal
│   ├── audio-engine.js             # Motor de audio (Web Audio API)
│   ├── midi-controller.js          # Controlador MIDI
│   ├── music-theory.js             # Teoría musical
│   ├── notation.js                 # Sistema de notación
│   ├── ui-controller.js            # Controlador UI y piano
│   ├── theme-manager.js            # Gestor de temas
│   └── game-modes/
│       ├── notes-mode.js           # Modo notas
│       ├── chords-mode.js          # Modo acordes
│       ├── scales-mode.js          # Modo escalas
│       └── intervals-mode.js       # Modo intervalos
└── assets/
    ├── sounds/                     # Samples de audio (cargados desde CDN)
    └── images/                     # Imágenes (futuro)
```

---

## 🐛 Solución de Problemas

### El MIDI no se detecta

1. Verifica que tu teclado esté conectado antes de abrir la app
2. Recarga la página (F5)
3. Verifica que estés usando Chrome, Edge u Opera
4. Permite el acceso MIDI cuando el navegador lo solicite
5. Ve a Configuración (⚙️) y selecciona tu dispositivo manualmente

### La aplicación no carga

1. Asegúrate de estar usando un servidor web (no abras el archivo HTML directamente)
2. Verifica que todos los archivos estén en su lugar
3. Abre la consola del navegador (F12) y busca errores

### Las teclas no responden

1. Verifica que el indicador MIDI muestre "Conectado"
2. Toca algunas teclas y observa el piano virtual
3. Asegúrate de estar en el modo correcto
4. Recarga la página si es necesario

### No se escucha sonido

1. **Primera vez**: Haz click en cualquier parte de la página (requerido por políticas del navegador)
2. Espera a que carguen los samples (verás un indicador en la parte superior)
3. Verifica el volumen de tu sistema operativo
4. Abre la consola (F12) y busca errores de audio
5. Si los samples no cargan, verifica tu conexión a internet

### El audio tiene latencia o se corta

1. Cierra otras pestañas/aplicaciones que usen audio
2. Usa Google Chrome para mejor rendimiento de Web Audio API
3. Reduce la calidad del audio si tu PC es antiguo
4. Verifica que no tengas muchos programas abiertos

---

## 🎯 Roadmap Futuro

- [x] ~~Sonidos de piano usando Web Audio API~~ ✅ **¡COMPLETADO!**
- [ ] Control de volumen en la interfaz
- [ ] Efectos de reverb/delay opcionales
- [ ] Modo de práctica libre
- [ ] Grabación de sesiones
- [ ] Desafíos personalizados
- [ ] Modo multijugador
- [ ] Soporte para MIDI de 88 teclas
- [ ] Exportar progreso

---

## 📝 Notas del Desarrollador

Esta aplicación fue diseñada específicamente para estudiantes de piano que están comenzando su viaje musical. Se enfoca en:

- **Aprendizaje progresivo**: Los niveles se adaptan a tu habilidad
- **Feedback inmediato**: Sabes al instante si tocaste correctamente
- **Teoría integrada**: Aprende el "por qué" mientras practicas
- **Personalización**: Adapta la app a tu estilo de aprendizaje

---

## 🎓 Recursos Adicionales

Para profundizar en teoría musical:
- [musictheory.net](https://www.musictheory.net)
- [teoria.com](https://www.teoria.com)

Para más información sobre MIDI:
- [Web MIDI API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API)

---

## 🤝 Contribuciones

Este es un proyecto educativo. Siéntete libre de:
- Reportar bugs
- Sugerir mejoras
- Agregar nuevos modos de juego
- Mejorar la documentación

---

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso educativo.

---

## 🎵 ¡Disfruta aprendiendo piano!

Recuerda: La práctica hace al maestro. Dedica 15-30 minutos diarios y verás progreso rápidamente.

**¡Feliz aprendizaje! 🎹✨**
