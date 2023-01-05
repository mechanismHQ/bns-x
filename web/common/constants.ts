import { StacksMocknet } from 'micro-stacks/network';

export const APP_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://nextjs-example.micro-stacks.dev';

export function getNetwork() {
  return new StacksMocknet();
}
