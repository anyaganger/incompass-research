import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // These produce false positives for standard async data-fetching in Next.js
      // (useEffect → fetch → setState is idiomatic and correct).
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      // Unused vars are warnings only, not build-blockers
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
]);

export default eslintConfig;
