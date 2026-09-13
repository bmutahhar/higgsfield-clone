import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import importPlugin from "eslint-plugin-import";
import prettierRecommended from "eslint-plugin-prettier/recommended";
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
          // Keep react / next/* / other externals in ONE block rather than
          // splitting each pathGroup into its own blank-line-separated group.
          distinctGroup: false,
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/no-duplicates": "error",
      "import/first": "error",
      "import/newline-after-import": "error",

      // import/order sorts the statements; this sorts the named members
      // *inside* the braces. Both are auto-fixable.
      "sort-imports": [
        "error",
        {
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          ignoreCase: true,
          allowSeparatedGroups: true,
        },
      ],
    },
  },

  // Must stay last. Turns off every rule that fights Prettier (via
  // eslint-config-prettier) AND surfaces Prettier's own formatting
  // violations — stray blank lines, spacing, quotes — as fixable ESLint
  // errors, so the editor underlines them instead of silently fixing them.
  prettierRecommended,
]);

export default eslintConfig;
