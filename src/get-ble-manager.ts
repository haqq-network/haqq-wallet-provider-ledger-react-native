import {BleManager} from 'react-native-ble-plx';

let bleManager: BleManager | null = null;

export function getBleManager(): BleManager {
  if (!bleManager) {
    bleManager = new BleManager();
  }

  return bleManager!;
}
