
-- First drop all existing policies that depend on the columns we want to modify
DROP POLICY IF EXISTS "DEO can view own receipts" ON public.receipts;
DROP POLICY IF EXISTS "DEO can insert receipts" ON public.receipts;
DROP POLICY IF EXISTS "DEO can update own receipts" ON public.receipts;
DROP POLICY IF EXISTS "Officer can view all receipts" ON public.receipts;
DROP POLICY IF EXISTS "Supervisor can view committee receipts" ON public.receipts;
DROP POLICY IF EXISTS "JD can view all receipts" ON public.receipts;

-- Update the committees table to use Andhra Pradesh locations
DELETE FROM public.committees;

-- Insert Andhra Pradesh committees/markets
INSERT INTO public.committees (name, code, district, state) VALUES
('Visakhapatnam Agricultural Market Committee', 'VIZAG_AMC', 'Visakhapatnam', 'Andhra Pradesh'),
('Vijayawada Agricultural Market Committee', 'VIJAYAWADA_AMC', 'Krishna', 'Andhra Pradesh'),
('Guntur Agricultural Market Committee', 'GUNTUR_AMC', 'Guntur', 'Andhra Pradesh'),
('Tirupati Agricultural Market Committee', 'TIRUPATI_AMC', 'Chittoor', 'Andhra Pradesh'),
('Rajahmundry Agricultural Market Committee', 'RAJAHMUNDRY_AMC', 'East Godavari', 'Andhra Pradesh'),
('Kakinada Agricultural Market Committee', 'KAKINADA_AMC', 'East Godavari', 'Andhra Pradesh'),
('Anantapur Agricultural Market Committee', 'ANANTAPUR_AMC', 'Anantapur', 'Andhra Pradesh'),
('Kurnool Agricultural Market Committee', 'KURNOOL_AMC', 'Kurnool', 'Andhra Pradesh'),
('Nellore Agricultural Market Committee', 'NELLORE_AMC', 'Nellore', 'Andhra Pradesh'),
('Kadapa Agricultural Market Committee', 'KADAPA_AMC', 'Kadapa', 'Andhra Pradesh'),
('Eluru Agricultural Market Committee', 'ELURU_AMC', 'West Godavari', 'Andhra Pradesh'),
('Ongole Agricultural Market Committee', 'ONGOLE_AMC', 'Prakasam', 'Andhra Pradesh'),
('Machilipatnam Agricultural Market Committee', 'MACHILIPATNAM_AMC', 'Krishna', 'Andhra Pradesh'),
('Hindupur Agricultural Market Committee', 'HINDUPUR_AMC', 'Anantapur', 'Andhra Pradesh'),
('Chittoor Agricultural Market Committee', 'CHITTOOR_AMC', 'Chittoor', 'Andhra Pradesh');

-- First add the new columns without defaults
ALTER TABLE public.receipts 
ADD COLUMN seller_committee_id UUID REFERENCES public.committees(id),
ADD COLUMN buyer_committee_id UUID REFERENCES public.committees(id),
ADD COLUMN seller_name TEXT,
ADD COLUMN buyer_name TEXT;

-- Update existing rows with default values
UPDATE public.receipts 
SET seller_committee_id = (SELECT id FROM public.committees LIMIT 1),
    buyer_committee_id = (SELECT id FROM public.committees LIMIT 1),
    seller_name = 'Unknown Seller',
    buyer_name = 'Unknown Buyer'
WHERE seller_committee_id IS NULL;

-- Now make the columns NOT NULL
ALTER TABLE public.receipts 
ALTER COLUMN seller_committee_id SET NOT NULL,
ALTER COLUMN buyer_committee_id SET NOT NULL,
ALTER COLUMN seller_name SET NOT NULL,
ALTER COLUMN buyer_name SET NOT NULL;

-- Drop the old columns
ALTER TABLE public.receipts 
DROP COLUMN source_committee_id,
DROP COLUMN dest_committee_id,
DROP COLUMN trader_name;

-- Create new RLS policies for the updated structure
CREATE POLICY "DEO can view own receipts" ON public.receipts
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'DEO' AND 
    created_by = auth.uid()
  );

CREATE POLICY "DEO can insert receipts" ON public.receipts
  FOR INSERT WITH CHECK (
    public.get_user_role(auth.uid()) = 'DEO' AND 
    created_by = auth.uid()
  );

CREATE POLICY "DEO can update own receipts" ON public.receipts
  FOR UPDATE USING (
    public.get_user_role(auth.uid()) = 'DEO' AND 
    created_by = auth.uid()
  );

CREATE POLICY "Officer can view all receipts" ON public.receipts
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'Officer');

CREATE POLICY "Supervisor can view committee receipts" ON public.receipts
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'Supervisor' AND 
    (seller_committee_id = public.get_user_committee(auth.uid()) OR 
     buyer_committee_id = public.get_user_committee(auth.uid()))
  );

CREATE POLICY "JD can view all receipts" ON public.receipts
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'JD');
