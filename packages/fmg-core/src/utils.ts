import Web3 from 'web3';
import { soliditySha3 } from 'web3-utils';
import { Signature } from 'web3/eth/accounts';

// TODO: write some jest tests for utils.

export function toHex32(num) {
  return "0x" + toPaddedHexString(num, 64);
}

export function padBytes32(data){
  const l = 66-data.length;
  let x = data.substr(2, data.length);

  for(let i=0; i<l; i++) {
    x = 0 + x;
  }
  return '0x' + x;
}

// https://stackoverflow.com/a/42203200
export function toPaddedHexString(num, len) {
    const str = num.toString(16);
    return "0".repeat(len - str.length) + str;
}

export enum SolidityType {
  // For now, we only allow the types that we'd use.
  bool = 'bool',
  uint8 = 'uint8',
  uint256 = 'uint256',
  address = 'address',
  bytes = 'bytes',
  bytes32 = 'bytes32',
}

export class SolidityParameter {
  type: SolidityType;
  value: string;

  constructor({ type, value }) {
    this.type = type;
    this.value = value;
  }
}

// TODO: Figure out how to export this type from index.ts
type SignableData = string | SolidityParameter | SolidityParameter[];

export function sign(data: SignableData, privateKey)
  : {v: string, r: string, s: string} {
  const localWeb3 = new Web3('');
  const account:any = localWeb3.eth.accounts.privateKeyToAccount(privateKey);
  let hash;
  if (typeof data === 'string' || data instanceof SolidityParameter) {
    hash = soliditySha3(data);
  } else {
    hash = soliditySha3(...data);
  }
  return localWeb3.eth.accounts.sign(hash, account.privateKey, true) as Signature;
}

export function recover(data: SignableData,  v: string, r: string, s: string): string {
  const web3 = new Web3('');
  let hash;
  if (typeof data === 'string' || data instanceof SolidityParameter) {
    hash = soliditySha3(data);
  } else {
    hash = soliditySha3(...data);
  }
  return web3.eth.accounts.recover(hash, v, r, s);
}

export function decodeSignature(signature: string) : { v, r, s } {
  const r = '0x' + signature.slice(2, 66);
  const s = '0x' + signature.slice(66, 130);
  const v = '0x' + signature.slice(130, 132);

  return { v, r, s };
}
