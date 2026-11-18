# Stripe Test Cards Reference

## Common Test Card Numbers

### Standard Success Card
**Card Number:** `4242 4242 4242 4242`
- **Status:** Always succeeds
- **Use for:** Testing successful payments
- **Expiry:** Any future date (e.g., 12/25)
- **CVC:** Any 3 digits (e.g., 123)

### Standard Decline Card
**Card Number:** `4000 0000 0000 0002`
- **Status:** Always declines (insufficient funds)
- **Use for:** Testing decline handling
- **Expiry:** Any future date
- **CVC:** Any 3 digits

### 3D Secure Required Card
**Card Number:** `4000 0025 0000 3155`
- **Status:** Requires 3D Secure authentication
- **Use for:** Testing 3D Secure/SCA flows
- **Expiry:** Any future date
- **CVC:** Any 3 digits
- **Note:** You'll need to complete authentication in popup

### Lost/Stolen Card
**Card Number:** `4000 0000 0000 9995`
- **Status:** Declines (card reported lost/stolen)
- **Use for:** Testing specific decline reasons

## Testing Different Scenarios

### Test Successful Payment
1. Use card: `4242 4242 4242 4242`
2. Fill in expiry: 12/25
3. Fill in CVC: 123
4. Submit form
5. Payment should succeed immediately

### Test Failed Payment
1. Use card: `4000 0000 0000 0002`
2. Fill in any future expiry
3. Fill in any CVC
4. Submit form
5. Payment should fail with error message

### Test Card Decline Due to Zip Code
**Card Number:** `4000 0000 0000 0010`
- Status: Declines when zip code is provided
- Use for: Testing zip code validation

### Test Insufficient Funds
**Card Number:** `4000 0000 0000 9987`
- Status: Declines for insufficient funds
- Use for: Testing specific decline reason

## Payment Outcomes

### On Success
✅ Order created in database
✅ Order number generated
✅ Payment confirmation sent
✅ WhatsApp notification sent to admin
✅ Success message shown to customer

### On Failure
❌ Payment declined message shown
❌ Customer can retry with different card
❌ No order created
❌ No WhatsApp notification

## Important Notes

⚠️ **Always Use Test Keys**
- Test keys start with `pk_test_` (publishable) or `sk_test_` (secret)
- Test payments never charge real money
- Completely safe for learning and testing

🔄 **Switch to Live Keys for Production**
- Live keys start with `pk_live_` or `sk_live_`
- Real payments will be charged
- Requires business verification

🛡️ **Never Share Keys**
- Secret keys should never be committed to git
- Keep keys in `.env.local` only
- Delete `.env.local` from git history if accidentally committed

## Stripe Dashboard Test Mode

In your Stripe Dashboard:
1. Toggle **View Test Data** on/off (top right)
2. Test Mode shows all test transactions
3. Live Mode shows real transactions
4. Keep separate test and live API keys

## Common Testing Flow

```
1. Add product to cart
2. Click "Checkout"
3. Choose "Credit/Debit Card"
4. Enter name, email, phone, address
5. Enter test card: 4242 4242 4242 4242
6. Enter any future expiry (e.g., 12/25)
7. Enter any CVC (e.g., 123)
8. Click "Pay Rs. XXXX"
9. See success message
10. Check order confirmation
```

## Webhook Testing (Advanced)

For production, set up webhooks to handle:
- `payment_intent.succeeded` - Payment successful
- `payment_intent.payment_failed` - Payment failed
- `charge.refunded` - Customer refunded

Webhook setup in: Stripe Dashboard → Developers → Webhooks

## Resources

- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe Test Mode](https://stripe.com/docs/keys)
- [Payment Intent API](https://stripe.com/docs/payments/payment-intents)
- [3D Secure Testing](https://stripe.com/docs/testing#3d-secure-authentication)

---

**Ready to test? Start with card `4242 4242 4242 4242` for instant success! 💳✨**
