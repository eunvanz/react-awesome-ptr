/* global process */

import pkg from "./package.json";
import babel from "rollup-plugin-babel";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import svgr from "@svgr/rollup";
import url from "rollup-plugin-url";

const extensions = [".js", ".jsx", ".ts", ".tsx", ".scss"];

process.env.BABEL_ENV = "production";

export default [
  {
    input: pkg.source,
    output: [
      {
        file: pkg.module,
        sourcemap: true,
        format: "es",
      },
      {
        file: pkg.main,
        sourcemap: true,
        format: "cjs",
        exports: "named",
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve({ extensions }),
      commonjs({
        include: /node_modules/,
      }),
      postcss({
        extract: false,
        sourceMap: true,
        use: ["sass"],
      }),
      babel({ extensions, include: ["src/**/*"], runtimeHelpers: true }),
      url(),
      svgr(),
      terser(),
    ],
    external: ["react", "react-dom"],
  },
];
