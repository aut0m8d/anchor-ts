import { Buffer } from "node:buffer";
import { PublicKey } from "@solana/web3.js";
import { translateAddress } from "../program/common.js";
import { sha256 as sha256Sync } from "js-sha256";
// Sync version of web3.PublicKey.createWithSeed.
export function createWithSeedSync(fromPublicKey, seed, programId) {
    const buffer = Buffer.concat([
        fromPublicKey.toBuffer(),
        Buffer.from(seed),
        programId.toBuffer(),
    ]);
    const hash = sha256Sync.digest(buffer);
    return new PublicKey(Buffer.from(hash));
}
export function associated(programId, ...args) {
    let seeds = [Buffer.from([97, 110, 99, 104, 111, 114])]; // b"anchor".
    args.forEach((arg) => {
        seeds.push(arg instanceof Buffer ? arg : translateAddress(arg).toBuffer());
    });
    const [assoc] = PublicKey.findProgramAddressSync(seeds, translateAddress(programId));
    return assoc;
}
//# sourceMappingURL=pubkey.js.map