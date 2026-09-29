import "@testing-library/jest-dom";

// jsdom lacks ResizeObserver, needed by @dnd-kit
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// jsdom lacks getAnimations, needed by @base-ui/react
if (!Element.prototype.getAnimations) {
  Element.prototype.getAnimations = () => [];
}