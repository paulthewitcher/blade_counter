const TARGET_SERVICE_UUID = '55c40000-f8eb-11ec-b939-0242ac120002';
const TARGET_CHAR_UUID = '55c4f002-f8eb-11ec-b939-0242ac120002';
const DEVICE_NAME = 'BEYBLADE_TOOL01';

export class BattlePassClient {
  constructor({ onPacket, onStatus }) {
    this.onPacket = onPacket;
    this.onStatus = onStatus;
    this.device = null;
    this.characteristic = null;
    this.handleValueChanged = this.handleValueChanged.bind(this);
    this.handleDisconnected = this.handleDisconnected.bind(this);
  }

  async connect() {
    if (!navigator.bluetooth) throw new Error('Web Bluetooth non supportato dal browser.');
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ name: DEVICE_NAME }],
      optionalServices: [TARGET_SERVICE_UUID],
    });
    await this.attach(device);
  }

  async attach(device) {
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(TARGET_SERVICE_UUID);
    const characteristic = await service.getCharacteristic(TARGET_CHAR_UUID);
    await characteristic.startNotifications();
    characteristic.addEventListener('characteristicvaluechanged', this.handleValueChanged);
    device.addEventListener('gattserverdisconnected', this.handleDisconnected);
    this.device = device;
    this.characteristic = characteristic;
    this.onStatus({ type: 'connected', deviceName: device.name || DEVICE_NAME });
  }

  handleValueChanged(event) {
    const value = event.target.value;
    const bytes = Array.from({ length: value.byteLength }, (_, index) => value.getUint8(index));
    this.onPacket(bytes, value);
  }

  handleDisconnected() {
    this.onStatus({ type: 'disconnected' });
    this.device = null;
    this.characteristic = null;
  }

  disconnect() {
    if (this.device?.gatt?.connected) this.device.gatt.disconnect();
    this.device = null;
    this.characteristic = null;
    this.onStatus({ type: 'disconnected' });
  }
}
