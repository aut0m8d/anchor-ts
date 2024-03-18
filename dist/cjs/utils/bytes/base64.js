"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decode = exports.encode = void 0;
const node_buffer_1 = require("node:buffer");
function encode(data) {
    return data.toString("base64");
}
exports.encode = encode;
function decode(data) {
    return node_buffer_1.Buffer.from(data, "base64");
}
exports.decode = decode;
//# sourceMappingURL=base64.js.map