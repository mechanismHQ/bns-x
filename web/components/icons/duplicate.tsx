import React from 'react';
import { Box } from '@nelson-ui/react';
import type { BoxProps } from '@nelson-ui/react';
import { CopyTooltip } from '../copy-tooltip';
import { Copy, Check } from 'lucide-react';
import { useTimeout } from 'usehooks-ts';
import { Button } from '@components/ui/button';

interface DuplicateProps extends BoxProps {
  clipboardText?: string;
  copyLabel?: string;
}

export const DuplicateIcon: React.FC<DuplicateProps> = ({ clipboardText, copyLabel, ...props }) => {
  const [clicked, setClicked] = React.useState(false);
  const onClick = React.useCallback(() => {
    setClicked(true);
  }, []);
  const hide = React.useCallback(() => {
    setClicked(false);
  }, []);

  useTimeout(hide, clicked ? 1000 : null);

  const className = 'w-[16px] aspect-square text-icon-subdued';
  return (
    <CopyTooltip
      copyText={clipboardText || ''}
      copyLabeL={copyLabel}
      cursor={clipboardText ? 'pointer' : 'default'}
      onClick={onClick}
      {...props}
    >
      <Button variant="ghost" size="icon">
        {clicked ? <Check className={className} /> : <Copy className={className} />}
      </Button>
    </CopyTooltip>
  );
};
