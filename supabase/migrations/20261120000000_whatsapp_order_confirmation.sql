ALTER TABLE public.orders
  ALTER COLUMN status DROP DEFAULT;

ALTER TABLE public.orders
  ALTER COLUMN status TYPE text USING status::text;

DO $$
DECLARE
  status_constraint record;
BEGIN
  FOR status_constraint IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.orders'::regclass
      AND contype = 'c'
      AND position('status' in lower(pg_get_constraintdef(oid))) > 0
  LOOP
    EXECUTE format('ALTER TABLE public.orders DROP CONSTRAINT %I', status_constraint.conname);
  END LOOP;
END $$;

ALTER TABLE public.orders
  ALTER COLUMN status SET DEFAULT 'PENDING_WHATSAPP',
  ADD COLUMN IF NOT EXISTS idempotency_key uuid,
  ADD COLUMN IF NOT EXISTS whatsapp_confirmation_token_hash text,
  ADD COLUMN IF NOT EXISTS whatsapp_message text,
  ADD COLUMN IF NOT EXISTS payment_slip_path text,
  ADD COLUMN IF NOT EXISTS customer_confirmed_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS orders_idempotency_key_idx
  ON public.orders (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment_slips',
  'payment_slips',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];
