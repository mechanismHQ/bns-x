import React from 'react';
import { Text } from '@components/ui/text';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@components/ui/table';
import { inscribedNamesInfiniteAtom } from '@store/bridge';
import { useAtom } from 'jotai';
import { Button } from '@components/ui/button';
import { BridgedNameRow } from '@components/p/bridge/names/name-row';
import { useDeepMemo } from '@common/hooks/use-deep-memo';

export const BridgeNames: React.FC<{ children?: React.ReactNode }> = () => {
  const [names, dispatch] = useAtom(inscribedNamesInfiniteAtom[0]);
  const fetchNextPage = React.useCallback(() => {
    dispatch({ type: 'fetchNextPage' });
  }, [dispatch]);

  const nameRows = useDeepMemo(() => {
    return [
      ...names.pages.map(page => page.map(name => <BridgedNameRow name={name} key={name.name} />)),
    ];
  }, [names]);

  const hasMore = (names.pages.at(-1)?.length ?? 0) === 100;

  return (
    <div className="flex flex-col gap-5 px-[29px]">
      <Text variant="Heading02">BNS on L1</Text>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-caption01 text-text w-[200px]">Name</TableHead>
            <TableHead className="text-right">Time</TableHead>
            <TableHead className="text-right">View</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{nameRows}</TableBody>
      </Table>
      <div>{hasMore && <Button onClick={fetchNextPage}>Load More</Button>}</div>
    </div>
  );
};
