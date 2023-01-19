import { Text } from '@components/text';
import { Box, BoxProps } from '@nelson-ui/react';
import { styled, VariantProps } from '@stitches/react';

export const ButtonComp = styled(Box, {
  padding: '14px 24px',
  borderRadius: '50px',
  textAlign: 'center',
  cursor: 'pointer',
  display: 'inline-block',
  backgroundColor: '$text',
  color: '$surface-surface',
  '&:hover': {
    backgroundColor: '$slate-300',
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
    type: {
      big: {
        padding: '20px 24px',
        width: '260px',
        borderRadius: '50px',
      },
    },
    secondary: {
      true: {
        border: '1px solid $onSurface-border',
        background: 'none',
        color: '$text',
        '&:hover': {
          background: 'none',
        },
      },
    },
  },
});

export const Button: React.FC<
  BoxProps &
    VariantProps<typeof ButtonComp> & {
      magic?: boolean;
    }
> = ({ children, type, ...props }) => {
  return (
    <ButtonComp {...props} type={type}>
      <Text
        className="button-text"
        variant={type === 'big' ? 'Label01' : 'Label02'}
        color="inherit"
      >
        {children}
      </Text>
    </ButtonComp>
  );
};
