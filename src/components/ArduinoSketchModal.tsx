import React, { useState } from 'react';
import { ARDUINO_COMPLETE_SKETCH } from '../utils/arduinoCode';
import { Copy, Check, Download, Cpu, HardDrive, Zap, Layers } from 'lucide-react';

export const ArduinoSketchModal: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(ARDUINO_COMPLETE_SKETCH);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([ARDUINO_COMPLETE_SKETCH], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Tablero_Gimnasio_Arduino.ino';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header del Código Arduino */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-6 h-6 text-emerald-400" />
            <h3 className="text-lg font-stadium font-black text-white">
              CÓDIGO ARDUINO (.INO) LISTO PARA COMPILAR
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Sketch completo con parser serie no bloqueante, displays MAX7219, RTC DS3231 y relé de chicharra.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-stadium font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow transition"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '¡COPIADO AL PORTAPAPELES!' : 'COPIAR CÓDIGO (.INO)'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-stadium font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 transition border border-slate-700"
          >
            <Download className="w-4 h-4" />
            <span>DESCARGAR .INO</span>
          </button>
        </div>
      </div>

      {/* Esquema de Conexión de Pines */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h4 className="text-sm font-stadium font-black text-amber-400 uppercase mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4" /> Guía de Conexión Pin a Pin (Arduino Uno / Nano)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="font-bold text-blue-400 block mb-1">Módulos MAX7219</span>
            <ul className="space-y-0.5 text-slate-400 font-mono-code text-[11px]">
              <li>• VCC → 5V</li>
              <li>• GND → GND</li>
              <li>• DIN → Pin Digital 12</li>
              <li>• CS → Pin Digital 10</li>
              <li>• CLK → Pin Digital 11</li>
            </ul>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="font-bold text-cyan-400 block mb-1">Módulo RTC DS3231</span>
            <ul className="space-y-0.5 text-slate-400 font-mono-code text-[11px]">
              <li>• VCC → 5V / 3.3V</li>
              <li>• GND → GND</li>
              <li>• SDA → Pin A4 (Uno)</li>
              <li>• SCL → Pin A5 (Uno)</li>
            </ul>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="font-bold text-purple-400 block mb-1">Relé de Bocina / Horn</span>
            <ul className="space-y-0.5 text-slate-400 font-mono-code text-[11px]">
              <li>• IN → Pin Digital 8</li>
              <li>• VCC → 5V</li>
              <li>• GND → GND</li>
              <li>• COM/NO → Bocina 12V/220V</li>
            </ul>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="font-bold text-emerald-400 block mb-1">Bluetooth HC-05 / HC-06</span>
            <ul className="space-y-0.5 text-slate-400 font-mono-code text-[11px]">
              <li>• VCC → 5V</li>
              <li>• GND → GND</li>
              <li>• TXD → Arduino RX (Pin 0)</li>
              <li>• RXD → Arduino TX (Pin 1)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Visor de Código con Scroll */}
      <div className="bg-black/90 border border-slate-800 rounded-2xl p-4 font-mono-code text-xs overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800 text-slate-500 text-[11px]">
          <span>Archivo: Tablero_Gimnasio_Arduino.ino (C++ / Arduino)</span>
          <span>Librerías: RTClib, LedControl, Wire</span>
        </div>
        <pre className="text-emerald-400 h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text p-2 bg-slate-950/70 rounded-xl border border-slate-900">
          {ARDUINO_COMPLETE_SKETCH}
        </pre>
      </div>
    </div>
  );
};
