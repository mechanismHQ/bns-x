import React from 'react';
import { Text } from '@components/ui/text';
import { truncateMiddle } from '@common/utils';
import { DuplicateIcon } from '@components/icons/duplicate';

export const Divider: React.FC<{ children?: React.ReactNode }> = () => {
  return <div className="w-full h-px bg-border-subdued"></div>;
};

export const Row: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div className="flex flex-col gap-0 py-7">{children}</div>;
};

export const FieldHeader: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <Text variant="Label01" className="text-text-subdued">
      {children}
    </Text>
  );
};

export const Truncated: React.FC<{ children: string }> = ({ children }) => {
  if (children.length <= 40) return <>{children}</>;
  const truncated = truncateMiddle(children, 8);
  if (children.length > 60) {
    const truncatedBig = children.includes('.')
      ? truncateMiddle(children, 6)
      : truncateMiddle(children, 20);
    return (
      <>
        <span className="font-mono hidden sm:inline-block">{truncatedBig}</span>
        <span className="font-mono sm:hidden">{truncated}</span>
      </>
    );
  }
  return (
    <>
      <span className="font-mono hidden sm:inline-block">{children}</span>
      <span className="font-mono sm:hidden">{truncated}</span>
    </>
  );
};

export const FieldValueRow: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div className="flex gap-3 items-center min-h-[40px]">{children}</div>;
};

export const FieldValue: React.FC<{ children: React.ReactNode; copyText?: string }> = ({
  children,
  copyText,
}) => {
  return (
    <FieldValueRow>
      <Text variant="Label02">{children}</Text>
      {typeof copyText !== 'undefined' && <DuplicateIcon clipboardText={copyText} />}
    </FieldValueRow>
  );
};

export const FieldValueTruncated: React.FC<{ children: string }> = ({ children }) => {
  return (
    <FieldValue copyText={children}>
      <Truncated>{children}</Truncated>
    </FieldValue>
  );
};
