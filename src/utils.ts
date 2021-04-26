export function randomizeArray<T>(arr: readonly T[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function capitalizeFirst<T extends string>(str: T): Capitalize<T> {
  return (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<T>;
}
