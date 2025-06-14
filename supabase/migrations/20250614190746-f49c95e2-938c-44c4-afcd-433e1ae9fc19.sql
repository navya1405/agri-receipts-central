
-- Insert the missing Tuni Agricultural Market Committee
INSERT INTO committees (name, code, district, state) VALUES
('Tuni Agricultural Market Committee', 'TUNI-AMC', 'East Godavari', 'Andhra Pradesh')
ON CONFLICT (name) DO UPDATE SET 
  code = EXCLUDED.code,
  district = EXCLUDED.district,
  state = EXCLUDED.state;
