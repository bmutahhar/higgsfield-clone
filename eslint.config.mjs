import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier/flat";
import importPlugin from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
    ".agent-logs/**",
  ]),

  // Next.js: core web vitals, React, react-hooks, jsx-a11y, import resolution.
  ...nextVitals,
  ...nextTs,

  // Type-aware linting. Only for files the TS project actually covers.
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mts"],
    extends: [
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Allow `void promise` and args-only unused vars prefixed with _.
      "@typescript-eslint/no-unused-vars": "off", // handled by unused-imports
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
    },
  },

  // Config files and any plain JS are outside the TS project — no type-aware rules.
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    extends: [tseslint.configs.disableTypeChecked],
  },

  // Import hygiene and ordering.
  {
    plugins: {
      import: importPlugin,
      "unused-imports": unusedImports,
    },
    rules: {
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "type",
          ],
          pathGroups: [
            { pattern: "react", group: "external", position: "before" },
            { pattern: "next/**", group: "external", position: "before" },
            { pattern: "@/**", group: "internal" },
          ],
          pathGroupsExcludedImportTypes: ["react", "next/**"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/no-duplicates": "error",
      "import/first": "error",
      "import/newline-after-import": "error",
    },
  },

  // Must stay last: turns off every rule that fights Prettier.
  prettierConfig,
]);

export default eslintConfig;
