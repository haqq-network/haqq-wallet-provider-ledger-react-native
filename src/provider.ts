import {ProviderLedgerReactNativeOptions,} from './types';
import {
  compressPublicKey,
  Provider,
  ProviderInterface
} from '@haqq/provider-base';
import {TransactionRequest} from '@ethersproject/abstract-provider';
import {UnsignedTransaction, utils} from 'ethers';
import AppEth, {ledgerService} from '@ledgerhq/hw-app-eth';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import {BleManager, State} from 'react-native-ble-plx';
import {sleep} from './sleep';

const connectOptions = {
  requestMTU: 156,
  connectionPriority: 1,
};

export class ProviderLedgerReactNative extends Provider<ProviderLedgerReactNativeOptions> implements ProviderInterface {
  public stop: boolean = false;
  private _transport: TransportBLE | null = null
  private _bleManager: BleManager | null = null

  async getBase64PublicKey() {
    let resp = ''
    try {
      if (!this._wallet.publicKey) {
        this.stop = false;

        const transport = await this.awaitForTransport(this._options.deviceId);
        if (!transport) {
          throw new Error('can_not_connected');
        }
        const eth = new AppEth(transport);

        const response = await eth.getAddress(this._options.hdPath);

        this._wallet.publicKey = compressPublicKey(response.publicKey);
      }

      resp = Buffer.from(this._wallet.publicKey, 'hex').toString('base64');
    } catch (e) {
      if (e instanceof Error) {
        this.emit('getBase64PublicKey', false, e.message);
        throw new Error(e.message);
      }
    }
    return resp
  }

  async getSignedTx(transaction: TransactionRequest) {
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

      const eth = new AppEth(transport);

      const signature = await eth.signTransaction(this._options.hdPath, unsignedTx, resolution);

      resp = utils.serializeTransaction(transaction as UnsignedTransaction, {
        ...signature,
        r: '0x' + signature.r,
        s: '0x' + signature.s,
        v: parseInt(signature.v, 10),
      });

      this.emit('getSignedTx', true);
    } catch (e) {
      if (e instanceof Error) {
        this.emit('getSignedTx', false, e.message);
        throw new Error(e.message);
      }
    }

    return resp
  }

  async signTypedData(domainHash: string, valuesHash: string) {
    let resp = ''
    try {
      this.stop = false;

      const transport = await this.awaitForTransport(this._options.deviceId);

      if (!transport) {
        throw new Error('can_not_connected')
      }

      const eth = new AppEth(transport);

      const signature = await eth.signEIP712HashedMessage(this._options.hdPath, domainHash, valuesHash);

      const v = (signature.v - 27).toString(16).padStart(2, '0');
      resp = '0x' + signature.r + signature.s + v;

      this.emit('signTypedData', true);
    } catch (e) {
      if (e instanceof Error) {
        this.emit('signTypedData', false, e.message);
        throw new Error(e.message);
      }
      return '';
    }

    return resp
  }

  abort() {
    this.emit('abortCall');
    this.stop = true;
  }

  async awaitForTransport(deviceId: string) {
    if (!this._bleManager) {
      this._bleManager = new BleManager();
    }
    while (!this._transport && !this.stop) {
      try {
        const state = await this._bleManager.state();

        if (state !== State.PoweredOn) {
          throw new Error(`not_connected ${state}`);
        }

        const device = await this._bleManager.connectToDevice(
          deviceId,
          connectOptions,
        );

        const isConnected = await device.isConnected();

        if (!isConnected) {
          await device.connect();
        }

        this._transport = await TransportBLE.open(device);
        if (this._transport) {
          this._transport.on('disconnect', this.onDisconnectTransport)
        }
      } catch (e) {
        this.emit('awaitForTransport', new Date(), e)
        await sleep(500);
      }
    }

    return this._transport
  }

  onDisconnectTransport = () => {
    if (this._transport) {
      this._transport.off('disconnect', this.onDisconnectTransport)
    }
  }
}
