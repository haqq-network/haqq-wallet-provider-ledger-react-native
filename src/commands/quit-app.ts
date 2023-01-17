import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';

export const quitApp = async (transport: TransportBLE) => {
  await transport.send(0xb0, 0xa7, 0x00, 0x00);
}
