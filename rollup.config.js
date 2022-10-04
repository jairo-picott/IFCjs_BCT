import resolve from "@rollup/plugin-node-resolve";

export default {
  input: "Main.js",
  output: [
    {
      format: "esm",
      file: "bundle.js",
    },
  ],
  plugins: [resolve()],
};