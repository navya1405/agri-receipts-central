
-- Remove all demo receipts first (to avoid foreign key constraints)
DELETE FROM public.receipts;

-- Remove demo user roles
DELETE FROM public.user_roles WHERE user_id IN (
  'a1111111-1111-1111-1111-111111111111',
  'a2222222-2222-2222-2222-222222222222', 
  'a3333333-3333-3333-3333-333333333333',
  'a4444444-4444-4444-4444-444444444444'
);

-- Remove demo user profiles
DELETE FROM public.profiles WHERE id IN (
  'a1111111-1111-1111-1111-111111111111',
  'a2222222-2222-2222-2222-222222222222',
  'a3333333-3333-3333-3333-333333333333', 
  'a4444444-4444-4444-4444-444444444444'
);

-- Remove demo auth users (if they exist)
DELETE FROM auth.users WHERE id IN (
  'a1111111-1111-1111-1111-111111111111',
  'a2222222-2222-2222-2222-222222222222',
  'a3333333-3333-3333-3333-333333333333', 
  'a4444444-4444-4444-4444-444444444444'
);

-- Remove all demo committees
DELETE FROM public.committees;
