import { PNG } from '../src/png';
import { readFile } from 'fs/promises';

export async function readPng(path: string) {
  return PNG.decode(await readFile(path));
}
