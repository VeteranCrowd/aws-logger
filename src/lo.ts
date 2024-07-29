import { isArray, isObject, isPlainObject, isString } from 'is-what';

export const pick = (value: unknown, keys: string[]): unknown => {
  if (!isObject(value)) return value;

  if (!Array.isArray(keys)) keys = [keys];

  return keys.reduce<typeof value>((result, key) => {
    if (key in value) {
      result[key] = value[key];
    }
    return result;
  }, {});
};

export const omit = (value: unknown, keys: string[]) => {
  if (!isObject(value)) return value;

  if (!Array.isArray(keys)) keys = [keys];

  return Object.keys(value).reduce<typeof value>((result, key) => {
    if (!keys.includes(key)) {
      result[key] = value[key];
    }
    return result;
  }, {});
};

/**
 * Recursively condense large object, arrays & strings by removing items from the middle.
 */
export const condense = (item: unknown, maxLen = 128): unknown => {
  if (!isPlainObject(item) && !isArray(item)) return;

  const leftLength = Math.ceil(maxLen / 2);
  const rightLength = Math.floor(maxLen / 2);

  for (const key in item) {
    if (isString(item[key]) && item[key].length > maxLen) {
      item[key] = `${item[key].slice(0, leftLength - 1)}...${item[key].slice(
        -(rightLength - 2),
      )}`;
    } else if (Array.isArray(item[key]) && item[key].length > maxLen) {
      item[key] = [
        ...(item[key].slice(0, leftLength - 1) as unknown[]),
        '...',
        ...(item[key].slice(-rightLength) as unknown[]),
      ];
    } else if (
      isPlainObject(item[key]) &&
      Object.keys(item[key]).length > maxLen
    ) {
      const entries = Object.entries(item[key]);
      item[key] = Object.fromEntries([
        ...entries.slice(0, leftLength - 1),
        ['...', '...'],
        ...entries.slice(-rightLength),
      ]);
    } else condense(item[key], maxLen);
  }

  return item;
};
