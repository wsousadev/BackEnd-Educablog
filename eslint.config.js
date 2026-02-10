import js from "@eslint/js";
import globals from "globals";
import css from "@eslint/css";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
		files: ["**/*.{js,mjs,cjs}"],
		ignores: ['./database/**/*.js'],
		plugins: { js },
		extends: ["js/recommended"],
		languageOptions: { globals: {...globals.browser, ...globals.node} }
	},
  {
		files: ["**/*.css"],
		ignores: ['./database/**/*.js'],
		plugins: { css },
		language: "css/css",
		extends: ["css/recommended"]
	},
]);
