export function parseIntervalDate(date: string | undefined): Date | null {
  if (date && date.length > 7) {
    const year = Number(date.substring(0, 4));
    const monthIndex = Number(date.substring(4, 6)) - 1; // Months in JS are zero-indexed, so subtract 1
    const day = Number(date.substring(6, 8));
    const result = new Date(Date.UTC(year, monthIndex, day, 0, 0, 0, 0));
    return isValidDate(result) ? result : null;
  }
  /* Will strip out invalid dates, but would need to check with PO what correct
    behaviour should be in case of invalid or missing date */
  return null;
}

function isValidDate(date: Date): boolean {
  return date && Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime());
}
