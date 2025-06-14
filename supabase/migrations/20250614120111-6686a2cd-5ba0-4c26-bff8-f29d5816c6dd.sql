
-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('DEO', 'Officer', 'Supervisor', 'JD');

-- Create committees table
CREATE TABLE public.committees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  district TEXT,
  state TEXT DEFAULT 'Maharashtra',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  email TEXT,
  committee_id UUID REFERENCES public.committees(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for role-based access
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create receipts table
CREATE TABLE public.receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  receipt_number TEXT NOT NULL,
  book_number TEXT NOT NULL,
  date DATE NOT NULL,
  trader_name TEXT NOT NULL,
  trader_license TEXT,
  source_committee_id UUID REFERENCES public.committees(id) NOT NULL,
  dest_committee_id UUID REFERENCES public.committees(id) NOT NULL,
  commodity TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  value DECIMAL(12,2) NOT NULL,
  fees_paid DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'Active',
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(book_number, receipt_number)
);

-- Insert sample committees
INSERT INTO public.committees (name, code, district) VALUES
('Mumbai Agricultural Market Committee', 'MUMBAI_AMC', 'Mumbai'),
('Pune Agricultural Market Committee', 'PUNE_AMC', 'Pune'),
('Nashik Agricultural Market Committee', 'NASHIK_AMC', 'Nashik'),
('Nagpur Agricultural Market Committee', 'NAGPUR_AMC', 'Nagpur'),
('Aurangabad Agricultural Market Committee', 'AURANGABAD_AMC', 'Aurangabad'),
('Kolhapur Agricultural Market Committee', 'KOLHAPUR_AMC', 'Kolhapur'),
('Sangli Agricultural Market Committee', 'SANGLI_AMC', 'Sangli'),
('Solapur Agricultural Market Committee', 'SOLAPUR_AMC', 'Solapur'),
('Ahmednagar Agricultural Market Committee', 'AHMEDNAGAR_AMC', 'Ahmednagar'),
('Satara Agricultural Market Committee', 'SATARA_AMC', 'Satara');

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS app_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.user_roles WHERE user_id = user_uuid LIMIT 1;
$$;

-- Create security definer function to get user committee
CREATE OR REPLACE FUNCTION public.get_user_committee(user_uuid UUID)
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT committee_id FROM public.profiles WHERE id = user_uuid;
$$;

-- RLS Policies for committees (everyone can read)
CREATE POLICY "Anyone can view committees" ON public.committees
  FOR SELECT USING (true);

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "JD can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'JD');

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "JD can view all roles" ON public.user_roles
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'JD');

-- RLS Policies for receipts
CREATE POLICY "DEO can view own receipts" ON public.receipts
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'DEO' AND 
    created_by = auth.uid()
  );

CREATE POLICY "DEO can insert receipts" ON public.receipts
  FOR INSERT WITH CHECK (
    public.get_user_role(auth.uid()) = 'DEO' AND 
    created_by = auth.uid()
  );

CREATE POLICY "DEO can update own receipts" ON public.receipts
  FOR UPDATE USING (
    public.get_user_role(auth.uid()) = 'DEO' AND 
    created_by = auth.uid()
  );

CREATE POLICY "Officer can view all receipts" ON public.receipts
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'Officer');

CREATE POLICY "Supervisor can view committee receipts" ON public.receipts
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'Supervisor' AND 
    (source_committee_id = public.get_user_committee(auth.uid()) OR 
     dest_committee_id = public.get_user_committee(auth.uid()))
  );

CREATE POLICY "JD can view all receipts" ON public.receipts
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'JD');

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
