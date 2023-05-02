export type Device = {
  id: string;

  /**
   * Device name if present
   */
  name: string | null;
};

export enum State {
  /**
   * The current state of the manager is unknown; an update is imminent.
   */
  Unknown = 'Unknown',
  /**
   * The connection with the system service was momentarily lost; an update is imminent.
   */
  Resetting = 'Resetting',
  /**
   * The platform does not support Bluetooth low energy.
   */
  Unsupported = 'Unsupported',
  /**
   * The app is not authorized to use Bluetooth low energy.
   */
  Unauthorized = 'Unauthorized',
  /**
   * Bluetooth is currently powered off.
   */
  PoweredOff = 'PoweredOff',
  /**
   * Bluetooth is currently powered on and available to use.
   */
  PoweredOn = 'PoweredOn',
}

export type ProviderLedgerReactNativeOptions = {
  deviceId: string;
  appName?: string;
};
