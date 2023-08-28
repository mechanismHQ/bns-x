import { useAccountPath } from '@common/hooks/use-account-path';
import { Button } from '@components/ui/button';
import { BoxLink } from '@components/link';
import { canNameBeRenewedState } from '@store/names';
import { useAtomValue } from 'jotai';
import { loadable } from 'jotai/utils';
import React from 'react';

export const RenewButton: React.FC<{ children?: React.ReactNode; name: string }> = ({ name }) => {
  const canBeRenewed = useAtomValue(loadable(canNameBeRenewedState(name)));
  const renewPath = useAccountPath('/renew/[name]', { name });

  if (canBeRenewed.state !== 'hasData') return null;
  if (canBeRenewed.data === false) return null;

  return (
    <BoxLink href={renewPath}>
      <Button size="lg" className="w-full" variant="tertiary">
        Renew
      </Button>
    </BoxLink>
  );
};
