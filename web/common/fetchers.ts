import { getAppUrl } from './constants';

/**
 * saveSession
 *
 * A simple wrapper around `fetch` to post to the `/api/session/save` endpoint
 * @param dehydratedState - the string value of the client state serialized
 */
export const saveSession = async (dehydratedState: string) => {
  try {
    await fetch(getAppUrl() + '/api/session/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dehydratedState }),
    });
  } catch (e) {
    console.error(e);
  }
};

/**
 * destroySession
 *
 * A simple wrapper around `fetch` to post to the `/api/session/destroy` endpoint
 */
export const destroySession = async () => {
  try {
    await fetch(getAppUrl() + '/api/session/destroy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: null,
    });
  } catch (e) {
    console.error(e);
  }
};
