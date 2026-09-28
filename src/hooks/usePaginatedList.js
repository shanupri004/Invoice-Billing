import { useCallback, useEffect, useRef, useState } from 'react';

// Loads a list page by page.
// `fetchPage({ page, pageSize })` must resolve to `{ rows, total }`.
// Memoize `fetchPage` with useCallback — whenever it changes (e.g. filters or
// search changed) callers should call `reload()` to start again from page 0.
export default function usePaginatedList(fetchPage, { pageSize = 20, onError } = {}) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Ignore responses from requests that were superseded by a newer reload
  const requestIdRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const load = useCallback(
    async (pageNo, { replace }) => {
      const requestId = replace ? ++requestIdRef.current : requestIdRef.current;
      const { rows, total: totalCount } = await fetchPage({ page: pageNo, pageSize });
      if (requestId !== requestIdRef.current) return;

      setItems(prev => {
        if (replace) return rows;
        const seen = new Set(prev.map(item => item.id));
        return [...prev, ...rows.filter(item => !seen.has(item.id))];
      });
      setTotal(totalCount);
      setPage(pageNo);
      setHasMore((pageNo + 1) * pageSize < totalCount);
    },
    [fetchPage, pageSize],
  );

  const reload = useCallback(async () => {
    setReloading(true);
    try {
      await load(0, { replace: true });
    } catch (error) {
      onErrorRef.current?.(error);
    } finally {
      setReloading(false);
      setInitialLoading(false);
    }
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load(0, { replace: true });
    } catch (error) {
      onErrorRef.current?.(error);
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMore || reloading || initialLoading) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      await load(page + 1, { replace: false });
    } catch (error) {
      onErrorRef.current?.(error);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [load, page, hasMore, reloading, initialLoading]);

  return {
    items,
    total,
    hasMore,
    initialLoading,
    reloading,
    refreshing,
    loadingMore,
    reload,
    refresh,
    loadMore,
  };
}

// Returns `value` only after it has stopped changing for `delay` ms
export function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
