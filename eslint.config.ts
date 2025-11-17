import prettier from 'eslint-plugin-prettier/recommended';
import { globalIgnores } from 'eslint/config';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
	tseslint.configs.strictTypeChecked,
	tseslint.configs.stylisticTypeChecked,
	prettier,
	globalIgnores([
		'**/node_modules/**',
		'**/dist/**',
		'**/.vitepress/cache/**',
		'**/docs/.vitepress/**',
	]),
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			'@typescript-eslint/array-type': 'off',

			'@typescript-eslint/consistent-type-definitions': 'off',

			'@typescript-eslint/consistent-type-imports': [
				'warn',
				{
					prefer: 'type-imports',
					fixStyle: 'inline-type-imports',
				},
			],

			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					varsIgnorePattern: '^_',
					argsIgnorePattern: '^_',
				},
			],
		},
	}
);
