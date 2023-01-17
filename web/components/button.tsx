import { Text } from '@components/text';
import { Box, BoxProps } from '@nelson-ui/react';
import { styled, VariantProps } from '@stitches/react';

export const ButtonComp = styled(Box, {
  padding: '14px 24px',
  borderRadius: '50px',
  textAlign: 'center',
  cursor: 'pointer',
  // maxWidth: '200px',
  display: 'inline-block',
  backgroundColor: '$text',
  color: '$surface-surface',
  fontFamily: 'Inter',
  fontSize: '14px',
  '&:hover': {
    backgroundColor: '$grey-100',
  },
  variants: {
    disabled: {
      true: {
        backgroundColor: '$primary-action-subdued',
        color: '$onSurface-text-subdued',
        '&:hover': {
          backgroundColor: '$primary-action-subdued',
          color: '$onSurface-text-subdued',
        },
        pointerEvents: 'none',
      },
    },
  },
});

export const Button: React.FC<
  BoxProps &
    VariantProps<typeof ButtonComp> & {
      magic?: boolean;
    }
> = ({ children, ...props }) => {
  return (
    <ButtonComp {...props}>
      <Text
        // variant="Label01"
        color="inherit"
        fontSize="14px !important"
        lineHeight="20px !important"
      >
        {children}
      </Text>
    </ButtonComp>
  );
};
