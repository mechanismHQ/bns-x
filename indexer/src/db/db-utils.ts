export function expectDb<T>(db?: T): asserts db is T {
  if (typeof db === 'undefined') {
    throw new Error('Expected DB connection');
  }
}
