
-- Delete any existing demo users first to avoid conflicts
DELETE FROM public.user_roles WHERE user_id IN (
  'a1111111-1111-1111-1111-111111111111',
  'a2222222-2222-2222-2222-222222222222', 
  'a3333333-3333-3333-3333-333333333333',
  'a4444444-4444-4444-4444-444444444444'
);

DELETE FROM public.profiles WHERE id IN (
  'a1111111-1111-1111-1111-111111111111',
  'a2222222-2222-2222-2222-222222222222',
  'a3333333-3333-3333-3333-333333333333', 
  'a4444444-4444-4444-4444-444444444444'
);

-- Insert demo users into profiles table
INSERT INTO public.profiles (id, username, full_name, email) VALUES 
('a1111111-1111-1111-1111-111111111111', 'demo_deo', 'Demo DEO User', 'deo@demo.com'),
('a2222222-2222-2222-2222-222222222222', 'demo_officer', 'Demo Officer User', 'officer@demo.com'),
('a3333333-3333-3333-3333-333333333333', 'demo_supervisor', 'Demo Supervisor User', 'supervisor@demo.com'),
('a4444444-4444-4444-4444-444444444444', 'demo_jd', 'Demo Joint Director User', 'jd@demo.com');

-- Insert user roles for demo users
INSERT INTO public.user_roles (user_id, role) VALUES 
('a1111111-1111-1111-1111-111111111111', 'DEO'),
('a2222222-2222-2222-2222-222222222222', 'Officer'),
('a3333333-3333-3333-3333-333333333333', 'Supervisor'),
('a4444444-4444-4444-4444-444444444444', 'JD');
