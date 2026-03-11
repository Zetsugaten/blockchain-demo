const { v4: uuidv4 } = require('uuid');

class DeviceManager {
  constructor() {
    this.devices = {};
    this._initDefaultDevices();
  }

  _initDefaultDevices() {
    const defaultDevices = [
      { id: 'device-alpha', name: 'Dispositivo Alpha', icon: '🖥️', color: '#6366f1' },
      { id: 'device-beta',  name: 'Dispositivo Beta',  icon: '💻', color: '#10b981' },
      { id: 'device-gamma', name: 'Dispositivo Gamma', icon: '📱', color: '#f59e0b' }
    ];

    for (const d of defaultDevices) {
      this.devices[d.id] = {
        ...d,
        online: true,
        lastSeen: Date.now(),
        blockCount: 0,
        registeredAt: Date.now()
      };
    }
  }

  getAll() {
    return Object.values(this.devices);
  }

  get(deviceId) {
    return this.devices[deviceId] || null;
  }

  setOnline(deviceId, online) {
    if (this.devices[deviceId]) {
      this.devices[deviceId].online = online;
      this.devices[deviceId].lastSeen = Date.now();
    }
  }

  incrementBlockCount(deviceId) {
    if (this.devices[deviceId]) {
      this.devices[deviceId].blockCount++;
      this.devices[deviceId].lastSeen = Date.now();
    }
  }

  toJSON() {
    return this.getAll();
  }
}

module.exports = { DeviceManager };
