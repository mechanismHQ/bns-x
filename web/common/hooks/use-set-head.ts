import { docTitleState, pageDescriptionState } from '@store/index';
import { useAtomCallback, useUpdateAtom } from 'jotai/utils';
import { useCallback, useEffect } from 'react';

export function useSetHead(meta: { title: string; description?: string }) {
  const { title, description } = meta;

  const setHead = useAtomCallback(
    useCallback(
      (get, set) => {
        set(docTitleState, title);
        set(pageDescriptionState, description ?? '');
      },
      [title, description]
    )
  );

  useEffect(() => {
    void setHead();
  }, [setHead]);
}
