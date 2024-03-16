/* istanbul ignore file */

import { error } from '@anmiles/logger';
import { run } from './lib/app';

run(process.argv[2], process.argv[3]).catch((ex) => {
	error(ex);
	process.exit(1);
});
