import { useInput } from '@common/hooks/use-input';
import { searchInputAtom, searchResultsAtom } from '@store/api';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { loadable } from 'jotai/utils';
import React from 'react';
import { Button } from '@components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@components/ui/command';
import { Command as CommandPrimitive } from 'cmdk';
import { Text } from '@components/ui/text';
import { ReloadIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/router';
import { useDeepMemo } from '@common/hooks/use-deep-memo';

export const Search: React.FC<{ children?: React.ReactNode }> = () => {
  const searchResults = useAtomValue(loadable(searchResultsAtom));
  const searchInput = useAtomValue(searchInputAtom.currentValueAtom);
  const [debouncedSearch, setSearchInput] = useAtom(searchInputAtom.debouncedValueAtom);
  // const debouncedSearch = useAtomValue(searchInputAtom.debouncedValueAtom);
  // const [searchInput, setSearchInput] = useAtom(searchInputAtom.currentValueAtom);
  const [isOpen, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(open => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const searchName = React.useCallback(
    async (name: string) => {
      setOpen(false);
      setSearchInput('');
      await router.push({ query: { name }, pathname: '/names/[name]' });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setOpen]
  );

  const names = useDeepMemo(() => {
    if (searchResults.state === 'hasData') {
      return searchResults.data.map(r => r.name);
    }
    return [];
  }, [searchResults]);

  const isLoading = React.useMemo(() => {
    if (searchResults.state === 'loading') return true;
    return debouncedSearch !== searchInput;
  }, [searchResults.state, debouncedSearch, searchInput]);

  return (
    <>
      <div className="">
        <Button
          variant="outline"
          className="h-full w-full px-6 sm:w-40 lg:w-64 rounded-[50px] dark:text-text-subdued justify-between relative items-center"
          onClick={() => setOpen(true)}
        >
          <span className="hidden sm:block">Search names...</span>
          <span className="block sm:hidden">Search</span>
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border-subdued bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>
      <CommandDialog open={isOpen} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search for a name"
          value={searchInput}
          onValueChange={setSearchInput}
          isLoading={isLoading}
        />
        <CommandList>
          {names.length === 0 && <CommandEmpty>No names found</CommandEmpty>}
          {names.map(name => (
            <CommandItem key={name} onSelect={() => searchName(name)}>
              {name}
            </CommandItem>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
};
