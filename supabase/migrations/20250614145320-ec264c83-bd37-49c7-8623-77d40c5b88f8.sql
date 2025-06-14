
-- Insert demo users into profiles table
INSERT INTO public.profiles (id, username, full_name, email) VALUES 
('a1111111-1111-1111-1111-111111111111', 'demo_deo', 'Demo DEO User', 'deo@demo.com'),
('a2222222-2222-2222-2222-222222222222', 'demo_officer', 'Demo Officer User', 'officer@demo.com'),
('a3333333-3333-3333-3333-333333333333', 'demo_supervisor', 'Demo Supervisor User', 'supervisor@demo.com'),
('a4444444-4444-4444-4444-444444444444', 'demo_jd', 'Demo Joint Director User', 'jd@demo.com')
ON CONFLICT (id) DO NOTHING;

-- Insert user roles for demo users
INSERT INTO public.user_roles (user_id, role) VALUES 
('a1111111-1111-1111-1111-111111111111', 'DEO'),
('a2222222-2222-2222-2222-222222222222', 'Officer'),
('a3333333-3333-3333-3333-333333333333', 'Supervisor'),
('a4444444-4444-4444-4444-444444444444', 'JD')
ON CONFLICT (user_id, role) DO NOTHING;
