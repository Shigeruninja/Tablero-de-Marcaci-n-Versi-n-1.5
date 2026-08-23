// Gestor unificado de comunicaciones con Arduino / ESP32
import { ConnectionType, LogEntry } from '../types';

export interface SerialPortLike {
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
  readable: ReadableStream<Uint8Array> | null;
  writable: WritableStream<Uint8Array> | null;
}

export interface BluetoothCharLike {
  writeValue(value: BufferSource): Promise<void>;
  startNotifications(): Promise<BluetoothCharLike>;
  addEventListener(type: string, listener: (e: Event) => void): void;
  value?: DataView;
}

export interface BluetoothServiceLike {
  getCharacteristic(characteristic: string | number): Promise<BluetoothCharLike>;
}

export interface BluetoothServerLike {
  connect(): Promise<BluetoothServerLike>;
  disconnect(): void;
  connected: boolean;
  getPrimaryService(service: string | number): Promise<BluetoothServiceLike>;
}

export interface BluetoothDeviceLike {
  name?: string;
  gatt?: BluetoothServerLike;
  addEventListener(type: string, listener: () => void): void;
}

export class HardwareManager {
  private connectionType: ConnectionType = 'none';
  private logCallback?: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  private statusCallback?: (type: ConnectionType, label: string) => void;
  private onDataReceivedCallback?: (data: string) => void;

  // Web Serial
  private serialPort: SerialPortLike | null = null;
  private serialReader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private serialWriter: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private isReadingSerial = false;

  // Web Bluetooth BLE
  private btDevice: BluetoothDeviceLike | null = null;
  private btTxChar: BluetoothCharLike | null = null;
  private btRxChar: BluetoothCharLike | null = null;

  // WiFi IP
  private wifiIp = '192.168.1.50';

  constructor() {
    //
  }

  setCallbacks(
    onLog: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void,
    onStatus: (type: ConnectionType, label: string) => void,
    onData?: (data: string) => void
  ) {
    this.logCallback = onLog;
    this.statusCallback = onStatus;
    this.onDataReceivedCallback = onData;
  }

  getConnectionType(): ConnectionType {
    return this.connectionType;
  }

  getWifiIp(): string {
    return this.wifiIp;
  }

  setWifiIp(ip: string) {
    this.wifiIp = ip.trim();
  }

  // Comprobar compatibilidad de APIs en el navegador
  static checkSupport() {
    const hasSerial = typeof navigator !== 'undefined' && 'serial' in navigator;
    const hasBluetooth = typeof navigator !== 'undefined' && 'bluetooth' in navigator;
    return { hasSerial, hasBluetooth };
  }

  // --- CONEXIÓN WEB SERIAL (USB / COM VIRTUAL BLUETOOTH HC-05) ---
  async connectSerial(baudRate = 9600): Promise<boolean> {
    try {
      if (!('serial' in navigator)) {
        throw new Error('Web Serial API no es soportada en este navegador. Utiliza Chrome, Edge u Opera en PC o Mac.');
      }

      this.log({ type: 'info', message: 'Solicitando puerto Serial USB / Bluetooth COM...' });
      const navSerial = (navigator as unknown as { serial: { requestPort: () => Promise<SerialPortLike> } }).serial;
      const port = await navSerial.requestPort();
      
      await port.open({ baudRate });
      this.serialPort = port;
      this.connectionType = 'serial';

      if (port.writable) {
        this.serialWriter = port.writable.getWriter();
      }

      this.statusCallback?.('serial', `USB/Serial (${baudRate} bps)`);
      this.log({ type: 'success', message: `Conectado a puerto Serial a ${baudRate} baudios.` });

      // Iniciar bucle de lectura asíncrono
      this.startSerialReadLoop(port);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.log({ type: 'error', message: `Fallo al conectar Serial: ${msg}` });
      return false;
    }
  }

