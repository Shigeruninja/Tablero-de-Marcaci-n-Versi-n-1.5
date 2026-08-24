# 📖 MANUAL DE USUARIO Y GUÍA DE OPERACIÓN OFICIAL
## TABLERO DEPORTIVO MULTIDEPORTE ELECTRÓNICO & CONTROLADOR DE GIMNASIO ESCOLAR
**Versión del Sistema:** 2.5 Pro LED Edition  
**Compatibilidad Hardware:** Arduino UNO / Nano / Mega / ESP32 / ESP8266 + Tira LED WS2812B / Matrices MAX7219  
**Interfaz:** Web Control Panel (PC, Notebook, Tablet y Móvil) + Web Serial / Bluetooth / WiFi  

---

## 📑 ÍNDICE GENERAL

1. [Introducción y Arquitectura del Sistema](#1-introducción-y-arquitectura-del-sistema)
2. [Matriz Reticular LED (17x64 Píxeles) y Tipografías Proporcionales](#2-matriz-reticular-led-17x64-píxeles-y-tipografías-proporcionales)
3. [Conexión y Enlace con el Hardware](#3-conexión-y-enlace-con-el-hardware)
4. [Modos de Funcionamiento](#4-modos-de-funcionamiento)
   - 4.1. Modo Tablero Deportivo (Scoreboard)
   - 4.2. Modo Reloj de Hora Oficial (RTC DS3231)
   - 4.3. Modo Cartel de Mensajes Luminosos (Banner LED 2 Renglones)
5. [Guía de Operación por Disciplina Deportiva](#5-guía-de-operación-por-disciplina-deportiva)
   - 5.1. Básquetbol (Reglamento FIBA / NBA)
   - 5.2. Fútbol y Futsal (AFA / FIFA)
   - 5.3. Voleibol (Sets, Saque y Sustituciones)
   - 5.4. Handball (Exclusiones 2 Minutos y Juego Pasivo)
   - 5.5. Boxeo y Artes Marciales (Rounds, Descanso y Campana)
   - 5.6. Modo Personalizado / Gimnasio Libre
6. [Operación del Cronómetro Principal y Reloj de Posesión (24s / 14s)](#6-operación-del-cronómetro-principal-y-reloj-de-posesión)
7. [Sistema de Macros y Atajos de Teclado (Modo PC / Mesa de Control)](#7-sistema-de-macros-y-atajos-de-teclado)
8. [Sistema de Audio, Sintetizador y Sonidos Personalizados](#8-sistema-de-audio-sintetizador-y-sonidos-personalizados)
9. [Iluminación LED RGB y Efectos Dinámicos FastLED](#9-iluminación-led-rgb-y-efectos-dinámicos-fastled)
10. [Protocolo Serie ASCII y Tabla de Comandos](#10-protocolo-serie-ascii-y-tabla-de-comandos)
11. [Instalación en Windows 11 y Android (PWA & Offline)](#11-instalación-en-windows-11-y-android)
12. [Solución de Problemas Frecuentes (FAQ & Troubleshooting)](#12-solución-de-problemas-frecuentes)

---

## 1. INTRODUCCIÓN Y ARQUITECTURA DEL SISTEMA

El **Sistema de Tablero Deportivo Escolar** es una solución integral de cronometraje, tanteador electrónico y señalización luminosa diseñada para gimnasios educativos, clubes deportivos y polideportivos.

Combina dos capas interconectadas:
1. **Controlador Central Web (Software de Mesa de Control):** Aplicación interactiva de alta precisión en tiempo real con Web Audio API, animaciones dinámicas de tiras LED, macros de teclado y compatibilidad PWA para Windows 11 y Android.
2. **Tablero Electrónico Físico (Hardware Arduino / ESP32):** Módulos de visualización LED direccionables WS2812B (retícula 17x64 = 1088 LEDs) y matrices MAX7219, reloj RTC DS3231 respaldado por pila CR2032 y relé optoacoplado para sirena de 220V/12V en Pin D8.

```
┌─────────────────────────────────────────────────────────────┐
│                 MESA DE CONTROL (PC / TABLET)               │
│  - Interfaz Web React / TypeScript / PWA Windows & Android  │
│  - Atajos de Teclado para Mesa Oficial (Macros PC)          │
│  - Motor Acústico: Sintetizador Web Audio + Sonidos Propios │
│  - Motor de Efectos LED RGB Independientes por Componente   │
└──────────────────────────────┬──────────────────────────────┘
                               │  USB Serial / Bluetooth / WiFi
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               CONTROLADOR CENTRAL (ARDUINO / ESP32)         │
│  - Decodificación de Comandos y Protocolo Serie FastLED     │
│  - Gestión de Tiempo por Interrupciones de Hardware         │
│  - Módulo RTC DS3231 (Respaldo con Pila CR2032)             │
└───────┬──────────────┬──────────────┬──────────────┬────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────┐
│ RETÍCULA LED ││ RELOJ 24s/14s││ MATRIZ LED   ││ SIRENA / HORN│
│ 17x64 WS2812B││ Posesión     ││ 2 Renglones  ││ Relé D8 12V  │
│ Tipografías  ││ Shot Clock   ││ Textos 3x5   ││ 220V Acústica│
└──────────────┘└──────────────┘└──────────────┘└──────────────┘
```

---

## 2. MATRIZ RETICULAR LED (17x64 PÍXELES) Y TIPOGRAFÍAS PROPORCIONALES

El cartel físico estándar (256 cm de ancho x 68 cm de alto, con celdas de 4 cm x 4 cm) organiza sus 1088 píxeles LED en dos renglones estructurados con familias tipográficas optimizadas para lectura nítida hasta 50 metros de distancia:

* **Renglón 1 (Filas 1 a 7):**
  - **Tanteador Local:** Columnas 2 a 12, Filas 1 a 7 (Tipografía 5x7 Biselada de 5 columnas de ancho x 7 filas de alto con 1 píxel de separación).
  - **Periodo / Cuarto Central:** Columnas 16 a 48, Filas 2 a 6 (Tipografía 3x5 Compacta simétricamente centrada, ej: `1 CUARTO`, `2 TIEMPO`, `1 SET`, `T EXTRA`).
  - **Tanteador Visitante:** Columnas 52 a 62, Filas 1 a 7 (Tipografía 5x7 Biselada).
  - **Indicadores de Posesión Lateral:** Columna 0 (Local) y Columna 63 (Visitante) en Filas 3 a 5.
* **Renglón 2 (Filas 9 a 15):**
  - **Cronómetro de Juego Centrado:** Centrado exacto sobre el eje horizontal (64 columnas) y vertical (Filas 9 a 15) en Tipografía 5x7 Biselada. Contiene exclusivamente minutos y segundos (`MM:SS` para < 100 min, y `MMM:SS` con capacidad de llegar hasta 3 dígitos de minutos, ej: `120:00`).
* **Cartel de Mensajes (2 Renglones):** Renglón 1 en Filas 2 a 6 (Y=2), Renglón 2 en Filas 10 a 14 (Y=10) en tipografía 3x5, con modos estático o desplazamiento continuo.

---

## 3. CONEXIÓN Y ENLACE CON EL HARDWARE

### 3.1. Conexión USB Serial Directa (Recomendada para PC / Windows 11)
1. Conecte el cable USB de la placa Arduino / ESP32 a la computadora de la mesa de control.
2. En la aplicación web, haga clic en el botón superior **`ENLACE`** (o ícono de antena).
3. Seleccione la pestaña **`USB / Serie Directo`**.
4. Configure la velocidad de baudios: **`9600 Baud`** (Arduino UNO/Nano estándar) o **`115200 Baud`** (ESP32).
5. Haga clic en **`Abrir Puerto Serie (Web Serial)`**.
6. El navegador mostrará un cuadro de diálogo del sistema: elija el puerto COM correspondiente (ej: `USB-SERIAL CH340` o `Arduino Uno`) y presione **Conectar**.
7. La luz de estado en la cabecera pasará a verde (**`USB: COMx @ 9600`**).

### 3.2. Conexión Inalámbrica Bluetooth (HC-05 / ESP32)
1. Encienda el módulo Bluetooth del tablero deportivo.
2. Abra el menú **`ENLACE`** > **`Bluetooth Serial`**.
3. Haga clic en **`Buscar Dispositivos Bluetooth`** y empareje con `TABLERO_GIMNASIO` o `HC-05`.

### 3.3. Conexión WiFi / Red Local (ESP8266 / ESP32)
1. Conecte el ESP32 a la red WiFi del gimnasio escolar.
2. Ingrese la dirección IP asignada (ej: `192.168.1.150:8080`) en la pestaña **`Red WiFi (TCP/WS)`**.
3. Presione **`Conectar Socket`**.

---

## 4. MODOS DE FUNCIONAMIENTO

### 4.1. Modo Tablero Deportivo (`TABLERO DE JUEGO`)
* Operación de cronómetro reglamentario, tanteador, faltas, tiempos muertos, posesión y chicharras.
* Vista previa en vivo idéntica a la disposición física de los LED con efectos dinámicos en tiempo real.

### 4.2. Modo Reloj de Hora Oficial (`RELOJ RTC (DS3231)`)
* Cuando no hay partidos en curso, el tablero muestra la hora oficial (`HH:MM:SS`) y fecha (`DD/MM/AAAA`).
* Incluye botón de **`Sincronizar RTC con PC`** para calibrar el módulo DS3231 al segundo exacto con un solo clic.

### 4.3. Modo Cartel de Mensajes Luminosos (`CARTEL MENSAJES`)
* Cartel de dos renglones con tipografía 3x5 de alta legibilidad.
* Presets integrados: *"Bienvenidos al Gimnasio Escolar"*, *"Acto de Fin de Curso"*, *"Torneo Intercolegial"*, etc.
* Control de velocidad de desplazamiento, brillo y efectos de destello.

---

## 5. GUÍA DE OPERACIÓN POR DISCIPLINA DEPORTIVA

### 5.1. Básquetbol (Reglamento FIBA / NBA)
* **Puntuación Rápida:** Botones dedicados para `+1` (Tiro Libre), `+2` (Doble), `+3` (Triple) y `-1` (Corrección de anulación).
* **Auto-Reset de Posesión en Canasta:** Al marcar un punto (+1, +2 o +3), el reloj de 24 segundos **se detiene y resetea automáticamente a 24s**, y la posesión pasa automáticamente al equipo rival.
* **Faltas Colectivas:** Contador de faltas por cuarto. Al alcanzar la 5ª falta, el tablero enciende automáticamente el indicador de **PENALIZACIÓN / BONUS**.
* **Flecha de Posesión Alternada FIBA:** Permite alternar la flecha de salto entre Local y Visitante (`P`).
* **Tiempos Muertos:** Botón de Time-Out oficial de **60 segundos** con cuenta regresiva en pantalla y aviso sonoro.

### 5.2. Fútbol y Futsal (AFA / FIFA)
* **Tiempos Reglamentarios:** 2 Tiempos de 45 minutos (Fútbol 11) o 2 Tiempos de 20 minutos netos (Futsal).
* **Tarjetas:** Registro de tarjetas Amarillas y Rojas por equipo.
* **Minutos Adicionados:** Botones rápidos para indicar tiempo de descuento (`+1m`, `+2m`, `+3m`, `+5m`).
* **Botón de ¡GOL!:** Emite sonido de sirena de gol y ovación de estadio.

### 5.3. Voleibol
* **Contador de Sets:** Tanteador de sets ganados (al mejor de 3 o 5 sets).
* **Indicador de Saque:** Flecha lumínica indicando qué equipo tiene el servicio.
* **Control de Sustituciones:** Contador reglamentario de cambios por set (máximo 6 sustituciones permitidas).

### 5.4. Handball (Balonmano)
* **2 Tiempos de 30 Minutos:** Cronómetro oficial con conteo ascendente o descendente.
* **Exclusiones de 2 Minutos Temporizadas:** Temporizadores independientes para sanción de jugadores excluidos.
* **Alerta de Juego Pasivo:** Sonido y señal lumínica de advertencia de pasivo para los árbitros.

### 5.5. Boxeo y Artes Marciales
* **Temporizador de Rounds y Descansos:** Configuración de tiempo de asalto (ej: 3 min) y tiempo de descanso (ej: 1 min).
* **Campana Acústica:** Toque de gong y campana de boxeo para inicio y fin de asalto.

---

## 6. OPERACIÓN DEL CRONÓMETRO PRINCIPAL Y RELOJ DE POSESIÓN

### Cronómetro Principal:
* **Iniciar / Pausar:** Botón grande central o barra espaciadora (`Espacio`).
* **Ajuste Fino:** Botones `+1m`, `-1m`, `+10s`, `-10s`.
* **Edición Directa:** Al hacer clic en el tiempo, puede escribir manualmente los minutos y segundos deseados.
* **Décimas de Segundo:** Durante el último minuto de juego (tiempo < 01:00), el display muestra automáticamente décimas de segundo (`SS.d`) para máxima precisión.
* **Chicharra de Fin de Tiempo:** Al llegar a `00:00`, se activa automáticamente la sirena por 2.5 segundos y se envía la orden de encendido al relé del pin D8.

### Reloj de Posesión (Shot Clock 24s / 14s):
* **Botón 24s (Tecla 1):** Reinicia la posesión a 24 segundos (inicio de jugada ofensiva).
* **Botón 14s (Tecla 2):** Reinicia a 14 segundos reglamentarios (rebote ofensivo o falta en campo de ataque).
* **Sincronización Automática:** El reloj de 24s arranca y se detiene automáticamente en conjunto con el cronómetro principal del partido.

---

## 7. SISTEMA DE MACROS Y ATAJOS DE TECLADO

| Función / Acción | Tecla Asignada | Descripción |
|---|---|---|
| **Iniciar / Pausar Tiempo** | `Espacio` | Arranca o detiene el cronómetro principal |
| **Reiniciar Tiempo** | `R` | Vuelve al tiempo reglamentario inicial del periodo |
| **Sumar / Restar 1 Minuto** | `+` / `-` | Ajuste rápido de minutos |
| **Sumar / Restar 10 Segundos** | `]` / `[` | Corrección de segundos |
| **Local: +1 Punto (Libre / Gol)** | `Q` | Suma 1 punto al equipo local |
| **Local: +2 Puntos (Doble)** | `W` | Suma 2 puntos de campo |
| **Local: +3 Puntos (Triple)** | `E` | Suma 3 puntos de triple |
| **Local: -1 Punto (Corrección)** | `A` | Descuenta 1 punto en caso de anulación |
| **Local: +1 Falta Colectiva** | `F` | Suma una falta al equipo local |
| **Local: Pedir Tiempo Muerto** | `T` | Inicia conteo oficial de Time-Out de 60s |
| **Visitante: +1 Punto** | `U` | Suma 1 punto al equipo visitante |
| **Visitante: +2 Puntos** | `I` | Suma 2 puntos de campo |
| **Visitante: +3 Puntos** | `O` | Suma 3 puntos de triple |
| **Visitante: -1 Punto** | `J` | Descuenta 1 punto |
| **Visitante: +1 Falta Colectiva** | `H` | Suma una falta al visitante |
| **Visitante: Pedir Tiempo Muerto** | `Y` | Inicia conteo oficial de Time-Out de 60s |
| **Posesión: Reset 24 Segundos** | `1` | Reinicia reloj de posesión a 24s |
| **Posesión: Reset 14 Segundos** | `2` | Reinicia a 14s (rebote ofensivo) |
| **Posesión: Iniciar / Pausar 24s** | `3` | Pausa o reanuda el shot clock |
| **Posesión: Alternar Flecha FIBA** | `P` | Cambia el sentido de la flecha de posesión |
| **Bocina / Chicharra Manual** | `B` | Dispara la sirena acústica del estadio (Relé D8) |
| **Silbato de Árbitro** | `S` | Emite silbato acústico de falta/reanudación |
| **Sonido de Gol** | `G` | Emite fanfarria y sirena de gol |
| **Avanzar Periodo / Cuarto** | `N` | Pasa al siguiente cuarto, tiempo o set |

---

## 8. SISTEMA DE AUDIO, SINTETIZADOR Y SONIDOS PERSONALIZADOS

* **Sintetizador Web Audio API Polifónico:** Generación digital en tiempo real de chicharra de fin de cuarto, silbato arbitral armónico, campana de boxeo, órgano de estadio y sirena de gol.
* **Carga de Sonidos Propios:** Permite subir y almacenar en el navegador archivos MP3, WAV u OGG para asociarlos a eventos del partido.
* **Plantillas Deportivas:** Asignación automática de perfiles de sonido según la disciplina seleccionada.
* **Relé Físico de Potencia (Pin D8):** Envía el comando `CMD:HORN:<ms>` para activar chicharras electromecánicas de 220V o 12V en el gimnasio.

---

## 9. ILUMINACIÓN LED RGB Y EFECTOS DINÁMICOS FASTLED

El panel de configuración LED permite personalizar de manera 100% independiente cada elemento del marcador:
- **Componentes Configurables:** Tanteador Local, Tanteador Visitante, Periodo Central, Cronómetro, Posesión / 24s, Cartel de Mensajes, Reloj RTC y Marco Perimetral.
- **Paleta de Color RGB:** Selector libre de color hexadecimal con presets rápidos (#00D2FF, #FF323C, #FBBF24, #10B981, #A855F7, #EC4899, #FFFFFF).
- **8 Efectos de Movimiento:**
  1. `solid`: Iluminación constante de alto brillo.
  2. `pulse`: Respiración suave sinusoidal de intensidad.
  3. `wave`: Onda lumínica continua desplazándose horizontalmente.
  4. `rainbow`: Transición cromática suave en ciclo continuo HSV.
  5. `fire`: Flama cálida orgánica simulada mediante ruido Perlin (`FastLED inoise8`).
  6. `scan`: Escáner de ida y vuelta estilo Knight Rider.
  7. `sparkle`: Destellos aleatorios de alta intensidad.
  8. `chase`: Puntos de luz en persecución secuencial.
- **Control de Velocidad y Brillo:** Ajuste fino de 1 a 5 en velocidad de animación y de 10% a 100% en brillo general.
- **Temas Preconfigurados:** *Clásico Deportivo*, *Neón Cyberpunk*, *Modo Fuego*, *Arcoíris Dinámico*, *Océano Ártico*.

---

## 10. PROTOCOLO SERIE ASCII Y TABLA DE COMANDOS

Todos los comandos se envían en texto ASCII terminado en salto de línea (`\n`) a **9600 Baud** (Arduino) o **115200 Baud** (ESP32):

| Comando Serie | Ejemplo | Descripción |
|---|---|---|
| `L:<puntos>` | `L:42` | Actualiza tanteador Local |
| `V:<puntos>` | `V:38` | Actualiza tanteador Visitante |
| `T:<tiempo>` | `T:08:45` | Actualiza dígitos del cronómetro principal |
| `P:<periodo>` | `P:1 CUARTO` | Actualiza el texto de periodo en tipografía 3x5 |
| `LED:<comp>:<hex>:<fx>:<spd>:<bri>` | `LED:scoreLocal:#00D2FF:pulse:3:100` | Configura color y efecto LED para un componente |
| `CMD:SHOT_CLOCK_RESET:24` | `CMD:SHOT_CLOCK_RESET:24` | Resetea posesión a 24 segundos |
| `CMD:SHOT_CLOCK_RESET:14` | `CMD:SHOT_CLOCK_RESET:14` | Resetea posesión a 14 segundos |
| `CMD:SHOT_CLOCK_PAUSE` | `CMD:SHOT_CLOCK_PAUSE` | Pausa el shot clock |
| `CMD:SHOT_CLOCK_START` | `CMD:SHOT_CLOCK_START` | Inicia el shot clock |
| `CMD:POSSESSION:LOCAL` | `CMD:POSSESSION:LOCAL` | Enciende indicador de posesión Local |
| `CMD:POSSESSION:VISITOR` | `CMD:POSSESSION:VISITOR` | Enciende indicador de posesión Visitante |
| `CMD:HORN:<ms>` | `CMD:HORN:2000` | Activa el relé de sirena en Pin D8 por N ms |
| `CMD:RTC_SYNC:<iso>` | `CMD:RTC_SYNC:2026-08-24T18:00:00` | Calibra fecha y hora en módulo RTC DS3231 |
| `MSG:<linea1>|<linea2>` | `MSG:BIENVENIDOS|GIMNASIO ESCOLAR` | Envía mensaje de 2 renglones al cartel LED |

---

## 11. INSTALACIÓN EN WINDOWS 11 Y ANDROID

### 11.1. Windows 11 (Notebook / PC de Mesa de Control)
1. **Instalación PWA Automática (1 Clic):**
   - Abra el sistema en **Google Chrome** o **Microsoft Edge**.
   - Haga clic en el ícono de **Instalar** (pantalla con flecha) en la parte superior derecha de la barra de direcciones.
   - La aplicación se integrará al Menú Inicio y Barra de Tareas de Windows 11.
2. **Lanzador de Escritorio (.BAT):**
   - En la pestaña **`DESCARGAS`**, haga clic en **`Descargar "Iniciar_Tablero_Windows11.bat"`**.
   - Guarde el archivo en el Escritorio. Al hacer doble clic, abrirá el tablero en modo ventana de aplicación sin barras de navegación.
3. **Acceso al Hardware Serie:**
   - La Web Serial API funciona de forma nativa en Windows 11 con Chrome y Edge, detectando automáticamente cables USB con chips CH340, FTDI y CP2102.

### 11.2. Android (Smartphones & Tablets para Árbitros y Jueces de Mesa)
1. **Instalación WebAPK en Pantalla Principal:**
   - Abra el enlace en **Google Chrome** en su celular o tablet Android.
   - Toque el menú de tres puntos (`⋮`) arriba a la derecha.
   - Seleccione **"Agregar a la pantalla principal"** o **"Instalar aplicación"**.
2. **Escaneo Directo por Código QR:**
   - En la pestaña **`DESCARGAS`** > **`ANDROID`**, apunte la cámara del celular al código QR para abrir el sistema de inmediato.
3. **Optimización Móvil:**
   - Bloqueo de suspensión de pantalla (*Wake Lock API*) para mantener la pantalla siempre encendida durante los partidos.
   - Interfaz táctil de gran tamaño con botones de respuesta rápida para canchas.

### 11.3. Funcionamiento 100% Offline (Sin Internet)
* Una vez instalada la aplicación, todos los recursos (interfaz, sintetizador de audio, tipografías LED y biblioteca de comandos) quedan almacenados en la memoria local mediante Service Worker.
* Podrá encender la notebook en un gimnasio sin Wi-Fi ni señal de datos y operar el tablero por cable USB o Bluetooth con cero latencia.

---

## 12. SOLUCIÓN DE PROBLEMAS FRECUENTES (FAQ & TROUBLESHOOTING)

### ❓ El botón "Abrir Puerto Serie" no muestra la placa Arduino
* **Causa:** El navegador no tiene permisos de Web Serial o falta el controlador USB del fabricante.
* **Solución:** Use Google Chrome o Microsoft Edge. Si la placa usa el chip CH340G, instale el driver gratuito CH341SER en Windows 11.

### ❓ La sirena no suena pero en la pantalla se ve la animación
* **Causa:** El relé conectado al pin digital D8 no recibe alimentación o está en nivel lógico invertido.
* **Solución:** Verifique que el módulo de relé esté conectado a GND, VCC (5V) y Señal a D8 de la placa Arduino.

### ❓ El reloj RTC pierde la hora al desconectar la alimentación
* **Causa:** La pila de botón CR2032 del módulo DS3231 está descargada o hace falso contacto.
* **Solución:** Reemplace la pila CR2032 y presione el botón **`Sincronizar RTC con PC`** en la pestaña de Reloj Oficial.

### ❓ Los atajos de teclado no responden
* **Causa:** El cursor de texto se encuentra dentro de un cuadro de edición (ej: nombre de equipo o mensaje).
* **Solución:** Haga clic en cualquier zona libre de la pantalla para quitar el foco de la caja de texto y active los macros desde el botón **`MACROS PC`**.

---

**Manual redactado para el Gimnasio Escolar y Polideportivo Municipal.**  
*© 2026 Sistema de Tablero Electrónico y Control de Estadio.*
