import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        appState: "writable",
        calculateFootprint: "writable",
        lucide: "readonly",
        Chart: "readonly",
        confetti: "readonly",
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn"
    }
  }
];
