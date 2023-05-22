import {State} from 'react-native-ble-plx';
import {getBleManager} from './get-ble-manager';

const cache = new Map();

const connectOptions = {
  requestMTU: 156,
  connectionPriority: 1,
};

export async function getDeviceConnection(deviceId: string) {
  const bleManager = getBleManager();
  const state = await bleManager.state();

  if (state !== State.PoweredOn) {
    throw new Error(`not_connected ${state}`);
  }
  if (!cache.has(deviceId)) {
    const result = await bleManager.connectToDevice(deviceId, connectOptions);

    if (result) {
      cache.set(deviceId, result);
    }
  }

  const device = cache.get(deviceId);

  if (!device) {
    throw new Error(`not_found ${deviceId}`);
  }

  const isConnected = await device.isConnected();

  if (!isConnected) {
    await device.connect();
  }

  return device;
}
