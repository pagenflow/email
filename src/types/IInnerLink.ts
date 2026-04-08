export type CalendarProvider = "google" | "outlook" | "office365" | "yahoo" | "ics";

export interface ICalendarLink {
    calendarProvider?: CalendarProvider;
    calendarTitle?: string;
    calendarStart?: string;       // ISO string, UTC recommended
    calendarEnd?: string;         // ISO string
    calendarAllDay?: boolean;
    calendarDescription?: string;
    calendarLocation?: string;
}

export type InnerLinkType =
    | "none"
    | "anchor"
    | "url"
    | "email"
    | "phone"
    | "page_top"
    | "page_bottom";

export default interface IInnerLink {
    type: InnerLinkType;
    email?: string;
    phone?: string;
    url?: string;
    anchor?: string;
    target?: "_blank" | "_self" | "_parent" | "_top";

    // calendar
    calendarProvider?: CalendarProvider;
    calendarTitle?: string;
    calendarStart?: string;
    calendarEnd?: string;
    calendarAllDay?: boolean;
    calendarDescription?: string;
    calendarLocation?: string;
}
