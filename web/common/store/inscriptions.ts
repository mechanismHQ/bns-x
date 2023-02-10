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
    const validation = await trpc.inscriptions.fetchZonefile.query({ inscriptionId });
    console.log('inscriptionId', inscriptionId);
    console.log('validation', validation);
    if (validation.success) {
      const result = await trpc.inscriptions.create.mutate({ inscriptionId });
      return result;
    }
    throw new Error('Invalid inscription.');
  },
}));
