/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
import { hmac } from "../noble-hashes/hmac.ts";
import { concatBytes, randomBytes } from "../noble-hashes/utils.ts";
import { weierstrass, CurveType } from "./abstract/weierstrass.ts";
import { CHash } from "./abstract/utils.ts";

// connects noble-curves to noble-hashes
export function getHash(hash: CHash) {
  return {
    hash,
    hmac: (key: Uint8Array, ...msgs: Uint8Array[]) =>
      hmac(hash, key, concatBytes(...msgs)),
    randomBytes,
  };
}
// Same API as @noble/hashes, with ability to create curve with custom hash
type CurveDef = Readonly<Omit<CurveType, "hash" | "hmac" | "randomBytes">>;
export function createCurve(curveDef: CurveDef, defHash: CHash) {
  const create = (hash: CHash) =>
    weierstrass({ ...curveDef, ...getHash(hash) });
  return Object.freeze({ ...create(defHash), create });
}
