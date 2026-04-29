const rateMap = new Map<string, { count: number; timestamp: number }>();
export function checkRateLimit(clientId: string, limit = 10, windowMs = 1000): boolean {
  const now = Date.now();
  const record = rateMap.get(clientId);
  if (!record) {
    rateMap.set(clientId, { count: 1, timestamp: now });
    return true;
  }

  if (now - record.timestamp > windowMs) {
    rateMap.set(clientId, { count: 1, timestamp: now });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}
