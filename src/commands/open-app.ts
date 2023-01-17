import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';

export const openApp = async (
  transport: TransportBLE,
  name: string,
): Promise<void> => {
  await transport.send(0xe0, 0xd8, 0x00, 0x00, Buffer.from(name, 'ascii'));
};
