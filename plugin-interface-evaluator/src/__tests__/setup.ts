import "@testing-library/jest-dom";

// jsdom implementiert ResizeObserver nicht — @dnd-kit braucht es aber.
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// jsdom implementiert getAnimations nicht — @base-ui/react braucht es aber.
if (!Element.prototype.getAnimations) {
  Element.prototype.getAnimations = () => [];
}