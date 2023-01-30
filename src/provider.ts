import {TransactionRequest} from '@ethersproject/abstract-provider';
import {
  compressPublicKey,
  Provider,
  ProviderInterface
} from '@haqq/provider-base';
import AppEth, {ledgerService} from '@ledgerhq/hw-app-eth';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import {utils, UnsignedTransaction} from 'ethers';
import {suggestApp} from './commands/suggest-app';
import {getDeviceConnection} from './get-device-connection';
import {sleep} from './sleep';
import {ProviderLedgerReactNativeOptions,} from './types';

export class ProviderLedgerReactNative extends Provider<ProviderLedgerReactNativeOptions> implements ProviderInterface {
  public stop: boolean = false;
  private _transport: TransportBLE | null = null

  async getEthAddress(hdPath: string): Promise<string> {
    const {address} = await this.getPublicKeyAndAddressForHDPath(hdPath)
    return address
  }

  async getPublicKeyAndAddressForHDPath(hdPath: string) {
    let resp = {publicKey: '', address: ''}
    try {
      this.stop = false;

      const transport = await this.awaitForTransport(this._options.deviceId);
      if (!transport) {
        throw new Error('can_not_connected');
      }

      if (this._options.appName) {
        await suggestApp(transport, this._options.appName);
      }

      const eth = new AppEth(transport);

      const response = await eth.getAddress(hdPath);

      resp = {
        publicKey: compressPublicKey(response.publicKey),
        address: response.address
      }
      this.emit('getPublicKeyForHDPath', true);
    } catch (e) {
      if (e instanceof Error) {
        this.catchError(e, 'getPublicKeyForHDPath');

      }
    }
    return resp
  }

  async getPublicKey(hdPath: string) {
    const {publicKey} = await this.getPublicKeyAndAddressForHDPath(hdPath)
    return publicKey
  }

  async getSignedTx(hdPath: string, transaction: TransactionRequest) {
    let resp = ''
    try {
      this.stop = false;
      const unsignedTx = utils
        .serializeTransaction(transaction as UnsignedTransaction)
        .substring(2);
      const resolution = await ledgerService.resolveTransaction(
        unsignedTx,
        {},
        {},
      );

      const transport = await this.awaitForTransport(this._options.deviceId);

      if (!transport) {
        throw new Error('can_not_connected');
      }

      if (this._options.appName) {
        await suggestApp(transport, this._options.appName);
      }

      const eth = new AppEth(transport);

      const signature = await eth.signTransaction(hdPath, unsignedTx, resolution);

      resp = utils.serializeTransaction(transaction as UnsignedTransaction, {
        ...signature,
        r: '0x' + signature.r,
        s: '0x' + signature.s,
        v: parseInt(signature.v, 10),
      });

      this.emit('getSignedTx', true);
    } catch (e) {
      if (e instanceof Error) {
        this.catchError(e, 'getSignedTx');
      }
    }

    return resp
  }

  async signTypedData(hdPath: string, domainHash: string, valuesHash: string) {
    let resp = ''
    try {
      this.stop = false;

      const transport = await this.awaitForTransport(this._options.deviceId);

      if (!transport) {
        throw new Error('can_not_connected')
      }

      if (this._options.appName) {
        await suggestApp(transport, this._options.appName);
      }

      const eth = new AppEth(transport);

      const signature = await eth.signEIP712HashedMessage(hdPath, domainHash, valuesHash);

      const v = (signature.v - 27).toString(16).padStart(2, '0');
      resp = '0x' + signature.r + signature.s + v;

      this.emit('signTypedData', true);
    } catch (e) {
      if (e instanceof Error) {
        this.catchError(e, 'signTypedData');
      }
      return '';
    }

    return resp
  }

  abort() {
    this.emit('abortCall');
    this.stop = true;
  }

  async confirmAddress(hdPath: string) {
    let resp = ''
    try {
      this.stop = false;

      const transport = await this.awaitForTransport(this._options.deviceId);
      if (!transport) {
        throw new Error('can_not_connected');
      }

      if (this._options.appName) {
        await suggestApp(transport, this._options.appName);
      }

      const eth = new AppEth(transport);

      const response = await eth.getAddress(hdPath, true);

      resp = response.address
      this.emit('confirmAddress', true);
    } catch (e) {
      if (e instanceof Error) {
        this.emit('confirmAddress', false, e.message);
        throw new Error(e.message);
      }
    }
    return resp
  }

  async awaitForTransport(deviceId: string) {
    let attempts = 0;
    while (!this._transport && !this.stop && attempts < 150) {
      try {
        const device = await getDeviceConnection(deviceId);

        this._transport = await TransportBLE.open(device);
        if (this._transport) {
          this._transport.on('disconnect', this.onDisconnectTransport)
        }
      } catch (e) {
        this.emit('awaitForTransport', new Date(), e, attempts)
        await sleep(500);
        attempts += 1;
      }
    }

    return this._transport
  }

  onDisconnectTransport = () => {
    if (this._transport) {
      this._transport.off('disconnect', this.onDisconnectTransport);
      this._transport = null;
    }
  }

  catchError(e: Error, source: string) {
    switch (e.name) {
      case 'TransportStatusError':
        // @ts-ignore
        switch (String(e.statusCode)) {
          case '27010':
            this.emit(source, false, e.message, e.name, '27010');
            throw new Error('ledger_locked');
            break;
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
