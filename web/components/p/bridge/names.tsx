import React, { useMemo } from 'react';
import { Text } from '@components/ui/text';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import { inscribedNamesAtom } from '@store/bridge';
import { useAtomValue } from 'jotai';
import { Button } from '@components/ui/button';
import { BridgedNameRow } from '@components/p/bridge/names/name-row';

export const BridgeNames: React.FC<{ children?: React.ReactNode }> = () => {
  const names = useAtomValue(inscribedNamesAtom);

  const nameRows = useMemo(() => {
    console.log('names', names);
    return names.map(name => {
      return <BridgedNameRow name={name} key={name.name} />;
    });
  }, [names]);
  return (
    <div className="flex flex-col gap-5 px-[29px]">
      <Text variant="Heading02">BNS on L1</Text>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-caption01 text-text w-[200px]">Name</TableHead>
            <TableHead className="text-right">View</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{nameRows}</TableBody>
      </Table>
    </div>
  );
};
