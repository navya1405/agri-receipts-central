
-- Remove trader_license column and add payee_address column
ALTER TABLE public.receipts 
DROP COLUMN IF EXISTS trader_license;

ALTER TABLE public.receipts 
ADD COLUMN payee_address TEXT NOT NULL DEFAULT '';

-- Update the default value constraint to make it properly required
ALTER TABLE public.receipts 
ALTER COLUMN payee_address DROP DEFAULT;
