# 📖 MANUAL DE USUARIO Y GUÍA DE OPERACIÓN OFICIAL
## TABLERO DEPORTIVO MULTIDEPORTE ELECTRÓNICO & CONTROLADOR DE GIMNASIO ESCOLAR
**Versión del Sistema:** 2.4 Pro LED Edition  
**Compatibilidad Hardware:** Arduino UNO / Nano / Mega / ESP32 / ESP8266  
**Interfaz:** Web Control Panel (PC, Tablet y Móvil) + Web Serial / Bluetooth / WiFi  

---

## 📑 ÍNDICE GENERAL

1. [Introducción y Arquitectura del Sistema](#1-introducción-y-arquitectura-del-sistema)
2. [Componentes del Tablero y Diagrama de Bloques](#2-componentes-del-tablero-y-diagrama-de-bloques)
3. [Conexión y Enlace con el Hardware](#3-conexión-y-enlace-con-el-hardware)
4. [Modos de Funcionamiento](#4-modos-de-funcionamiento)
   - 4.1. Modo Tablero Deportivo (Scoreboard)
   - 4.2. Modo Reloj de Hora Oficial (RTC DS3231)
   - 4.3. Modo Cartel de Mensajes Luminosos (Banner LED)
5. [Guía de Operación por Disciplina Deportiva](#5-guía-de-operación-por-disciplina-deportiva)
   - 5.1. Básquetbol (Reglamento FIBA / NBA)
   - 5.2. Fútbol y Futsal (AFA / FIFA)
   - 5.3. Voleibol (Sets, Saque y Sustituciones)
   - 5.4. Handball (Exclusiones 2 Minutos y Juego Pasivo)
   - 5.5. Modo Personalizado / Gimnasio Libre
6. [Operación del Cronómetro Principal y Reloj de Posesión (24s / 14s)](#6-operación-del-cronómetro-principal-y-reloj-de-posesión)
7. [Sistema de Macros y Atajos de Teclado (Modo PC / Mesa de Control)](#7-sistema-de-macros-y-atajos-de-teclado)
8. [Sistema de Audio y Chicharra Acústica](#8-sistema-de-audio-y-chicharra-acústica)
9. [Protocolo Serie y Tabla de Comandos](#9-protocolo-serie-y-tabla-de-comandos)
10. [Solución de Problemas Frecuentes (FAQ & Troubleshooting)](#10-solución-de-problemas-frecuentes)

---

## 1. INTRODUCCIÓN Y ARQUITECTURA DEL SISTEMA

El **Sistema de Tablero Deportivo Escolar** es una solución integral de cronometraje, tanteador electrónico y señalización luminosa diseñada para gimnasios educativos, clubes deportivos y polideportivos.

Combina dos capas interconectadas:
1. **Controlador Central Web (Software de Mesa de Control):** Aplicación interactiva de alta precisión en tiempo real, accesible desde cualquier computadora, notebook, tablet o teléfono celular.
2. **Tablero Electrónico Físico (Hardware Arduino / ESP32):** Módulos de visualización LED de alto brillo (dígitos de 7 segmentos para puntos y reloj, matrices 8x32 para nombres/mensajes, flechas de posesión y relé para sirena de 220V/12V).

```
┌─────────────────────────────────────────────────────────────┐
│                 MESA DE CONTROL (PC / TABLET)               │
│  - Interfaz Web React / TypeScript                         │
│  - Atajos de Teclado para Mesa Oficial (Macros PC)          │
│  - Motor Acústico de Bocinas, Silbatos y Chicharras         │
└──────────────────────────────┬──────────────────────────────┘
                               │  USB Serial / Bluetooth / WiFi
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               CONTROLADOR CENTRAL (ARDUINO / ESP32)         │
│  - Decodificación de Comandos y Protocolo Serie              │
│  - Gestión de Tiempo por Interrupciones de Hardware         │
│  - Módulo RTC DS3231 (Respaldo con Pila CR2032)             │
└───────┬──────────────┬──────────────┬──────────────┬────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────┐
│ DÍGITOS LED  ││ RELOJ 24s/14s││ MATRIZ LED   ││ SIRENA / HORN│
│ Tanteador    ││ Posesión     ││ Nombres /    ││ Relé 12V/220V│
│ 7 Segmentos  ││ Shot Clock   ││ Textos Scroll││ Acústica     │
└──────────────┘└──────────────┘└──────────────┘└──────────────┘
```

---

## 2. COMPONENTES DEL TABLERO Y DIAGRAMA DE BLOQUES

El cartel físico estándar se compone de:

* **Tanteador Local y Visitante:** 2 dígitos grandes (0 a 99) por equipo con tecnología LED roja y verde/azul.
* **Cronómetro Principal:** 4 dígitos (`MM:SS`) con indicador de décimas de segundo (`SS.d`) para el último minuto de juego.
* **Periodo / Set / Cuarto:** 1 dígito central (`1`, `2`, `3`, `4`, `TE`).
* **Indicadores de Faltas Colectivas:** Dígitos o barra de puntos LED con indicador de Penalización / Bonus (a partir de la 5ª falta).
* **Módulos de 24 / 14 Segundos (Básquet):** Pantallas independientes de posesión ubicadas sobre los aros o en el lateral del tablero principal.
* **Flecha de Posesión Alternada (FIBA):** Indicadores direccionales luminosos (`◄` LOCAL | `►` VISITANTE).
* **Cartel de Nombres / Mensajes:** Módulos de matriz LED MAX7219 de 8x32 / 8x64 píxeles para mostrar nombres de equipos, avisos escolares y bienvenida.
* **Módulo de Reloj en Tiempo Real (RTC DS3231):** Mantiene la hora y fecha exacta incluso sin conexión ni alimentación externa gracias a su batería de litio.
* **Bocina / Chicharra de Estadio:** Conectada a la salida digital `D8` mediante módulo de relé optoacoplado.

---

## 3. CONEXIÓN Y ENLACE CON EL HARDWARE

Para comunicar la aplicación web con el tablero físico:

### 3.1. Conexión USB Serial Directa (Recomendada para PC)
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

### 3.4. Modo Simulación / Virtual
Si no dispone del hardware conectado físicamente, el sistema incluye un simulador virtual integrado que valida todos los comandos en pantalla sin requerir cables.

---

## 4. MODOS DE FUNCIONAMIENTO

La aplicación cuenta con 3 modos principales seleccionables desde la barra superior:

### 4.1. Modo Tablero Deportivo (`TABLERO DE JUEGO`)
* Operación de cronómetro reglamentario, tanteador, faltas, tiempos muertos, posesión y chicharras.
* Vista previa en vivo idéntica a la disposición física de los LED.

### 4.2. Modo Reloj de Hora Oficial (`RELOJ RTC (DS3231)`)
* Cuando no hay partidos en curso, el tablero muestra la hora oficial de Buenos Aires (`HH:MM:SS`) y fecha (`DD/MM/AAAA`).
* Incluye botón de **`Sincronizar RTC con PC`** para calibrar el módulo DS3231 al segundo exacto con un solo clic.

### 4.3. Modo Cartel de Mensajes Luminosos (`CARTEL MENSAJES`)
* Permite enviar textos con desplazamiento (scroll) o estáticos a la matriz LED.
* Presets integrados: *"Bienvenidos al Gimnasio Escolar"*, *"Acto de Fin de Curso"*, *"Torneo Intercolegial"*, etc.
* Control de velocidad de desplazamiento, brillo y efectos de destello.

---

## 5. GUÍA DE OPERACIÓN POR DISCIPLINA DEPORTIVA

### 5.1. Básquetbol (Reglamento FIBA / NBA)
* **Puntuación Rápida:** Botones dedicados para `+1` (Tiro Libre), `+2` (Doble), `+3` (Triple) y `-1` (Corrección de anulación).
* **Auto-Reset de Posesión en Canasta:** Al marcar un punto (+1, +2 o +3), el reloj de 24 segundos **se detiene y resetea automáticamente a 24s**, y la posesión pasa automáticamente al equipo rival para la reposición de fondo.
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

---

## 6. OPERACIÓN DEL CRONÓMETRO PRINCIPAL Y RELOJ DE POSESIÓN

### Cronómetro Principal:
* **Iniciar / Pausar:** Botón grande central o barra espaciadora (`Espacio`).
* **Ajuste Fino:** Botones `+1m`, `-1m`, `+10s`, `-10s`.
* **Edición Directa:** Al hacer clic en el tiempo, puede escribir manualmente los minutos y segundos deseados.
* **Décimas de Segundo:** Durante el último minuto de juego (tiempo < 01:00), el display muestra automáticamente décimas de segundo (`SS.d`) para máxima precisión.
* **Chicharra de Fin de Tiempo:** Al llegar a `00:00`, se activa automáticamente la sirena por 2.5 segundos y se envía la orden de apagado al relé del tablero.

### Reloj de Posesión (Shot Clock 24s / 14s):
* **Botón 24s:** Reinicia la posesión a 24 segundos (inicio de jugada ofensiva).
* **Botón 14s:** Reinicia a 14 segundos reglamentarios (después de rebote ofensivo o falta cometida en pista delantera).
* **Sincronización Automática:** El reloj de 24s arranca y se detiene automáticamente en conjunto con el cronómetro principal del partido.

---

## 7. SISTEMA DE MACROS Y ATAJOS DE TECLADO (MODO PC)

Para operar el tanteador a máxima velocidad durante un partido oficial, la aplicación cuenta con un motor de macros de teclado para computadora:

### 🎮 Distribución por Defecto (Mesa Oficial 2 Manos):

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
| **Bocina / Chicharra Manual** | `B` | Dispara la sirena acústica del estadio |
| **Silbato de Árbitro** | `S` | Emite silbato acústico de falta/reanudación |
| **Sonido de Gol** | `G` | Emite fanfarria y sirena de gol |
| **Avanzar Periodo / Cuarto** | `N` | Pasa al siguiente cuarto, tiempo o set |

### Presets Alternativos Disponibles:
1. **Teclado Numérico (Numpad):** Optimizado para ingresar puntuaciones con la mano derecha en el bloque numérico (`Numpad 1/2/3` para Local, `Numpad 7/8/9` para Visitante, `Enter` para bocina).
2. **Teclas de Función (F1 a F12):** Utiliza las teclas superiores para evitar cualquier pulsación accidental.

> **💡 Nota de Seguridad:** Los macros se desactivan automáticamente mientras el operador escribe dentro de cajas de texto, nombres de equipos o mensajes del cartel LED.

---

## 8. SISTEMA DE AUDIO Y CHICHARRA ACÚSTICA

El sistema dispone de un generador acústico polifónico mediante la API Web Audio del navegador, combinado con la salida de relé físico para la bocina electromecánica del gimnasio:

* **Chicharra Oficial de Fin de Tiempo:** Sirena bitonal de alta potencia (320 Hz + 640 Hz con armónicos saturados) que simula una chicharra de estadio profesional.
* **Aviso de Time-Out:** Doble pulso corto a los 50 segundos y chicharra final a los 60 segundos de tiempo muerto.
* **Silbato de Árbitro:** Modulación de doble frecuencia con trémolo realista.
* **Canasta / Triple / Gol:** Sonidos nítidos de confirmación de anotación.

---

## 9. PROTOCOLO SERIE Y TABLA DE COMANDOS

Los comandos transmitidos por el puerto serie / Bluetooth / WiFi utilizan texto ASCII terminado en salto de línea (`\n`). La tasa estándar es **9600 baudios, 8 bits de datos, sin paridad, 1 bit de parada (8N1)**.

| Comando Serie | Parámetros / Formato | Acción en el Tablero Físico |
|---|---|---|
| `L:<valor>` | `L:0` a `L:99` | Actualiza tanteador del Equipo Local |
| `V:<valor>` | `V:0` a `V:99` | Actualiza tanteador del Equipo Visitante |
| `T:<mm:ss>` | `T:10:00`, `T:00:45.8` | Actualiza dígitos del cronómetro principal |
| `P:<periodo>` | `P:1`, `P:2`, `P:3`, `P:4`, `P:TE` | Actualiza el dígito de periodo o cuarto |
| `CMD:SHOT_CLOCK_RESET:24` | Ninguno | Resetea displays de posesión a 24s |
| `CMD:SHOT_CLOCK_RESET:14` | Ninguno | Resetea displays de posesión a 14s |
| `CMD:SHOT_CLOCK_PAUSE` | Ninguno | Pausa el contador de posesión |
| `CMD:SHOT_CLOCK_START` | Ninguno | Inicia el contador de posesión |
| `CMD:POSSESSION:LOCAL` | Ninguno | Enciende flecha LED izquierda (Local) |
| `CMD:POSSESSION:VISITOR` | Ninguno | Enciende flecha LED derecha (Visitante) |
| `CMD:HORN:<ms>` | `CMD:HORN:2000` | Activa el relé de la chicharra por N milisegundos |
| `CMD:FOUL:LOCAL:<n>` | `CMD:FOUL:LOCAL:5` | Actualiza faltas colectivas locales |
| `CMD:FOUL:VISITOR:<n>` | `CMD:FOUL:VISITOR:3` | Actualiza faltas colectivas visitantes |
| `CMD:MODE:CLOCK` | Ninguno | Pasa el tablero a modo Reloj Hora Oficial |
| `CMD:MODE:BANNER` | Ninguno | Pasa el tablero a modo Cartel de Mensajes |
| `CMD:RTC_SYNC:<iso>` | `CMD:RTC_SYNC:2026-08-22T17:00:00` | Calibra fecha y hora del módulo DS3231 |
| `CMD:MSG:SHOW:<texto>` | `CMD:MSG:SHOW:BIENVENIDOS` | Envía texto a la matriz LED con scroll |

---

## 10. SOLUCIÓN DE PROBLEMAS FRECUENTES (FAQ & TROUBLESHOOTING)

### ❓ El botón "Abrir Puerto Serie" no muestra la placa Arduino
* **Causa:** El navegador no tiene permisos de Web Serial o no están instalados los controladores USB.
* **Solución:**
  1. Use un navegador compatible con Web Serial API (Google Chrome, Microsoft Edge, Opera o Brave).
  2. Verifique que el cable USB soporte datos (no sólo carga).
  3. En Windows, asegúrese de tener instalado el controlador del chip serial (CH340, FTDI o CP2102).

### ❓ Los dígitos del tanteador parpadean o no responden
* **Causa:** Velocidad de baudios incorrecta o ruido electromagnético en la línea.
* **Solución:** Compruebe que tanto la aplicación como el sketch de Arduino estén configurados a `9600` baudios. Verifique que la fuente de alimentación de 5V/12V de los LED entregue la corriente necesaria (mínimo 3A a 5A).

### ❓ El reloj RTC pierde la hora al desconectar la corriente
* **Causa:** La pila de botón CR2032 del módulo DS3231 está agotada o mal colocada.
* **Solución:** Reemplace la pila CR2032 de 3V del zócalo del módulo RTC y luego presione el botón **`Sincronizar RTC con PC`** en la pestaña de Reloj.

### ❓ Los atajos de teclado no responden
* **Causa:** El cursor se encuentra dentro de un cuadro de texto editable o los macros están desactivados.
* **Solución:** Haga clic en cualquier zona libre de la pantalla para quitar el foco del campo de texto. Verifique en el botón superior **`MACROS PC`** que la casilla *Macros Activos* esté tildada.

---

**Manual redactado para el Gimnasio Escolar y Polideportivo Municipal.**  
*© 2026 Sistema de Tablero Electrónico y Control de Estadio.*
