import React, { useMemo, useState } from 'react';
import { Stack, Box } from '@nelson-ui/react';
import { Text } from '@components/text';
import { useInput } from '@common/hooks/use-input';
import { Input } from '@components/form';
import {
  debugCodePoints,
  fullDisplayName,
  hasInvalidExtraZwj,
  toPunycode,
  toUnicode,
} from '@bns-x/punycode';
import { Button } from '@components/button';
import { hashAtom } from '@store/migration';
import { useAtom } from 'jotai';

const punyInput = hashAtom('input', '');

export const Punycode: React.FC<{ children?: React.ReactNode }> = () => {
  const input = useInput(useAtom(punyInput));
  // const [inputType, setInputType] = useState<'unicode' | 'punycode'>('punycode');

  const inputValue = useMemo(() => {
    return input.value ?? '';
  }, [input.value]);

  const inputType = useMemo(() => {
    return inputValue.startsWith('xn--') ? 'punycode' : 'unicode';
  }, [inputValue]);

  const output = useMemo(() => {
    if (inputType === 'punycode') {
      return toUnicode(inputValue);
    }
    return toPunycode(inputValue);
  }, [inputValue, inputType]);

  const unicode = useMemo(() => {
    return inputType === 'unicode' ? inputValue : output;
  }, [inputValue, inputType, output]);

  const displayName = useMemo(() => {
    if (inputType === 'punycode') {
      return fullDisplayName(inputValue);
    }
    return fullDisplayName(output);
  }, [inputType, output, inputValue]);

  const hasInvalidZwj = useMemo(() => {
    return hasInvalidExtraZwj(unicode);
  }, [unicode]);

  const bytes = useMemo(() => {
    // const value = inputType === 'unicode' ? input.value : output;
    const bytes = debugCodePoints(unicode.split('.')[0]!);
    const items = bytes.split(' ').map((b, i) => {
      return (
        <Text variant="Caption01" display="inline" key={`bytes-${i}`} lineHeight="0px">
          <pre>
            {'{'}
            {b}
            {'}'}
          </pre>
        </Text>
      );
    });
    return (
      <Stack isInline spacing="5px">
        {items}
      </Stack>
    );
  }, [unicode]);

  function Example({ text, invalid = false }: { text: string; invalid?: boolean }) {
    return (
      <Button
        secondary
        borderColor={invalid ? '#a24e4e !important' : undefined}
        onClick={() => {
          input.setter(text);
        }}
      >
        {text}
      </Button>
    );
  }
  return (
    <Stack spacing="20px" px="29px">
      <Text variant="Heading02">Punycode debugger</Text>
      <Stack spacing="5px">
        <Text variant="Body01">Enter punycode or Unicode:</Text>
        <Input placeholder={"Try '❤️.btc' or 'xn--1ug66vku9r8p9h'"} {...input} />
      </Stack>

      <Stack isInline spacing="10px">
        <Example text="❤️.btc" />
        <Example text="xn--1ug2145p8xd.btc" invalid />
        <Example text="0️⃣" />
      </Stack>

      <Stack spacing="5px">
        <Text variant="Caption01">Output</Text>
        <Text variant="Body01">{output}</Text>
      </Stack>
      <Stack spacing="0px">
        <Text variant="Caption01">Raw bytes:</Text>
        {bytes}
      </Stack>
      {displayName && displayName !== output && (
        <Stack spacing="5px">
          <Text variant="Caption01">Display Name</Text>
          <Text variant="Body01">{displayName}</Text>
        </Stack>
      )}
      <Stack spacing="5px">
        <Text variant="Caption01">Invalid extra ZWJ?</Text>
        <Text variant="Body01">{hasInvalidZwj ? 'true' : 'false'}</Text>
      </Stack>
    </Stack>
  );
};
