export const NAVIGATION_SPRING = { type: 'spring', stiffness: 420, damping: 36, mass: 0.8 };
export function readMotionConfig() {
  const style = getComputedStyle(document.documentElement);
  return {
    base: parseFloat(style.getPropertyValue('--duration-base')) || 240,
    reveal: parseFloat(style.getPropertyValue('--duration-reveal')) || 360,
    overlay: parseFloat(style.getPropertyValue('--duration-overlay')) || 180,
    ease: style.getPropertyValue('--motion-ease').trim() || 'ease-out',
  };
}
