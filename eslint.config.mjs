import { defineConfig, globalIgnores } from "eslint/config";
import eslintJs from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";

const eslintConfig = defineConfig([
  // Global ignores
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "node_modules/**",
    "src/generated/**",
    "next-env.d.ts",
  ]),

  // Base JS recommended rules
  eslintJs.configs.recommended,

  // TypeScript support
  ...tseslint.configs.recommended,

  // Next.js plugin rules
  {
    plugins: { "@next/next": nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },

  // React Hooks plugin
  {
    plugins: { "react-hooks": reactHooksPlugin },
    rules: {
      ...reactHooksPlugin.configs.recommended.rules,
    },
  },

  // Global settings
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        React: "readonly",
      },
    },
    rules: {
      // Relax rules that are too noisy for this project
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "no-unused-vars": "off", // handled by @typescript-eslint
    },
  },
]);

export default eslintConfig;
