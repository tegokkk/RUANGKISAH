import { readMotionConfig } from '@/config/motionConfig';
import { useEffect, useState } from 'react';

export function usePresence(open, duration) {
  const [retained, setRetained] = useState(open);
  useEffect(() => {
    if (open) {
      setRetained(true);
      return undefined;
    }
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const timeout = setTimeout(
      () => setRetained(false),
      reduced ? 0 : (duration ?? readMotionConfig().overlay)
    );
    return () => clearTimeout(timeout);
  }, [open, duration]);
  return open || retained;
}
