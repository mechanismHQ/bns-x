import React, { useEffect, useState } from 'react';
import { Box, Flex } from '@nelson-ui/react';
import { start } from 'repl';

export const ProgressBar: React.FC<{ start: bigint; length: bigint }> = ({ start, length }) => {
  const [size, setSize] = useState('0%');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const nowInt = BigInt(Math.round(now / 1000));
      const diff = nowInt - start;
      const maxDiff = diff > length ? length : diff;
      const percent = (Number(maxDiff) * 100) / Number(length);
      setSize(`${percent}%`);
    }, 500);
    return () => clearInterval(interval);
  }, [setSize, length, start]);

  return (
    <Box
      width="100%"
      borderRadius="12px"
      height="50px"
      overflow="clip"
      borderWidth="1px"
      borderColor="rbga(0,0,0,0.3)"
      border="1px solid rgba(0,0,0,0.2)"
    >
      <Box width={size} height="100%" backgroundColor="gray" />
    </Box>
  );
};
