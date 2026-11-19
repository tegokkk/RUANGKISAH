import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

// Lazy route modules can require a cold Vite transform before rendering.
configure({ asyncUtilTimeout: 5000 });

if (typeof window !== 'undefined') {
  window.scrollTo = () => {};
  const NativeRequest = globalThis.Request;
  if (typeof NativeRequest === 'function') {
    globalThis.Request = class TestRequest extends NativeRequest {
      constructor(input, init) {
        if (init && typeof init === 'object' && 'signal' in init) {
          const { signal: _signal, ...rest } = init;
          super(input, rest);
        } else {
          super(input, init);
        }
      }
    };
  }
}

beforeEach(() => {
  Object.defineProperty(navigator, 'locks', {
    configurable: true,
    value: { request: async (_name, task) => task() },
  });
});

afterEach(() => {
  cleanup();
});
