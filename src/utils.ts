export function randomizeArray<T>(array: T[]) {
  const randomPivot = 0.5;
  return [...array].sort(() => randomPivot - Math.random());
}
