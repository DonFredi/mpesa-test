export function shouldTriggerAlert(usage: any) {
  if (usage.totalVolume > 100000) return "HIGH_VOLUME";
  if (usage.totalFees > 1000) return "HIGH_FEES";
  return null;
}
