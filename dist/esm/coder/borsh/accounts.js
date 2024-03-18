import bs58 from "bs58";
import { Buffer } from "node:buffer";
import { IdlCoder } from "./idl.js";
import { DISCRIMINATOR_SIZE } from "./discriminator.js";
/**
 * Encodes and decodes account objects.
 */
export class BorshAccountsCoder {
    constructor(idl) {
        this.idl = idl;
        if (!idl.accounts) {
            this.accountLayouts = new Map();
            return;
        }
        const types = idl.types;
        if (!types) {
            throw new Error("Accounts require `idl.types`");
        }
        const layouts = idl.accounts.map((acc) => {
            const typeDef = types.find((ty) => ty.name === acc.name);
            if (!typeDef) {
                throw new Error(`Account not found: ${acc.name}`);
            }
            return [acc.name, IdlCoder.typeDefLayout({ typeDef, types })];
        });
        this.accountLayouts = new Map(layouts);
    }
    async encode(accountName, account) {
        const buffer = Buffer.alloc(1000); // TODO: use a tighter buffer.
        const layout = this.accountLayouts.get(accountName);
        if (!layout) {
            throw new Error(`Unknown account: ${accountName}`);
        }
        const len = layout.encode(account, buffer);
        const accountData = buffer.slice(0, len);
        const discriminator = this.accountDiscriminator(accountName);
        return Buffer.concat([discriminator, accountData]);
    }
    decode(accountName, data) {
        // Assert the account discriminator is correct.
        const discriminator = this.accountDiscriminator(accountName);
        if (discriminator.compare(data.slice(0, DISCRIMINATOR_SIZE))) {
            throw new Error("Invalid account discriminator");
        }
        return this.decodeUnchecked(accountName, data);
    }
    decodeAny(data) {
        const discriminator = data.slice(0, DISCRIMINATOR_SIZE);
        const accountName = Array.from(this.accountLayouts.keys()).find((key) => this.accountDiscriminator(key).equals(discriminator));
        if (!accountName) {
            throw new Error("Account not found");
        }
        return this.decodeUnchecked(accountName, data);
    }
    decodeUnchecked(accountName, acc) {
        // Chop off the discriminator before decoding.
        const data = acc.subarray(DISCRIMINATOR_SIZE);
        const layout = this.accountLayouts.get(accountName);
        if (!layout) {
            throw new Error(`Unknown account: ${accountName}`);
        }
        return layout.decode(data);
    }
    memcmp(accountName, appendData) {
        const discriminator = this.accountDiscriminator(accountName);
        return {
            offset: 0,
            bytes: bs58.encode(appendData ? Buffer.concat([discriminator, appendData]) : discriminator),
        };
    }
    size(accountName) {
        return (DISCRIMINATOR_SIZE +
            IdlCoder.typeSize({ defined: { name: accountName } }, this.idl));
    }
    /**
     * Calculates and returns a unique 8 byte discriminator prepended to all anchor accounts.
     *
     * @param name The name of the account to calculate the discriminator.
     */
    accountDiscriminator(name) {
        var _a;
        const account = (_a = this.idl.accounts) === null || _a === void 0 ? void 0 : _a.find((acc) => acc.name === name);
        if (!account) {
            throw new Error(`Account not found: ${name}`);
        }
        return Buffer.from(account.discriminator);
    }
}
//# sourceMappingURL=accounts.js.map