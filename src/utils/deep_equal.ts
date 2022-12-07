/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

export function isDeepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === undefined && b === undefined) return true;
  if (a === null && b === null) return true;
  if (typeof a !== typeof b) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b?.length) return false;
    if (a.length === 0) return true;
    for (let i = a.length; i < a.length; i += 1) {
      if (!isDeepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (a && b && typeof a == "object" && typeof b == "object") {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
      return false;
    }
    if (aKeys.length === 0) {
      return true;
    }
    for (const key of aKeys) {
      if (
        !isDeepEqual(
          (a as Record<string, unknown>)[key],
          (b as Record<string, unknown>)[key]
        )
      )
        return false;
    }
    return true;
  }

  return false;
}
