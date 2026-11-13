export const PAYBACK_LIMIT_YEARS = 100;

export function applyTurbine(result, turbine) {
  if (!result) return null;
  const w = turbine.weight;
  const annualSavingsKrw = result.annualSavingsKrw * w;
  return {
    ...result,
    recoveredPowerW: result.recoveredPowerW * w,
    annualEnergyKwh: result.annualEnergyKwh * w,
    annualSavingsKrw,
    annualCarbonReductionKg: result.annualCarbonReductionKg * w,
    paybackYears:
      annualSavingsKrw > 0
        ? (turbine.priceKrw + turbine.installCostKrw) / annualSavingsKrw
        : null,
  };
}
