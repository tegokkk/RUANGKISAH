import { useEffect, useRef } from 'react';
export function useHeadingFocus(stateKey) {
  const ref = useRef(null);
  useEffect(() => {
    const heading = ref.current?.querySelector('h1');
    if (!heading) return;
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    heading.scrollIntoView?.({ block: 'start', behavior: 'auto' });
  }, [stateKey]);
  return ref;
}
