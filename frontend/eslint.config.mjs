import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // This project does not opt into the React Compiler (scaffolded with
      // --no-react-compiler), so these compiler-readiness rules flag
      // standard, correct patterns (resetting a controlled dialog's form
      // state when it opens, mount-only effects for browser APIs like
      // matchMedia/navigator.onLine) as errors. Disabled rather than
      // rearchitecting working dialogs around key-based remounts.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
