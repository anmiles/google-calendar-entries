import { filterProfiles } from '@anmiles/google-api-wrapper';
import { log } from '@anmiles/logger';
import { getEventsFull } from './events';

export { run };
export default { run };

async function run(profile?: string, calendarName?: string): Promise<void> {
	for (const foundProfile of filterProfiles(profile)) {
		const events = await getEventsFull(foundProfile, calendarName);
		log(JSON.stringify(events, null, '    '));
	}
}

