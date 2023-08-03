import React, { memo, useMemo } from 'react';
import { isNameValid } from '@bns-x/core';
import { Box, Stack } from '@nelson-ui/react';
import { Input } from '@components/ui/input';
import { currentUserAddressNameStringsState, availableNamespacesState } from '@store/names';
import { useAtomValue, useSetAtom } from 'jotai';
import { Button } from '@components/ui/button';
import { useSwitchAccounts } from '@common/hooks/use-switch-accounts';
import { BnsNameRow } from '@components/bns-name-row';
import { Toaster } from 'sonner';
import { useDeepMemo } from '@common/hooks/use-deep-memo';
import { nameInputAtom, registrationNameState, registrationTxAtom } from '@store/register';
import { Text } from '@components/text';
import { Table, TableHeader, TableRow, TableHead, TableBody } from '@components/ui/table';
import { Link } from '@components/link';

// TODO: success state
// const RegistrationTx: React.FC = () => {
//   const registrationTx = useAtomValue(registrationTxAtom);
//   return (
//     <>
//       <div className="grow"></div>
//       <div className="w-full space-y-6">
//         <div className="flex flex-col gap-10 items-center">

//         </div>
//       </div>
//     </>
//   )
// }

export const Register: React.FC<{ children?: React.ReactNode }> = () => {
  const { switchAccounts } = useSwitchAccounts();
  const bnsNameValue = useAtomValue(nameInputAtom.currentValueAtom);
  const setName = useSetAtom(nameInputAtom.debouncedValueAtom);
  const transformedName = useAtomValue(registrationNameState);
  const allNames = useAtomValue(currentUserAddressNameStringsState);
  const availableNamespaces = useAtomValue(availableNamespacesState);
  const v1Name = allNames.coreName;
  const noNames = v1Name === null;
  const registrationTx = useAtomValue(registrationTxAtom);

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

  return (
    <>
      <Box flexGrow={1} />
      <div className="w-full space-y-6">
        {noNames ? (
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
        ) : (
          <div className="space-y-5 text-center">
            <div className="flex flex-col gap-10 items-center">
              <div>
                <h1 className="text-gray-200 text-7xl font-open-sauce-one font-medium tracking-normal leading-10 max-w-lg">
                  Register your BNS name
                </h1>
              </div>
              <p className="text-gray-200 text-sm font-inter font-normal tracking-normal leading-6 max-w-lg">
                Looks like you registered {v1Name} for this account. Switch to an account that
                doesn&apos;t own any names, or{' '}
                <Link href="/upgrade">migrate your name to BNSx</Link>.
              </p>
              <Button className="w-60 text-md" size="lg" onClick={() => switchAccounts()}>
                Switch accounts
              </Button>
            </div>
          </div>
        )}
      </div>
      <Box flexGrow={1} />
      <Toaster theme="dark" closeButton />
    </>
  );
};
