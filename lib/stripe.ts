import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

export const getStripe = () => stripePromise;

export async function createPaymentIntent(amount: number, currency = "USD", metadata?: Record<string, string>) {
  const response = await fetch("/api/payments/create-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, currency, metadata }),
  });

  if (!response.ok) {
    throw new Error("Failed to create payment intent");
  }

  return response.json();
}
