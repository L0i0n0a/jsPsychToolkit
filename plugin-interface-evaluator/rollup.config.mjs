import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import { defineConfig } from "rollup";
import esbuild from "rollup-plugin-esbuild";
import externals from "rollup-plugin-node-externals";
import postcss from "rollup-plugin-postcss";
import tailwindcss from "@tailwindcss/postcss";

const input = "src/index.tsx";
const destination = "dist/index";

const esbuildOptions = {
  loaders: { ".json": "json" },
  jsx: "automatic",
  jsxImportSource: "react",
};

// Tailwind wird als PostCSS-Plugin direkt übergeben — so findet rollup-plugin-postcss es sicher
// inject: false — CSS wird als String-Export zurückgegeben statt global in document.head injiziert,
// damit index.tsx es selbst in den Shadow Root des Plugins einfügen kann (siehe trial()).
const makePostcss = () => postcss({ inject: false, extract: false, plugins: [tailwindcss()] });

export default defineConfig([
  // ESM + CJS module builds (used when imported via npm in a bundled experiment)
  {
    input,
    plugins: [
      externals(), // marks peerDependencies (react, react-dom, jspsych) as external automatically
      esbuild({ ...esbuildOptions, target: "node18" }),
      commonjs({ extensions: [".js", ".json"] }),
      makePostcss(),
    ],
    output: [
      { file: `${destination}.js`, format: "esm", sourcemap: true, exports: "auto" },
      { file: `${destination}.cjs`, format: "cjs", sourcemap: true, exports: "auto" },
    ],
  },

  // Minified browser bundle (loaded via <script> tag)
  // React is bundled inline — React 19 no longer ships UMD builds so it cannot be loaded from CDN as a global.
  // Only jspsych stays external (consumers always have it on the page already).
  {
    input,
    external: ["jspsych"],
    plugins: [
      // React uses process.env.NODE_ENV internally — replace it with "production" for the browser
      replace({ "process.env.NODE_ENV": JSON.stringify("production"), preventAssignment: true }),
      resolve({ preferBuiltins: false }),
      esbuild({ ...esbuildOptions, target: "es2015", minify: true }),
      commonjs({ extensions: [".js", ".json"] }),
      makePostcss(),
    ],
    output: {
      file: `${destination}.browser.min.js`,
      format: "iife",
      name: "jsPsychInterfaceEvaluator",
      sourcemap: true,
      exports: "auto",
      globals: {
        jspsych: "jsPsychModule",
      },
      // Merge .default onto the global so researchers can write
      // jsPsychInterfaceEvaluator directly instead of jsPsychInterfaceEvaluator.default.
      // Named exports (e.g. AnnotateWrapper) remain accessible as properties.
      footer: "jsPsychInterfaceEvaluator = Object.assign(jsPsychInterfaceEvaluator.default, jsPsychInterfaceEvaluator);",
    },
  },
]);
