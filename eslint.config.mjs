import eslint from "@eslint/js"
import globals from "globals"
import tseslint from "typescript-eslint"

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	{
		ignores: [
			"**/node_modules/**",
			"dist/**",
			"webpack.*.js",
			"src/typings/**",
		],
	},
	{
		languageOptions: {
			globals: globals.node,
		},
		rules: {
			"spaced-comment": "error",
			"no-var": "error",
			"no-extra-bind": "error",
			"prefer-arrow-callback": "error",
			"no-empty": ["warn", { allowEmptyCatch: true }],
			"@typescript-eslint/ban-ts-comment": "off",
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					vars: "all",
					args: "none",
					ignoreRestSiblings: true,
					caughtErrors: "none",
				},
			],
			"@typescript-eslint/no-empty-interface": "off",
			"@typescript-eslint/explicit-function-return-type": "off",
			"@typescript-eslint/array-type": "off",
			"@typescript-eslint/no-require-imports": "warn",
			"@typescript-eslint/explicit-module-boundary-types": "off",
		},
	},
)
