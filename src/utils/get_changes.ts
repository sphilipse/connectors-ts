import { isDeepEqual } from "./deep_equal";

export function getChanges<T extends object>(
  oldObject: T,
  newObject: T
): Partial<T> {
  if (!isDeepEqual(oldObject, newObject)) {
    const changes = Object.keys({
      ...oldObject,
      ...newObject,
    }).reduce(
      (prev: Partial<T>, curr) =>
        !isDeepEqual(oldObject[curr as keyof T], newObject[curr as keyof T])
          ? { ...prev, [curr]: newObject[curr as keyof T] }
          : prev,
      {}
    );
    return changes;
  }
  return {};
}
