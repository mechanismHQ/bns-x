import React, { useCallback } from 'react';
import { Stack, Box, Flex, SpaceBetween } from '@nelson-ui/react';
import { Text } from '../../text';
import { useAtomValue } from 'jotai';
import { Button } from '@components/button';
import { Button as Beutton } from '@components/ui/button';
import { useRouter } from 'next/router';
import { useGradient } from '@common/hooks/use-gradient';
import { stxAddressAtom } from '@store/micro-stacks';
import { truncateMiddle } from '@common/utils';
import { BoxLink, LinkText } from '@components/link';
import { styled } from '@common/theme';
import { usePunycode } from '@common/hooks/use-punycode';
import { useAccountPath } from '@common/hooks/use-account-path';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { L1_ENABLED } from '@common/constants';

export const ProfileActions: React.FC<{
  children?: React.ReactNode;
  v1?: boolean;
  name: string;
}> = ({ name, v1 = false }) => {
  const upgradePath = useAccountPath('/upgrade');
  const namePath = useAccountPath(`/manage/[name]`, { name });
  const bridgePath = useAccountPath('/bridge/[name]', { name });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Beutton size="lg" variant="outline">
          Actions
          <ChevronDown className="ml-1 w-3" />
        </Beutton>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {L1_ENABLED && (
          <BoxLink href={bridgePath}>
            <DropdownMenuItem className="cursor-pointer">Bridge to L1</DropdownMenuItem>
          </BoxLink>
        )}
        {v1 && (
          <BoxLink href={upgradePath}>
            <DropdownMenuItem className="cursor-pointer">Upgrade</DropdownMenuItem>
          </BoxLink>
        )}
        <BoxLink href={namePath}>
          <DropdownMenuItem className="cursor-pointer">Manage</DropdownMenuItem>
        </BoxLink>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const StyledName = styled(Text, {
  // initial: {
  fontSize: '28px',
  lineHeight: '44px',
  // },
  '@bp1': {
    fontSize: '22px',
    lineHeight: '36px',
  },
});

const StyledEditBox = styled(Box, {
  display: 'block',
  '@bp1': {
    display: 'none',
  },
});

const StyledAvatar = styled(Box, {
  width: '86px',
  height: '86px',
  // '@bp1': {
  //   width: '40px',
  //   height: '40px',
  // },
});

export const ProfileRow: React.FC<{
  children?: React.ReactNode;
  v1?: boolean;
  name: string;
}> = ({ v1 = false, name }) => {
  const nameString = usePunycode(name);
  const router = useRouter();
  const gradient = useGradient(name);
  const upgradePath = useAccountPath('/upgrade');

  const upgrade = useCallback(async () => {
    await router.push(upgradePath);
  }, [router, upgradePath]);

  const namePath = useAccountPath(`/manage/[name]`, { name });

  const manage = useCallback(async () => {
    await router.push(namePath);
  }, [router, namePath]);
  const stxAddress = useAtomValue(stxAddressAtom);

  return (
    <SpaceBetween isInline alignItems={'center'} width="100%" height="136px" px="29px">
      <Stack alignItems={'center'} isInline>
        <StyledAvatar
          borderRadius="50%"
          aspectRatio="1"
          maxWidth="86px"
          maxHeight="86px"
          backgroundImage={gradient}
          onClick={async () => {
            if (v1) {
              await upgrade();
            } else {
              await manage();
            }
          }}
        />
        <Stack spacing="6px">
          <StyledName variant="Heading035" color={'$text'}>
            {nameString}
          </StyledName>
          <div className="flex flex-row gap-[27px] h-[27px] items-baseline">
            <LinkText
              href={`https://explorer.stacks.co/address/${stxAddress ?? ''}`}
              target="_blank"
              variant="Body02"
              color={'$onSurface-text-subdued'}
            >
              {truncateMiddle(stxAddress || '')}
            </LinkText>
            <Text variant="Body02" height="20px" color={'$onSurface-text-subdued'}>
              {v1 ? 'BNS Core' : 'BNSx'}
            </Text>
          </div>
        </Stack>
      </Stack>
      <StyledEditBox>
        <ProfileActions v1={v1} name={name} />
      </StyledEditBox>
    </SpaceBetween>
  );
};
