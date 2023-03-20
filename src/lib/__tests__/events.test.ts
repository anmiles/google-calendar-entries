import fs from 'fs';
import { getCalendarAPI, getItems } from '@anmiles/google-api-wrapper';
import logger from '../logger';

import original from '../events';

jest.mock<Partial<typeof fs>>('fs', () => ({
	writeFileSync : jest.fn(),
}));

jest.mock('@anmiles/google-api-wrapper', () => ({
	getCalendarAPI : jest.fn().mockImplementation(async () => api),
	getItems       : jest.fn().mockImplementation(async (itemsAPI: string) => {
		switch (itemsAPI) {
			case api.calendarList: return calendars;
			case api.events: return events;
		}
	}),
}));

jest.mock<Partial<typeof logger>>('../logger', () => ({
	log   : jest.fn(),
	error : jest.fn().mockImplementation((error) => {
		throw error;
	}) as jest.Mock<never, any>,
}));

const profile = 'username';

const api = {
	calendarList : 'calendarList',
	events       : 'events',
};

let calendars: Array<{ id?: string | null | undefined, summary?: string, description?: string, hidden?: boolean }>;
let events: Array<{ id?: string | null | undefined, summary?: string, organizer?: { email?: string, displayName?: string, self?: boolean} }>;

beforeEach(() => {
	calendars = [
		{ id : 'id1', summary : 'calendar 1', description : 'calendar 1 description', hidden : false },
		{ id : 'id2', summary : 'calendar 2', description : 'calendar 2 description', hidden : undefined },
		{ id : null, summary : 'calendar 3', description : undefined, hidden : true },
		{ id : 'id4', summary : 'calendar 4', description : undefined, hidden : undefined },
	];

	events = [
		{ id : 'id1', summary : 'event 1', organizer : { email : 'id1', displayName : 'calendar 1' } },
		{ id : null, summary : 'event 2', organizer : { email : 'id2', self : true } },
		{ id : 'id3', summary : 'event 3', organizer : { email : undefined, displayName : undefined } },
		{ id : 'id4', summary : 'event 4', organizer : undefined },
	];
});

describe('src/lib/events', () => {
	describe('getEvents', () => {
		const timeMax = `${new Date().getFullYear()}-12-31T21:00:00.000Z`;

		it('should get calendar API', async () => {
			await original.getEvents(profile);

			expect(getCalendarAPI).toBeCalledWith(profile);
		});

		it('should get all calendars', async () => {
			await original.getEvents(profile);

			expect(getItems).toBeCalledWith(api.calendarList, {}, { hideProgress : true });
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

		it('should get events for all calendars without showing progress', async () => {
			await original.getEvents(profile);

			expect(getItems).toBeCalledTimes(5);
			expect(getItems).toBeCalledWith(api.calendarList, { }, { hideProgress : true });
			expect(getItems).toBeCalledWith(api.events, { calendarId : calendars[0].id, singleEvents : true, timeMax }, { hideProgress : true });
			expect(getItems).toBeCalledWith(api.events, { calendarId : calendars[1].id, singleEvents : true, timeMax }, { hideProgress : true });
			expect(getItems).toBeCalledWith(api.events, { calendarId : undefined, singleEvents : true, timeMax }, { hideProgress : true });
			expect(getItems).toBeCalledWith(api.events, { calendarId : calendars[3].id, singleEvents : true, timeMax }, { hideProgress : true });
		});

		it('should get events only for selected calendar without showing progress', async () => {
			await original.getEvents(profile, calendars[1].summary);

			expect(getItems).toBeCalledTimes(2);
			expect(getItems).toBeCalledWith(api.calendarList, { }, { hideProgress : true });
			expect(getItems).toBeCalledWith(api.events, { calendarId : calendars[1].id, singleEvents : true, timeMax }, { hideProgress : true });
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
