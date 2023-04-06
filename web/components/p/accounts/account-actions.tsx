import React, { Suspense, memo, useMemo } from 'react';
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
import { ChevronDown } from 'lucide-react';

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

export const AccountActions: React.FC<{ account: Account }> = ({ account }) => {
  const pathBase = '/accounts/[address]';
  const query = { address: account.stxAddress };
  const { setPrimary } = useSetPrimaryAccount();
  const { removeAccount } = useRemoveAccount();
  const status = useAtomValue(accountProgressStatusState(account.stxAddress));

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
  );
};
