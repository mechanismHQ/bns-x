import React from 'react';
import { Box } from '@nelson-ui/react';
import type { BoxProps } from '@nelson-ui/react';
import { CopyTooltip } from '../copy-tooltip';
import { Copy } from 'lucide-react';

interface DuplicateProps extends BoxProps {
  clipboardText?: string;
  copyLabel?: string;
}

export const DuplicateIcon: React.FC<DuplicateProps> = ({ clipboardText, copyLabel, ...props }) => {
  return (
    <CopyTooltip
      copyText={clipboardText || ''}
      copyLabeL={copyLabel}
      cursor={clipboardText ? 'pointer' : 'default'}
      // height="16px"
      {...props}
    >
      <Copy className="w-[16px] aspect-square text-icon-subdued"></Copy>
    </CopyTooltip>
  );
};
