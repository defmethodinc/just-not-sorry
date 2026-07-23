import { defineConfig, globalIgnores } from "eslint/config";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import react from "eslint-plugin-react";
import globals from "globals";
import babelParser from "@babel/eslint-parser";
import jest from "eslint-plugin-jest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores([
    "**/node_modules/",
    "**/build/",
    "**/dist/",
    "**/gulpfile.js",
    "**/webpack.config.js",
    "**/.jest.puppeteer.config.js",
    "eslint.config.mjs",
  ]),

  {
    files: ["src/**/*.js", "spec/**/*.js", "e2e/**/*.js"],

    extends: fixupConfigRules(
      compat.extends(
        "eslint:recommended",
        "prettier",
        "plugin:react/recommended",
      ),
    ),

    plugins: {
      react: fixupPluginRules(react),
    },

    languageOptions: {
      parser: babelParser,
      ecmaVersion: "latest",
      sourceType: "module",

      parserOptions: {
        requireConfigFile: false,
        ecmaFeatures: {
          jsx: true,
        },
      },

      globals: {
        ...globals.browser,
        chrome: "readonly",
        analytics: "readonly",
        global: "readonly",
        page: "readonly",
        browser: "readonly",
        context: "readonly",
        jestPuppeteer: "readonly",
      },
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      "react/prop-types": "off",

      "react/no-unknown-property": [
        "error",
        {
          ignore: ["class"],
        },
      ],
    },
  },

  {
    files: [
    "spec/**/*.test.js",
    "spec/setupTests.js",
    "e2e/**/*.test.js",
    "e2e/global-setup.js",
    "e2e/setup-puppeteer.js",
    "e2e/global-teardown.js",
    ],

    extends: compat.extends(
      "eslint:recommended",
      "plugin:jest/recommended",
      "prettier",
    ),

    plugins: {
      jest,
    },

    rules: {
      "jest/expect-expect": [
        "warn",
        {
          assertFunctionNames: ["expect", "assertWarnings"],
        }
      ]
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },
]);
