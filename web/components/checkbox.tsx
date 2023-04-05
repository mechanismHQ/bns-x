import React, { useCallback } from 'react';
import type { PrimitiveAtom, WritableAtom } from 'jotai';
import { useAtomValue } from 'jotai';
import { Box } from '@nelson-ui/react';
import { useAtomCallback } from 'jotai/utils';

export const CheckboxCheckedIcon: React.FC<{ children?: React.ReactNode }> = () => {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11.6667 1H2.33333C1.59695 1 1 1.59695 1 2.33333V11.6667C1 12.403 1.59695 13 2.33333 13H11.6667C12.403 13 13 12.403 13 11.6667V2.33333C13 1.59695 12.403 1 11.6667 1Z"
        fill="#EFEFEF"
        stroke="#EFEFEF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.8134 4.69516L6.00427 9.50427L3.75 7.25"
        stroke="#0C0C0D"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const Checkbox: React.FC<{
  children?: React.ReactNode;
  atom: PrimitiveAtom<boolean> | WritableAtom<boolean, (current: boolean) => boolean>;
}> = ({ atom }) => {
  const checked = useAtomValue(atom);

  const toggleChecked = useAtomCallback(
    useCallback(
      (get, set) => {
        set(atom, cur => !cur);
      },
      [atom]
    )
  );

  if (checked)
    return (
      <Box onClick={toggleChecked} cursor="pointer">
        <CheckboxCheckedIcon />
      </Box>
    );

  return (
    <Box
      width="14px"
      height="14px"
      borderRadius={'2px'}
      border="1.5px solid $onSurface-icon-subdued"
      cursor="pointer"
      onClick={toggleChecked}
    ></Box>
  );
};
