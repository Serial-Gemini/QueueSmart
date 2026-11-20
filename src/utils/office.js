export const effectiveStatus = (o) => (o.paused ? "Paused" : o.status);

export const acceptingQueue = (o) => !o.paused && o.status !== "Closed";

// Approximate: skipped/cancelled tickets make "waiting" run slightly high
export function queueSummary(o) {
  return {
    serving: o.servingNumber || null,
    waiting: Math.max(0, (o.lastNumber || 0) - (o.servingN || 0)),
  };
}