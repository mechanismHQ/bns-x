export function expectDb<T>(db?: T): T {
  if (typeof db === 'undefined') {
    throw new Error('Expected DB connection');
  }
  return db;
}