  private async startSerialReadLoop(port: SerialPortLike) {
    if (!port.readable) return;
    this.isReadingSerial = true;
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();

    try {
      let buffer = '';
      while (this.isReadingSerial) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          buffer += value;
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed) {
              this.log({ type: 'rx', message: trimmed, source: 'ARDUINO' });
              this.onDataReceivedCallback?.(trimmed);
            }
          }
        }
      }
    } catch {
      // Ignorar interrupción normal de desconexión
    } finally {
      reader.releaseLock();
      await readableStreamClosed.catch(() => {});
    }
  }

  // --- CONEXIÓN WEB BLUETOOTH BLE (ESP32 BLE / HM-10 / AT-09) ---
  async connectBluetoothBLE(): Promise<boolean> {
    try {
      if (!('bluetooth' in navigator)) {
        throw new Error('Web Bluetooth API no disponible en este navegador o contexto iframe.');
      }

      this.log({ type: 'info', message: 'Escaneando dispositivos Bluetooth BLE (ESP32 / HM-10)...' });

      // UUIDs estándar de Nordic UART Service y genéricos
      const NORDIC_UART_SERVICE = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
      const NORDIC_TX_CHAR = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'; // Phone to device (write)
      const NORDIC_RX_CHAR = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'; // Device to phone (notify)

      const navBt = (navigator as unknown as { bluetooth: { requestDevice: (opts: unknown) => Promise<BluetoothDeviceLike> } }).bluetooth;
      const device = await navBt.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          NORDIC_UART_SERVICE,
          '0000ffe0-0000-1000-8000-00805f9b34fb', // HM-10 / CC2541 service
          '49535343-fe7d-4ae5-8fa9-9fafd205e455'  // ISSC BLE
        ]
      });

      this.log({ type: 'info', message: `Emparejando con: ${device.name || 'Dispositivo BLE'}...` });
      
      device.addEventListener('gattserverdisconnected', () => {
        this.disconnect();
        this.log({ type: 'info', message: 'Dispositivo Bluetooth BLE desconectado.' });
      });

      const server = await device.gatt?.connect();
      if (!server) throw new Error('No se pudo establecer conexión GATT.');

      this.btDevice = device;
      
      // Buscar servicios UART
      let service: BluetoothServiceLike | undefined;
      try {
        service = await server.getPrimaryService(NORDIC_UART_SERVICE);
        this.btTxChar = await service.getCharacteristic(NORDIC_TX_CHAR);
        try {
          this.btRxChar = await service.getCharacteristic(NORDIC_RX_CHAR);
          await this.btRxChar.startNotifications();
          this.btRxChar.addEventListener('characteristicvaluechanged', (e: Event) => {
            const target = e.target as unknown as BluetoothCharLike;
            if (target.value) {
              const text = new TextDecoder().decode(target.value).trim();
              if (text) {
                this.log({ type: 'rx', message: text, source: 'ESP32-BLE' });
                this.onDataReceivedCallback?.(text);
              }
            }
          });
        } catch {
          // Rx opcional
        }
      } catch {
        // Probar servicio HM-10 alternativo
        try {
          service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
          this.btTxChar = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');
        } catch {
          throw new Error('Servicio UART BLE no encontrado en el dispositivo. Asegúrese que el ESP32 o HM-10 esté transmitiendo el servicio Nordic UART.');
        }
      }

      this.connectionType = 'bluetooth';
      this.statusCallback?.('bluetooth', `BLE: ${device.name || 'Conectado'}`);
      this.log({ type: 'success', message: `Conectado exitosamente por Bluetooth BLE a ${device.name || 'ESP32'}.` });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.log({ type: 'error', message: `Error Bluetooth BLE: ${msg}` });
      return false;
    }
  }

  // --- MODO WIFI (ESP32 HTTP/REST O WEBSOCKET) ---
  connectWifi(ip: string): boolean {
    this.wifiIp = ip.trim();
    this.connectionType = 'wifi';
    this.statusCallback?.('wifi', `WiFi: ${this.wifiIp}`);
    this.log({ type: 'info', message: `Configurado enlace WiFi a http://${this.wifiIp}/cmd?val=...` });
    return true;
  }

  // --- MODO SIMULACIÓN ---
  connectSimulation(): boolean {
    this.connectionType = 'simulation';
    this.statusCallback?.('simulation', 'Simulador Arduino Activo');
    this.log({ type: 'success', message: 'Modo Simulación Virtual iniciado. El tablero emula un Arduino Uno con display MAX7219 y RTC DS3231.' });
    return true;
  }

  // --- DESCONEXIÓN ---
  async disconnect() {
    if (this.connectionType === 'serial' && this.serialPort) {
      this.isReadingSerial = false;
      try {
        if (this.serialWriter) {
          await this.serialWriter.close();
          this.serialWriter = null;
        }
        await this.serialPort.close();
      } catch {
        // Ignorar
      }
      this.serialPort = null;
    } else if (this.connectionType === 'bluetooth' && this.btDevice?.gatt?.connected) {
      this.btDevice.gatt.disconnect();
      this.btDevice = null;
      this.btTxChar = null;
      this.btRxChar = null;
    }

    this.connectionType = 'none';
    this.statusCallback?.('none', 'Desconectado');
    this.log({ type: 'info', message: 'Conexión cerrada.' });
  }

  // --- ENVÍO DE COMANDOS ---
  async sendCommand(command: string): Promise<boolean> {
    const cleanCmd = command.trim();
    const packet = cleanCmd + '\n';
    this.log({ type: 'tx', message: cleanCmd });

    if (this.connectionType === 'serial' && this.serialWriter) {
      try {
        const encoder = new TextEncoder();
        await this.serialWriter.write(encoder.encode(packet));
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.log({ type: 'error', message: `Error envío Serial: ${msg}` });
        return false;
      }
    } else if (this.connectionType === 'bluetooth' && this.btTxChar) {
      try {
        const encoder = new TextEncoder();
        await this.btTxChar.writeValue(encoder.encode(packet));
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.log({ type: 'error', message: `Error envío BLE: ${msg}` });
        return false;
      }
    } else if (this.connectionType === 'wifi') {
      try {
        // Usar fetch sin bloquear
        fetch(`http://${this.wifiIp}/cmd?val=${encodeURIComponent(cleanCmd)}`, {
          method: 'GET',
          mode: 'no-cors'
        }).catch((err) => {
          this.log({ type: 'error', message: `HTTP WiFi error: ${err.message}` });
        });
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.log({ type: 'error', message: `Error WiFi: ${msg}` });
        return false;
      }
    } else if (this.connectionType === 'simulation') {
      // Simular respuesta de confirmación desde el microcontrolador
      if (cleanCmd.startsWith('CMD:')) {
        setTimeout(() => {
          this.log({ type: 'rx', message: `ACK:${cleanCmd}`, source: 'SIM-ARDUINO' });
        }, 35);
      }
      return true;
    }

    return false;
  }

  private log(entry: Omit<LogEntry, 'id' | 'timestamp'>) {
    this.logCallback?.(entry);
  }
}

export const hardware = new HardwareManager();

