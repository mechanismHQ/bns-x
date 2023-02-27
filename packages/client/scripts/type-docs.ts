import { namesByAddressBnsxSchema } from '@bns-x/core';
import type { ZodObjectDef } from 'zod';
import { z, ZodFirstPartyTypeKind } from 'zod';

console.log(Object.keys(namesByAddressBnsxSchema._def));

const shape = namesByAddressBnsxSchema._def.shape();

function logObject<T extends z.SomeZodObject>(def: T) {
  // if (!def._def) return;
  for (const [key, val] of Object.entries(def._def.shape())) {
    if (val instanceof z.ZodObject) {
      console.log(val);
    } else {
      console.log(key, val.description);
    }
  }
}

logObject(namesByAddressBnsxSchema);
