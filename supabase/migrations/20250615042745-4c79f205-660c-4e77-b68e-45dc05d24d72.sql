
-- Re-add the East Godavari District committees that were removed
INSERT INTO public.committees (name, code, district, state) VALUES
('Tuni Agricultural Market Committee', 'TUNI-AMC', 'East Godavari', 'Andhra Pradesh'),
('Kakinada Agricultural Market Committee', 'KAKINADA-AMC', 'East Godavari', 'Andhra Pradesh'),
('Rajahmundry Agricultural Market Committee', 'RAJAHMUNDRY-AMC', 'East Godavari', 'Andhra Pradesh'),
('Amalapuram Agricultural Market Committee', 'AMALAPURAM-AMC', 'East Godavari', 'Andhra Pradesh'),
('Peddapuram Agricultural Market Committee', 'PEDDAPURAM-AMC', 'East Godavari', 'Andhra Pradesh'),
('Ramachandrapuram Agricultural Market Committee', 'RAMACHANDRAPURAM-AMC', 'East Godavari', 'Andhra Pradesh'),
('Mandapeta Agricultural Market Committee', 'MANDAPETA-AMC', 'East Godavari', 'Andhra Pradesh'),
('Korumilli Agricultural Market Committee', 'KORUMILLI-AMC', 'East Godavari', 'Andhra Pradesh'),
('Sankhavaram Agricultural Market Committee', 'SANKHAVARAM-AMC', 'East Godavari', 'Andhra Pradesh'),
('Yelamanchili Agricultural Market Committee', 'YELAMANCHILI-AMC', 'East Godavari', 'Andhra Pradesh')
ON CONFLICT (name) DO NOTHING;
