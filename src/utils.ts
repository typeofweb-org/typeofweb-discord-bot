export function randomizeArray<T>(arr: readonly T[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function capitalizeFirst<T extends string>(str: T): Capitalize<T> {
  return (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<T>;
}

export function getWeekNumber(d: Date): readonly [year: number, week: number] {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));

  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  // Get first day of year
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil(((Number(date) - Number(yearStart)) / 86400000 + 1) / 7);

  return [date.getUTCFullYear(), weekNo];
}

export function getDateForWeekNumber(year: number, weekNo: number): Date {
  const yearStart = new Date(year, 0, 1);
  return new Date((weekNo * 7 - 1) * 86400000 + Number(yearStart));
}
