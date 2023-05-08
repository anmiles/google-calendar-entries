import { getProfiles } from '@anmiles/google-api-wrapper';
import { log } from '@anmiles/logger';
import { getEventsFull } from './events';

export { run };
export default { run };

async function run(profile?: string, calendarName?: string): Promise<void> {
	const profiles = getProfiles().filter((p) => !profile || p === profile);

	if (profiles.length === 0) {
		throw 'Please `npm run create` at least one profile';
	}

	for (const profile of profiles) {
		const events = await getEventsFull(profile, calendarName);
		log(JSON.stringify(events, null, '    '));
	}
}

