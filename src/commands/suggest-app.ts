import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import {getAppAndVersion} from './get-app-and-version';
import {openApp} from './open-app';
import {quitApp} from './quit-app';

const dashboardNames = ['BOLOS', 'OLOS\u0000'];
export const isDashboardName = (name: string) => dashboardNames.includes(name);

export const suggestApp = async (
  transport: TransportBLE,
  name: string,
): Promise<void> => {
  try {
    const v = await getAppAndVersion(transport);

    if (v.name !== name) {
      if (!isDashboardName(v.name)) {
        await quitApp(transport);
      }

      await openApp(transport, name);
    }
  } catch (err) {
    console.error('suggestApp', err);

    //@ts-ignore
    if (err instanceof Error && !!err.statusCode) {
      throw err;
    }
  }
};
