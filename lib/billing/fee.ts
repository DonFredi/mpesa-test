export function calculateFee(amount: number) {
  const rate = 0.01;
  if (!amount || amount <= 0) return 0;

  return Math.round(amount * rate);
}
