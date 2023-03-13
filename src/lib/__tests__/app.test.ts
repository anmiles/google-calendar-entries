import googleApiWrapper from '@anmiles/google-api-wrapper';
import logger from '../logger';
import events from '../events';

import app from '../app';

jest.mock<Partial<typeof logger>>('../logger', () => ({
	log   : jest.fn(),
	error : jest.fn().mockImplementation((error) => {
		throw error;
	}) as jest.Mock<never, any>,
}));

jest.mock<Partial<typeof googleApiWrapper>>('@anmiles/google-api-wrapper', () => ({
	getProfiles : jest.fn().mockImplementation(() => existingProfiles),
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

let existingProfiles: string[];

beforeEach(() => {
	existingProfiles = [ profile1, profile2 ];
});

describe('src/lib/app', () => {
	describe('run', () => {
		it('should get profiles', async () => {
			await app.run();

			expect(googleApiWrapper.getProfiles).toBeCalled();
		});

		it('should output error if no profiles', async () => {
			existingProfiles = [];

			const func = () => app.run();

			await expect(func).rejects.toEqual('Please `npm run create` at least one profile');
		});

		it('should get events JSON for all profiles', async () => {
			await app.run();

			expect(events.getEventsFull).toBeCalledWith(profile1, undefined);
			expect(events.getEventsFull).toBeCalledWith(profile2, undefined);
		});

		it('should get events JSON only for specified profile', async () => {
			await app.run(profile1);

			expect(events.getEventsFull).toBeCalledWith(profile1, undefined);
			expect(events.getEventsFull).not.toBeCalledWith(profile2, undefined);
		});

		it('should get events JSON for all profiles and selected calendar', async () => {
			await app.run(undefined, 'calendar name');

			expect(events.getEventsFull).toBeCalledWith(profile1, 'calendar name');
			expect(events.getEventsFull).toBeCalledWith(profile2, 'calendar name');
		});

		it('should get events JSON only for specified profile and selected calendar', async () => {
			await app.run(profile1, 'calendar name');

			expect(events.getEventsFull).toBeCalledWith(profile1, 'calendar name');
			expect(events.getEventsFull).not.toBeCalledWith(profile2, 'calendar name');
		});

		it('should output events JSON for all profiles', async () => {
			await app.run();

			expect(logger.log).toBeCalledTimes(2);
			expect(logger.log).toBeCalledWith(JSON.stringify(eventsList, null, '    '));
		});

		it('should output events JSON only for specified profile', async () => {
			await app.run(profile1);

			expect(logger.log).toBeCalledTimes(1);
			expect(logger.log).toBeCalledWith(JSON.stringify(eventsList, null, '    '));
		});
	});
});
