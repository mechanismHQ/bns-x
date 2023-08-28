import type { BoxProps } from '@nelson-ui/react';
import { Box } from '@nelson-ui/react';
import { Text } from '@components/text';

export const CodeBlock: React.FC<BoxProps & { children?: React.ReactNode }> = ({
  children,
  ...props
}) => {
  return (
    <Box
      backgroundColor="$primary-action-subdued"
      // maxWidth="500px"
      borderRadius="5px"
      px="12px"
      {...props}
    >
      <Text variant="Body01" whiteSpace="pre-line" wordBreak="break-all">
        <pre style={{ whiteSpace: 'pre-line', wordBreak: 'break-all' }}>
          <code>{children}</code>
        </pre>
      </Text>
    </Box>
  );
};
