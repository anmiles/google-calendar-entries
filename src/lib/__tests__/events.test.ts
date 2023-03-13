import fs from 'fs';
import { calendar } from '@anmiles/google-api-wrapper';
import logger from '../logger';

import original from '../events';

jest.mock<Partial<typeof fs>>('fs', () => ({
	writeFileSync : jest.fn(),
}));

jest.mock<{ calendar: Partial<typeof calendar> }>('@anmiles/google-api-wrapper', () => ({
	calendar : {
		getEvents    : jest.fn().mockImplementation(async () => eventsList),
		getCalendars : jest.fn().mockImplementation(async () => calendars),
	},
}));

jest.mock<Partial<typeof logger>>('../logger', () => ({
	log   : jest.fn(),
	error : jest.fn().mockImplementation((error) => {
		throw error;
	}) as jest.Mock<never, any>,
}));

const profile = 'username';

let calendars: Array<{ id?: string | null | undefined, summary?: string, description?: string, hidden?: boolean }>;
let eventsList: Array<{ id?: string | null | undefined, summary?: string, organizer?: { email?: string, displayName?: string, self?: boolean} }>;

beforeEach(() => {
	calendars = [
		{ id : 'id1', summary : 'calendar 1', description : 'calendar 1 description', hidden : false },
		{ id : 'id2', summary : 'calendar 2', description : 'calendar 2 description', hidden : undefined },
		{ id : null, summary : 'calendar 3', description : undefined, hidden : true },
		{ id : 'id4', summary : 'calendar 4', description : undefined, hidden : undefined },
	];

	eventsList = [
		{ id : 'id1', summary : 'event 1', organizer : { email : 'id1', displayName : 'calendar 1' } },
		{ id : null, summary : 'event 2', organizer : { email : 'id2', self : true } },
		{ id : 'id3', summary : 'event 3', organizer : { email : undefined, displayName : undefined } },
		{ id : 'id4', summary : 'event 4', organizer : undefined },
	];
});

describe('src/lib/events', () => {
	describe('getEvents', () => {
		it('should get all calendars', async () => {
			await original.getEvents(profile);

			expect(calendar.getCalendars).toBeCalledWith(profile, {});
		});

		it('should throw if there are no available calendars', async () => {
			calendars = [];

			await expect(() => original.getEvents(profile)).rejects.toEqual(`There are no available calendars for profile '${profile}'`);
		});

		it('should throw if there are no matching calendars', async () => {
			await expect(() => original.getEvents(profile, 'random calendar name')).rejects.toEqual(`Unknown calendar 'random calendar name' for profile '${profile}'`);
		});

		it('should not throw if there are matching calendars', async () => {
			const result = await original.getEvents(profile, calendars[1].summary);
			expect(result).toBeDefined();
		});

		it('should get events for all calendars', async () => {
			await original.getEvents(profile);

			expect(calendar.getEvents).toBeCalledTimes(4);
			expect(calendar.getEvents).toBeCalledWith(profile, { calendarId : calendars[0].id });
			expect(calendar.getEvents).toBeCalledWith(profile, { calendarId : calendars[1].id });
			expect(calendar.getEvents).toBeCalledWith(profile, { calendarId : undefined });
			expect(calendar.getEvents).toBeCalledWith(profile, { calendarId : calendars[3].id });
		});

		it('should get events only for selected calendar', async () => {
			await original.getEvents(profile, calendars[1].summary);

			expect(calendar.getEvents).toBeCalledTimes(1);
			expect(calendar.getEvents).toBeCalledWith(profile, { calendarId : calendars[1].id });
		});

		it('should return events for all calendars', async () => {
			const events = await original.getEvents(profile);

			expect(events).toHaveLength(16);
			expect(events).toMatchSnapshot();
		});

		it('should return events only for selected calendar', async () => {
			const events = await original.getEvents(profile, calendars[1].summary);

			expect(events).toHaveLength(4);
			expect(events).toMatchSnapshot();
		});
	});

	describe('getEventsFull', () => {
		it('should return events with calendar data for all calendars', async () => {
			const events = await original.getEventsFull(profile);

			expect(events).toHaveLength(16);
			expect(events).toMatchSnapshot();
		});

		it('should return events with calendar data only for selected calendar', async () => {
			const result = await original.getEventsFull(profile, calendars[1].summary);

			expect(result).toHaveLength(4);
			expect(result).toMatchSnapshot();
		});
	});
});
