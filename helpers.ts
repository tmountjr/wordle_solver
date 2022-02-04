/**
 * Perform a boolean union on two or more sets.
 * @param sets Two or more sets to join.
 * @returns A single joined set.
 */
export function union(...sets: Set<string>[]): Set<string> {
  if (sets.length < 1) throw new Error('Union requires at least one set.');
  if (sets.length === 1) return sets[0];
  let base = sets[0];
  for (let i = 1; i < sets.length; i++) {
    base = new Set([...base].concat([...sets[i]]));
  }
  return base;
}

/**
 * Perform an intersection on two or more sets.
 * @param sets Two or more sets to intersect.
 * @returns A single set representing values that appear in all sets.
 */
export function intersect(...sets: Set<string>[]): Set<string> {
  if (sets.length < 1) throw new Error('Intersect requires at least one set.');
  if (sets.length === 1) return sets[0];
  let base = sets[0];
  for (let i = 1; i < sets.length; i++) {
    base = new Set([...base].filter(x => sets[i].has(x)));
  }
  return base;
}

/**
 * Perform a difference operation on two or more sets.
 * @param sets Two or more sets to diff.
 * @returns A single set representing the unique values of all the sets.
 */
export function difference(...sets: Set<string>[]): Set<string> {
  if (sets.length < 1) throw new Error('Difference requires at least one set.');
  if (sets.length === 1) return sets[0];
  let base = sets[0];
  for (let i = 1; i < sets.length; i++) {
    base = new Set([...base].filter(x => !sets[i].has(x)));
  }
  return base;
}