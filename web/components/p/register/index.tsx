import React, { useMemo } from 'react';
import { isNameValid } from '@bns-x/core';
import { Box, Stack } from '@nelson-ui/react';
import { Input } from '@components/ui/input';
import { currentUserAddressNameStringsState, availableNamespacesState } from '@store/names';
import { useAtomValue, useSetAtom } from 'jotai';
import { BnsNameRow } from '@components/bns-name-row';
import { Toaster } from 'sonner';
import { useDeepMemo } from '@common/hooks/use-deep-memo';
import { nameInputAtom, registerTxIdAtom, registrationNameState } from '@store/register';
import { Text } from '@components/text';
import { Table, TableHeader, TableRow, TableHead, TableBody } from '@components/ui/table';
import { RegisterNoName } from '@components/p/register/no-name';
import { RegistrationTx } from '@components/p/register/register-tx';

export const Register: React.FC<{ children?: React.ReactNode }> = () => {
  const bnsNameValue = useAtomValue(nameInputAtom.currentValueAtom);
  const setName = useSetAtom(nameInputAtom.debouncedValueAtom);
  const transformedName = useAtomValue(registrationNameState);
  const allNames = useAtomValue(currentUserAddressNameStringsState);
  const availableNamespaces = useAtomValue(availableNamespacesState);
  const v1Name = allNames.coreName;
  const noNames = v1Name === null;
  const registrationTxid = useAtomValue(registerTxIdAtom);

  const emptyInput = bnsNameValue.length === 0;

  const nameIsValid = useMemo(() => {
    if (transformedName.length === 0) return true;
    const isValid = isNameValid(transformedName);
    return isValid;
  }, [transformedName]);

  const rows = useDeepMemo(() => {
    if (nameIsValid === false) return null;
    if (emptyInput) return null;
    return availableNamespaces.map(namespace => (
      <BnsNameRow key={namespace} namespace={namespace} />
    ));
  }, [availableNamespaces, emptyInput, nameIsValid, transformedName]);

  if (!noNames) {
    return <RegisterNoName />;
  }

  return (
    <>
      <Box flexGrow={1} />
      <div className="w-full space-y-6">
        {registrationTxid ? (
          <RegistrationTx />
        ) : (
          <>
            <div className="space-y-10 text-center">
              {/* <div className="max-w-lg mx-auto"> */}
              <Text variant="Display02">Register your BNS name</Text>
              {/* </div> */}
              <div className="flex w-full max-w-xl mx-auto items-center space-x-3">
                <div className="w-full relative">
                  <Input
                    className="h-12 text-md"
                    type="text"
                    placeholder="Enter a name"
                    value={bnsNameValue}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
              </div>
              {!nameIsValid && (
                <div className="text-center">
                  <Stack>
                    <Text variant="Body02">The name you&apos;ve entered is not valid.</Text>
                    <Text variant="Body02">
                      Names can only have the characters a-z, `-`, and `_`.
                    </Text>
                  </Stack>
                </div>
              )}
            </div>

            {nameIsValid && !emptyInput && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{rows}</TableBody>
              </Table>
            )}
          </>
        )}
      </div>
      <Box flexGrow={1} />
      <Toaster theme="dark" closeButton />
    </>
  );
};
