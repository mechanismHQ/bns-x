/* eslint-disable @typescript-eslint/no-namespace */
import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'bns-card': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { n: string },
        HTMLElement
      >;
    }
  }
}

export const BridgeCardPreview: React.FC<{ children?: React.ReactNode; name: string }> = ({
  name,
}) => {
  return <bns-card n={name} />;
};
