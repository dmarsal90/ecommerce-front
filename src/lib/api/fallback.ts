/**
 * Runs an API read and returns `fallback` if it fails, so one failing section cannot take a page down.
 * Call it OUTSIDE `use cache` functions: those must throw on failure, because a returned fallback would
 * be cached and keep showing the error for minutes after the API recovers.
 */
export async function orFallback<T>(load: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await load();
  } catch (error) {
    console.error(error);
    return fallback;
  }
}
