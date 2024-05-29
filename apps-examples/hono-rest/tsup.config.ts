import { defineConfig } from "tsup";

export default defineConfig({
  format: ["esm"],
  outDir: "out",
  dts: false,
  splitting: false,
  clean: true,
  target: 'es2020',
  platform: 'node',
  cjsInterop: false,
});