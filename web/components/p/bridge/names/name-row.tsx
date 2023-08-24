import React, { useCallback, useMemo, useState } from 'react';
import { TableCell, TableRow } from '@components/ui/table';
import { Button } from '@components/ui/button';
import type { InscribedNamesResult } from '@store/bridge';
import { useTxUrl } from '@common/hooks/use-tx-url';
import { ordinalsBaseUrl } from '@common/constants';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@components/ui/tooltip';
import { Text } from '@components/ui/text';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuExternalLink,
  DropdownMenuSeparator,
} from '@components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { useCopyToClipboard } from 'usehooks-ts';
import { useToast } from '@common/hooks/use-toast';

export const BridgedNameRow: React.FC<{
  children?: React.ReactNode;
  name: InscribedNamesResult;
}> = ({ name }) => {
  const txUrl = useTxUrl(name.txid);
  const inscriptionUrl = useMemo(() => {
    return `${ordinalsBaseUrl()}/inscription/${name.inscriptionId}`;
  }, [name.inscriptionId]);

  const { toast } = useToast();

  const [_, copy] = useCopyToClipboard();
  const copyToClipboard = useCallback(() => {
    void copy(name.inscriptionId);
    toast({
      title: `Copied inscription ID to clipboard`,
    });
  }, [name.inscriptionId, copy, toast]);

  return (
    <TableRow className="items-center">
      <TableCell className="text-heading05">{name.name}</TableCell>
      <TableCell>
        <div className="flex gap-3 justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                View
                <ChevronDown className="ml-1 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <DropdownMenuItem disabled>Name details</DropdownMenuItem>
                  </TooltipTrigger>
                  <TooltipContent>
                    <Text variant="Body01" className="text-text-subdued">
                      Coming soon
                    </Text>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuExternalLink href={txUrl}>Stacks Transaction</DropdownMenuExternalLink>
              <DropdownMenuExternalLink href={inscriptionUrl}>Inscription</DropdownMenuExternalLink>
              <DropdownMenuItem onClick={copyToClipboard}>Copy to clipboard</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuExternalLink href={`https://gamma.io/inscription/${name.inscriptionId}`}>
                Gamma
              </DropdownMenuExternalLink>
              <DropdownMenuExternalLink
                href={`https://ordinals.market/ordinal/${name.inscriptionId}`}
              >
                Ordinals Market
              </DropdownMenuExternalLink>
              <DropdownMenuExternalLink
                href={`https://ordinalswallet.com/inscription/${name.inscriptionId}`}
              >
                Ordinals Wallet
              </DropdownMenuExternalLink>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
};
