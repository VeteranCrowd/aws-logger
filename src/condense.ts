import { isArray, isObject, isPrimitive, isString } from 'is-what';
import { inspect } from 'util';

const condenseObject = (
  value: Record<string, unknown>,
  keys: string[],
  maxLen: number,
): Record<string, unknown> =>
  keys.reduce((a, k) => ({ ...a, [k]: condense(value[k], maxLen) }), {});

const condenseArray = (value: unknown[], maxLen: number) =>
  value.reduce<unknown[]>((a, item) => [...a, condense(item, maxLen)], []);

/**
 * Recursively condense large object, arrays & strings by removing items from the middle.
 */
export const condense = (value: unknown, maxLen = 128): unknown => {
  const leftLength = Math.ceil(maxLen / 2);
  const rightLength = Math.floor(maxLen / 2);

  if (isString(value))
    return value.length > maxLen
      ? `${value.slice(0, leftLength - 1)}...${value.slice(-(rightLength - 2))}`
      : value;

  if (isPrimitive(value)) return value;

  if (isObject(value)) {
    const keys = Object.keys(value);

    return keys.length > maxLen
      ? {
          ...condenseObject(value, keys.slice(0, leftLength - 1), maxLen),
          '...': '...',
          ...condenseObject(value, keys.slice(-(rightLength - 2)), maxLen),
        }
      : condenseObject(value, keys, maxLen);
  }

  if (isArray(value))
    return value.length > maxLen
      ? [
          ...condenseArray(value.slice(0, leftLength - 1), maxLen),
          '...',
          ...condenseArray(value.slice(-(rightLength - 2)), maxLen),
        ]
      : condenseArray(value, maxLen);

  return inspect(value, false, 1);
};
