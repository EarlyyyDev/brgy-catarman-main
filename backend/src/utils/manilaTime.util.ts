// The Philippines has a fixed UTC+8 offset with no DST, so boundaries can be
// computed with plain arithmetic instead of a timezone database/library.
const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000;

function manilaWallClock(date: Date): Date {
  return new Date(date.getTime() + MANILA_OFFSET_MS);
}

export function manilaMonthOfYear(date: Date): number {
  return manilaWallClock(date).getUTCMonth() + 1;
}

export function startOfManilaDay(date: Date): Date {
  const wall = manilaWallClock(date);
  return new Date(Date.UTC(wall.getUTCFullYear(), wall.getUTCMonth(), wall.getUTCDate()) - MANILA_OFFSET_MS);
}

export function startOfManilaMonth(date: Date): Date {
  const wall = manilaWallClock(date);
  return new Date(Date.UTC(wall.getUTCFullYear(), wall.getUTCMonth(), 1) - MANILA_OFFSET_MS);
}

export function startOfManilaYear(date: Date): Date {
  const wall = manilaWallClock(date);
  return new Date(Date.UTC(wall.getUTCFullYear(), 0, 1) - MANILA_OFFSET_MS);
}
