"use client";
import { FormEvent, useState } from "react";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { createPaymentIntent, getStripe } from "@/lib/stripe";
import type { CartItem, Settings } from "@/types";
import Image from "next/image";

const money = (n: number) => `Rs. ${n.toLocaleString("en-LK")}`;

function PaymentForm({
  cart,
  subtotal,
  settings,
  close,
  complete,
}: {
  cart: CartItem[];
  subtotal: number;
  settings: Settings;
  close: () => void;
  complete: (orderNumber: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card element not found");

      const total = subtotal + settings.delivery_fee;
      const { clientSecret } = await createPaymentIntent(total, "USD", {
        name,
        email,
        phone,
        address,
        items: JSON.stringify(cart.map(item => ({ name: item.name, quantity: item.quantity }))),
      });

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { 
            name, 
            email, 
            phone, 
            address: {
              line1: address,
              country: "LK",
            }
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message || "Payment failed");
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        const orderNumber = `ORD-${Date.now()}`;
        complete(orderNumber);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-[#fffdfd]">
      <div className="brand-shell py-6">
        <button type="button" onClick={close} className="text-sm underline text-[#251d22]">
          ← Back to cart
        </button>

        <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-5xl pb-16">
          <p className="eyebrow">Almost yours</p>
          <h2 className="display mt-3 text-4xl text-[#251d22]">Checkout</h2>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_0.85fr]">
            <div className="space-y-6">
              <fieldset>
                <legend className="mb-4 text-sm font-semibold text-[#251d22]">Delivery details</legend>
                <div className="grid gap-3">
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="field"
                    placeholder="Full name"
                  />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="field"
                    placeholder="Email address"
                  />
                  <input
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="field"
                    placeholder="Phone number"
                  />
                  <textarea
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="field min-h-28"
                    placeholder="Delivery address"
                  />
                </div>
              </fieldset>

              <section className="border-y border-[#dfd6d9] py-6">
                <h3 className="text-sm font-semibold text-[#251d22]">Payment details</h3>
                <div className="mt-4">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: "16px",
                          color: "#251d22",
                          "::placeholder": {
                            color: "#b7a7ad",
                          },
                        },
                        invalid: {
                          color: "#a1455b",
                        },
                      },
                    }}
                    className="p-3 border border-[#d8cdd3] rounded"
                  />
                </div>
              </section>

              {error && <p className="text-sm text-[#a1455b]">{error}</p>}
            </div>

            <aside className="rounded-[24px] border border-[#e9dfe4] bg-[#f8f0f2] p-6">
              <h3 className="display text-2xl text-[#251d22]">Order Summary</h3>
              <div className="mt-5 space-y-4">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex gap-3 border-b border-[#e2d4d8] pb-3">
                    <div className="relative h-16 w-16 overflow-hidden bg-[#f2e7ea]">
                      <Image
                        fill
                        src={
                          item.image || "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=300&q=80"
                        }
                        alt={item.name}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 text-sm text-[#3b2d35]">
                      <div className="font-semibold">{item.name}</div>
                      <div className="mt-1">
                        Qty: {item.quantity} · Size: {item.selectedSize}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-[#251d22]">{money(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2 text-sm">
                <p className="flex justify-between text-[#5d4d53]">
                  <span>Subtotal</span>
                  <span>{money(subtotal)}</span>
                </p>
                <p className="flex justify-between text-[#5d4d53]">
                  <span>Delivery</span>
                  <span>{money(settings.delivery_fee)}</span>
                </p>
                <p className="flex justify-between pt-2 text-base font-semibold text-[#251d22]">
                  <span>Total</span>
                  <span>{money(subtotal + settings.delivery_fee)}</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !stripe}
                className="button-dark mt-8 w-full disabled:cursor-not-allowed disabled:bg-[#b7a7ad]"
              >
                {loading ? "Processing..." : `Pay ${money(subtotal + settings.delivery_fee)}`}
              </button>
            </aside>
          </div>
        </form>
      </div>
    </div>
  );
}

export function StripeCheckout({
  cart,
  subtotal,
  settings,
  close,
  complete,
}: {
  cart: CartItem[];
  subtotal: number;
  settings: Settings;
  close: () => void;
  complete: (orderNumber: string) => void;
}) {
  return (
    <Elements stripe={getStripe()}>
      <PaymentForm cart={cart} subtotal={subtotal} settings={settings} close={close} complete={complete} />
    </Elements>
  );
}
