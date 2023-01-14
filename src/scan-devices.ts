import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import EventEmitter from 'events';
import {Observable, Subscription} from 'rxjs';

export function scanDevices() {
  let sub: null | Subscription = null
  let transport: null | Subscription = null

  const emitter = new EventEmitter();

  const listen = () => {
    try {
      if (transport) {
        transport.unsubscribe();
      }

      transport = new Observable(TransportBLE.listen).subscribe({
        complete: () => {
          emitter.emit('complete', true);
        },
        next: e => {
          if (e.type === 'add') {
            emitter.emit('device', e.descriptor)
          }
        },
        error: e => {
          emitter.emit('error', e);
          emitter.emit('complete', true);
        },
      });
    } catch (e) {
      emitter.emit('error', e);
    }
  }

  return {
    start() {
      let previousAvailable: boolean = false;
      sub = new Observable<{available: boolean}>(
        TransportBLE.observeState,
      ).subscribe(e => {
        if (e.available !== previousAvailable) {
          previousAvailable = e.available;
          if (e.available) {
            listen();
          }
        }
      });

      listen();
    },
    stop() {
      if(sub) {
        sub.unsubscribe();
      }
      if (transport) {
        transport.unsubscribe();
      }
    },
    on: emitter.on.bind(emitter),
    off: emitter.off.bind(emitter)
  }
}
