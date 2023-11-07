import { useRouter } from 'next/router';
import React, { memo, useEffect, useMemo } from 'react';
import { currentNameAtom, nameDetailsAtom } from '@store/names';
import { useAtomValue, useSetAtom } from 'jotai';
import { usePunycode } from '@common/hooks/use-punycode';
import { Text } from '@components/ui/text';
import { useGradient } from '@common/hooks/use-gradient';
import { NameExpiration } from '@components/p/name/name-expiration';
import { DuplicateIcon } from '@components/icons/duplicate';
import {
  Divider,
  FieldHeader,
  FieldValue,
  FieldValueRow,
  FieldValueTruncated,
  Row,
  Truncated,
} from './fields';
import { computeNamePrice, parseFqn } from '@bns-x/core';
import { getInscriptionUrl, ustxToStx } from '@common/utils';
import { ExternalLink } from 'lucide-react';
import { ExternalTx } from '@components/icons/external-tx';
import { ExternalLinkIcon } from '@components/icons/external-link';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs';
import { CodeBlock } from '@components/code';
import { ZoneFile } from '@bns-x/client';
import {
  Table,
  TableBody,
  TableHeader,
  TableHead,
  TableCell,
  TableRow,
} from '@components/ui/table';
import { ZonefileTable } from '@components/p/name/name-zonefile';
import Link from 'next/link';
import { badgeVariants } from '@components/ui/badge';
import { cn } from '@common/ui-utils';
import { Button } from '@components/ui/button';
import { BoxLink } from '@components/link';
import { useDeepMemo } from '@common/hooks/use-deep-memo';
import { stxAddressAtom } from '@store/micro-stacks';
import { useAccountPath } from '@common/hooks/use-account-path';
import { inscriptionForNameAtom } from '@store/bridge';

export const NotFound: React.FC<{ children?: React.ReactNode }> = () => {
  const name = useAtomValue(currentNameAtom);
  return (
    <>
      <div className="flex-grow"></div>
      <div className="w-full max-w-[800px] flex flex-col gap-12 text-center mx-auto mb-12">
        <Text variant="Display01" className="font-mono italic">
          404
        </Text>
        {/* <Text variant="Display01">Name not found</Text> */}
        <Text variant="Body01" className="text-text-subdued max-w-md mx-auto w-full">
          We couldn&apos;t find details for {name}
        </Text>
      </div>
      <div className="flex-grow"></div>
    </>
  );
};

