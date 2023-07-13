import React from 'react';
import { useMemo } from 'react';
import { Box } from '@nelson-ui/react';
import { Check, AlertCircle } from 'lucide-react';
import { Spinner } from '@components/spinner';
import { useDebounce } from 'usehooks-ts';
import { Text } from './text';
import { useAtomValue } from 'jotai';
import { Button } from '@components/ui/button';
import { ustxToStx } from '@common/utils';
import { computeNamePrice } from '@bns-x/core';
import { useNameRegister } from '@common/hooks/use-name-register';
import { loadable } from 'jotai/utils';
import { nameIsAvailableAtom } from '@store/names';
import { useDeepMemo } from '@common/hooks/use-deep-memo';
import { TableCell, TableRow } from '@components/ui/table';
import { cva } from 'class-variance-authority';
import { cn } from '@common/ui-utils';

const nameVariants = cva('', {
  variants: {
    availability: {
      available: 'text-slate-100',
      unavailable: 'text-neutral-500 line-through',
      loading: 'text-neutral-500',
    },
  },
});

export const BnsNameRow: React.FC<{
  name: string;
  namespace: string;
}> = ({ name, namespace }) => {
  const fqn = `${name.toLowerCase()}.${namespace}`;
  const debouncedValue = useDebounce<string>(fqn, 1000);
  const price = useMemo(() => {
    if (name.length === 0) return 0n;
    return computeNamePrice(name, namespace);
  }, [name, namespace]);
  const { nameRegister } = useNameRegister(name, namespace, price);

  // const tx = useAtomValue(registerTxAtom); // TODO: use this to display some status of the tx

  const nameAvailabilityLoader = useAtomValue(loadable(nameIsAvailableAtom(debouncedValue)));

  const isLoading = useMemo(() => {
    if (debouncedValue !== fqn) return true;
    if (nameAvailabilityLoader.state === 'loading') return true;
    if (nameAvailabilityLoader.state === 'hasError') return true;
    return false;
  }, [debouncedValue, nameAvailabilityLoader.state, fqn]);

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

  return (
    <TableRow>
      <TableCell>
        <span className={cn('text-lg', nameVariants({ availability: nameVariant }))}>{fqn}</span>
      </TableCell>
      <TableCell>
        <Text variant="Body01">{ustxToStx(price).toFormat()} STX</Text>
      </TableCell>
      <TableCell className="text-right h-[75px]">
        <div className="flex items-end flex-col">
          <div>
            {isLoading ? (
              <Spinner size={16} color="currentColor" />
            ) : isAvailable ? (
              <Button variant="default" onClick={nameRegister}>
                Register
              </Button>
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
