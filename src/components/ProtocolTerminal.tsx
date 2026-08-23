import React, { useState, useRef, useEffect } from 'react';
import { LogEntry } from '../types';
import { Terminal, Send, Trash2, ArrowDownCircle, ArrowUpCircle, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  logs: LogEntry[];
  onSendCommand: (cmd: string) => void;
  onClearLogs: () => void;
}

export const ProtocolTerminal: React.FC<Props> = ({ logs, onSendCommand, onClearLogs }) => {
  const [manualCmd, setManualCmd] = useState('');
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCmd.trim()) {
      onSendCommand(manualCmd.trim());
      setManualCmd('');
    }
  };

  const quickCommands = [
    'CMD:START',
    'CMD:PAUSE',
    'CMD:RESET',
    'CMD:HORN',
    'L:10',
    'V:08',
    'CMD:MODE_CLOCK',
    'CMD:MODE_SCOREBOARD',
    'BRIGHT:100'
  ];

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
      <div className="flex flex-wrap justify-between items-center pb-2 mb-3 border-b border-slate-800 gap-2">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-stadium font-bold text-slate-300 uppercase tracking-wider">
            Monitor Serie & Enlace de Protocolo Arduino
          </span>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500 font-mono-code text-[11px]">Total: {logs.length} eventos</span>
          <button
            onClick={onClearLogs}
            className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition flex items-center gap-1 text-[11px]"
            title="Limpiar Consola"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpiar</span>
          </button>
        </div>
      </div>

      {/* Ventana de Logs */}
      <div
        ref={logContainerRef}
        className="bg-black/95 border border-slate-800 rounded-xl p-3 h-44 sm:h-52 overflow-y-auto font-mono-code text-[11px] space-y-1 select-text"
      >
        {logs.length === 0 ? (
          <p className="text-slate-600">// Sin datos aún. Conecte su Arduino / ESP32 o envíe comandos.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start space-x-2 leading-relaxed">
              <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
              {log.type === 'tx' && (
                <span className="text-amber-400 font-bold shrink-0 flex items-center gap-0.5">
                  <ArrowUpCircle className="w-3 h-3 text-amber-500" /> TX →
                </span>
              )}
              {log.type === 'rx' && (
                <span className="text-emerald-400 font-bold shrink-0 flex items-center gap-0.5">
                  <ArrowDownCircle className="w-3 h-3 text-emerald-500" /> RX ←
                </span>
              )}
              {log.type === 'info' && (
                <span className="text-blue-400 font-bold shrink-0">INFO:</span>
              )}
              {log.type === 'error' && (
                <span className="text-rose-400 font-bold shrink-0 flex items-center gap-0.5">
                  <AlertCircle className="w-3 h-3 text-rose-500" /> ERR:
                </span>
              )}
              {log.type === 'success' && (
                <span className="text-emerald-300 font-bold shrink-0 flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> OK:
                </span>
              )}
              <span
                className={
                  log.type === 'tx'
                    ? 'text-amber-300'
                    : log.type === 'rx'
                    ? 'text-emerald-300 font-bold'
                    : log.type === 'error'
                    ? 'text-rose-300'
                    : log.type === 'success'
                    ? 'text-emerald-200'
                    : 'text-slate-300'
                }
              >
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Enviar Comando Manual */}
      <form onSubmit={handleSubmit} className="flex gap-2 mt-3">
        <input
          type="text"
          value={manualCmd}
          onChange={(e) => setManualCmd(e.target.value)}
          placeholder="Comando manual (ej: CMD:HORN, L:15, T:05:00:1:D)..."
          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono-code text-white focus:border-emerald-500 outline-none"
        />
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-stadium font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow transition"
        >
          <Send className="w-3.5 h-3.5" />
          <span>ENVIAR</span>
        </button>
      </form>

      {/* Botones de Comandos Rápidos */}
      <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2.5 border-t border-slate-800">
        <span className="text-[10px] text-slate-500 font-bold uppercase self-center mr-1">Rápidos:</span>
        {quickCommands.map((cmd) => (
          <button
            key={cmd}
            type="button"
            onClick={() => onSendCommand(cmd)}
            className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono-code transition"
          >
            {cmd}
          </button>
        ))}
      </div>
    </section>
  );
};
