# Payment Integration & Hover Images Guide

## New Features Added

### 1. ✨ Hover Images for Nails
Products now display beautiful hover images when you hover over them on the shop page. This showcases different angles or variations of each nail design.

**How it works:**
- Each product can have both a main `image` and a `hover_image`
- When you hover over a product card, the image smoothly transitions to the hover image
- Mobile devices don't have hover, but the main image is always displayed

**To add hover images to your products:**
1. Update your products data in `lib/demo.ts` or your database
2. Add a `hover_image` property with a URL to the alternate image

**Example:**
```typescript
{
  id: "demo-rose",
  name: "Rosé Glaze",
  image: "https://example.com/rose-main.jpg",
  hover_image: "https://example.com/rose-hover.jpg",
  // ... other properties
}
```

---

### 2. 💳 Dual Payment Methods

The checkout now supports **two payment methods**:

#### A. Credit/Debit Card Payment (Stripe)
- **Secure & Fast:** Processed instantly using Stripe
- **Accepts:** Visa, Mastercard, American Express
- **Best for:** Online payments and international orders
- **Setup required:** Stripe account with API keys

#### B. Bank Transfer (Original)
- **Traditional:** Upload payment slip for verification
- **For:** Local bank transfers with slip confirmation
- **No additional setup needed**

#### Payment Method Selection
When customers proceed to checkout, they see a **Payment Method Selector** modal:
- Choose between Credit/Debit Card or Bank Transfer
- Each method has its own checkout flow
- Clear descriptions help customers decide

---

## Setup Instructions

### Setting Up Stripe Payments

#### 1. Create a Stripe Account
- Visit [stripe.com](https://stripe.com)
- Sign up for a free account
- Complete the verification process

#### 2. Get Your API Keys
1. Go to your [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API Keys**
3. Copy your **Publishable Key** (starts with `pk_`)
4. Copy your **Secret Key** (starts with `sk_`)

#### 3. Add Keys to Environment
Update your `.env.local` file:

```env
# Existing variables
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key

# Add these Stripe variables
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
```

**⚠️ Important:**
- Use test keys for development (they won't charge real cards)
- Switch to live keys when going to production
- Never commit `.env.local` to version control

#### 4. Test the Integration
1. Run the development server: `npm run dev`
2. Add items to cart
3. Click "Proceed to Checkout"
4. Select "Credit/Debit Card (Stripe)"
5. Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)

---

## File Structure

### New Files
- **`lib/stripe.ts`** - Stripe utility functions
- **`components/stripe-checkout.tsx`** - Stripe payment form component
- **`app/api/payments/create-intent/route.ts`** - Payment intent creation API

### Modified Files
- **`types/index.ts`** - Added `hover_image` property to Product type
- **`lib/demo.ts`** - Added hover images to demo products
- **`components/storefront.tsx`** - Enhanced with:
  - Hover image functionality
  - Payment method selector
  - Dual checkout flows

---

## Features in Detail

### Product Cards
```typescript
// Hover on a product card to see the alternate image
// Smooth CSS transition over 500ms
// Image scales up slightly (hover:scale-105) for effect
```

### Checkout Flow

**Without Payment Method Selection (before):**
```
Add to Cart → Checkout → Bank Transfer Form → Complete
```

**With Payment Method Selection (new):**
```
Add to Cart → Checkout → Payment Method Selection
                        ├→ Stripe Card → Complete
                        └→ Bank Transfer → Complete
```

### Payment Status Tracking
Both payment methods:
- Create orders in the database
- Send confirmation via WhatsApp
- Display order number on completion
- Save cart to completion state

---

## Customization

### Styling Payment Buttons
The payment method selector uses the brand's color scheme:
- Primary color: `#251d22` (dark brown)
- Accent color: `#d1b8c0` (blush)
- Background: `#f8f0f2` (light pink)

Edit `PaymentMethodSelector` in `components/storefront.tsx` to customize.

### Changing Card Styling
In `components/stripe-checkout.tsx`, modify the `CardElement` options:

```typescript
<CardElement
  options={{
    style: {
      base: {
        fontSize: "16px",
        color: "#251d22",
        "::placeholder": { color: "#b7a7ad" },
      },
    },
  }}
/>
```

### Adding Payment Logos
In the `PaymentMethodSelector` component, you can add payment provider logos:

```typescript
{/* Add Stripe logo */}
<img src="/stripe-logo.svg" alt="Stripe" className="h-6 w-6" />
```

---

## Security Notes

✅ **What's Secure:**
- Stripe handles PCI compliance
- Card details never touch your server
- API keys are environment variables
- Payments use HTTPS encryption

✅ **Best Practices:**
- Keep secret keys in `.env.local` only
- Never commit `.env.local` to git
- Use different keys for test/production
- Monitor Stripe Dashboard for disputes

---

## Testing

### Test Card Numbers (Stripe)
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0025 0000 3155`

### Payment Status Codes
- `succeeded` - Payment successful
- `processing` - Payment being processed
- `requires_action` - Needs customer action (3D Secure, etc.)
- `requires_payment_method` - No payment method on file

---

## Troubleshooting

### "Stripe key not found" Error
**Solution:** Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to `.env.local`

### Cards not loading in checkout
**Solution:** 
1. Verify Stripe keys are correct
2. Clear browser cache
3. Restart dev server

### Payment fails with network error
**Solution:**
1. Check internet connection
2. Verify API endpoint is accessible
3. Check Stripe Dashboard for API errors

### Order not created after payment
**Solution:**
1. Check database connection
2. Verify `/api/orders` endpoint works
3. Check Stripe webhook settings (for production)

---

## Migration Guide (Existing Users)

If you already have a storefront:

1. **Update Product Types**
   - Add optional `hover_image: string` field
   - Existing products will work without it

2. **Install Stripe Packages**
   ```bash
   npm install @stripe/react-stripe-js @stripe/stripe-js stripe
   ```

3. **Copy New Files**
   - `lib/stripe.ts`
   - `components/stripe-checkout.tsx`
   - `app/api/payments/create-intent/route.ts`

4. **Update Imports**
   - Import `StripeCheckout` in your storefront component

5. **Add Environment Variables**
   - Update `.env.local` with Stripe keys

---

## Next Steps

1. ✅ Set up Stripe account
2. ✅ Add API keys to `.env.local`
3. ✅ Test with test card numbers
4. ✅ Add hover images to your products
5. ✅ Deploy to production with live keys

For more details, visit:
- [Stripe Documentation](https://stripe.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
