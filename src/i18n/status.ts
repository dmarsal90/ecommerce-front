import { defaultLocale, hasLocale } from './config';
import status from './dictionaries/status.json';

/** Copy for the 403/404/500 pages; kept apart from the server-only dictionaries because error boundaries are client code. */
export const getStatusCopy = (locale: string) => status[hasLocale(locale) ? locale : defaultLocale];
