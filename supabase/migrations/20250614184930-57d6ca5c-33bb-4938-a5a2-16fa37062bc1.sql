
-- Drop the existing receipts table completely since it has the wrong structure
DROP TABLE IF EXISTS public.receipts CASCADE;

-- Create the new receipts table with the correct structure
CREATE TABLE public.receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_number TEXT NOT NULL,
  receipt_number TEXT NOT NULL,
  date DATE NOT NULL,
  
  -- Trader/Farmer details
  trader_name TEXT NOT NULL,
  trader_address TEXT NOT NULL,
  trader_license TEXT,
  
  -- Payee details
  payee_name TEXT NOT NULL,
  
  -- Product details
  commodity TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  value NUMERIC NOT NULL,
  
  -- Receipt type and fees
  nature_of_receipt TEXT NOT NULL CHECK (nature_of_receipt IN ('lf', 'mf', 'uc', 'others')),
  fees_paid NUMERIC NOT NULL,
  
  -- Transport details
  vehicle_number TEXT,
  invoice_number TEXT,
  
  -- Collection details
  collection_location TEXT NOT NULL CHECK (collection_location IN ('checkpost', 'office')),
  collected_by TEXT CHECK (collected_by IN ('supervisor_1', 'supervisor_2')),
  checkpost_location TEXT,
  
  -- Administrative details
  generated_by TEXT NOT NULL,
  designation TEXT NOT NULL,
  
  -- System fields
  committee_id UUID REFERENCES committees(id) NOT NULL,
  created_by UUID NOT NULL,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_receipts_committee_id ON public.receipts(committee_id);
CREATE INDEX idx_receipts_date ON public.receipts(date);
CREATE INDEX idx_receipts_commodity ON public.receipts(commodity);
CREATE INDEX idx_receipts_trader_name ON public.receipts(trader_name);
CREATE INDEX idx_receipts_receipt_number ON public.receipts(receipt_number);

-- Enable Row Level Security
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic policies for now)
CREATE POLICY "Users can view receipts from their committee" 
  ON public.receipts 
  FOR SELECT 
  USING (true); -- For demo purposes, allowing all users to see all receipts

CREATE POLICY "Users can create receipts" 
  ON public.receipts 
  FOR INSERT 
  WITH CHECK (true); -- For demo purposes, allowing all users to create receipts

CREATE POLICY "Users can update receipts from their committee" 
  ON public.receipts 
  FOR UPDATE 
  USING (true); -- For demo purposes, allowing all users to update receipts

CREATE POLICY "Users can delete receipts from their committee" 
  ON public.receipts 
  FOR DELETE 
  USING (true); -- For demo purposes, allowing all users to delete receipts
