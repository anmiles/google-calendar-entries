import fs from 'fs';
import logger from '@anmiles/logger';
import { calendar } from 'googleapis/build/src/apis/calendar';
import original from '../events';
import '@anmiles/jest-extensions';

const mockDate = new Date(2012, 11, 26, 7, 40, 0);
jest.useFakeTimers();

jest.mock<Partial<typeof fs>>('fs', () => ({
	writeFileSync : jest.fn(),
}));

jest.mock<{ calendar: typeof calendar }>('googleapis/build/src/apis/calendar', () => ({
	calendar : jest.fn().mockImplementation(() => apis),
}));

jest.mock('@anmiles/google-api-wrapper', () => ({
	getAPI : jest.fn().mockImplementation((...args) => getAPI(...args)),
}));

jest.mock<Partial<typeof logger>>('@anmiles/logger', () => ({
	log : jest.fn(),
}));

const profile = 'username';

const apis = {
	calendarList : 'calendarList',
	events       : 'events',
} as const;

const getItems = jest.fn().mockImplementation(async (selectAPI: (api: typeof apis) => typeof apis[keyof typeof apis]) => {
	switch (selectAPI(apis)) {
		case apis.calendarList: return calendars;
		case apis.events: return events;
	}
});

const getAPI = jest.fn().mockImplementation(async () => ({
	getItems,
}));

let calendars: Array<{ id?: string | null | undefined, summary?: string, description?: string, hidden?: boolean }>;
let events: Array<{ id?: string | null | undefined, summary?: string, organizer?: { email?: string, displayName?: string, self?: boolean} }>;

const toISOStringOriginal = Date.prototype.toISOString;
let endOfYear: string;

beforeAll(() => {
	Date.prototype.toISOString = function() {
		return this.toLocaleString('ru');
	};
});

beforeEach(() => {
	jest.setSystemTime(mockDate);

	endOfYear = new Date(new Date().getFullYear() + 1, 0, 1).toISOString();

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

afterEach(() => {
	jest.setSystemTime(new Date());
});

afterAll(() => {
	Date.prototype.toISOString = toISOStringOriginal;
});

describe('src/lib/events', () => {
	describe('getEvents', () => {
		it('should get all calendars without showing progress', async () => {
			await original.getEvents(profile);

			expect(getItems).toHaveBeenCalledWith(expect.anything(), {}, { hideProgress : true });
			expect(getItems.mock.calls[0][0](apis)).toEqual(apis.calendarList);
		});

		it('should throw if there are no available calendars', async () => {
			calendars = [];

			await expect(() => original.getEvents(profile)).rejects.toEqual(`There are no available calendars for profile '${profile}'`);
		});

		it('should throw if there are no matching calendars', async () => {
			await expect(() => original.getEvents(profile, 'random calendar name')).rejects.toEqual(`Unknown calendar 'random calendar name' for profile '${profile}'`);
		});

		it('should not throw if there are matching calendars', async () => {
			const result = await original.getEvents(profile, calendars[1]!.summary);
			expect(result).toBeDefined();
		});

		it('should get events for all calendars without showing progress', async () => {
			await original.getEvents(profile);

			expect(getItems).toHaveBeenCalledTimes(5);
			expect(getItems).toHaveBeenCalledWith(expect.toBeFunction([ apis ], apis.calendarList), { }, { hideProgress : true });
			expect(getItems).toHaveBeenCalledWith(expect.toBeFunction([ apis ], apis.events), { calendarId : calendars[0]!.id, singleEvents : true, timeMax : endOfYear }, { hideProgress : true });
			expect(getItems).toHaveBeenCalledWith(expect.toBeFunction([ apis ], apis.events), { calendarId : calendars[1]!.id, singleEvents : true, timeMax : endOfYear }, { hideProgress : true });
			expect(getItems).toHaveBeenCalledWith(expect.toBeFunction([ apis ], apis.events), { calendarId : undefined, singleEvents : true, timeMax : endOfYear }, { hideProgress : true });
			expect(getItems).toHaveBeenCalledWith(expect.toBeFunction([ apis ], apis.events), { calendarId : calendars[3]!.id, singleEvents : true, timeMax : endOfYear }, { hideProgress : true });
		});

		it('should get events only for selected calendar without showing progress', async () => {
			await original.getEvents(profile, calendars[1]!.summary);

			expect(getItems).toHaveBeenCalledTimes(2);
			expect(getItems).toHaveBeenCalledWith(expect.toBeFunction([ apis ], apis.calendarList), { }, { hideProgress : true });
			expect(getItems).toHaveBeenCalledWith(expect.toBeFunction([ apis ], apis.events), { calendarId : calendars[1]!.id, singleEvents : true, timeMax : endOfYear }, { hideProgress : true });
		});

		it('should return events for all calendars', async () => {
			const events = await original.getEvents(profile);

			expect(events).toHaveLength(16);
			expect(events).toMatchSnapshot();
		});

		it('should return events only for selected calendar', async () => {
			const events = await original.getEvents(profile, calendars[1]!.summary);

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
			const result = await original.getEventsFull(profile, calendars[1]!.summary);

			expect(result).toHaveLength(4);
			expect(result).toMatchSnapshot();
		});
	});
});
