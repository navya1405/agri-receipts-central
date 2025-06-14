
-- Update the receipts table to have better constraints for conditional fields
ALTER TABLE public.receipts 
DROP CONSTRAINT IF EXISTS receipts_collected_by_check,
DROP CONSTRAINT IF EXISTS receipts_collection_location_check;

-- Add updated constraints
ALTER TABLE public.receipts 
ADD CONSTRAINT receipts_collection_location_check 
CHECK (collection_location IN ('checkpost', 'office'));

-- Update the collected_by constraint to allow more flexibility
ALTER TABLE public.receipts 
ALTER COLUMN collected_by DROP NOT NULL;

-- Add a constraint that ensures proper conditional logic
-- If collection_location is 'office', collected_by must be present
-- If collection_location is 'checkpost', checkpost_location must be present
ALTER TABLE public.receipts 
ADD CONSTRAINT receipts_conditional_fields_check 
CHECK (
  (collection_location = 'office' AND collected_by IS NOT NULL) OR
  (collection_location = 'checkpost' AND checkpost_location IS NOT NULL)
);
