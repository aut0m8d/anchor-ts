import { Buffer } from "node:buffer";
import * as base64 from "base64-js";
import { Layout } from "buffer-layout";
import { sha256 } from "js-sha256";
import { Idl, IdlEvent, IdlTypeDef } from "../../idl.js";
import { Event, EventData } from "../../program/event.js";
import { IdlCoder } from "./idl.js";
import { EventCoder } from "../index.js";

export class BorshEventCoder implements EventCoder {
  /**
   * Maps account type identifier to a layout.
   */
  private layouts: Map<string, Layout>;

  /**
   * Maps base64 encoded event discriminator to event name.
   */
  private discriminators: Map<string, string>;

  public constructor(idl: Idl) {
    if (idl.events === undefined) {
      this.layouts = new Map();
      return;
    }
    const layouts: [string, Layout<any>][] = idl.events.map((event) => {
      let eventTypeDef: IdlTypeDef = {
        name: event.name,
        type: {
          kind: "struct",
          fields: event.fields.map((f) => {
            return { name: f.name, type: f.type };
          }),
        },
      };
      return [event.name, IdlCoder.typeDefLayout(eventTypeDef, idl.types)];
    });
    this.layouts = new Map(layouts);

    this.discriminators = new Map<string, string>(
      idl.events === undefined
        ? []
        : idl.events.map((e) => [
            base64.fromByteArray(eventDiscriminator(e.name)),
            e.name,
          ])
    );
  }

  public decode<E extends IdlEvent = IdlEvent, T = Record<string, never>>(
    log: string
  ): Event<E, T> | null {
    let logArr: Buffer;
    // This will throw if log length is not a multiple of 4.
    try {
      logArr = Buffer.from(base64.toByteArray(log));
    } catch (e) {
      return null;
    }
    const disc = base64.fromByteArray(logArr.slice(0, 8));

    // Only deserialize if the discriminator implies a proper event.
    const eventName = this.discriminators.get(disc);
    if (eventName === undefined) {
      return null;
    }

    const layout = this.layouts.get(eventName);
    if (!layout) {
      throw new Error(`Unknown event: ${eventName}`);
    }
    const data = layout.decode(logArr.slice(8)) as EventData<
      E["fields"][number],
      T
    >;
    return { data, name: eventName };
  }
}

export function eventDiscriminator(name: string): Buffer {
  return Buffer.from(sha256.digest(`event:${name}`)).slice(0, 8);
}
