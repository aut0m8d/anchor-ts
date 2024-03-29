import bs58 from "bs58";
import { Buffer } from "node:buffer";

export function encode(data: Buffer | number[] | Uint8Array) {
  return bs58.encode(data);
}

export function decode(data: string) {
  return bs58.decode(data);
}
