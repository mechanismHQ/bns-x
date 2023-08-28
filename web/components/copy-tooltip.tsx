import React, { useState, useCallback } from 'react';
import { useCopyToClipboard } from 'usehooks-ts';
import { TooltipTippy } from './tooltip';
import { Text } from './text';
import type { BoxProps } from '@nelson-ui/react';
import { Box } from '@nelson-ui/react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@components/ui/tooltip';
import { useToast } from '@common/hooks/use-toast';

export const CopyTooltip: React.FC<BoxProps & { copyText: string; copyLabeL?: string }> = ({
  children,
  copyText,
  copyLabeL = 'Copy',
  ...props
}) => {
  const [_, copy] = useCopyToClipboard();

  const { toast } = useToast();
  const { onClick: outerOnClick } = props;

  const onClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      void copy(copyText);
      outerOnClick?.(event);
      toast({
        title: 'Copied to clipboard',
        duration: 1000,
      });
    },
    [copy, copyText, toast, outerOnClick]
  );

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger onClick={onClick}>{children}</TooltipTrigger>
        <TooltipContent>{copyLabeL}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const CopyTooltipV1: React.FC<BoxProps & { copyText: string; copyLabeL?: string }> = ({
  children,
  copyText,
  copyLabeL = 'Copy',
  ...props
}) => {
  const [_, copy] = useCopyToClipboard();
  const [showCopied, setShowCopied] = useState(false);
  const unshowCopied = useCallback(() => {
    setShowCopied(false);
  }, [setShowCopied]);
  const onClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      setShowCopied(true);
      void copy(copyText);
    },
    [copy, copyText]
  );

  return (
    <TooltipTippy
      tippyProps={{
        trigger: 'mouseenter focus',
        followCursor: true,
        placement: 'bottom',
        hideOnClick: false,
        onHidden: unshowCopied,
      }}
      render={
        <Text variant="Caption01" color="$text">
          {showCopied ? 'Copied' : copyLabeL}
        </Text>
      }
      containerProps={{
        padding: '12px 16px',
      }}
    >
      <Box onClick={onClick} cursor="pointer" {...props}>
        {children}
      </Box>
    </TooltipTippy>
  );
};
