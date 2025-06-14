
-- First, let's check if the users exist and insert them if they don't
-- Insert demo users into profiles table if they don't exist
INSERT INTO public.profiles (id, username, full_name, email) 
SELECT 'a1111111-1111-1111-1111-111111111111', 'demo_deo', 'Demo DEO User', 'deo@demo.com'
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE username = 'demo_deo');

INSERT INTO public.profiles (id, username, full_name, email) 
SELECT 'a2222222-2222-2222-2222-222222222222', 'demo_officer', 'Demo Officer User', 'officer@demo.com'
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE username = 'demo_officer');

INSERT INTO public.profiles (id, username, full_name, email) 
SELECT 'a3333333-3333-3333-3333-333333333333', 'demo_supervisor', 'Demo Supervisor User', 'supervisor@demo.com'
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE username = 'demo_supervisor');

INSERT INTO public.profiles (id, username, full_name, email) 
SELECT 'a4444444-4444-4444-4444-444444444444', 'demo_jd', 'Demo Joint Director User', 'jd@demo.com'
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE username = 'demo_jd');

-- Insert user roles for demo users if they don't exist
INSERT INTO public.user_roles (user_id, role) 
SELECT 'a1111111-1111-1111-1111-111111111111', 'DEO'
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = 'a1111111-1111-1111-1111-111111111111');

INSERT INTO public.user_roles (user_id, role) 
SELECT 'a2222222-2222-2222-2222-222222222222', 'Officer'
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = 'a2222222-2222-2222-2222-222222222222');

INSERT INTO public.user_roles (user_id, role) 
SELECT 'a3333333-3333-3333-3333-333333333333', 'Supervisor'
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = 'a3333333-3333-3333-3333-333333333333');

INSERT INTO public.user_roles (user_id, role) 
SELECT 'a4444444-4444-4444-4444-444444444444', 'JD'
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = 'a4444444-4444-4444-4444-444444444444');
