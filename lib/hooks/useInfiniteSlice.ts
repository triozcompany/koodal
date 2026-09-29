'use client';
import { useCallback, useState } from 'react';

/** Progressive reveal over an already-loaded list (issues are one live Firestore
 * subscription, so there is nothing to page from the server). `resetKey` changes → back to page 1. */
export function useInfiniteSlice<T>(items: T[], resetKey: string, pageSize = 12) {
  const [st, setSt] = useState({ k: resetKey, n: pageSize });
  const n = st.k === resetKey ? st.n : pageSize;
  const loadMore = useCallback(() => setSt({ k: resetKey, n: n + pageSize }), [resetKey, n, pageSize]);
  return { visible: items.slice(0, n), hasMore: n < items.length, loadMore };
}
