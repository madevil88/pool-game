export const getRandomRange = (min: number, max: number): number =>
  Math.floor(
    (globalThis.crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296) *
      (max - min + 1),
  ) + min;

export const getRandomColor = (): string =>
  `rgb(${getRandomRange(0, 255)}, ${getRandomRange(0, 255)}, ${getRandomRange(150, 170)})`;

export const computeSwipeForce = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): { x: number; y: number } => {
  const maxPixels = 150;
  const dx = endX - startX;
  const dy = endY - startY;
  const dist = Math.hypot(dx, dy);
  if (dist === 0) return { x: 0, y: 0 };
  const ratio = Math.min(dist, maxPixels) / maxPixels;
  return {
    x: -(dx / dist) * ratio,
    y: -(dy / dist) * ratio,
  };
};
