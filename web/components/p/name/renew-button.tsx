import { Button } from '@components/button';
import { canNameBeRenewedState } from '@store/names';
import { useAtomValue } from 'jotai';
import { loadable } from 'jotai/utils';
import React from 'react';

export const RenewButton: React.FC<{ children?: React.ReactNode; name: string }> = ({ name }) => {
  const canBeRenewed = useAtomValue(loadable(canNameBeRenewedState(name)));

  if (canBeRenewed.state !== 'hasData') return null;
  if (canBeRenewed.data === false) return null;

  return (
    <Button width="100%" tertiary>
      Renew
    </Button>
  );
};
