import {TransactionRequest} from '@ethersproject/abstract-provider';
import {
  compressPublicKey,
  prepareHashedEip712Data,
  stringToUtf8Bytes,
  BytesLike,
  Provider,
  ProviderInterface,
  TypedData,
} from '@haqq/provider-base';
import AppEth, {ledgerService} from '@ledgerhq/hw-app-eth';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import {utils, UnsignedTransaction} from 'ethers';
import {firstValueFrom, Observable} from 'rxjs';
import {suggestApp} from './commands';
import {withDevicePolling} from './device-access';
import {ProviderLedgerReactNativeOptions} from './types';

export class ProviderLedgerReactNative
  extends Provider<ProviderLedgerReactNativeOptions>
  implements ProviderInterface
{
  getIdentifier(): string {
    return this._options.deviceId;
  }

  withDevice = () => {
    return <T>(job: (arg0: TransportBLE) => Observable<T>): Observable<T> => {
      return withDevicePolling(this._options.deviceId)(
        transport =>
          new Observable(o => {
            this.on('abortCall', () => {
              o.error(new Error('aborted'));
              o.complete();
            });
            return job(transport).subscribe(o);
          }),
      );
    };
  };

  async confirmAddress(hdPath: string) {
    return (await this.getAccountInfo(hdPath, true)).address;
  }

  async getAccountInfo(hdPath: string, showDisplay = false) {
    await this.suggestApp();
    return firstValueFrom<{publicKey: string; address: string}>(
      this.withDevice()(
        transport =>
          new Observable(o => {
            const run = async () => {
              const eth = new AppEth(transport);
              const response = await eth.getAddress(hdPath, showDisplay);

              return {
                publicKey: compressPublicKey(response.publicKey),
                address: response.address,
              };
            };

            run()
              .then(result => {
                o.next(result);
                o.complete();
                this.emit('getPublicKeyForHDPath', true);
              })
              .catch(e => {
                try {
                  o.error(e); // resolve in genericCanRetryOnError
                } catch (_) {
                  o.next({publicKey: '', address: ''});
                  o.complete();
                  this.catchError(e, 'getPublicKeyForHDPath');
                }
              });
          }),
      ),
    );
  }

  async signTransaction(hdPath: string, transaction: TransactionRequest) {
    await this.suggestApp();
    return firstValueFrom<string>(
      this.withDevice()(
        transport =>
          new Observable(o => {
            const run = async () => {
              const eth = new AppEth(transport);
              const unsignedTx = utils
                .serializeTransaction(transaction as UnsignedTransaction)
                .substring(2);
              const resolution = await ledgerService.resolveTransaction(
                unsignedTx,
                {},
                {},
              );
              const signature = await eth.signTransaction(
                hdPath,
                unsignedTx,
                resolution,
              );

              return utils.serializeTransaction(
                transaction as UnsignedTransaction,
                {
                  ...signature,
                  r: '0x' + signature.r,
                  s: '0x' + signature.s,
                  v: parseInt(signature.v, 10),
                },
              );
            };

            run()
              .then(result => {
                o.next(result);
                o.complete();
                this.emit('signTransaction', true);
              })
              .catch(e => {
                try {
                  o.error(e); // resolve in genericCanRetryOnError
                } catch (_) {
                  o.next('');
                  o.complete();
                  this.catchError(e, 'signTransaction');
                }
              });
          }),
      ),
    );
  }

  async signPersonalMessage(
    hdPath: string,
    message: string | BytesLike,
  ): Promise<string> {
    await this.suggestApp();
    return firstValueFrom(
      this.withDevice()(
        transport =>
          new Observable(o => {
            const run = async () => {
              const eth = new AppEth(transport);
              const m = Array.from(
                typeof message === 'string'
                  ? stringToUtf8Bytes(message)
                  : message,
              );
              const signature = await eth.signPersonalMessage(
                hdPath,
                Buffer.from(m).toString('hex'),
              );

              const v = (signature.v - 27).toString(16).padStart(2, '0');
              return '0x' + signature.r + signature.s + v;
            };

            run()
              .then(result => {
                o.next(result);
                o.complete();
                this.emit('signPersonalMessage', true);
              })
              .catch(e => {
                try {
                  o.error(e); // resolve in genericCanRetryOnError
                } catch (_) {
                  o.next('');
                  o.complete();
                  this.catchError(e, 'signPersonalMessage');
                }
              });
          }),
      ),
    );
  }

  async signTypedData(hdPath: string, typedData: TypedData) {
    await this.suggestApp();
    return firstValueFrom<string>(
      this.withDevice()(
        transport =>
          new Observable(o => {
            const run = async () => {
              const {domainSeparatorHex, hashStructMessageHex} =
                prepareHashedEip712Data(typedData);

              const eth = new AppEth(transport);

              const signature = await eth.signEIP712HashedMessage(
                hdPath,
                domainSeparatorHex,
                hashStructMessageHex,
              );

              const v = (signature.v - 27).toString(16).padStart(2, '0');
              return '0x' + signature.r + signature.s + v;
            };

            run()
              .then(result => {
                o.next(result);
                o.complete();
                this.emit('signTypedData', true);
              })
              .catch(e => {
                try {
                  o.error(e); // resolve in genericCanRetryOnError
                } catch (_) {
                  o.next('');
                  o.complete();
                  this.catchError(e, 'signTypedData');
                }
              });
          }),
      ),
    );
  }

  suggestApp = async () => {
    return firstValueFrom<boolean>(
      this.withDevice()(
        transport =>
          new Observable(o => {
            const run = async () => {
              if (this._options.appName) {
                await suggestApp(transport, this._options.appName);
              }
            };

            run()
              .then(() => {
                o.next(true);
                o.complete();
                this.emit('suggestApp', true);
              })
              .catch(e => {
                try {
                  o.error(e); // resolve in genericCanRetryOnError
                } catch (_) {
                  o.next(false);
                  o.complete();
                  this.emit('suggestApp', false);
                }
              });
          }),
      ),
    );
  };

  async abort() {
    this.emit('abortCall');
    return firstValueFrom<void>(
      this.withDevice()(
        transport =>
          new Observable(o => {
            const run = async () => {
              if (transport.isConnected) {
                if (await transport.device.isConnected()) {
                  transport.device.cancelConnection();
                }
                transport.close();
              }
            };

            run().finally(() => {
              o.next();
              o.complete();
            });
          }),
      ),
    );
  }

  catchError(e: Error, source: string) {
    this.emit('error', e, source);
    switch (e.name) {
      case 'TransportStatusError':
        // @ts-ignore
        switch (String(e.statusCode)) {
          case '27010':
            this.emit(source, false, e.message, e.name, '27010');
            throw new Error('ledger_locked');
          case '27013':
            this.emit(source, false, e.message, e.name, '27013');
            throw new Error('ledger_rejected');
        }
        break;
      default:
        super.catchError(e, source);
        break;
    }
  }
}
