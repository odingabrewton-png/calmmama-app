/**
 * Cal.ai-style tab navigation performance contract.
 * Custom tab shell mirrors React Navigation screen options.
 */
export const TAB_NAV_PERF = {
  detachInactiveScreens: false,
  unmountOnBlur: false,
  freezeOnBlur: true,
};

export const LIST_PERF = {
  initialNumToRender: 4,
  maxToRenderPerBatch: 4,
  windowSize: 3,
  removeClippedSubviews: true,
};
