import React, { useCallback, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import { Button } from '@components/ui/button';
import type { InscribedNamesResult } from '@store/bridge';
import { getTxUrl } from '@common/utils';
import { useTxUrl } from '@common/hooks/use-tx-url';
import Link from 'next/link';
import { BoxLink } from '@components/link';
import { ordinalsBaseUrl } from '@common/constants';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@components/ui/tooltip';
import { Text } from '@components/ui/text';

export const BridgedNameRow: React.FC<{
  children?: React.ReactNode;
  name: InscribedNamesResult;
}> = ({ name }) => {
  const txUrl = useTxUrl(name.txid);
  const inscriptionUrl = useMemo(() => {
    return `${ordinalsBaseUrl()}/inscription/${name.inscriptionId}`;
  }, [name.inscriptionId]);
  // const viewTx = useCallback(() => {
  //   const url = getTxUrl(name.txid);
  //   window.open(url, '_blank');
  // }, [name.txid]);
  return (
    <TableRow className="items-center">
      <TableCell className="text-heading05">{name.name}</TableCell>
      <TableCell>
        <div className="flex gap-3 justify-end">
          <BoxLink href={txUrl} target="_blank">
            <Button variant="outline" size="sm">
              Tx
            </Button>
          </BoxLink>
          <BoxLink href={inscriptionUrl} target="_blank">
            <Button variant="outline" size="sm">
              Inscription
            </Button>
          </BoxLink>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button variant="outline" size="sm" disabled>
                  Name
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <Text variant="Body01" className="text-text-subdued">
                  Coming soon
                </Text>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </TableCell>
    </TableRow>
  );
};
