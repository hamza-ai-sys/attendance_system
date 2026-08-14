import js from "@eslint/js";
import tseslint from "typescript-eslint";
import { filenameCaseRule } from "./eslint-rules/filename-case.mjs";
import { functionSizeRule } from "./eslint-rules/function-size.mjs";

export default [
  {
    ignores: [
      "**/.next/**",
      "**/.turbo/**",
      "**/coverage/**",
      "**/dist/**",
      "**/node_modules/**",
      "**/next-env.d.ts",
      "**/pnpm-lock.yaml",
      "apps/firmware/.pio/**"
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        projectService: false
      }
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          fixStyle: "inline-type-imports"
        }
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_"
        }
      ]
    }
  },
  {
    files: ["apps/portal/src/**/*.{ts,tsx}"],
    plugins: {
      local: {
        rules: {
          "filename-case": filenameCaseRule,
          "function-size": functionSizeRule
        }
      }
    },
    rules: {
      "local/filename-case": "error"
    }
  },
  {
    files: ["apps/portal/src/**/*.tsx"],
    rules: {
      // UI modules should remain easy to review and split along component boundaries.
      "max-lines": [
        "error",
        {
          max: 250,
          skipBlankLines: true,
          skipComments: true
        }
      ],
      "local/function-size": [
        "error",
        {
          functionMax: 50,
          componentMax: 100
        }
      ]
    }
  }
];
