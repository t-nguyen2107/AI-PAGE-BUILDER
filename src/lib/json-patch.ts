import type { JsonPatch } from '@/types/revision';

/** Apply a sequence of JSON Patch operations to an object */
export function applyPatches<T>(target: T, patches: JsonPatch[]): T {
  let result = structuredClone(target);

  for (const patch of patches) {
    result = applyPatch(result, patch);
  }

  return result;
}

function applyPatch<T>(target: T, patch: JsonPatch): T {
  const pathParts = patch.path.split('/').filter(Boolean);

  switch (patch.op) {
    case 'add':
      return setAtPath(target, pathParts, patch.value);

    case 'remove':
      return removeAtPath(target, pathParts);

    case 'replace':
      return setAtPath(target, pathParts, patch.value);

    case 'move': {
      if (!patch.from) throw new Error('Move operation requires "from" path');
      const fromParts = patch.from.split('/').filter(Boolean);
      const value = getAtPath(target, fromParts);
      const without = removeAtPath(target, fromParts);
      return setAtPath(without, pathParts, value);
    }

    case 'copy': {
      if (!patch.from) throw new Error('Copy operation requires "from" path');
      const fromParts = patch.from.split('/').filter(Boolean);
      const value = getAtPath(target, fromParts);
      return setAtPath(target, pathParts, value);
    }

    case 'test': {
      const value = getAtPath(target, pathParts);
      if (JSON.stringify(value) !== JSON.stringify(patch.value)) {
        throw new Error(`Test failed at path: ${patch.path}`);
      }
      return target;
    }

    default:
      return target;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getAtPath(obj: any, path: string[]): any {
  let current = obj;
  for (const key of path) {
    if (current == null) return undefined;
    current = current[key];
  }
  return current;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setAtPath(obj: any, path: string[], value: any): any {
  if (path.length === 0) return value;

  const clone = Array.isArray(obj) ? [...obj] : { ...obj };
  const [head, ...rest] = path;

  if (rest.length === 0) {
    if (Array.isArray(clone) && head === '-') {
      clone.push(value);
    } else if (Array.isArray(clone)) {
      const index = parseInt(head, 10);
      clone.splice(index, 0, value);
    } else {
      clone[head] = value;
    }
  } else {
    clone[head] = setAtPath(clone[head] ?? {}, rest, value);
  }

  return clone;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function removeAtPath(obj: any, path: string[]): any {
  if (path.length === 0) return obj;

  const clone = Array.isArray(obj) ? [...obj] : { ...obj };
  const [head, ...rest] = path;

  if (rest.length === 0) {
    if (Array.isArray(clone)) {
      clone.splice(parseInt(head, 10), 1);
    } else {
      delete clone[head];
    }
  } else {
    clone[head] = removeAtPath(clone[head], rest);
  }

  return clone;
}
