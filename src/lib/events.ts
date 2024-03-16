import type GoogleApis from 'googleapis';
import { calendar } from 'googleapis/build/src/apis/calendar';
import { getAPI } from '@anmiles/google-api-wrapper';
import _ from 'lodash';

async function getEvents(profile: string, calendarName?: string): Promise<Array<GoogleApis.calendar_v3.Schema$Event>> {
	const { events } = await getCalendarsAndEvents(profile, calendarName);
	return events;
}

async function getEventsFull(profile: string, calendarName?: string): Promise<Array<GoogleApis.calendar_v3.Schema$Event & {
	calendar : GoogleApis.calendar_v3.Schema$CalendarListEntry | undefined;
}>> {
	const { events, calendars } = await getCalendarsAndEvents(profile, calendarName);
	const calendarsDict         = _.keyBy(calendars, 'id');

	return events.map((e) => {
		const calendar = _.get(calendarsDict, e.organizer?.email ?? '', undefined);
		return { ...e, calendar };
	});
}

async function getCalendarsAndEvents(profile: string, calendarName?: string): Promise<{
	events    : Array<GoogleApis.calendar_v3.Schema$Event>;
	calendars : Array<GoogleApis.calendar_v3.Schema$CalendarListEntry>;
}> {
	const calendarAPI = await getAPI((auth) => calendar({ version : 'v3', auth }), profile);
	const calendars   = await calendarAPI.getItems((api) => api.calendarList, {}, { hideProgress : true });

	if (calendars.length === 0) {
		throw new Error(`There are no available calendars for profile '${profile}'`);
	}

	const selectedCalendars = calendars.filter((c) => !calendarName || calendarName === c.summary);

	if (selectedCalendars.length === 0) {
		throw new Error(`Unknown calendar '${calendarName}' for profile '${profile}'`);
	}

	const timeMax = new Date(new Date().getFullYear() + 1, 0, 1).toISOString();

	const allEventsPromises = selectedCalendars.map(async (c) => calendarAPI.getItems(
		(api) => api.events,
		{ calendarId : c.id ?? undefined, singleEvents : true, timeMax },
		{ hideProgress : true },
	));

	const allEvents = await Promise.all(allEventsPromises);
	const events    = _.flatten(allEvents);

	return { calendars, events };
}

export { getEvents, getEventsFull };
export default { getEvents, getEventsFull };
