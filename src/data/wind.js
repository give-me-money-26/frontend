export const WIND_RANGE = [1.1, 3.2];
export const HOUR_RANGE = [10, 22];

// 건물 데이터가 없을 때 그래프 기본 곡선의 시간대별 에너지 밀도(W/m²)
const DEFAULT_DENSITY = [
  0, 1.7, 5.7, 10.9, 16.2, 17.6, 16.1, 13.2, 9.9, 5.8, 2.4, 0.6, 0,
];

export function hourlyStrength(series, hour) {
  const densities = series?.map((p) => p.densityWM2) ?? DEFAULT_DENSITY;
  return densities[hour - HOUR_RANGE[0]] / Math.max(...densities);
}
