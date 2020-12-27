import { useCallback, useState } from 'react';

export function useForceUpdate() {
  const [_, setNonce] = useState(Math.random());
  return useCallback(() => setNonce(Math.random()), []);
}
