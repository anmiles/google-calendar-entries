import { filterProfiles } from '@anmiles/google-api-wrapper';
import { log } from '@anmiles/logger';

import { run } from '../app';
import { getEventsFull } from '../events';

jest.mock('@anmiles/google-api-wrapper');
jest.mock('@anmiles/logger');
jest.mock('../events');

const profile1 = 'username1';
const profile2 = 'username2';

const calendars: Array<{ id?: string | null | undefined; summary?: string; description?: string; hidden?: boolean }> = [
	{ id: 'id1', summary: 'calendar 1', description: 'calendar 1 description', hidden: false },
	{ id: 'id2', summary: 'calendar 2', description: 'calendar 2 description', hidden: undefined },
	{ id: null, summary: 'calendar 3', description: undefined, hidden: true },
	{ id: 'id4', summary: 'calendar 4', description: undefined, hidden: undefined },
];

const eventsList: Array<{
	id?: string | null | undefined;
	summary?: string;
	organizer?: {
		email?: string;
		displayName?: string;
		self?: boolean;
	};
	calendar: typeof calendars[number] | undefined;
}> = [
	{ id: 'id1', summary: 'event 1', organizer: { email: 'id1', displayName: 'calendar 1' }, calendar: calendars[0] },
	{ id: null, summary: 'event 2', organizer: { email: 'id2', displayName: 'calendar 2' }, calendar: calendars[1] },
	{ id: 'id3', summary: 'event 3', organizer: { email: undefined, displayName: undefined }, calendar: undefined },
	{ id: 'id4', summary: 'event 4', organizer: { email: 'id4', self: true }, calendar: calendars[3] },
];

jest.mocked(filterProfiles).mockReturnValue([ profile1, profile2 ]);
jest.mocked(getEventsFull).mockResolvedValue(eventsList);

describe('src/lib/app', () => {
	describe('run', () => {
		it('should filter profiles', async () => {
			await run(profile1);

			expect(filterProfiles).toHaveBeenCalledWith(profile1);
		});

		it('should get events JSON for all filtered profiles', async () => {
			await run();

			expect(getEventsFull).toHaveBeenCalledWith(profile1, undefined);
			expect(getEventsFull).toHaveBeenCalledWith(profile2, undefined);
		});

		it('should get events JSON for all filtered profiles and selected calendar', async () => {
			await run(undefined, 'calendar name');

			expect(getEventsFull).toHaveBeenCalledWith(profile1, 'calendar name');
			expect(getEventsFull).toHaveBeenCalledWith(profile2, 'calendar name');
		});

		it('should output events JSON for all filtered profiles', async () => {
			await run();

			expect(log).toHaveBeenCalledTimes(2);
			expect(log).toHaveBeenCalledWith(JSON.stringify(eventsList, null, '    '));
		});
	});
});
