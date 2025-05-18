import { configs } from '@anmiles/eslint-config';
import type { Linter } from 'eslint';

export default [
	...configs.base,
	...configs.ts,
	...configs.jest,

	{
		ignores: [
			'coverage/*',
			'dist/*',
			'input/*',
			'secrets/*',
		],
	},
] as Linter.Config[];
