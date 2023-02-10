import { atom } from 'jotai';
import { atomsWithMutation, atomsWithQuery } from 'jotai-tanstack-query';
import { trpc } from './api';

export const uploadInscriptionSuccessAtom = atom<boolean | null>(null);

export const inscriptionIdAtom = atom('');

export const uploadInscriptionMutation = atomsWithMutation<
  {
    inscriptionId: string;
    success: boolean;
  },
  unknown,
  undefined
>(get => ({
  mutationKey: ['upload-inscription', get(inscriptionIdAtom)],
  mutationFn: async () => {
    const inscriptionId = get(inscriptionIdAtom);
    console.log('inscriptionId', inscriptionId);
    const result = await trpc.inscriptions.create.mutate({ inscriptionId });
    return result;
  },
}));