export const NamePage: React.FC<{ children?: React.ReactNode; name?: string }> = () => {
  const namePuny = useAtomValue(currentNameAtom);
  const nameDetails = useAtomValue(nameDetailsAtom(namePuny));
  const inscription = useAtomValue(inscriptionForNameAtom(namePuny));
  const name = usePunycode(namePuny);
  const gradient = useGradient(namePuny);
  const isBnsx = nameDetails?.isBnsx ?? false;
  const stxAddress = useAtomValue(stxAddressAtom);

  const isOwnName = stxAddress === nameDetails?.address;
  const managePath = useAccountPath('/manage/[name]', { name: namePuny });

  const bridgeToL2Path = useAccountPath('/bridge/[name]', {
    name: namePuny,
  });

  const wrapper = useDeepMemo(() => {
    if (!nameDetails?.isBnsx) return null;
    return nameDetails.wrapper;
  }, [nameDetails]);

  const registrationPrice = useMemo(() => {
    const { name, namespace } = parseFqn(namePuny);
    const ustx = computeNamePrice(name, namespace);
    return ustxToStx(ustx);
  }, [namePuny]);

  const gammaLink = useDeepMemo(() => {
    if (nameDetails === null) return null;
    if (inscription?.inscriptionId) {
      return `https://gamma.io/inscription/${inscription.inscriptionId}`;
    }
    if (nameDetails.isBnsx) {
      return `https://stacks.gamma.io/collections/bnsx/${nameDetails.id}`;
    }
    return `https://stacks.gamma.io/collections/bns/${namePuny}`;
  }, [nameDetails, namePuny]);

  if (nameDetails === null) return <NotFound />;

  return (
    <div className="flex flex-row px-sidewall flex-wrap gap-x-[70px] gap-y-[30px]">
      <div className="flex flex-col flex-basis-[300px] gap-[27px]">
        <div
          className="w-[150px] aspect-square rounded-full"
          style={{ backgroundImage: gradient.replaceAll(';', '') }}
        />
        <div className="flex flex-col justify-between h-[73px]">
          <Text variant="Heading035">{name}</Text>
          <div className="flex gap-[25px] items-center">
            <Text variant="Label02" className="text-text-subdued">
              {isBnsx ? 'BNSx' : 'BNS'}
            </Text>
            <NameExpiration name={namePuny} />
            <DuplicateIcon clipboardText={namePuny} copyLabel="Copy Name" />
          </div>
        </div>
        <div className="flex flex-col gap-4 w-[280px]">
          {isOwnName && (
            <BoxLink href={managePath}>
              <Button size="lg" className="w-full">
                Manage
              </Button>
            </BoxLink>
          )}
          {inscription && (
            <BoxLink href={bridgeToL2Path}>
              <Button size="lg" className="w-full" variant="secondary">
                Bridge to L2
              </Button>
            </BoxLink>
          )}
          <BoxLink href={gammaLink ?? ''} target="_blank">
            <Button size="lg" variant="secondary" className="w-full">
              View on Gamma
            </Button>
          </BoxLink>
        </div>
      </div>
      <div className="flex flex-col gap-y-0 flex-basis-[450px]">
        <div className="flex-col flex gap-2 pb-5">
          <Text variant="Heading04">Name Details</Text>
        </div>
        <Divider />

        {inscription && (
          <>
            <Row>
              <FieldHeader>Inscription ID</FieldHeader>
              <FieldValueRow>
                <Text variant="Label02">
                  <Truncated>{inscription.inscriptionId}</Truncated>
                </Text>
                <div className="flex gap-0 items-center">
                  <DuplicateIcon clipboardText={inscription.inscriptionId} />
                  {/* <ExternalTx txId={inscription.inscriptionId} /> */}
                </div>
              </FieldValueRow>
            </Row>
            <Divider />
            <Row>
              <FieldHeader>Bitcoin Address</FieldHeader>
              <FieldValueRow>
                <Text variant="Label02">
                  <Truncated>{inscription.owner}</Truncated>
                </Text>
                <div className="flex gap-0 items-center">
                  <DuplicateIcon clipboardText={inscription.owner} />
                  <ExternalLinkIcon href={`https://mempool.space/address/${inscription.owner}`} />
                </div>
              </FieldValueRow>
            </Row>
            <Divider />
            {wrapper && (
              <>
                <Row>
                  <FieldHeader>Name Wrapper</FieldHeader>
                  <FieldValueRow>
                    <Text variant="Label02">
                      <Truncated>{wrapper}</Truncated>
                    </Text>
                    <div className="flex gap-0 items-center">
                      <DuplicateIcon clipboardText={wrapper} />
                      <ExternalLinkIcon
                        href={`https://explorer.stacks.co/address/${wrapper}?chain=mainnet`}
                      />
                    </div>
                  </FieldValueRow>
                </Row>
                <Divider />
              </>
            )}
          </>
        )}

        <Row>
          <FieldHeader>Stacks Address</FieldHeader>
          <FieldValueRow>
            <Text variant="Label02">
              <Truncated>{nameDetails.address}</Truncated>
            </Text>
            <div className="flex gap-0 items-center">
              <DuplicateIcon clipboardText={nameDetails.address} />
              <ExternalLinkIcon
                href={`https://explorer.stacks.co/address/${nameDetails.address}?chain=mainnet`}
              />
            </div>
          </FieldValueRow>
        </Row>
        <Divider />
        {nameDetails.zonefileRecords.btcAddress && (
          <>
            <Row>
              <FieldHeader>Bitcoin Address</FieldHeader>
              <FieldValueRow>
                <Text variant="Label02">
                  <Truncated>{nameDetails.zonefileRecords.btcAddress}</Truncated>
                </Text>
                <div className="flex gap-0 items-center">
                  <DuplicateIcon clipboardText={nameDetails.zonefileRecords.btcAddress} />
                  <ExternalLinkIcon
                    href={`https://mempool.space/address/${nameDetails.zonefileRecords.btcAddress}`}
                  />
                </div>
              </FieldValueRow>
            </Row>
            <Divider />
          </>
        )}
        <Row>
          <FieldHeader>Registration price</FieldHeader>
          <FieldValueRow>
            <Text variant="Label02">
              {registrationPrice.toFormat()} <span className="text-subdued">STX</span>
            </Text>
          </FieldValueRow>
        </Row>
        <Divider />
        <Row>
          <FieldHeader>Most recent name update</FieldHeader>
          <FieldValueRow>
            <Text variant="Label02">
              <Truncated>{nameDetails.last_txid}</Truncated>
            </Text>
            <div className="flex gap-0 items-center">
              <DuplicateIcon clipboardText={nameDetails.last_txid} />
              <ExternalTx txId={nameDetails.last_txid} />
            </div>
          </FieldValueRow>
        </Row>
        <Divider />
        <Row>
          <div className="flex gap-5 items-center">
            <FieldHeader>Zonefile</FieldHeader>
            {nameDetails.zonefile && <DuplicateIcon clipboardText={nameDetails.zonefile} />}
          </div>
          <div className="mb-4">
            <a
              href="https://docs.bns.xyz/docs/zonefiles/"
              target="_blank"
              rel="noreferrer"
              className={cn(badgeVariants({ variant: 'secondary' }))}
            >
              Learn more about zonefiles
            </a>
          </div>
          {!nameDetails.zonefile ? (
            <Text variant="Caption01" className="text-text-subdued">
              No zonefile found
            </Text>
          ) : (
            <Tabs defaultValue="parsed">
              <TabsList>
                <TabsTrigger value="parsed">Parsed</TabsTrigger>
                <TabsTrigger value="raw">Raw</TabsTrigger>
              </TabsList>
              <TabsContent value="parsed">
                <ZonefileTable zonefile={nameDetails.zonefile} />
              </TabsContent>
              <TabsContent value="raw">
                <CodeBlock className="py-3 max-w-[600px]">{nameDetails.zonefile}</CodeBlock>
              </TabsContent>
            </Tabs>
          )}
        </Row>
        <Divider />
      </div>
    </div>
  );
};
