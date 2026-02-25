import { commonParsers } from '@/lib/search-params';
import type {
  PaginationState,
  SortingState,
  Updater,
} from '@tanstack/react-table';
import { useQueryStates } from 'nuqs';
import { useCallback } from 'react';

export default function useSearchParams() {
  const [queryParams, setQueryParams] = useQueryStates(
    {
      q: commonParsers.q,
      qKey: commonParsers.qKey,
      pageIndex: commonParsers.pageIndex,
      pageSize: commonParsers.pageSize,
      sorting: commonParsers.sorting,
    },
    { history: 'push', shallow: false }
  );

  const setQuery = useCallback(
    (newParams: Partial<typeof queryParams>) => {
      setQueryParams((prev) => {
        const newQueryParams = {
          ...prev,
          ...newParams,
          pageIndex: 0,
        };
        return newQueryParams;
      });
    },
    [setQueryParams]
  );

  const setPagination = useCallback(
    (updaterOrValue: Updater<PaginationState>) => {
      setQueryParams((prev) => {
        const newPagination =
          typeof updaterOrValue === 'function'
            ? updaterOrValue({
                pageIndex: prev.pageIndex,
                pageSize: prev.pageSize,
              })
            : updaterOrValue;

        const newQueryParams = {
          ...prev,
          ...newPagination,
        };
        return newQueryParams;
      });
    },
    [setQueryParams]
  );

  const setSorting = useCallback(
    (updaterOrValue: Updater<SortingState>) => {
      setQueryParams((prev) => {
        const newSorting =
          typeof updaterOrValue === 'function'
            ? updaterOrValue([
                {
                  id: prev.sorting.split('.')[0],
                  desc: prev.sorting.split('.')[1] === 'desc',
                },
              ])
            : updaterOrValue;
        const newQueryParams = {
          ...prev,
          sorting: `${newSorting[0].id}.${newSorting[0].desc ? 'desc' : 'asc'}`,
        };
        return newQueryParams;
      });
    },
    [setQueryParams]
  );

  return { queryParams, setQuery, setPagination, setSorting };
}
