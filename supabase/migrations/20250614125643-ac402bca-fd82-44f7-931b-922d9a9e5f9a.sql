
-- Create demo users without ON CONFLICT clauses
-- First check if users already exist and only insert if they don't

DO $$
BEGIN
  -- Insert demo users only if they don't already exist
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'deo@demo.com') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      'a1111111-1111-1111-1111-111111111111',
      'authenticated',
      'authenticated',
      'deo@demo.com',
      '$2a$10$8K1p/a0dhrxSHxN1nByIy.x8dvp7Vp6s8rLRHBGwPkP.BjvQC5QGy',
      NOW(),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "Demo DEO User", "username": "demo_deo"}'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'officer@demo.com') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      'a2222222-2222-2222-2222-222222222222',
      'authenticated',
      'authenticated',
      'officer@demo.com',
      '$2a$10$8K1p/a0dhrxSHxN1nByIy.x8dvp7Vp6s8rLRHBGwPkP.BjvQC5QGy',
      NOW(),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "Demo Officer User", "username": "demo_officer"}'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'supervisor@demo.com') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      'a3333333-3333-3333-3333-333333333333',
      'authenticated',
      'authenticated',
      'supervisor@demo.com',
      '$2a$10$8K1p/a0dhrxSHxN1nByIy.x8dvp7Vp6s8rLRHBGwPkP.BjvQC5QGy',
      NOW(),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "Demo Supervisor User", "username": "demo_supervisor"}'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'jd@demo.com') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      'a4444444-4444-4444-4444-444444444444',
      'authenticated',
      'authenticated',
      'jd@demo.com',
      '$2a$10$8K1p/a0dhrxSHxN1nByIy.x8dvp7Vp6s8rLRHBGwPkP.BjvQC5QGy',
      NOW(),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "Demo Joint Director User", "username": "demo_jd"}'
    );
  END IF;
END $$;

-- Insert profiles for demo users (using IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = 'a1111111-1111-1111-1111-111111111111') THEN
    INSERT INTO public.profiles (id, username, full_name, email) VALUES 
    ('a1111111-1111-1111-1111-111111111111', 'demo_deo', 'Demo DEO User', 'deo@demo.com');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = 'a2222222-2222-2222-2222-222222222222') THEN
    INSERT INTO public.profiles (id, username, full_name, email) VALUES 
    ('a2222222-2222-2222-2222-222222222222', 'demo_officer', 'Demo Officer User', 'officer@demo.com');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = 'a3333333-3333-3333-3333-333333333333') THEN
    INSERT INTO public.profiles (id, username, full_name, email) VALUES 
    ('a3333333-3333-3333-3333-333333333333', 'demo_supervisor', 'Demo Supervisor User', 'supervisor@demo.com');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = 'a4444444-4444-4444-4444-444444444444') THEN
    INSERT INTO public.profiles (id, username, full_name, email) VALUES 
    ('a4444444-4444-4444-4444-444444444444', 'demo_jd', 'Demo Joint Director User', 'jd@demo.com');
  END IF;
END $$;

-- Assign roles to demo users (using IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = 'a1111111-1111-1111-1111-111111111111' AND role = 'DEO') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES ('a1111111-1111-1111-1111-111111111111', 'DEO');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = 'a2222222-2222-2222-2222-222222222222' AND role = 'Officer') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES ('a2222222-2222-2222-2222-222222222222', 'Officer');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = 'a3333333-3333-3333-3333-333333333333' AND role = 'Supervisor') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES ('a3333333-3333-3333-3333-333333333333', 'Supervisor');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = 'a4444444-4444-4444-4444-444444444444' AND role = 'JD') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES ('a4444444-4444-4444-4444-444444444444', 'JD');
  END IF;
END $$;
