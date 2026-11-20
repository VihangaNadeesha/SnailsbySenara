# 🔑 Finding Your Service Role Key

The service role key is hidden or not visible in some Supabase UI views. Here are **4 ways** to find it:

## Method 1: Dashboard Settings (Most Common) ✅

1. Go to: https://supabase.com/dashboard/project/tcjwvnxshhwsmibdwcoh/settings/api
2. Look for a section called **"Project API keys"** or **"Service keys"**
3. You should see:
   - **anon (public) key** ← You have this one (sb_publishable_...)
   - **service_role key** ← This is what we need
4. The service_role key usually starts with `sb_` or `eyJ...`
5. Copy the entire service_role key

If you don't see it on that page, try:

## Method 2: Look in Different Tabs

The Supabase dashboard sometimes organizes keys differently:

1. Try Settings > Database (bottom left sidebar)
2. Try looking for "JWT Secrets" or "Service Secrets"
3. Sometimes it's under "Authentication" section

## Method 3: Use Supabase CLI (Requires Installation)

If you have the Supabase CLI installed:

```bash
# List all secrets/keys for your project
supabase secrets list --project-ref tcjwvnxshhwsmibdwcoh

# Or use the management API (requires auth token)
supabase projects api-keys --project-ref tcjwvnxshhwsmibdwcoh
```

## Method 4: Create a New One (Last Resort)

If you absolutely can't find it, you can regenerate it:

1. Go to Supabase Project > Settings > API
2. Look for a "Regenerate" or "Generate" button next to service role key
3. Click it to create a new one
4. Copy the new key immediately (it won't be shown again)

---

## ⚠️ Important Notes

- The **anon key** is public (OK to commit to GitHub)
- The **service_role key** is SECRET (never commit to GitHub or share publicly)
- Keep service_role key only in `.env.local` and never in `.env`

---

## 🆘 Still Can't Find It?

If you've tried all methods above, here's a workaround:

### For now, the app can work with JUST the Anon Key:
- ✅ You can display products from database
- ✅ You can browse the shop
- ✅ You can add items to cart
- ⏳ Order creation might be limited (requires service role)

### Then later, when you find the service role key:
1. Update `.env.local` with the service role key
2. Restart the app: `npm run dev`
3. Full functionality unlocked!

---

## Screenshots Help!

If you can share a screenshot of your Supabase Settings > API page, I can help you locate the exact position of your service role key.

The key location typically looks like:

```
┌─ Project API Keys ─────────────────┐
│                                    │
│ anon (public)                      │
│ sb_publishable_C3aYLxXGB3L...     │ ← You found this
│                                    │
│ service_role (private)             │
│ sb_private_or_eyJ...              │ ← Find this one
│                                    │
└────────────────────────────────────┘
```

---

## Once You Have Both Keys:

Update `.env.local` with both keys:

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_C3aYLxXGB3LD0_BGsF8XEw_opivQayv
SUPABASE_SERVICE_ROLE_KEY=sb_private_... (the one you find)
```

Then restart with:
```bash
npm run dev
```

That's it! 🚀
