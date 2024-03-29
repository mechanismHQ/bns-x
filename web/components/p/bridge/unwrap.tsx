import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { Text } from '@components/ui/text';
import { bridgeBurnScriptState, bridgeUnwrapTxidAtom, inscriptionForNameAtom } from '@store/bridge';
import { useAtom, useAtomValue } from 'jotai';
import { CodeBlock } from '@components/code';
import { Button } from '@components/ui/button';
import { Link } from '@components/link';
import { getInscriptionUrl, truncateMiddle } from '@common/utils';
import { DuplicateIcon } from '@components/icons/duplicate';
import { useBridgeUnwrap } from '@common/hooks/use-bridge-unwrap';
import { UnwrapTx } from '@components/p/bridge/unwrap-tx';

export const BridgeUnwrap: React.FC<{ children?: React.ReactNode }> = () => {
  const router = useRouter();
  const name = router.query.name as string;

  const inscription = useAtomValue(inscriptionForNameAtom(name));
  const inscriptionId = inscription?.inscriptionId ?? null;
  const burnAddress = useAtomValue(bridgeBurnScriptState);
  const unwrapTxid = useAtomValue(bridgeUnwrapTxidAtom);

  const { unwrap } = useBridgeUnwrap();

  const owner = inscription?.owner ?? '';

  const isBurnt = useMemo(() => {
    return owner === burnAddress;
  }, [owner, burnAddress]);

  const inscriptionUrl = useMemo(() => {
    return getInscriptionUrl(inscriptionId || '');
  }, [inscriptionId]);

  if (unwrapTxid) {
    return <UnwrapTx />;
  }

  if (inscriptionId === null) return null;
  if (burnAddress === null) return null; // logged out

  return (
    <div className="flex gap-5 flex-col px-[29px] w-full max-w-[800px] mx-auto">
      <Text variant="Heading035">Bridge {name} to Stacks</Text>
      <CodeBlock py="12px">
        <div className="flex justify-between w-full items-center">
          <span>{inscriptionId}</span>
          <DuplicateIcon clipboardText={inscriptionId} />
        </div>
      </CodeBlock>
      <Text variant="Body01">
        <Link href={inscriptionUrl} target="_blank">
          View inscription
        </Link>
      </Text>
      <Text variant="Heading04">Step 1: transfer the inscription</Text>
      {!isBurnt && (
        <>
          <Text variant="Body01">
            In order to bridge {name} to the Stacks chain, you first need to transfer the
            inscription to a burn address. This burn address is uniquely tied to your Stacks
            address.
          </Text>
          <Text variant="Body01">
            The inscription is currently owned by{' '}
            <span className="font-mono">{truncateMiddle(owner)}</span>
          </Text>
          <Text variant="Body01">Your burn address is:</Text>
          <CodeBlock py="12px">
            <div className="flex justify-between w-full items-center">
              <span>{burnAddress}</span>
              <DuplicateIcon clipboardText={burnAddress} />
            </div>
          </CodeBlock>
        </>
      )}
      {isBurnt && (
        <>
          <Text variant="Body01" className="font-bold">
            Done!
          </Text>
          <Text variant="Heading04">Step 2: receive the name on Stacks</Text>
          <div>
            <Button size="lg" onClick={unwrap}>
              Submit
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
