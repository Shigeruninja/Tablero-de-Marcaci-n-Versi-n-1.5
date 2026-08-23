import React from 'react';
import { AUDIT_ITEMS } from '../utils/arduinoCode';
import { ShieldCheck, AlertTriangle, CheckCircle2, FileCode, Wrench, ArrowRight, Cpu, Usb, Bluetooth } from 'lucide-react';

export const CodeVerificationAudit: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Resumen del Diagnóstico */}
      <div className="bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-500/40 rounded-2xl p-5 shadow-xl">
        <div className="flex items-start space-x-3">
          <ShieldCheck className="w-8 h-8 text-blue-400 shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-stadium font-black text-white">
              INFORME DE VERIFICACIÓN TÉCNICA DEL CÓDIGO
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Hemos auditado a fondo el código HTML/JS que programaste para el tablero del colegio. 
              La estructura visual, la lógica del cronómetro y el cálculo horario de Buenos Aires (UTC-3) 
              fueron excelentes bases. A continuación se detallan los <b>puntos críticos de enlace con Arduino</b> corregidos 
              para que el cartel físico responda sin errores.
            </p>
          </div>
        </div>
      </div>

      {/* Tarjetas de Diagnóstico Punto por Punto */}
      <div className="grid grid-cols-1 gap-4">
        {AUDIT_ITEMS.map((item) => (
          <div
            key={item.id}
            className={`border rounded-2xl p-5 shadow-lg ${
              item.category === 'critical'
                ? 'bg-rose-950/20 border-rose-500/40'
                : item.category === 'warning'
                ? 'bg-amber-950/20 border-amber-500/40'
                : 'bg-cyan-950/20 border-cyan-500/40'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {item.category === 'critical' ? (
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                ) : item.category === 'warning' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                )}
                <h4 className="font-stadium font-bold text-sm sm:text-base text-white">
                  {item.title}
                </h4>
              </div>
              <span
                className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                  item.category === 'critical'
                    ? 'bg-rose-900/60 text-rose-300'
                    : item.category === 'warning'
                    ? 'bg-amber-900/60 text-amber-300'
                    : 'bg-cyan-900/60 text-cyan-300'
                }`}
              >
                {item.category === 'critical' ? 'Corrección Crítica' : 'Optimización'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {item.description}
            </p>

            {/* Comparativa de código */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs font-mono-code">
              {item.codeSnippetOriginal && (
                <div className="bg-black/80 border border-red-500/30 rounded-xl p-3">
                  <div className="text-[10px] font-bold text-red-400 uppercase mb-1">
                    ❌ En tu código original:
                  </div>
                  <pre className="text-slate-400 overflow-x-auto whitespace-pre-wrap">
                    {item.codeSnippetOriginal}
                  </pre>
                </div>
              )}

              {item.codeSnippetFixed && (
                <div className="bg-black/80 border border-emerald-500/30 rounded-xl p-3">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase mb-1">
                    ✅ Corrección aplicada en la App:
                  </div>
                  <pre className="text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                    {item.codeSnippetFixed}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Guía de hardware recomendada */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h4 className="font-stadium font-black text-white text-base mb-3 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-amber-400" />
          Recomendaciones para el Montaje en el Gimnasio
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2 text-blue-400 font-bold mb-1">
              <Usb className="w-4 h-4" />
              <span>Opción 1: USB / Web Serial</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              La más confiable para la mesa de control. Conectas la PC con cable USB al Arduino y la app transmite a 9600 bps sin interferencias.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2 text-amber-400 font-bold mb-1">
              <Bluetooth className="w-4 h-4" />
              <span>Opción 2: Bluetooth HC-05 (COM)</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Emparejas el HC-05 en Windows/Mac (código 1234). El sistema crea un puerto COM virtual que abres con Web Serial en Chrome.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold mb-1">
              <Cpu className="w-4 h-4" />
              <span>Opción 3: ESP32 BLE / WiFi</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Si usas un microcontrolador ESP32, puedes usar Web Bluetooth nativo sin cables directo desde cualquier celular o notebook.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
