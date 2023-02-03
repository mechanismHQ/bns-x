import { useMemo } from 'react';
import randomGradient from 'random-gradient';
import stringHash from '@sindresorhus/string-hash';
import tinyColor from 'tinycolor2';

export function useGradient(uid: string) {
  const gradient = useMemo(() => {
    const n = stringHash(uid);
    // const s = 0;
    // const sShift = 10;
    // const s = ((n % sShift) - sShift * 2) / (sShift * 10);
    const color = tinyColor({ h: n % 360, s: 0.95, l: 0.5 });
    const colors = color.tetrad();

    return `
    radial-gradient(
      circle at top left,
      ${colors[0].toString()}, 
      transparent 80%
    ),
    radial-gradient(
      circle at top right,
      ${colors[1].toString()}, 
      transparent 80%
    ),
    radial-gradient(
      circle at bottom left,
      ${colors[2].toString()}, 
      transparent 80%
    ),
    radial-gradient(
      circle at bottom right,
      ${colors[3].toString()}, 
      transparent 80%
    );
    `;
    // return `linear-gradient(to top right, ${c1}, ${c2})`;
    // return randomGradient(uid, 'linear');
  }, [uid]);
  return gradient;
}
