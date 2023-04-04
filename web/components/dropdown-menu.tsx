import React, { useState } from 'react';
import { styled } from '@common/theme';
import Tippy from '@tippyjs/react/headless';
import { useSpring, animated } from 'react-spring';
import type { BoxProps } from '@nelson-ui/react';
import { Box, Stack, Flex } from '@nelson-ui/react';
import { Text } from '@components/text';
import { btnShiftActiveProps } from '@components/button';

export const PopoverOption: React.FC<BoxProps> = ({ children, onClick }) => {
  return (
    <Box
      px="12px"
      py="10px"
      onClick={onClick}
      cursor="pointer"
      _hover={{ backgroundColor: '$surface-surface--hovered' }}
      _active={{
        backgroundColor: '$surface-surface--pressed',
      }}
    >
      <Text variant="Body02">{children}</Text>
    </Box>
  );
};

const MenuContainerStyled = styled(Box, {
  position: 'relative',
  '.menu-name:hover ~ .dropdown-btn': {
    backgroundColor: '$surface-surface',
  },
  '[data-tippy-root]': {
    transform: 'translate3d(0px, 50px, 0)',
  },
});

type OnClick = Pick<BoxProps, 'onClick'>;

type MenuButtonProps = React.ComponentProps<typeof StyledMenu>;

export type MenuProps = MenuButtonProps & {
  children: React.ReactNode;
  popover: React.ReactNode | React.ReactNode[];
  onClick?: OnClick;
};

const StyledMenu = styled(Stack, {
  '&:hover': {
    backgroundColor: '$surface-surface--hovered',
  },
});

export const DropdownMenu: React.FC<MenuProps> = ({ children, popover, ...props }) => {
  const [mouseDown, setMouseDown] = useState(false);
  const activeStyles = mouseDown ? btnShiftActiveProps : {};
  return (
    <MenuContainerStyled
      {...activeStyles}
      onMouseDown={() => setMouseDown(true)}
      onMouseUp={() => setMouseDown(false)}
    >
      <MenuButton {...props}>{children}</MenuButton>
      <MenuDropdown>{popover}</MenuDropdown>
    </MenuContainerStyled>
  );
};

export const MenuButton: React.FC<React.ComponentProps<typeof StyledMenu>> = ({
  children,
  ...props
}) => {
  return (
    <StyledMenu
      isInline
      className="menu-name"
      borderRadius="70px"
      border="1px solid $border-subdued"
      height="48px"
      cursor="pointer"
      pl="9px"
      pt="0px"
      spacing="12px"
      alignItems={'center'}
      _active={btnShiftActiveProps}
      pr="50px"
      {...props}
    >
      {children}
    </StyledMenu>
  );
};

export const MenuDropdown: React.FC<{ children: React.ReactNode | React.ReactNode[] }> = ({
  children,
}) => {
  const config = { tension: 300, friction: 25 };
  const initialStyles = { opacity: 0, transform: 'scale(0.3) translate3d(0, -150px, 0)' };
  const [props, setSpring] = useSpring(() => initialStyles);

  return (
    <Tippy
      placement="bottom-end"
      trigger="click"
      interactive
      render={() => <PopoverContainer style={props}>{children}</PopoverContainer>}
      onMount={() => {
        setSpring({
          opacity: 1,
          transform: 'scale(1) translate3d(0, 0px, 0)',
          // onRest: () => {},
          config: { ...config, clamp: false },
        });
      }}
      onHide={instance => {
        setSpring({
          ...initialStyles,
          onRest() {
            instance.unmount();
          },
          config: { ...config, clamp: true },
          // config,
        });
      }}
    >
      <Flex
        size="32px"
        backgroundColor="$surface-subdued"
        cursor={'pointer'}
        // pl="9px"
        borderRadius="50%"
        alignItems={'center'}
        className="dropdown-btn"
        justifyContent="center"
        position={'absolute'}
        right="9px"
        top="8px"
        pt="1px"
        _hover={{
          backgroundColor: '$surface--hovered',
        }}
      >
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0.999999 1L5 5L9 0.999999"
            stroke="#9A9A9A"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Flex>
    </Tippy>
  );
};

const PopoverContainer = styled(animated.div, {
  width: '168px',
  border: '1px solid $onSurface-border',
  borderRadius: '10px',
  padding: '8px',
  backgroundColor: '$surface-surface',
  marginTop: '8px',
});
