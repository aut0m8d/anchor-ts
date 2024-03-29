import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import replace from "@rollup/plugin-replace";

const env = process.env.NODE_ENV;

export default {
  input: "src/index.ts",
  plugins: [
    nodeResolve({
      browser: true,
      extensions: [".js", ".ts"],
      dedupe: ["bn.js", "node:buffer"],
      preferBuiltins: false,
    }),
    typescript({
      tsconfig: "./tsconfig.base.json",
      moduleResolution: "node",
      outDir: "types",
      target: "es2019",
      outputToFilesystem: false,
    }),
    replace({
      preventAssignment: true,
      values: {
        "process.env.NODE_ENV": JSON.stringify(env),
        "process.env.ANCHOR_BROWSER": JSON.stringify(true),
      },
    }),
  ],
  external: [
    "@coral-xyz/borsh",
    "@solana/web3.js",
    "bn.js",
    "bs58",
    "node:buffer",
    "camelcase",
    "eventemitter3",
    "@noble/hashes/sha256",
    "pako",
    "toml",
  ],
  output: {
    file: "dist/esm/index.js",
    format: "es",
    sourcemap: true,
  },
};
