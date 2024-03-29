import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Text } from '@components/ui/text';
import { inscriptionContentForName } from '@bns-x/bridge';
import {
  bridgeInscriptionIdAtom,
  bridgeWrapErrorAtom,
  bridgeWrapTxidAtom,
  inscribedNamesAtom,
} from '@store/bridge';
import { useAtom, useAtomValue } from 'jotai';
import { loadable, useAtomCallback } from 'jotai/utils';
import { useInput } from '@common/hooks/use-input';
import { CodeBlock } from '@components/code';
import { Button } from '@components/ui/button';
import { useCopyToClipboard } from 'usehooks-ts';
import { Input } from '@components/form';
import { nameDetailsAtom } from '@store/names';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { WrapTx } from '@components/p/bridge/wrap-tx';
import { useBridgeWrap } from '@common/hooks/use-bridge-wrap';
import { ReloadIcon } from '@radix-ui/react-icons';
import { useToast } from '@common/hooks/use-toast';
import { Copy, Download, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@components/ui/alert';
import { BridgeCardPreview } from '@components/p/bridge/preview';

export const BridgeWrap: React.FC<{ children?: React.ReactNode }> = () => {
  const router = useRouter();
  const name = router.query.name as string;
  const inscriptionId = useInput(useAtom(bridgeInscriptionIdAtom));
  const inscribedNames = useAtomValue(inscribedNamesAtom);
  const wrapTxid = useAtomValue(bridgeWrapTxidAtom);
  const wrapError = useAtomValue(bridgeWrapErrorAtom);

  useDeepCompareEffect(() => {
    console.log(inscribedNames);
  }, [inscribedNames]);

  const inscriptionContent = useMemo(() => {
    return inscriptionContentForName(name);
  }, [name]);

  const [_, copyInscription] = useCopyToClipboard();
  // prefetch:
  useAtomValue(loadable(nameDetailsAtom(name)));
  const { toast } = useToast();

  const copyToClipboard = useCallback(async () => {
    await copyInscription(inscriptionContent);
    toast({
      title: 'Copied to clipboard',
    });
  }, [inscriptionContent, copyInscription, toast]);

  const download = useAtomCallback(
    useCallback(() => {
      const lines = inscriptionContent.replace(/\n/g, '\r\n');
      const file = new Blob([lines], { type: 'text/html' });
      const element = document.createElement('a');
      element.href = URL.createObjectURL(file);
      element.download = `${name.replaceAll('.', '-')}-inscription.html`;
      // element.style.position = 'abolute';
      document.body.appendChild(element);
      element.click();
    }, [inscriptionContent, name])
  );

  const { fetchSignature, isPending } = useBridgeWrap();
  return (
    <div className="w-full px-[29px] flex justify-center">
      <div className="flex gap-5 flex-col w-full max-w-[800px]">
        {wrapTxid ? (
          <WrapTx />
        ) : (
          <>
            <Text variant="Heading02">
              Bridge <span className="font-mono">{name}</span> to Bitcoin
            </Text>
            <Text variant="Body01" className="underline font-bold text-dark-primary-action-primary">
              <a
                href="https://docs.bns.xyz/docs/l1-bridge/overview/"
                target="_blank"
                rel="noreferrer"
              >
                Learn more
              </a>
            </Text>
            <Text variant="Heading035">Step 1: Inscribe your name</Text>
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex flex-col gap-5 w-full sm:w-3/4">
                <Alert variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Heads up!</AlertTitle>
                  <div className="flex flex-col gap-3">
                    <AlertDescription>
                      Inscriptions must be uploaded as HTML file types in order to be valid. The
                      content type must be{' '}
                      <span className="font-mono py-px px-1 bg-surface-surface-selected rounded-sm">
                        text/html;charset=utf-8
                      </span>{' '}
                      to work properly.
                    </AlertDescription>
                    <AlertDescription>
                      Please be aware that many inscription services don&apos;t support HTML
                      inscriptions.
                    </AlertDescription>
                    <AlertDescription>
                      We recommend using{' '}
                      <a
                        target="_blank"
                        href="https://ordinalswallet.com"
                        rel="noreferrer"
                        className="underline font-bold"
                      >
                        Ordinals Wallet
                      </a>
                      {' or '}
                      <a
                        target="_blank"
                        href="https://ordinalsbot.com"
                        rel="noreferrer"
                        className="underline font-bold"
                      >
                        OrdinalsBot
                      </a>{' '}
                      to inscribe your name.{' '}
                    </AlertDescription>
                    <AlertDescription>
                      <a
                        href="https://docs.bns.xyz/docs/l1-bridge/how-to-bridge-l1/"
                        target="_blank"
                        rel="noreferrer"
                        className="underline font-bold"
                      >
                        Learn more
                      </a>
                    </AlertDescription>
                  </div>
                </Alert>
                <Text variant="Body01">Create a new inscription with the following content:</Text>
                <CodeBlock tabIndex={0} className="p-3 select-all focus:animate-select">
                  {inscriptionContent}
                </CodeBlock>
                <div className="flex gap-5">
                  <Button variant="secondary" onClick={copyToClipboard}>
                    <Copy className="w-3 h-3 mr-2" />
                    <span className="hidden sm:inline-block">Copy to Clipboard</span>
                    <span className="inline-block sm:hidden">Copy</span>
                  </Button>
                  <Button variant="secondary" onClick={download}>
                    <Download className="w-3 h-3 mr-2" />
                    <span className="hidden sm:inline-block">Download file</span>
                    <span className="inline-block sm:hidden">Download</span>
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full sm:w-1/4">
                <div className="w-full aspect-square rounded-sm overflow-hidden">
                  <BridgeCardPreview name={name} />
                </div>
                <Text variant="Caption02">Preview of the inscription</Text>
              </div>
            </div>

            <Text variant="Heading035">Step 2: Submit your inscription</Text>
            <Text variant="Body01">
              Once your inscription is created, submit it to the bridge by entering the inscription
              ID:
            </Text>
            <Input placeholder="Enter your inscription ID" {...inscriptionId.props}></Input>
            {wrapError && (
              <Text variant="Caption01" className="!text-text-error">
                Error: {wrapError}
              </Text>
            )}
            <div className="flex">
              <Button size="xl" disabled={isPending} onClick={fetchSignature}>
                {isPending && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
                Submit
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
