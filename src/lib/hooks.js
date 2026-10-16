import { useCallback, useEffect, useState } from 'react';

/** Muat data dari fungsi async; kembalikan {data, loading, error, reload}. */
export function useLoad(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const run = useCallback(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: '' }));
    loader()
      .then((data) => alive && setState({ data, loading: false, error: '' }))
      .catch((e) => alive && setState({ data: null, loading: false, error: e.message }));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => run(), [run]);
  return { ...state, reload: run };
}
