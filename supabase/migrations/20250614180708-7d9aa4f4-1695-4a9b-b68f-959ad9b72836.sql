
-- Update committees table to ensure all AMCs in Kakinada district are properly defined
UPDATE committees SET district = 'East Godavari', state = 'Andhra Pradesh' WHERE name = 'Tuni Agricultural Market Committee';

-- Insert additional AMCs in Kakinada district for realistic structure (using ON CONFLICT for name as well)
INSERT INTO committees (name, code, district, state) VALUES
('Kakinada Agricultural Market Committee', 'KKD-AMC', 'East Godavari', 'Andhra Pradesh'),
('Rajahmundry Agricultural Market Committee', 'RJY-AMC', 'East Godavari', 'Andhra Pradesh'),
('Amalapuram Agricultural Market Committee', 'AML-AMC', 'East Godavari', 'Andhra Pradesh'),
('Peddapuram Agricultural Market Committee', 'PDM-AMC', 'East Godavari', 'Andhra Pradesh'),
('Ramachandrapuram Agricultural Market Committee', 'RCP-AMC', 'East Godavari', 'Andhra Pradesh'),
('Mandapeta Agricultural Market Committee', 'MDP-AMC', 'East Godavari', 'Andhra Pradesh'),
('Korumilli Agricultural Market Committee', 'KRM-AMC', 'East Godavari', 'Andhra Pradesh'),
('Sankhavaram Agricultural Market Committee', 'SKV-AMC', 'East Godavari', 'Andhra Pradesh'),
('Prathipadu Agricultural Market Committee', 'PTD-AMC', 'East Godavari', 'Andhra Pradesh'),
('Yelamanchili Agricultural Market Committee', 'YLM-AMC', 'East Godavari', 'Andhra Pradesh')
ON CONFLICT (name) DO UPDATE SET 
  code = EXCLUDED.code,
  district = EXCLUDED.district,
  state = EXCLUDED.state;

-- Add foreign key constraint to profiles table to link users to committees (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_committee_id_fkey'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_committee_id_fkey 
        FOREIGN KEY (committee_id) REFERENCES committees(id);
    END IF;
END $$;
