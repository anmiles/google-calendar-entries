import type GoogleApis from 'googleapis';
import { calendar } from '@anmiles/google-api-wrapper';
import _ from 'lodash';
import { error } from './logger';

export { getEvents, getEventsFull };
export default { getEvents, getEventsFull };

async function getEvents(profile: string, calendarName?: string): Promise<Array<GoogleApis.calendar_v3.Schema$Event>> {
	const { events } = await getCalendarsAndEvents(profile, calendarName);
	return events;
}

async function getEventsFull(profile: string, calendarName?: string): Promise<Array<GoogleApis.calendar_v3.Schema$Event & {
	calendar: GoogleApis.calendar_v3.Schema$CalendarListEntry | undefined
}>> {
	const { events, calendars } = await getCalendarsAndEvents(profile, calendarName);
	const calendarsDict         = _.keyBy(calendars, 'id');

	return events.map((e) => {
		const calendar = _.get(calendarsDict, e.organizer?.email || '', undefined);
		return { ...e, calendar };
	});
}

async function getCalendarsAndEvents(profile: string, calendarName?: string): Promise<{
	events: Array<GoogleApis.calendar_v3.Schema$Event>,
	calendars: Array<GoogleApis.calendar_v3.Schema$CalendarListEntry>
}> {
	const calendars = await calendar.getCalendars(profile, {});

	if (calendars.length === 0) {
		error(`There are no available calendars for profile '${profile}'`);
	}

	const selectedCalendars = calendars.filter((c) => !calendarName || calendarName === c.summary);

	if (selectedCalendars.length === 0) {
		error(`Unknown calendar '${calendarName}' for profile '${profile}'`);
	}

	const endOfYear         = new Date(new Date().getFullYear() + 1, 0, 1).toISOString();
	const allEventsPromises = selectedCalendars.map((c) => calendar.getEvents(profile, { calendarId : c.id || undefined, singleEvents : true, timeMax : endOfYear }));
	const allEvents         = await Promise.all(allEventsPromises);
	const events            = _.flatten(allEvents);

	return { calendars, events };
}
