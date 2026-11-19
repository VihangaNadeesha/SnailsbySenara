"use client";
import Image from "next/image";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CartItem, Product, Settings, Size } from "@/types";
import { ImageZoom } from "./image-zoom";
import { formatOrderMessage } from "@/lib/whatsapp-sharing";
import { PendingOrderConfirmation } from "./pending-order-confirmation";
import {
  ORDER_ATTEMPT_STORAGE_KEY,
  ORDER_WHATSAPP_OPENED_KEY,
  PENDING_ORDER_STORAGE_KEY,
  getOrCreateOrderAttempt,
  readOrderAccess,
  saveOrderAccess,
  type OrderAccess,
} from "@/lib/order-confirmation";

const money = (n: number) => `Rs. ${n.toLocaleString("en-LK")}`;
const WHATSAPP_BUSINESS_NUMBER = "+94 75 387 2343";

// Helper to convert phone number to WhatsApp URL
const wa = (number: string, text = "Hello, I would like to inquire about your services and products.") =>
  number.startsWith("[") ? "#" : `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;

const nav = [
  ["Home", "home"],
  ["Shop", "shop"],
  ["About", "about"],
  ["How It Works", "how"],
  ["FAQ", "faq"],
] as const;

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 stroke-current fill-none">
      <path d="M3.5 6.5h2l1.6 8.3a1.5 1.5 0 0 0 1.5 1.2h7.7a1.5 1.5 0 0 0 1.5-1.2l1.1-6.2H6.2" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="18.2" r="1.1" />
      <circle cx="17" cy="18.2" r="1.1" />
    </svg>
  );
}

function SnailLogo({ className = "h-12 w-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 180" aria-hidden="true" className={className}>
      <path
        d="M62 122C38 110 21 82 23 53C27 17 62 0 94 11C129 23 150 55 146 88C142 117 116 144 85 150C52 157 22 144 12 113C1 81 14 45 42 27C71 9 113 16 138 41C161 64 168 100 154 128C139 157 103 171 71 166C36 160 9 129 13 94C18 58 49 26 86 20C129 13 174 38 189 79C206 125 179 175 120 181C70 186 26 155 17 109"
        fill="none"
        stroke="currentColor"
        strokeWidth="8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M131 41C155 40 177 50 192 69C204 84 208 101 201 118C192 139 168 155 144 156"
        fill="none"
        stroke="currentColor"
        strokeWidth="8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M133 118C126 133 110 144 92 146"
        fill="none"
        stroke="currentColor"
        strokeWidth="8.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const reviewCards = [
  {
    quote: "Absolutely love my nails! The quality is amazing and they look so natural — I feel so confident wearing them.",
    name: "Tharushi M.",
    city: "COLOMBO",
  },
  {
    quote: "Such a beautiful collection! The nails are super comfortable and last so long. Packaging was also so thoughtful.",
    name: "Nethmi S.",
    city: "MOUNT LAVINIA",
  },
  {
    quote: "Amazing service! The team is so kind and helpful. My order arrived quickly and the nails are stunning.",
    name: "Dinithi K.",
    city: "KANDY",
  },
] as const;

const faqItems = [
  "What are press-on nails?",
  "How long do press-on nails last?",
  "Are press-on nails reusable?",
  "How do I apply my press-on nails?",
  "How do I remove press-on nails?",
  "How long does delivery take?",
  "Can I request a custom design?",
] as const;

export function Storefront({ products, settings }: { products: Product[]; settings: Settings }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"bank">("bank");
  const [menu, setMenu] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [pendingOrder, setPendingOrder] = useState<OrderAccess | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("snails-cart");
    if (saved) setCart(JSON.parse(saved));
    const savedOrder = localStorage.getItem(PENDING_ORDER_STORAGE_KEY);
    const access = readOrderAccess(savedOrder);
    if (access) {
      setPendingOrder(access);
    } else if (savedOrder) {
      localStorage.removeItem(PENDING_ORDER_STORAGE_KEY);
    }
  }, []);

  const handleOrderCreated = useCallback((access: OrderAccess) => {
    setCart([]);
    setCheckout(false);
    setPendingOrder(access);
  }, []);

  const handleOrderConfirmed = useCallback((orderNumber: string) => {
    localStorage.removeItem(PENDING_ORDER_STORAGE_KEY);
    localStorage.removeItem(ORDER_ATTEMPT_STORAGE_KEY);
    localStorage.removeItem(ORDER_WHATSAPP_OPENED_KEY);
    setPendingOrder(null);
    setDone(orderNumber);
  }, []);

  useEffect(() => {
    sessionStorage.setItem("snails-cart", JSON.stringify(cart));
  }, [cart]);

  const add = (product: Product, size: Size, quantity: number) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id && item.selectedSize === size);
      return existing
        ? current.map((item) => (item === existing ? { ...item, quantity: item.quantity + quantity } : item))
        : [...current, { ...product, selectedSize: size, quantity }];
    });
    setOpen(true);
  };

  const update = (id: string, size: Size, delta: number) =>
    setCart((current) =>
      current.flatMap((item) =>
        item.id === id && item.selectedSize === size
          ? item.quantity + delta > 0
            ? [{ ...item, quantity: item.quantity + delta }]
            : []
          : [item],
      ),
    );

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  return (
    <>
      <header className="brand-header sticky top-0 z-30">
        <div className="brand-shell brand-header-inner">
          <a href="#home" className="flex items-center text-[#251d22]" aria-label="Snails by Senara home">
            <span className="flex flex-col leading-none">
              <span className="brand-logo-word text-[1.35rem] sm:text-[1.6rem]">Snails by Senara</span>
              <span className="brand-logo-sub mt-1">Nails | Lashes</span>
            </span>
          </a>

          <nav className="brand-nav">
            {nav.map(([label, id]) => (
              <a key={id} href={`#${id}`}>
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setOpen(true)} className="brand-icon-button relative" aria-label="Open cart">
              <CartIcon />
              {cart.length > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#261d22] px-1 text-[10px] text-white">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
            <button type="button" onClick={() => setMenu((state) => !state)} className="brand-icon-button md:hidden" aria-label="Toggle menu">
              <span className="text-xl leading-none">☰</span>
            </button>
          </div>
        </div>

        {menu && (
          <nav className="brand-shell flex flex-col border-t border-[#eadfe4] py-3 md:hidden">
            {nav.map(([label, id]) => (
              <a key={id} href={`#${id}`} className="py-3 text-sm text-[#2a2126]" onClick={() => setMenu(false)}>
                {label}
              </a>
            ))}
          </nav>
        )}
      </header>

      <main>
        <section id="home" className="brand-hero">
          <div className="brand-shell brand-hero-inner">
            <div className="order-2 lg:order-1">
              <p className="eyebrow mb-5">Luxury, in minutes.</p>
              <h1 className="display max-w-xl text-[3.25rem] leading-[0.92] tracking-[-0.06em] text-[#251d22] sm:text-[4.25rem] lg:text-[5.5rem]">
                Press-On Nails
              </h1>
              <h2 className="display mt-3 text-[2.1rem] leading-none text-[#251d22] sm:text-[2.7rem] lg:text-[3.2rem]">
                Your Everyday Elegance.
              </h2>
              <p className="mt-7 max-w-lg text-base leading-7 text-[#5d4d53]">
                Hand-painted, reusable press-on nails with a refined finish designed to make every day feel a little more polished.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <a href="#shop" className="button-dark">
                  Shop Press-On Nails <span aria-hidden="true">→</span>
                </a>
                <a href={wa(settings.whatsapp_number)} target="_blank" rel="noreferrer" className="button-outline">
                  Order on WhatsApp
                </a>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="brand-hero-visual">
                <Image
                  priority
                  fill
                  sizes="(max-width: 1024px) 100vw, 52vw"
                  src="/salon/salon (1).JPG"
                  alt="Snails by Senara nail salon"
                  className="object-cover object-[center_25%]"
                />
                <div className="brand-badge">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-[#7a666d]">Snails by Senara</div>
                  <div className="mt-1 font-medium text-[#251d22]">Luxury, in minutes.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="brand-shell">
            <div className="brand-meta-row">
              <span>Reusable up to 3x</span>
              <span>Hand-painted</span>
              <span>Salon-quality</span>
              <span>Islandwide delivery</span>
            </div>
          </div>
        </section>

        <section id="about" className="brand-section" style={{ background: "#f7dfe7" }}>
          <div className="brand-shell grid gap-10 lg:grid-cols-[1.05fr_1.05fr] lg:items-center">
            <div className="relative h-[460px] overflow-hidden rounded-[30px] bg-[#ead8d7] shadow-[0_20px_40px_rgba(93,78,84,0.09)]">
              <Image
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                src="/salon/salon (1).jpeg"
                alt="A woman at the Snails by Senara salon"
                className="object-cover"
              />
            </div>

            <div>
              <p className="eyebrow">The person behind the polish</p>
              <h2 className="display mt-4 text-[3.2rem] leading-[0.95] text-[#251d22] sm:text-[4.1rem]">Meet Senara</h2>

              <p className="mt-6 max-w-[720px] text-lg leading-8 text-[#4d4045]">
                <span className="font-semibold text-[#251d22]">[ABOUT SENARA]</span> Share Senara&apos;s personal story, nail and lash passion,
                and salon journey here. Snails by Senara is a Nails | Lashes beauty brand, with this collection lovingly focused on
                press-on nails.
              </p>

              <div className="mt-8 flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-[#251d22] text-lg font-semibold text-[#f9ecee]">N</div>
                <div className="text-sm uppercase tracking-[0.2em] text-[#7a666d]">Founded by Senara</div>
              </div>
            </div>
          </div>
        </section>

        <section id="shop" className="brand-shell brand-section">
          <div className="mb-10 flex items-end justify-between gap-3">
            <div>
              <p className="eyebrow">The collection</p>
              <h2 className="display mt-4 text-[3rem] leading-none text-[#251d22] sm:text-[4rem]">Shop Press-On Nails</h2>
            </div>
            <span className="hidden text-[10px] uppercase tracking-[0.24em] text-[#8b717b] sm:block">{products.length} designs</span>
          </div>

          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} add={add} />
            ))}
          </div>
        </section>

        <section id="how" className="brand-shell brand-section">
          <p className="eyebrow text-center">The press-on ritual</p>
          <h2 className="display mt-4 text-center text-[2.8rem] leading-none text-[#251d22] sm:text-[4rem]">Your Press-On Order, In 4 Steps</h2>

          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {[
              ["01", "Choose Your Set & Size", "Select your favourite set and choose the right size for your nails."],
              ["02", "Add to Cart", "Select your quantity and add your set to your cart."],
              ["03", "Complete Your Payment", "Complete your payment via the provided bank details or transfer instructions."],
              ["04", "Upload Your Payment Slip", "Upload your payment slip and submit your order for approval."],
            ].map(([step, title, copy]) => (
              <div key={step} className="border-t border-[#2a2126] pt-5 text-left">
                <div className="text-[0.8rem] font-medium uppercase tracking-[0.18em] text-[#b16c88]">{step}</div>
                <h3 className="display mt-7 text-[2rem] leading-[1.05] text-[#251d22]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#6b5d63]">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="brand-shell brand-section pb-14 text-center">
          <p className="eyebrow">What happens next?</p>
          <p className="mx-auto mt-5 max-w-4xl text-base leading-7 text-[#5d4d53]">
            Once your payment is verified, your order will be prepared and dispatched. You will receive a confirmation message and your
            order will be updated as it moves through the process.
          </p>
        </section>

        <section className="brand-shell brand-section pb-8">
          <div className="text-center">
            <p className="eyebrow">Reviews</p>
            <h2 className="display mt-4 text-[2.8rem] leading-none text-[#251d22] sm:text-[4rem]">What Our Clients Say</h2>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {reviewCards.map((review) => (
              <article key={review.name} className="brand-review-card">
                <div className="mb-4 flex gap-1 text-[#d28ca8]">★★★★★</div>
                <p className="text-lg leading-8 text-[#352d31]">“{review.quote}”</p>
                <div className="mt-8 text-sm font-semibold uppercase tracking-[0.12em] text-[#251d22]">{review.name}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[#8a7078]">{review.city}</div>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <a href="https://share.google/RAz9zDqGMfamj9Ply" target="_blank" rel="noopener noreferrer" className="button-dark">
              Read More Reviews on Google
            </a>
          </div>
        </section>

        <section id="faq" className="border-y border-[#e8dfe4] bg-[#f8f0f2]">
          <div className="brand-shell grid gap-10 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="eyebrow">FAQ</p>
              <h2 className="display mt-4 text-[2.8rem] leading-none text-[#251d22] sm:text-[4rem]">Questions, Answered</h2>
            </div>

            <div>
              {faqItems.map((question) => (
                <details key={question} className="faq-item group">
                  <summary>
                    <span>{question}</span>
                    <span className="text-2xl font-light text-[#7b5a65] transition group-open:rotate-45">+</span>
                  </summary>
                  <p>
                    [FAQ ANSWER] This information will be added once the brand&apos;s product and delivery policy is confirmed.
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="brand-shell brand-section">
          <div className="rounded-[30px] bg-[#251d22] px-7 py-16 text-center text-white sm:px-16">
            <p className="eyebrow text-[#edbfd0]">A salon moment, wherever you are</p>
            <h2 className="display mx-auto mt-4 max-w-2xl text-[2.6rem] leading-none text-white sm:text-[4rem]">
              Ready to Find Your Perfect Set?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-white/75">
              Choose your favourite press-on nails and place your order with Snails by Senara.
            </p>
            <a href={wa(settings.whatsapp_number)} target="_blank" rel="noreferrer" className="button-blush mt-8">
              Order on WhatsApp ↗
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#eadfe4] bg-[#f7edf0]">
        <div className="brand-shell grid gap-8 py-12 md:grid-cols-[1.2fr_1fr_1fr_1.2fr] md:items-start">
          <div>
            <div className="leading-none text-center md:text-left">
              <div className="brand-logo-word text-[1.7rem]">Snails by Senara</div>
              <div className="brand-logo-sub mt-1">Nails | Lashes</div>
            </div>
            <p className="mt-4 max-w-[260px] text-sm leading-6 text-[#635760]">
              Premium, reusable press-on nails and beauty essentials curated for effortless everyday elegance.
            </p>
          </div>

          <div>
            <div className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#8d6d7a]">Explore</div>
            <div className="mt-4 space-y-3 text-sm text-[#40373d]">
              <a href="#home" className="block">Home</a>
              <a href="#shop" className="block">Shop</a>
              <a href="#about" className="block">About</a>
              <a href="#faq" className="block">FAQ</a>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#8d6d7a]">Customer Care</div>
            <div className="mt-4 space-y-3 text-sm text-[#40373d]">
              <a href={wa(settings.whatsapp_number)} target="_blank" rel="noreferrer" className="block">WhatsApp</a>
              <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="block">Instagram</a>
              <a href={settings.facebook_url} target="_blank" rel="noreferrer" className="block">Facebook</a>
              <a href={settings.tiktok_url} target="_blank" rel="noreferrer" className="block">TikTok</a>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#8d6d7a]">Contact</div>
            <div className="mt-4 space-y-3 text-sm text-[#40373d]">
              <a href={wa(settings.whatsapp_number)} target="_blank" rel="noreferrer" className="block">
                WhatsApp: {settings.whatsapp_number}
              </a>
              <button type="button" className="block text-left">
                Leave a review
              </button>
            </div>
          </div>
        </div>

        <div className="brand-shell border-t border-[#e6d6dc] py-5 text-center text-xs uppercase tracking-[0.18em] text-[#7a666d]">
          © 2026 Snails by Senara. All rights reserved.
        </div>
      </footer>

      {open && (
        <CartDrawer
          cart={cart}
          subtotal={subtotal}
          fee={settings.delivery_fee}
          update={update}
          close={() => setOpen(false)}
          checkout={() => {
            setOpen(false);
            setCheckout(true);
          }}
        />
      )}

      {checkout && paymentMethod === "bank" && (
        <Checkout
          cart={cart}
          subtotal={subtotal}
          settings={settings}
          close={() => {
            setCheckout(false);
            setPaymentMethod("bank");
          }}
          onOrderCreated={handleOrderCreated}
        />
      )}

      {pendingOrder && (
        <PendingOrderConfirmation
          access={pendingOrder}
          whatsappNumber={WHATSAPP_BUSINESS_NUMBER}
          onConfirmed={handleOrderConfirmed}
        />
      )}

      {done && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-5">
          <div className="max-w-md bg-white p-8 text-center shadow-xl">
            <p className="eyebrow">Order received</p>
            <h2 className="display mt-3 text-4xl text-[#251d22]">Order Submitted</h2>
            <p className="mt-5 leading-7 text-[#6e6065]">
              Thank you. Your confirmation has been recorded.
            </p>
            <p className="mt-6 text-lg font-semibold text-[#251d22]">Order Number: #{done}</p>
            <p className="mt-6 text-sm leading-6 text-[#6e6065]">
              This confirms your statement that you sent the order through WhatsApp. It does not confirm WhatsApp delivery or payment receipt; the company will review both manually.
            </p>
            <button type="button" onClick={() => setDone(null)} className="button-dark mt-7">
              Back to the collection
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function ProductCard({ product, add }: { product: Product; add: (p: Product, s: Size, q: number) => void }) {
  const [size, setSize] = useState<Size>(product.available_sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const sold = product.inventory < 1 || !product.is_available;

  useEffect(() => {
    if (!sizeChartOpen) return;

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSizeChartOpen(false);
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [sizeChartOpen]);

  return (
    <>
      <article className="product-card">
        <div className="product-card-image" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
          <ImageZoom
            src={
              isHovering && product.hover_image
                ? product.hover_image
                : product.image || "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=85"
            }
            alt={product.name}
            fill
            className="object-cover transition duration-500 hover:scale-105"
          />
          {sold && <span className="absolute left-3 top-3 bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]">Sold out</span>}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="display text-[1.9rem] leading-none text-[#251d22]">{product.name}</h3>
              <p className="mt-2 text-sm font-semibold text-[#4d4045]">{money(product.price)}</p>
            </div>
          </div>

          <p className="mt-3 min-h-[48px] text-xs leading-5 text-[#6b5d63]">{product.description}</p>

          <div className="mt-4 flex items-center gap-2">
            {product.available_sizes.map((option) => (
              <button
                key={option}
                type="button"
                disabled={sold}
                onClick={() => setSize(option)}
                className={`product-size-button ${size === option ? "border-[#251d22] bg-[#251d22] text-white" : "border-[#d9ced3] text-[#251d22] hover:border-[#251d22]"}`}
              >
                {option}
              </button>
            ))}
          </div>

          <button type="button" onClick={() => setSizeChartOpen(true)} className="mt-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[#6e6065] underline decoration-[#d1b8c0] underline-offset-4">
            Size chart
          </button>

          <div className="mt-5 flex flex-col gap-3">
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center border border-[#d8cdd3] bg-[#fffdfd]">
                <button type="button" className="grid h-10 w-10 place-items-center text-lg text-[#2a2126] hover:bg-[#f2e7ea] transition" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
                  −
                </button>
                <span className="grid w-10 place-items-center text-sm font-semibold text-[#2a2126]">{quantity}</span>
                <button type="button" className="grid h-10 w-10 place-items-center text-lg text-[#2a2126] hover:bg-[#f2e7ea] transition" onClick={() => setQuantity((value) => value + 1)}>
                  +
                </button>
              </div>
              
              <button 
                type="button" 
                disabled={sold} 
                onClick={() => add(product, size, quantity)} 
                className="flex-1 button-dark px-3 py-1.5 font-medium text-xs transition-all hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:bg-[#b7a7ad] disabled:hover:shadow-none"
              >
                {sold ? "Sold Out" : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </article>

      {sizeChartOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-3 sm:p-4" onClick={() => setSizeChartOpen(false)}>
          <div className="relative mx-auto w-fit max-w-full rounded-[24px] bg-white p-3 shadow-[0_25px_80px_rgba(0,0,0,0.25)] sm:p-4" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setSizeChartOpen(false)} aria-label="Close size chart" className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-[#f7edf0] text-xl text-[#251d22] sm:right-4 sm:top-4">
              ×
            </button>

            <div className="mx-auto w-fit max-w-full overflow-hidden rounded-[18px] border border-[#eadfe4] bg-[#f9f4f5]">
              <Image
                src="/size-chart.png"
                alt={`${product.name} nail size chart`}
                width={1200}
                height={900}
                className="block h-auto max-h-[75vh] w-auto max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CartDrawer({ cart, subtotal, fee, update, close, checkout }: { cart: CartItem[]; subtotal: number; fee: number; update: (id: string, s: Size, d: number) => void; close: () => void; checkout: () => void }) {
  return (
    <div className="fixed inset-0 z-40 bg-black/30" onMouseDown={close}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        onMouseDown={(event) => event.stopPropagation()}
        className="ml-auto flex h-full w-full max-w-md flex-col bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="display text-3xl text-[#251d22]">Your Cart</h2>
          <button type="button" onClick={close} aria-label="Close cart" className="text-2xl">
            ×
          </button>
        </div>

        {cart.length === 0 ? (
          <p className="mt-12 text-center text-sm text-[#6e6065]">Your cart is waiting for a beautiful set.</p>
        ) : (
          <>
            <div className="mt-8 flex-1 space-y-5 overflow-y-auto">
              {cart.map((item) => (
                <div className="flex gap-3" key={`${item.id}-${item.selectedSize}`}>
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-[#f4ebed]">
                    <Image
                      fill
                      src={item.image || "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=300&q=80"}
                      alt={item.name}
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-[#251d22]">{item.name}</h3>
                        <p className="mt-1 text-xs text-[#8e6a76]">Size: {item.selectedSize}</p>
                      </div>
                      <button type="button" className="text-xs underline text-[#251d22]" onClick={() => update(item.id, item.selectedSize, -item.quantity)}>
                        Remove
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex border border-[#d8cdd3]">
                        <button type="button" className="h-8 w-8 text-lg text-[#2a2126]" onClick={() => update(item.id, item.selectedSize, -1)}>
                          −
                        </button>
                        <span className="grid h-8 w-8 place-items-center text-xs text-[#2a2126]">{item.quantity}</span>
                        <button type="button" className="h-8 w-8 text-lg text-[#2a2126]" onClick={() => update(item.id, item.selectedSize, 1)}>
                          +
                        </button>
                      </div>
                      <b className="text-sm text-[#251d22]">{money(item.price * item.quantity)}</b>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Totals subtotal={subtotal} fee={fee} />
            <button type="button" onClick={checkout} className="button-dark mt-5 w-full">
              Proceed to Checkout
            </button>
          </>
        )}
      </aside>
    </div>
  );
}

function Totals({ subtotal, fee }: { subtotal: number; fee: number }) {
  return (
    <div className="mt-6 space-y-2 border-t border-[#dfd6d9] pt-5 text-sm">
      <p className="flex justify-between text-[#6e6065]">
        <span>Subtotal</span>
        <span>{money(subtotal)}</span>
      </p>
      <p className="flex justify-between text-[#6e6065]">
        <span>Delivery</span>
        <span>{money(fee)}</span>
      </p>
      <p className="flex justify-between pt-2 text-base font-semibold text-[#251d22]">
        <span>Total</span>
        <span>{money(subtotal + fee)}</span>
      </p>
    </div>
  );
}

function Checkout({ cart, subtotal, settings, close, onOrderCreated }: { cart: CartItem[]; subtotal: number; settings: Settings; close: () => void; onOrderCreated: (access: OrderAccess) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const submissionStarted = useRef(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ name: "", phone: "", address: "", notes: "" });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string) => {
    const errors: Record<string, string> = { ...validationErrors };
    
    if (name === "name") {
      if (value.length < 2) {
        errors.name = "Name must be at least 2 characters";
      } else {
        delete errors.name;
      }
    } else if (name === "phone") {
      if (value.length < 5) {
        errors.phone = "Phone must be at least 5 digits";
      } else if (!/^\d+$/.test(value.replace(/[\s\-\(\)]/g, ""))) {
        errors.phone = "Phone must contain only numbers";
      } else {
        delete errors.phone;
      }
    } else if (name === "address") {
      if (value.length < 5) {
        errors.address = "Address must be at least 5 characters";
      } else {
        delete errors.address;
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionStarted.current) return;
    setError("");

    // Validate all fields
    const errors: Record<string, string> = {};
    if (formData.name.length < 2) errors.name = "Name must be at least 2 characters";
    if (formData.phone.length < 5) errors.phone = "Phone must be at least 5 digits";
    if (!/^\d+$/.test(formData.phone.replace(/[\s\-\(\)]/g, ""))) errors.phone = "Phone must contain only numbers";
    if (formData.address.length < 5) errors.address = "Address must be at least 5 characters";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError("Please correct the errors in your delivery details.");
      return;
    }

    if (!file) {
      setError("Please upload your payment slip before submitting.");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Payment slip must be JPG, PNG, or WEBP format.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Payment slip must be under 5 MB.");
      return;
    }

    submissionStarted.current = true;
    setLoading(true);

    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("phone", formData.phone);
      form.append("address", formData.address);
      form.append("notes", formData.notes);
      form.append("slip", file);
      form.append("items", JSON.stringify(cart.map((item) => ({ product_id: item.id, selected_size: item.selectedSize, quantity: item.quantity }))));
      const attempt = getOrCreateOrderAttempt();
      const messageTemplate = formatOrderMessage({
        orderNumber: "__ORDER_REFERENCE__",
        customerName: formData.name,
        phone: formData.phone,
        deliveryAddress: formData.address,
        specialNotes: formData.notes,
        items: cart.map((item) => ({
          name: item.name,
          size: item.selectedSize,
          quantity: item.quantity,
          totalPrice: item.price * item.quantity,
        })),
        subtotal,
        deliveryFee: settings.delivery_fee,
        total: subtotal + settings.delivery_fee,
        bankName: settings.bank_name,
        accountName: settings.account_name,
        accountNumber: settings.account_number,
        branch: settings.branch,
      });
      form.append("idempotencyKey", attempt.idempotencyKey);
      form.append("resumeToken", attempt.resumeToken);
      form.append("messageTemplate", messageTemplate);

      const response = await fetch("/api/orders", { method: "POST", body: form });
      const data = await response.json();
      
      if (!response.ok) {
        const errorMsg = data.error || `Order submission failed with status ${response.status}`;
        throw new Error(errorMsg);
      }

      if (!data.orderNumber) {
        throw new Error("No order number returned from server");
      }
      if (typeof data.resumeToken !== "string" || !/^[0-9a-f]{64}$/i.test(data.resumeToken)) {
        throw new Error("The server did not return valid order recovery details.");
      }

      console.log("Order created:", data.orderNumber);
      const access: OrderAccess = {
        orderNumber: String(data.orderNumber),
        resumeToken: data.resumeToken,
      };
      saveOrderAccess(access);
      onOrderCreated(access);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn("Checkout submission failed:", message);
      setError(message || "Order submission failed. Please try again.");
    } finally {
      submissionStarted.current = false;
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-[#fffdfd]">
      <div className="brand-shell py-6">
        <button type="button" onClick={close} className="text-sm underline text-[#251d22]">
          ← Back to cart
        </button>

        <form onSubmit={submit} className="mx-auto mt-8 max-w-5xl pb-16">
          <p className="eyebrow">Almost yours</p>
          <h2 className="display mt-3 text-4xl text-[#251d22]">Checkout</h2>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_0.85fr]">
            <div className="space-y-6">
              <fieldset>
                <legend className="mb-4 text-sm font-semibold text-[#251d22]">Delivery details</legend>
                <div className="grid gap-4">
                  <div>
                    <input 
                      required 
                      name="name" 
                      className={`field ${validationErrors.name ? "border-red-500 bg-red-50" : ""}`}
                      placeholder="Full name" 
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                    {validationErrors.name && <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>}
                  </div>
                  <div>
                    <input 
                      required 
                      name="phone" 
                      className={`field ${validationErrors.phone ? "border-red-500 bg-red-50" : ""}`}
                      placeholder="Phone number" 
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                    {validationErrors.phone && <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>}
                  </div>
                  <div>
                    <textarea 
                      required 
                      name="address" 
                      className={`field min-h-28 ${validationErrors.address ? "border-red-500 bg-red-50" : ""}`}
                      placeholder="Delivery address" 
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                    {validationErrors.address && <p className="mt-1 text-sm text-red-600">{validationErrors.address}</p>}
                  </div>
                  <textarea 
                    name="notes" 
                    className="field min-h-20" 
                    placeholder="Additional notes (optional)" 
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </div>
              </fieldset>

              <section className="border-y border-[#dfd6d9] py-6">
                <h3 className="text-sm font-semibold text-[#251d22]">Make your payment</h3>
                <dl className="mt-4 space-y-3 text-sm">
                  <Info label="Bank" value={settings.bank_name} />
                  <Info label="Account Name" value={settings.account_name} />
                  <Info label="Account Number" value={settings.account_number} />
                  <Info label="Branch" value={settings.branch} />
                </dl>
              </section>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#251d22]">Upload payment slip</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  required
                  onChange={(event) => {
                    const f = event.target.files?.[0];
                    if (f) {
                      const errors: Record<string, string> = {};
                      if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
                        errors.file = "File must be JPG, PNG, or WEBP format";
                      }
                      if (f.size > 5 * 1024 * 1024) {
                        errors.file = "File must be under 5 MB";
                      }
                      if (Object.keys(errors).length === 0) {
                        setValidationErrors(prev => {
                          const copy = { ...prev };
                          delete copy.file;
                          return copy;
                        });
                      } else {
                        setValidationErrors(prev => ({ ...prev, ...errors }));
                      }
                    }
                    setFile(f ?? null);
                  }}
                  className={`block w-full text-sm text-[#4d4045] file:mr-4 file:rounded-none file:border file:border-[#d8cdd3] file:bg-[#f7edf0] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#251d22] ${validationErrors.file ? "border-red-500" : ""}`}
                />
                {file && (
                  <p className="mt-2 text-xs text-[#5d4d53]">
                    📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                {validationErrors.file && <p className="mt-1 text-sm text-red-600">{validationErrors.file}</p>}
              </label>

              {error && (
                <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                  <p className="font-semibold">❌ Error</p>
                  <p className="mt-1">{error}</p>
                </div>
              )}
              
            </div>

            <aside className="rounded-[24px] border border-[#e9dfe4] bg-[#f8f0f2] p-6">
              <h3 className="display text-2xl text-[#251d22]">Order Summary</h3>
              <div className="mt-5 space-y-4">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex gap-3 border-b border-[#e2d4d8] pb-3">
                    <ImageZoom
                      src={item.image || "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=300&q=80"}
                      alt={item.name}
                      className="relative h-16 w-16 overflow-hidden bg-[#f2e7ea] rounded flex-shrink-0"
                    />
                    <div className="flex-1 text-sm text-[#3b2d35]">
                      <div className="font-semibold">{item.name}</div>
                      <div className="mt-1">Qty: {item.quantity} · Size: {item.selectedSize}</div>
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

              <button type="submit" disabled={loading} className="button-dark mt-8 w-full disabled:cursor-not-allowed disabled:bg-[#b7a7ad]">
                {loading ? "Submitting..." : "Submit Order"}
              </button>
            </aside>
          </div>
        </form>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-[#6b5d63]">{label}</dt>
      <dd className="text-right font-medium text-[#251d22]">{value}</dd>
    </div>
  );
}
