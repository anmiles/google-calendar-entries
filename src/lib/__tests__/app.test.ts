import googleApiWrapper from '@anmiles/google-api-wrapper';
import logger from '@anmiles/logger';
import events from '../events';

import app from '../app';

jest.mock<Partial<typeof logger>>('@anmiles/logger', () => ({
	log : jest.fn(),
}));

jest.mock<Partial<typeof googleApiWrapper>>('@anmiles/google-api-wrapper', () => ({
	filterProfiles : jest.fn().mockImplementation(() => [ profile1, profile2 ]),
}));

jest.mock<Partial<typeof events>>('../events', () => ({
	getEventsFull : jest.fn().mockImplementation(async () => eventsList),
}));

const profile1 = 'username1';
const profile2 = 'username2';

const calendars: Array<{ id?: string | null | undefined, summary?: string, description?: string, hidden?: boolean }> = [
	{ id : 'id1', summary : 'calendar 1', description : 'calendar 1 description', hidden : false },
	{ id : 'id2', summary : 'calendar 2', description : 'calendar 2 description', hidden : undefined },
	{ id : null, summary : 'calendar 3', description : undefined, hidden : true },
	{ id : 'id4', summary : 'calendar 4', description : undefined, hidden : undefined },
];

const eventsList: Array<{ id?: string | null | undefined, summary?: string, organizer?: { email?: string, displayName?: string, self?: boolean}, calendar?: typeof calendars[number] }> = [
	{ id : 'id1', summary : 'event 1', organizer : { email : 'id1', displayName : 'calendar 1' }, calendar : calendars[0] },
	{ id : null, summary : 'event 2', organizer : { email : 'id2', displayName : 'calendar 2' }, calendar : calendars[1] },
	{ id : 'id3', summary : 'event 3', organizer : { email : undefined, displayName : undefined }, calendar : undefined },
	{ id : 'id4', summary : 'event 4', organizer : { email : 'id4', self : true }, calendar : calendars[3] },
];

describe('src/lib/app', () => {
	describe('run', () => {
		it('should filter profiles', async () => {
			await app.run(profile1);

			expect(googleApiWrapper.filterProfiles).toHaveBeenCalledWith(profile1);
		});

		it('should get events JSON for all filtered profiles', async () => {
			await app.run();

			expect(events.getEventsFull).toHaveBeenCalledWith(profile1, undefined);
			expect(events.getEventsFull).toHaveBeenCalledWith(profile2, undefined);
		});

		it('should get events JSON for all filtered profiles and selected calendar', async () => {
			await app.run(undefined, 'calendar name');

			expect(events.getEventsFull).toHaveBeenCalledWith(profile1, 'calendar name');
			expect(events.getEventsFull).toHaveBeenCalledWith(profile2, 'calendar name');
		});

		it('should output events JSON for all filtered profiles', async () => {
			await app.run();

			expect(logger.log).toHaveBeenCalledTimes(2);
			expect(logger.log).toHaveBeenCalledWith(JSON.stringify(eventsList, null, '    '));
		});
	});
});
