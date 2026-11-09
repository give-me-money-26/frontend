export const WIND_RANGE = [0, 12];

const AIR_DENSITY = 1.2;

export const windFromDensity = (density) =>
  Math.cbrt((2 * density) / AIR_DENSITY);
