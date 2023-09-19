import React from 'react';
import { useMemo } from 'react';
import { Box } from '@nelson-ui/react';
import { Check, AlertCircle } from 'lucide-react';
import { Spinner } from '@components/spinner';
import { useDebounce } from 'usehooks-ts';
import { Text } from '../../text';
import { useAtomValue } from 'jotai';
import { Button } from '@components/ui/button';
import { ustxToStx } from '@common/utils';
import { computeNamePrice } from '@bns-x/core';
import { useNameRegister } from '@common/hooks/use-name-register';
import { loadable } from 'jotai/utils';
import { nameIsAvailableAtom } from '@store/names';
import { nameInputAtom } from '@store/register';
import { useDeepMemo } from '@common/hooks/use-deep-memo';
import { TableCell, TableRow } from '@components/ui/table';
import { cva } from 'class-variance-authority';
import { cn } from '@common/ui-utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/ui/dialog';
import { useConnect } from '@common/hooks/use-connect';

const nameVariants = cva('', {
  variants: {
    availability: {
      available: 'text-slate-100',
      unavailable: 'text-neutral-500 line-through',
      loading: 'text-neutral-500',
    },
  },
});

export const RegisterNameRow: React.FC<{
  namespace: string;
}> = ({ namespace }) => {
  const name = useAtomValue(nameInputAtom.debouncedValueAtom);
  const fqn = `${name.toLowerCase()}.${namespace}`;
  const isDebouncing = useAtomValue(nameInputAtom.isDebouncingAtom);
  const price = useMemo(() => {
    if (name.length === 0) return 0n;
    return computeNamePrice(name, namespace);
  }, [namespace, name]);
  const { nameRegister } = useNameRegister(name, namespace, price);
  const { isSignedIn, openAuthRequest } = useConnect();

  // const tx = useAtomValue(registerTxAtom); // TODO: use this to display some status of the tx

  const nameAvailabilityLoader = useAtomValue(loadable(nameIsAvailableAtom(fqn)));

  const isLoading = useMemo(() => {
    if (isDebouncing) return true;
    if (nameAvailabilityLoader.state === 'loading') return true;
    if (nameAvailabilityLoader.state === 'hasError') return true;
    return false;
  }, [nameAvailabilityLoader.state, isDebouncing]);

  const isAvailable = useDeepMemo(() => {
    if (nameAvailabilityLoader.state === 'hasData') {
      return nameAvailabilityLoader.data;
    }
    return false;
  }, [nameAvailabilityLoader]);

  const nameVariant = useMemo(() => {
    if (isLoading) return 'loading';
    if (isAvailable) return 'available';
    return 'unavailable';
  }, [isLoading, isAvailable]);

  const action = useMemo(() => {
    if (isSignedIn) {
      return (
        <Button variant="default" onClick={nameRegister}>
          Register
        </Button>
      );
    }
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="default">Sign in</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sign in to register</DialogTitle>
            <DialogDescription>To register a name, connect your Stacks wallet</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="submit"
              onClick={async () => {
                await openAuthRequest();
              }}
            >
              Connect wallet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }, [isSignedIn, nameRegister, openAuthRequest]);

  return (
    <TableRow>
      <TableCell>
        <div className="flex flex-row gap-3 items-baseline">
          <div>
            <span className={cn('text-lg', nameVariants({ availability: nameVariant }))}>
              {fqn}
            </span>
          </div>
          <div>
            {isAvailable && (
              <span className="text-neutral-300 text-sm">
                <span className="text-emerald-500 font-bold">
                  {ustxToStx(price).toFormat()} STX
                </span>
              </span>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right h-[75px] max-w-[200px]">
        <div className="flex items-end flex-col">
          <div>
            {isLoading ? (
              <Spinner size={16} color="currentColor" />
            ) : isAvailable ? (
              action
            ) : (
              <Box display="flex" alignItems="center" opacity={0.5}>
                <AlertCircle size={16} />{' '}
                <Text variant="Body02" marginLeft="8px">
                  Not Available{' '}
                </Text>{' '}
              </Box>
            )}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};
