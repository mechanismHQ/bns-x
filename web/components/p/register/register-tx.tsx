import React, { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { nameBeingRegisteredAtom, registerTxIdAtom, registrationTxAtom } from '@store/register';
import { Text } from '@components/text';
import { CenterBox } from '@components/layout';
import { DoneRow, PendingRow } from '@components/upgrade/rows';

export const RegistrationTx: React.FC<{ children?: React.ReactNode }> = () => {
  const registrationTx = useAtomValue(registrationTxAtom);
  const name = useAtomValue(nameBeingRegisteredAtom);
  const status = registrationTx?.tx_status;
  const pending = useMemo(() => {
    if (typeof status === 'undefined') return true;
    if (status === 'pending') return true;
    return false;
  }, [status]);

  if (registrationTx === null) return null;
  return (
    <div className="flex items-center w-full flex-col">
      <CenterBox mt="20px" mb="30px">
        {pending ? (
          <PendingRow txidAtom={registerTxIdAtom}>Registering {name}</PendingRow>
        ) : (
          <DoneRow txidAtom={registerTxIdAtom}>Registered {name}</DoneRow>
        )}
      </CenterBox>
    </div>
  );
};
