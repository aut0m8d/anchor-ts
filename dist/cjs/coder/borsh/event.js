import { Buffer } from "node:buffer";
import * as base64 from "../../utils/bytes/base64.js";
import { IdlCoder } from "./idl.js";
export class BorshEventCoder {
    constructor(idl) {
        var _a;
        if (!idl.events) {
            this.layouts = new Map();
            return;
        }
        const types = idl.types;
        if (!types) {
            throw new Error("Events require `idl.types`");
        }
        const layouts = idl.events.map((ev) => {
            const typeDef = types.find((ty) => ty.name === ev.name);
            if (!typeDef) {
                throw new Error(`Event not found: ${ev.name}`);
            }
            return [ev.name, IdlCoder.typeDefLayout({ typeDef, types })];
        });
        this.layouts = new Map(layouts);
        this.discriminators = new Map(((_a = idl.events) !== null && _a !== void 0 ? _a : []).map((ev) => [
            base64.encode(Buffer.from(ev.discriminator)),
            ev.name,
        ]));
    }
    decode(log) {
        let logArr;
        // This will throw if log length is not a multiple of 4.
        try {
            logArr = base64.decode(log);
        }
        catch (e) {
            return null;
        }
        const disc = base64.encode(logArr.slice(0, 8));
        // Only deserialize if the discriminator implies a proper event.
        const eventName = this.discriminators.get(disc);
        if (!eventName) {
            return null;
        }
        const layout = this.layouts.get(eventName);
        if (!layout) {
            throw new Error(`Unknown event: ${eventName}`);
        }
        const data = layout.decode(logArr.slice(8));
        return { data, name: eventName };
    }
}
//# sourceMappingURL=event.js.map