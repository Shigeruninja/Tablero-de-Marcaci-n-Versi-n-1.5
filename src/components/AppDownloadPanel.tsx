import React, { useState, useEffect } from 'react';
import { 
  Laptop, 
  Smartphone, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  QrCode, 
  Share2, 
  Usb, 
  Bluetooth, 
  Monitor, 
  Sparkles,
  HelpCircle,
  FileCode,
  Layers,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { ARDUINO_COMPLETE_SKETCH } from '../utils/arduinoCode';

interface Props {
  soundEnabled?: boolean;
}

export const AppDownloadPanel: React.FC<Props> = ({ soundEnabled = true }) => {
  const [platform, setPlatform] = useState<'windows' | 'android' | 'offline'>('windows');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // Obtener URL actual o de respaldo
  const currentAppUrl = typeof window !== 'undefined' 
    ? window.location.href 
    : 'https://ais-pre-ltfxl2g2zfbymukqcvnj5g-427512984348.us-east5.run.app';

  // Escuchar evento de instalación PWA nativo
  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    window.addEventListener('appinstalled', () => {
      setInstallSuccess(true);
      setDeferredPrompt(null);
      setIsInstallable(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (soundEnabled) sounds.playClick();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallSuccess(true);
      }
      setDeferredPrompt(null);
    } else {
      // Si el navegador no disparó el evento (ej: ya instalado o en iframe), mostramos la guía
      alert('Para instalar:\n\n1. En Google Chrome o Edge, haz clic en el ícono de "Instalar aplicación" (pantalla con flecha) en la parte superior derecha de la barra de direcciones.\n2. O en el menú (...) selecciona "Aplicaciones" -> "Instalar Tablero Deportivo".');
    }
  };

  const handleCopyUrl = () => {
    if (soundEnabled) sounds.playClick();
    navigator.clipboard.writeText(currentAppUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleCopyShareMessage = () => {
    if (soundEnabled) sounds.playClick();
    const msg = `🏆 *Tablero Deportivo LED - Mesa de Control*\n\nAccedé y controlá el tablero del gimnasio desde tu notebook o celular:\n👉 ${currentAppUrl}\n\nIncluye cronómetro oficial, tanteador, posesión 24s/14s, sirena y conexión USB/Bluetooth con Arduino.`;
    navigator.clipboard.writeText(msg);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  // Descargar archivo .BAT para lanzar en Windows como aplicación
  const handleDownloadWindowsLauncher = () => {
    if (soundEnabled) sounds.playClick();
    const batContent = `@echo off
title Tablero Deportivo LED - Iniciando Mesa de Control...
echo ========================================================
echo   TABLERO DEPORTIVO LED - GIMNASIO ESCOLAR
echo ========================================================
echo Iniciando aplicacion en modo ventana independiente...
echo.

:: Intentar abrir con Microsoft Edge en modo App
start msedge --app="${currentAppUrl}" --window-size=1280,800
if %ERRORLEVEL% NEQ 0 (
    :: Si falla Edge, intentar con Google Chrome
    start chrome --app="${currentAppUrl}" --window-size=1280,800
)

echo Aplicacion iniciada correctamente.
exit
`;

    const blob = new Blob([batContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Iniciar_Tablero_Windows11.bat';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Descargar Sketch Arduino .INO
  const handleDownloadArduinoCode = () => {
    if (soundEnabled) sounds.playClick();
    const blob = new Blob([ARDUINO_COMPLETE_SKETCH], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Tablero_Gimnasio_Arduino.ino';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // URL para el código QR dinámico
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(currentAppUrl)}&color=0f172a&bgcolor=f8fafc`;

  return (
    <div className="space-y-6">
      
      {/* HEADER DE LA SECCIÓN */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                100% Multiplataforma • Windows 11 & Android
              </span>
              <span className="bg-blue-500/20 text-blue-400 border border-blue-500/40 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                PWA / Offline Ready
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-stadium font-black text-white">
              DESCARGA E INSTALACIÓN DE LA APLICACIÓN
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Instalá la mesa de control en la notebook del gimnasio (Windows 11) o en celulares y tablets Android de los árbitros.
            </p>
          </div>

          {/* Botones rápidos de Compartir URL */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyUrl}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition shadow"
            >
              {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
              <span>{copiedUrl ? '¡Enlace Copiado!' : 'Copiar Enlace'}</span>
            </button>

            <button
              onClick={handleCopyShareMessage}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg"
            >
              {copiedMsg ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedMsg ? '¡Texto para WhatsApp Copiado!' : 'Compartir con Colega'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SELECTOR DE PLATAFORMA */}
      <div className="flex rounded-2xl bg-slate-900 border border-slate-800 p-1.5 gap-1.5 shadow-lg">
        <button
          onClick={() => {
            if (soundEnabled) sounds.playClick();
            setPlatform('windows');
          }}
          className={`flex-1 py-3 px-4 rounded-xl font-stadium font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 ${
            platform === 'windows'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Laptop className="w-4 h-4 sm:w-5 sm:h-5 text-sky-300" />
          <span>WINDOWS 11 (NOTEBOOK / PC)</span>
        </button>

        <button
          onClick={() => {
            if (soundEnabled) sounds.playClick();
            setPlatform('android');
          }}
          className={`flex-1 py-3 px-4 rounded-xl font-stadium font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 ${
            platform === 'android'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
          <span>ANDROID (CELULAR / TABLET)</span>
        </button>

        <button
          onClick={() => {
            if (soundEnabled) sounds.playClick();
            setPlatform('offline');
          }}
          className={`flex-1 py-3 px-4 rounded-xl font-stadium font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 ${
            platform === 'offline'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
          <span>OFFLINE & ARDUINO</span>
        </button>
      </div>

      {/* CONTENIDO PLATAFORMA: WINDOWS 11 */}
      {platform === 'windows' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Tarjeta Principal de Instalación */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                  <Laptop className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-stadium font-black text-lg text-white">
                    INSTALACIÓN EN WINDOWS 11 (MESA DE CONTROL)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ejecución nativa en pantalla completa con soporte de puertos USB Serie y Bluetooth.
                  </p>
                </div>
              </div>

              {/* Botón Principal: Instalar PWA */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Opción A: Instalación Automática (1 Clic)
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">
                    Recomendado
                  </span>
                </div>

                <button
                  onClick={handleInstallClick}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-stadium font-black text-sm tracking-wider uppercase transition shadow-xl flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  <span>{isInstallable ? 'INSTALAR APLICACIÓN EN WINDOWS 11 AHORA' : 'INSTALAR COMO APP DE WINDOWS 11'}</span>
                </button>

                {installSuccess && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-lg text-emerald-300 text-xs flex items-center gap-2 font-bold">
                    <Check className="w-4 h-4" />
                    ¡Aplicación instalada en Windows 11! Busca el ícono en tu Menú Inicio y Escritorio.
                  </div>
                )}
              </div>

              {/* Botón Lanzador .BAT */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-sky-400" />
                    Opción B: Descargar Lanzador de Escritorio (.BAT)
                  </span>
                  <span className="text-[10px] bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded font-bold">
                    Acceso Directo
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Descarga un archivo ejecutable directo para el escritorio de Windows que abre el tablero en modo ventana sin bordes ni buscador.
                </p>
                <button
                  onClick={handleDownloadWindowsLauncher}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sky-300 hover:text-white font-bold text-xs transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar "Iniciar_Tablero_Windows11.bat"</span>
                </button>
              </div>

              {/* Pasos Manuales en Windows 11 */}
              <div className="space-y-2 pt-2 text-xs text-slate-300">
                <h4 className="font-bold text-amber-400 uppercase text-[11px] tracking-wider">
                  ¿Cómo instalarlo manualmente en Microsoft Edge o Google Chrome?
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <li>Abre este enlace en <b>Microsoft Edge</b> o <b>Google Chrome</b> en la notebook.</li>
                  <li>En la esquina derecha de la barra de direcciones, haz clic en el ícono de <b>Instalar</b> <kbd className="bg-slate-900 px-1 py-0.5 rounded border border-slate-700 text-[10px]">⊕</kbd>.</li>
                  <li>Haz clic en <b>Instalar</b>. Windows 11 fijará la app al Escritorio y la Barra de Tareas.</li>
                </ol>
              </div>

            </div>
          </div>

          {/* Panel Lateral: Ventajas y Conectividad en Windows 11 */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Ventajas Windows 11 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <h4 className="font-stadium font-bold text-sm text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                VENTAJAS EN WINDOWS 11
              </h4>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <Usb className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <b className="text-white">Web Serial USB Directo:</b>
                    <p className="text-slate-400">Detecta los puertos COM del Arduino Uno/Nano sin instalar software intermedio.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Bluetooth className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <b className="text-white">Bluetooth Inalámbrico:</b>
                    <p className="text-slate-400">Conexión con módulos HC-05 o placas ESP32 por Web Bluetooth.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Monitor className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <b className="text-white">Macros de Teclado Físico:</b>
                    <p className="text-slate-400">Controla cronómetro (Espacio), goles/puntos y sirena (B) con el teclado de la notebook.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enlace para Enviar al Colega */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <h4 className="font-stadium font-bold text-sm text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-amber-400" />
                ENLACE DIRECTO PARA TU COLEGA
              </h4>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono-code text-amber-300 break-all select-all">
                {currentAppUrl}
              </div>
              <button
                onClick={handleCopyUrl}
                className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center justify-center gap-2"
              >
                {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>Copiar Enlace al Portapapeles</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* CONTENIDO PLATAFORMA: ANDROID */}
      {platform === 'android' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Tarjeta Principal Android con QR */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-stadium font-black text-lg text-white">
                    INSTALACIÓN EN ANDROID (CELULARES & TABLETS)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Instala la WebAPK en la pantalla de inicio para control táctil en cancha.
                  </p>
                </div>
              </div>

              {/* Pasos en Android */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Instalación en 3 Pasos en Google Chrome Android:
                </h4>

                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">1</span>
                    <p>Abre el enlace en <b>Google Chrome</b> en tu celular o tablet Android.</p>
                  </div>

                  <div className="flex items-start gap-2.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">2</span>
                    <p>Toca el menú de tres puntos <kbd className="bg-slate-950 px-1 py-0.5 rounded border border-slate-700 font-mono">⋮</kbd> arriba a la derecha.</p>
                  </div>

                  <div className="flex items-start gap-2.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">3</span>
                    <p>Selecciona <b>"Agregar a la pantalla principal"</b> o <b>"Instalar aplicación"</b>.</p>
                  </div>
                </div>

                <button
                  onClick={handleInstallClick}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-stadium font-black text-sm tracking-wider uppercase transition shadow-xl flex items-center justify-center gap-2 mt-2"
                >
                  <Download className="w-5 h-5" />
                  <span>AGREGAR A LA PANTALLA PRINCIPAL DE ANDROID</span>
                </button>
              </div>

              {/* Características Android */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <b className="text-emerald-300 block mb-0.5">📱 Modo Pantalla Completa:</b>
                  <span className="text-slate-400 text-[11px]">Se ocultan las barras del navegador para aprovechar toda la pantalla táctil.</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <b className="text-emerald-300 block mb-0.5">🔋 Pantalla Siempre Encendida:</b>
                  <span className="text-slate-400 text-[11px]">Evita que el celular se apague durante el tiempo de juego (Wake Lock API).</span>
                </div>
              </div>

            </div>
          </div>

          {/* Código QR para Escaneo Inmediato con Celular */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-white font-stadium font-bold text-sm">
                <QrCode className="w-5 h-5 text-emerald-400" />
                <span>ESCANEAR CON LA CÁMARA DEL CELULAR</span>
              </div>
              <p className="text-xs text-slate-400">
                Apunta la cámara de tu smartphone Android a este código QR para abrir el tablero al instante:
              </p>

              {/* Imagen del Código QR */}
              <div className="bg-white p-3 rounded-2xl inline-block shadow-2xl border-4 border-emerald-500/40">
                <img 
                  src={qrApiUrl} 
                  alt="Código QR para abrir Tablero Deportivo en Android" 
                  className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleCopyShareMessage}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Enviar Invitación por WhatsApp al Colega</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* CONTENIDO PLATAFORMA: OFFLINE & ARDUINO */}
      {platform === 'offline' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-stadium font-black text-lg text-white">
                    PAQUETES OFFLINE Y CÓDIGO FUENTE
                  </h3>
                  <p className="text-xs text-slate-400">
                    Lleva todos los archivos en un pendrive para utilizarlos en gimnasios sin conexión a Internet.
                  </p>
                </div>
              </div>

              {/* Descarga de Código Arduino */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-purple-400" />
                    Sketch Oficial Arduino (.INO)
                  </span>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-bold">
                    Arduino Uno / Nano / ESP32
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Descarga el firmware optimizado con control de matrices MAX7219, RTC DS3231, chicharra y protocolo serie bidireccional.
                </p>
                <button
                  onClick={handleDownloadArduinoCode}
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-stadium font-bold text-xs tracking-wider transition shadow flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>DESCARGAR "Tablero_Gimnasio_Arduino.ino"</span>
                </button>
              </div>

              {/* Instrucciones de Uso sin Internet */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300">
                <h4 className="font-bold text-amber-400 uppercase text-[11px]">
                  ¿Cómo funciona el modo 100% Offline (Sin Internet)?
                </h4>
                <p>
                  Una vez que instalas la aplicación en <b>Windows 11</b> o <b>Android</b> mediante el navegador, los archivos quedan guardados localmente en la memoria del dispositivo (gracias al Service Worker registrado).
                </p>
                <p className="text-slate-400">
                  Podrás abrir el tablero en el gimnasio aunque no haya Wi-Fi ni señal de datos celulares, y conectarte por cable USB o Bluetooth al Arduino con latencia cero.
                </p>
              </div>

            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <h4 className="font-stadium font-bold text-sm text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                ASISTENCIA RÁPIDA
              </h4>
              <p className="text-xs text-slate-400">
                Si tu colega tiene dudas durante la prueba en el gimnasio:
              </p>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1.5">
                <li>Verifica que la tasa de baudios esté en <b>9600 Baud</b> al conectar por USB.</li>
                <li>Presiona la tecla <b>Espacio</b> para verificar el cronómetro.</li>
                <li>Presiona la tecla <b>B</b> para probar la sirena de tiempo.</li>
                <li>Ajusta el brillo desde el botón superior <b>BRILLO: XX%</b>.</li>
              </ul>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
