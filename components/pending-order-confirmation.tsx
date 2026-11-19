"use client";

import { useEffect, useState } from "react";
import {
  ORDER_ATTEMPT_STORAGE_KEY,
  ORDER_WHATSAPP_OPENED_KEY,
  PENDING_ORDER_STORAGE_KEY,
  type OrderAccess,
} from "@/lib/order-confirmation";

type ResumeDetails = {
  status: string;
  message: string;
  paymentSlipUrl: string;
};

export function PendingOrderConfirmation({
  access,
  whatsappNumber,
  onConfirmed,
}: {
  access: OrderAccess;
  whatsappNumber: string;
  onConfirmed: (orderNumber: string) => void;
}) {
  const [details, setDetails] = useState<ResumeDetails | null>(null);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/orders/resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(access),
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Could not resume this order.");
        }
        if (!active) return;
        if (result.status === "SUBMITTED") {
          localStorage.removeItem(PENDING_ORDER_STORAGE_KEY);
          localStorage.removeItem(ORDER_ATTEMPT_STORAGE_KEY);
          onConfirmed(access.orderNumber);
          return;
        }
        setDetails(result);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Could not resume this order.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadOrder();
    return () => {
      active = false;
    };
  }, [access, onConfirmed]);

  async function confirmOrder() {
    setConfirming(true);
    setError("");
    try {
      const response = await fetch("/api/orders/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(access),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Could not confirm this order.");
      }
      localStorage.removeItem(PENDING_ORDER_STORAGE_KEY);
      localStorage.removeItem(ORDER_ATTEMPT_STORAGE_KEY);
      onConfirmed(access.orderNumber);
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : "Could not confirm this order.");
    } finally {
      setConfirming(false);
    }
  }

  const whatsappUrl = details
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(details.message)}`
    : undefined;

  useEffect(() => {
    if (!details || !whatsappUrl || details.status !== "PENDING_WHATSAPP") return;
    if (localStorage.getItem(ORDER_WHATSAPP_OPENED_KEY) === access.orderNumber) return;
    localStorage.setItem(ORDER_WHATSAPP_OPENED_KEY, access.orderNumber);
    window.location.assign(whatsappUrl);
  }, [access.orderNumber, details, whatsappUrl]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 p-4 sm:grid sm:place-items-center">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="pending-order-title"
        className="mx-auto my-6 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl sm:my-0 sm:p-8"
      >
        <p className="eyebrow">Order reference</p>
        <h2 id="pending-order-title" className="display mt-2 text-3xl text-[#251d22]">
          Complete your WhatsApp order
        </h2>
        <p className="mt-3 text-sm text-[#6e6065]">
          Reference: <strong className="text-[#251d22]">{access.orderNumber}</strong>
        </p>

        {loading ? (
          <p className="mt-6 text-sm text-[#6e6065]">Restoring your pending order…</p>
        ) : details ? (
          <>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <a
                href={details.paymentSlipUrl}
                target="_blank"
                rel="noreferrer"
                className="button-outline w-full text-center"
              >
                Open payment slip
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="button-dark w-full text-center"
              >
                Open / reopen WhatsApp
              </a>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#6e6065]">
              In WhatsApp, attach the payment slip image and send the pre-filled order message. Return here afterward.
            </p>

            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-[#e9dfe4] p-4 text-sm leading-6 text-[#3b2d35]">
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) => setChecked(event.target.checked)}
                className="mt-1 h-4 w-4 accent-[#694653]"
              />
              <span>
                I confirm that I have attached my payment slip and sent my order details through WhatsApp.
              </span>
            </label>

            <p className="mt-3 text-xs leading-5 text-[#6e6065]">
              This records your confirmation only. It does not verify WhatsApp delivery or payment; the company will review those manually.
            </p>
            <button
              type="button"
              disabled={!checked || confirming}
              onClick={confirmOrder}
              className="button-dark mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {confirming ? "Confirming…" : "Confirm Order"}
            </button>
          </>
        ) : (
          <button type="button" onClick={() => window.location.reload()} className="button-outline mt-6 w-full">
            Retry restoring order
          </button>
        )}

        {error && (
          <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
      </section>
    </div>
  );
}
