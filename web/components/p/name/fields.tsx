import React from 'react';
import { Text } from '@components/ui/text';
import { truncateMiddle } from '@common/utils';
import { DuplicateIcon } from '@components/icons/duplicate';

export const Divider: React.FC<{ children?: React.ReactNode }> = () => {
  return <div className="w-full h-px bg-border-subdued"></div>;
};

export const Row: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div className="flex flex-col gap-3 py-7">{children}</div>;
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
  return (
    <>
      <span className="hidden sm:inline-block">{children}</span>
      <span className="sm:hidden">{truncated}</span>
    </>
  );
};

export const FieldValueRow: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div className="flex gap-7 items-center">{children}</div>;
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
