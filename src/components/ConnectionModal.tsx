import React, { useState } from 'react';
import { ConnectionType } from '../types';
import { Usb, Bluetooth, Wifi, Cpu, X, Check, HelpCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  connectionType: ConnectionType;
  currentLabel: string;
  onConnectSerial: (baudRate: number) => Promise<boolean>;
  onConnectBluetooth: () => Promise<boolean>;
  onConnectWifi: (ip: string) => boolean;
  onConnectSimulation: () => boolean;
  onDisconnect: () => Promise<void>;
}

export const ConnectionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  connectionType,
  currentLabel,
  onConnectSerial,
  onConnectBluetooth,
  onConnectWifi,
  onConnectSimulation,
  onDisconnect,
}) => {
  const [activeTab, setActiveTab] = useState<'serial' | 'bt' | 'wifi' | 'sim'>('serial');
  const [baudRate, setBaudRate] = useState<number>(9600);
  const [wifiIp, setWifiIp] = useState<string>('192.168.1.50');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSerial = async () => {
    setLoading(true);
    const ok = await onConnectSerial(baudRate);
    setLoading(false);
    if (ok) onClose();
  };

  const handleBt = async () => {
    setLoading(true);
    const ok = await onConnectBluetooth();
    setLoading(false);
    if (ok) onClose();
  };

  const handleWifi = () => {
    if (wifiIp.trim()) {
      onConnectWifi(wifiIp.trim());
      onClose();
    }
  };

  const handleSim = () => {
    onConnectSimulation();
    onClose();
  };

  const handleDisconnect = async () => {
    setLoading(true);
    await onDisconnect();
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Cpu className="w-6 h-6 text-blue-400" />
            <div>
              <h3 className="text-lg font-stadium font-black text-white">
                ENLACE CON TABLERO ARDUINO
              </h3>
              <p className="text-xs text-slate-400">Selecciona el método de comunicación</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Estado actual */}
        {connectionType !== 'none' && (
          <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <div>
                <span className="text-xs font-bold text-emerald-300 block">Conexión Activa:</span>
                <span className="text-xs font-mono-code text-slate-300">{currentLabel}</span>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="bg-rose-600 hover:bg-rose-500 text-white font-stadium font-bold text-xs px-3 py-1.5 rounded-lg transition"
            >
              Desconectar
            </button>
          </div>
        )}

        {/* Selector de Pestañas */}
        <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('serial')}
            className={`py-2 rounded-lg font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition ${
              activeTab === 'serial'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Usb className="w-3.5 h-3.5" />
            <span>USB / COM</span>
          </button>

          <button
            onClick={() => setActiveTab('bt')}
            className={`py-2 rounded-lg font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition ${
              activeTab === 'bt'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bluetooth className="w-3.5 h-3.5" />
            <span>BLE</span>
          </button>

          <button
            onClick={() => setActiveTab('wifi')}
            className={`py-2 rounded-lg font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition ${
              activeTab === 'wifi'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>WiFi</span>
          </button>

          <button
            onClick={() => setActiveTab('sim')}
            className={`py-2 rounded-lg font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition ${
              activeTab === 'sim'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Virtual</span>
          </button>
        </div>

        {/* Contenido según pestaña */}
        <div className="space-y-4 pt-1">
          {activeTab === 'serial' && (
            <div className="space-y-3">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <Usb className="w-3.5 h-3.5" /> Recomendado para Mesa de Control:
                </span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Conecta tu Arduino Uno/Nano/Mega por cable USB o vía Bluetooth HC-05 (emparejado previamente como puerto COM virtual en tu sistema).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Velocidad en Baudios (Baud Rate):
                </label>
                <select
                  value={baudRate}
                  onChange={(e) => setBaudRate(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono-code focus:border-blue-500 outline-none"
                >
                  <option value="9600">9600 baudios (Estándar Arduino / HC-05)</option>
                  <option value="115200">115200 baudios (ESP32 / Alta Velocidad)</option>
                  <option value="57600">57600 baudios</option>
                  <option value="38400">38400 baudios (HC-05 Modo AT)</option>
                </select>
              </div>

              <button
                onClick={handleSerial}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-stadium font-bold py-3 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg"
              >
                <Usb className="w-4 h-4" />
                <span>{loading ? 'CONECTANDO...' : 'SELECCIONAR PUERTO SERIAL USB/COM'}</span>
              </button>
            </div>
          )}

          {activeTab === 'bt' && (
            <div className="space-y-3">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
                <span className="font-bold text-blue-400 flex items-center gap-1">
                  <Bluetooth className="w-3.5 h-3.5" /> Web Bluetooth BLE:
                </span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Para placas con <b>Bluetooth Low Energy</b> (ESP32 BLE, HM-10, AT-09). 
                  <i> (Nota: Los módulos clásicos HC-05 no usan BLE; para ellos usa la pestaña USB/COM con su puerto serial).</i>
                </p>
              </div>

              <button
                onClick={handleBt}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-stadium font-bold py-3 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg"
              >
                <Bluetooth className="w-4 h-4" />
                <span>{loading ? 'BUSCANDO...' : 'BUSCAR DISPOSITIVO BLUETOOTH BLE'}</span>
              </button>
            </div>
          )}

          {activeTab === 'wifi' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Dirección IP del ESP32 / Arduino WiFi en la Red Escolar:
                </label>
                <input
                  type="text"
                  value={wifiIp}
                  onChange={(e) => setWifiIp(e.target.value)}
                  placeholder="192.168.1.50"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono-code focus:border-blue-500 outline-none"
                />
              </div>

              <button
                onClick={handleWifi}
                className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-stadium font-bold py-3 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg"
              >
                <Wifi className="w-4 h-4" />
                <span>GUARDAR IP Y CONECTAR VÍA WIFI</span>
              </button>
            </div>
          )}

          {activeTab === 'sim' && (
            <div className="space-y-3">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
                <span className="font-bold text-cyan-400 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5" /> Simulador de Hardware Virtual:
                </span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Permite probar el funcionamiento completo del tablero deportivo, temporizador, RTC y chicharra 
                  sin necesidad de tener el microcontrolador conectado físicamente.
                </p>
              </div>

              <button
                onClick={handleSim}
                className="w-full bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-stadium font-bold py-3 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg"
              >
                <Cpu className="w-4 h-4" />
                <span>ACTIVAR MODO SIMULACIÓN</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
