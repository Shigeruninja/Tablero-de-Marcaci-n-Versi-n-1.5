import React, { useState } from 'react';
import { ARDUINO_COMPLETE_SKETCH, ARDUINO_MATRIX_17X64_SKETCH } from '../utils/arduinoCode';
import { Copy, Check, Download, Cpu, HardDrive, Zap, Layers, Grid } from 'lucide-react';

export const ArduinoSketchModal: React.FC = () => {
  const [selectedFirmware, setSelectedFirmware] = useState<'matrix_17x64' | 'max7219'>('matrix_17x64');
  const [copied, setCopied] = useState(false);

  const activeSketch = selectedFirmware === 'matrix_17x64' ? ARDUINO_MATRIX_17X64_SKETCH : ARDUINO_COMPLETE_SKETCH;
  const fileName = selectedFirmware === 'matrix_17x64' ? 'Tablero_Reticula_LED_17x64_ESP32.ino' : 'Tablero_Gimnasio_7Seg_Arduino.ino';

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSketch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([activeSketch], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Selector de Firmware */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
        <button
          onClick={() => setSelectedFirmware('matrix_17x64')}
          className={`flex-1 min-w-[240px] py-3 px-4 rounded-xl font-stadium font-bold text-xs flex items-center justify-center gap-2 transition ${
            selectedFirmware === 'matrix_17x64'
              ? 'bg-amber-500 text-slate-950 shadow-lg font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>FIRMWARE RETÍCULA LED WS2812B 17x64 (ESP32 / FASTLED)</span>
        </button>

        <button
          onClick={() => setSelectedFirmware('max7219')}
          className={`flex-1 min-w-[240px] py-3 px-4 rounded-xl font-stadium font-bold text-xs flex items-center justify-center gap-2 transition ${
            selectedFirmware === 'max7219'
              ? 'bg-amber-500 text-slate-950 shadow-lg font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>FIRMWARE 7 SEGMENTOS CLÁSICO (MAX7219 / ARDUINO)</span>
        </button>
      </div>

      {/* Header del Código Arduino */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-6 h-6 text-emerald-400" />
            <h3 className="text-lg font-stadium font-black text-white">
              {selectedFirmware === 'matrix_17x64' 
                ? 'CÓDIGO ESP32 / ARDUINO • RETÍCULA 17x64 (1088 LEDS)' 
                : 'CÓDIGO ARDUINO • DISPLAYS 7 SEGMENTOS MAX7219'}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {selectedFirmware === 'matrix_17x64'
              ? 'Sketch FastLED con mapeo de serpentina 17x64, tipografía 5x7 biselada, cronómetro, tanteadores, shot clock y relé de bocina.'
              : 'Sketch completo con parser serie no bloqueante, 4 módulos MAX7219, RTC DS3231 y relé de chicharra.'}
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
            <span>DESCARGAR {fileName}</span>
          </button>
        </div>
      </div>

      {/* Esquema de Conexión de Pines */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h4 className="text-sm font-stadium font-black text-amber-400 uppercase mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4" /> 
          {selectedFirmware === 'matrix_17x64' 
            ? 'Guía de Conexión y Alimentación • Retícula 17x64 (ESP32)'
            : 'Guía de Conexión Pin a Pin (Arduino Uno / Nano)'}
        </h4>

        {selectedFirmware === 'matrix_17x64' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="font-bold text-amber-400 block mb-1">Tiras WS2812B (1088 LEDs)</span>
              <ul className="space-y-0.5 text-slate-400 font-mono-code text-[11px]">
                <li>• DIN 1er LED → GPIO 18 (resistor 330Ω)</li>
                <li>• VCC → Riel 5V Fuente 15A</li>
                <li>• GND → GND Común</li>
                <li>• Inyección 5V/GND en ambos flancos</li>
              </ul>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="font-bold text-purple-400 block mb-1">Relé Sirena / Chicharra</span>
              <ul className="space-y-0.5 text-slate-400 font-mono-code text-[11px]">
                <li>• IN → GPIO 23 (ESP32)</li>
                <li>• VCC → 5V</li>
                <li>• GND → GND</li>
                <li>• COM/NO → Bocina 12V/220V</li>
              </ul>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="font-bold text-blue-400 block mb-1">Alimentación Eléctrica</span>
              <ul className="space-y-0.5 text-slate-400 font-mono-code text-[11px]">
                <li>• Fuente: 5V DC / 12A a 15A</li>
                <li>• Capacitor: 1000µF 16V en 5V</li>
                <li>• Cable: AWG 16 para 5V/GND</li>
                <li>• ESP32: Vin o USB-C</li>
              </ul>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="font-bold text-emerald-400 block mb-1">Comunicación Web App</span>
              <ul className="space-y-0.5 text-slate-400 font-mono-code text-[11px]">
                <li>• USB Serial: 115200 Baud</li>
                <li>• Bluetooth BLE / Classic integrado</li>
                <li>• Wi-Fi WebSocket / REST HTTP</li>
              </ul>
            </div>
          </div>
        ) : (
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
        )}
      </div>

      {/* Visor de Código con Scroll */}
      <div className="bg-black/90 border border-slate-800 rounded-2xl p-4 font-mono-code text-xs overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800 text-slate-500 text-[11px]">
          <span>Archivo: {fileName} (C++ / Arduino)</span>
          <span>Librerías: {selectedFirmware === 'matrix_17x53' ? 'FastLED, Wire' : 'RTClib, LedControl, Wire'}</span>
        </div>
        <pre className="text-emerald-400 h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text p-2 bg-slate-950/70 rounded-xl border border-slate-900">
          {activeSketch}
        </pre>
      </div>
    </div>
  );
};

