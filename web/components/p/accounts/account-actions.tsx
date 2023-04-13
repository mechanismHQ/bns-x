import React, { Suspense, memo, useCallback, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import type { Account } from '@store/micro-stacks';
import { AccountProgress, accountProgressStatusState } from '@store/accounts';
import { BoxLink } from '@components/link';
import { useSetPrimaryAccount } from '@common/hooks/use-set-primary-account';
import { useRemoveAccount } from '@common/hooks/use-remove-account';
import type { ButtonProps } from '@components/ui/beutton';
import { Beutton } from '@components/ui/beutton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { ChevronDown, Play } from 'lucide-react';
import { useDeployWrapper } from '@common/hooks/use-deploy-wrapper';
import { isMainnetState } from '@store/index';
import { useWrapperMigrateInstant } from '@common/hooks/use-instant-wrapper-migrate';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@components/ui/tooltip';

function actionStyle({
  label,
  className,
  status,
}: {
  label: string;
  className?: string;
  status?: ButtonProps['status'];
}) {
  return {
    label,
    className,
    status,
  };
}

function useInstantTx(account: Account, status: AccountProgress) {
  const { deploy } = useDeployWrapper(account);
  const { migrate } = useWrapperMigrateInstant(account);

  const hasNextTx = useMemo(() => {
    return status === AccountProgress.NotStarted || status === AccountProgress.WrapperDeployed;
  }, [status]);

  const openNextTx = useCallback(async () => {
    if (status === AccountProgress.NotStarted) {
      await deploy();
    } else if (status === AccountProgress.WrapperDeployed) {
      await migrate();
    }
  }, [status, deploy, migrate]);

  return {
    hasNextTx,
    openNextTx,
  };
}

export const AccountActions: React.FC<{ account: Account }> = ({ account }) => {
  const pathBase = '/accounts/[address]';
  const query = { address: account.stxAddress };
  const { setPrimary } = useSetPrimaryAccount();
  const { removeAccount } = useRemoveAccount();
  const status = useAtomValue(accountProgressStatusState(account.stxAddress));
  const { hasNextTx, openNextTx } = useInstantTx(account, status);
  const isMainnet = useAtomValue(isMainnetState);

  const migrateOptionMessage = useMemo(() => {
    switch (status) {
      case AccountProgress.NoName:
        return null;
      case AccountProgress.NotStarted:
        return 'Migrate to BNSx';
      case AccountProgress.Done:
        return 'View migration';
    }
    return 'Continue migration';
  }, [status]);

  const actionLabel = useMemo(() => {
    switch (status) {
      case AccountProgress.NoName:
        return actionStyle({ label: 'Manage' });
      case AccountProgress.NotStarted:
        return actionStyle({ label: 'Ready to start' });
      case AccountProgress.Done:
        return actionStyle({ label: 'Finished', status: 'success' });
      case AccountProgress.FinalizePending:
        return actionStyle({ label: 'Migration pending', status: 'pending' });
      case AccountProgress.WrapperDeployPending:
        return actionStyle({ label: 'Wrapper pending', status: 'pending' });
      case AccountProgress.WrapperDeployed:
        return actionStyle({ label: 'Ready to finish', status: 'success' });
    }
  }, [status]);

  return (
    <div className="flex gap-4 items-center">
      {hasNextTx && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Beutton variant="ghost" size="sm" onClick={openNextTx}>
                <Play className="h-4" color={'var(--colors-text-dim)'} />
              </Beutton>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {status === AccountProgress.NotStarted
                  ? 'Deploy wrapper contract'
                  : 'Finalize migration'}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Beutton
            size="sm"
            variant="outline"
            status={actionLabel.status}
            className={actionLabel.className}
          >
            {actionLabel.label}
            <ChevronDown className="ml-1 w-3" />
          </Beutton>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {migrateOptionMessage !== null && (
            <BoxLink href={{ pathname: `${pathBase}/upgrade`, query }}>
              <DropdownMenuItem>{migrateOptionMessage}</DropdownMenuItem>
            </BoxLink>
          )}
          {!isMainnet && (
            <BoxLink href={{ pathname: `${pathBase}/faucet`, query }}>
              <DropdownMenuItem>Faucet</DropdownMenuItem>
            </BoxLink>
          )}
          <BoxLink href={{ pathname: pathBase, query }}>
            <DropdownMenuItem>Manage account</DropdownMenuItem>
          </BoxLink>
          <DropdownMenuItem
            onClick={async () => {
              await setPrimary(account.index);
            }}
          >
            Set as primary
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              await removeAccount(account);
            }}
          >
            Remove account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
