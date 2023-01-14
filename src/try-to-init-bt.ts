import {PermissionsAndroid, Platform} from 'react-native';
import {State, Subscription as BleSub} from 'react-native-ble-plx';
import {Observable} from 'rxjs';
import {getBleManager} from './get-ble-manager';

export async function tryToInitBt(): Promise<Observable<State>> {
  if (Platform.OS === 'android') {
    await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
    ]);
  }
  const manager = getBleManager();
  let sub: BleSub;
  let previousState = State.Unknown;
  return new Observable(observer => {
    const subs = (state: State) => {
      if (state !== previousState) {
        previousState = state;
        observer.next(state);
      }
    }

    manager.state().then(subs);
    sub = manager.onStateChange(subs, true);
  })
}
