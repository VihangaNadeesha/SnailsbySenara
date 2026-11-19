export const PENDING_ORDER_STORAGE_KEY = "snails-pending-order";
export const ORDER_ATTEMPT_STORAGE_KEY = "snails-order-attempt";
export const ORDER_WHATSAPP_OPENED_KEY = "snails-whatsapp-opened-order";

export type OrderAccess = {
  orderNumber: string;
  resumeToken: string;
};

export type OrderAttempt = {
  idempotencyKey: string;
  resumeToken: string;
};

export function getOrCreateOrderAttempt(): OrderAttempt {
  const saved = localStorage.getItem(ORDER_ATTEMPT_STORAGE_KEY);
  if (saved) {
    try {
      const attempt = JSON.parse(saved) as Partial<OrderAttempt>;
      if (
        typeof attempt.idempotencyKey === "string" &&
        typeof attempt.resumeToken === "string"
      ) {
        return {
          idempotencyKey: attempt.idempotencyKey,
          resumeToken: attempt.resumeToken,
        };
      }
    } catch {
      localStorage.removeItem(ORDER_ATTEMPT_STORAGE_KEY);
    }
  }

  const tokenBytes = new Uint8Array(32);
  crypto.getRandomValues(tokenBytes);
  const attempt = {
    idempotencyKey: crypto.randomUUID(),
    resumeToken: Array.from(tokenBytes, (byte) => byte.toString(16).padStart(2, "0")).join(""),
  };
  localStorage.setItem(ORDER_ATTEMPT_STORAGE_KEY, JSON.stringify(attempt));
  return attempt;
}

export function saveOrderAccess(access: OrderAccess): void {
  localStorage.setItem(PENDING_ORDER_STORAGE_KEY, JSON.stringify(access));
}

export function readOrderAccess(value: string | null): OrderAccess | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<OrderAccess>;
    if (
      typeof parsed.orderNumber === "string" &&
      typeof parsed.resumeToken === "string" &&
      /^[0-9a-f]{64}$/i.test(parsed.resumeToken)
    ) {
      return { orderNumber: parsed.orderNumber, resumeToken: parsed.resumeToken };
    }
  } catch {
    return null;
  }
  return null;
}
