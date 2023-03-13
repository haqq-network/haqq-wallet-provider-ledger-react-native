[@haqq/provider-ledger-react-native - v0.0.18](README.md) / Exports

# @haqq/provider-ledger-react-native - v0.0.18

## Table of contents

### Enumerations

- [State](enums/State.md)

### Classes

- [ProviderLedgerReactNative](classes/ProviderLedgerReactNative.md)

### Type Aliases

- [App](modules.md#app)
- [Device](modules.md#device)
- [ProviderLedgerReactNativeOptions](modules.md#providerledgerreactnativeoptions)

### Functions

- [getBleManager](modules.md#getblemanager)
- [getVersion](modules.md#getversion)
- [isDashboardName](modules.md#isdashboardname)
- [listApps](modules.md#listapps)
- [scanDevices](modules.md#scandevices)
- [suggestApp](modules.md#suggestapp)
- [tryToInitBt](modules.md#trytoinitbt)

## Type Aliases

### App

Ƭ **App**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `blocks` | `number` |
| `flags` | `number` |
| `hash` | `string` |
| `hashCodeData` | `string` |
| `name` | `string` |

#### Defined in

[src/commands/list-apps.ts:3](https://github.com/haqq-network/haqq-wallet-provider-ledger-react-native/blob/10fe57d/src/commands/list-apps.ts#L3)

___

### Device

Ƭ **Device**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | - |
| `name` | `string` \| ``null`` | Device name if present |

#### Defined in

[src/types.ts:1](https://github.com/haqq-network/haqq-wallet-provider-ledger-react-native/blob/10fe57d/src/types.ts#L1)

___

### ProviderLedgerReactNativeOptions

Ƭ **ProviderLedgerReactNativeOptions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `appName?` | `string` |
| `deviceId` | `string` |

#### Defined in

[src/types.ts:37](https://github.com/haqq-network/haqq-wallet-provider-ledger-react-native/blob/10fe57d/src/types.ts#L37)

## Functions

### getBleManager

▸ **getBleManager**(): `BleManager`

#### Returns

`BleManager`

#### Defined in

[src/get-ble-manager.ts:5](https://github.com/haqq-network/haqq-wallet-provider-ledger-react-native/blob/10fe57d/src/get-ble-manager.ts#L5)

___

### getVersion

▸ **getVersion**(`transport`): `Promise`<`Buffer`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `transport` | `default` |

#### Returns

`Promise`<`Buffer`\>

#### Defined in

[src/commands/get-version.ts:3](https://github.com/haqq-network/haqq-wallet-provider-ledger-react-native/blob/10fe57d/src/commands/get-version.ts#L3)

___

### isDashboardName

▸ **isDashboardName**(`name`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

`boolean`

#### Defined in

[src/commands/suggest-app.ts:7](https://github.com/haqq-network/haqq-wallet-provider-ledger-react-native/blob/10fe57d/src/commands/suggest-app.ts#L7)

___

### listApps

▸ **listApps**(`transport`): `Promise`<[`App`](modules.md#app)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `transport` | `default` |

#### Returns

`Promise`<[`App`](modules.md#app)[]\>

#### Defined in

[src/commands/list-apps.ts:11](https://github.com/haqq-network/haqq-wallet-provider-ledger-react-native/blob/10fe57d/src/commands/list-apps.ts#L11)

___

### scanDevices

▸ **scanDevices**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `off` | (`eventName`: `string` \| `symbol`, `listener`: (...`args`: `any`[]) => `void`) => `EventEmitter` |
| `on` | (`eventName`: `string` \| `symbol`, `listener`: (...`args`: `any`[]) => `void`) => `EventEmitter` |
| `start` | () => `void` |
| `stop` | () => `void` |

#### Defined in

[src/scan-devices.ts:5](https://github.com/haqq-network/haqq-wallet-provider-ledger-react-native/blob/10fe57d/src/scan-devices.ts#L5)

___

### suggestApp

▸ **suggestApp**(`transport`, `name`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `transport` | `default` |
| `name` | `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/commands/suggest-app.ts:9](https://github.com/haqq-network/haqq-wallet-provider-ledger-react-native/blob/10fe57d/src/commands/suggest-app.ts#L9)

___

### tryToInitBt

▸ **tryToInitBt**(): `Promise`<`Observable`<`State`\>\>

#### Returns

`Promise`<`Observable`<`State`\>\>

#### Defined in

[src/try-to-init-bt.ts:6](https://github.com/haqq-network/haqq-wallet-provider-ledger-react-native/blob/10fe57d/src/try-to-init-bt.ts#L6)
