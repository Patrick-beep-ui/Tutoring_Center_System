import '@testing-library/jest-dom';

// Deterministic secret for JWT-based tests. Set before any server module is
// evaluated so middleware/utils that read process.env.SECRET_KEY at import
// time use this value instead of the production secret from .env.
process.env.SECRET_KEY = process.env.SECRET_KEY || 'test-jwt-secret';

// jsdom does not implement these by default. Provide no-op stubs so that
// components importing browser-only APIs can still render in tests.
if (typeof window !== 'undefined') {
  if (!window.matchMedia) {
    window.matchMedia = (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    });
  }

  if (!window.ResizeObserver) {
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  if (!URL.createObjectURL) {
    URL.createObjectURL = () => 'blob:mock';
    URL.revokeObjectURL = () => {};
  }

  if (!window.scrollTo) {
    window.scrollTo = () => {};
  }
}
