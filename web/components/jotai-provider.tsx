import React from 'react';
import type { Atom } from 'jotai';
import { useMicroStacksClient } from '@micro-stacks/react';
import { useHydrateAtoms } from 'jotai/utils';
import { clientAtom } from '@store/micro-stacks';

export const JotaiClientProvider: React.FC<{
  initialValues?: [Atom<unknown>, unknown][];
  children: React.ReactNode;
}> = ({ children, initialValues }) => {
  const client = useMicroStacksClient();
  useHydrateAtoms([[clientAtom, client] as const, ...(initialValues || [])]);

  return <>{children}</>;
};
