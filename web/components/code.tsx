import { Box } from '@nelson-ui/react';
import { Text } from '@components/text';

export const CodeBlock: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <Box
      backgroundColor="$primary-action-subdued"
      // maxWidth="500px"
      borderRadius="5px"
      px="12px"
    >
      <Text variant="Body01" whiteSpace="pre-line" wordBreak="break-all">
        <pre style={{ whiteSpace: 'pre-line', wordBreak: 'break-all' }}>{children}</pre>
      </Text>
    </Box>
  );
};
