import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';

export const getVersion = async (transport: TransportBLE) => {
  return await transport.send(0xe0, 0x01, 0x00, 0x00);
};
