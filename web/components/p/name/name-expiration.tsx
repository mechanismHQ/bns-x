import React, { Suspense } from 'react';
import { useMemo } from 'react';
import { nameExpirationBlocksRemainingState } from '@store/profile';
import { nameExpirationBlockState } from '@store/names';
import { useAtomValue } from 'jotai';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@components/ui/tooltip';
import format from 'date-fns/format';
import { Text } from '@components/ui/text';
import { Skeleton } from '@components/ui/skeleton';

const Fallback: React.FC = () => {
  return <Skeleton className="w-[100px] h-[16px]" />;
};

export const NameExpiration: React.FC<{ children?: React.ReactNode; name: string }> = ({
  name,
}) => {
  return (
    <Suspense fallback={<Fallback />}>
      <NameExpirationInner name={name} />
    </Suspense>
  );
};

export const NameExpirationInner: React.FC<{ children?: React.ReactNode; name: string }> = ({
  name,
}) => {
  const expBlock = useAtomValue(nameExpirationBlockState(name));
  const expBlocks = useAtomValue(nameExpirationBlocksRemainingState(name));

  const dateString = useMemo(() => {
    if (expBlocks === null) return null;
    const timeDiff = expBlocks * 10 * 60 * 1000;
    const expireDate = new Date(new Date().getTime() + timeDiff);
    return format(expireDate, 'yyyy-MM-dd');
  }, [expBlocks]);

  if (dateString === null) {
    return <Text variant="Label02">No expiration</Text>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Text variant="Label02" className="text-text-subdued">
            Expires <span className="text-text">{dateString}</span>
          </Text>
        </TooltipTrigger>
        <TooltipContent>
          {expBlock !== null && <p>Expires at Stacks block {expBlock}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
