-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'coach', 'user');

-- Create enum for event status
CREATE TYPE public.event_status AS ENUM ('active', 'booked', 'cancelled');

-- Create enum for habit status
CREATE TYPE public.habit_status AS ENUM ('pending', 'completed', 'missed');

-- Create teams table
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role app_role DEFAULT 'user',
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    total_seats INTEGER NOT NULL CHECK (total_seats > 0),
    available_seats INTEGER NOT NULL CHECK (available_seats >= 0),
    coach_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status event_status DEFAULT 'active',
    image_url TEXT,
    category TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT check_available_seats CHECK (available_seats <= total_seats)
);

-- Create bookings table
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    tickets_count INTEGER NOT NULL CHECK (tickets_count > 0),
    guest_emails TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create habits table
CREATE TABLE public.habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    habit_name TEXT NOT NULL,
    status habit_status DEFAULT 'pending',
    habit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    points INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create progress table
CREATE TABLE public.progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    points INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(team_id)
);

-- Enable RLS on all tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = _user_id
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" 
ON public.profiles FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
TO authenticated WITH CHECK (auth.uid() = id);

-- RLS Policies for teams
CREATE POLICY "Users can view all teams" 
ON public.teams FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Admins can manage teams" 
ON public.teams FOR ALL 
TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Team admins can update their teams" 
ON public.teams FOR UPDATE 
TO authenticated USING (admin_id = auth.uid());

-- RLS Policies for events
CREATE POLICY "Users can view active events" 
ON public.events FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Coaches can manage their events" 
ON public.events FOR ALL 
TO authenticated USING (coach_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Coaches can insert events" 
ON public.events FOR INSERT 
TO authenticated WITH CHECK (coach_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for bookings
CREATE POLICY "Users can view their bookings" 
ON public.bookings FOR SELECT 
TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create bookings" 
ON public.bookings FOR INSERT 
TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their bookings" 
ON public.bookings FOR UPDATE 
TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for habits
CREATE POLICY "Users can view their habits" 
ON public.habits FOR SELECT 
TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can manage their habits" 
ON public.habits FOR ALL 
TO authenticated USING (user_id = auth.uid());

-- RLS Policies for progress
CREATE POLICY "Users can view progress" 
ON public.progress FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "System can update progress" 
ON public.progress FOR ALL 
TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON public.teams
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'name', new.email),
    'user'
  );
  RETURN new;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update available seats when booking
CREATE OR REPLACE FUNCTION public.update_event_seats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.events
    SET available_seats = available_seats - NEW.tickets_count
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.events
    SET available_seats = available_seats + OLD.tickets_count
    WHERE id = OLD.event_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for booking seat updates
CREATE TRIGGER update_seats_on_booking
  AFTER INSERT OR DELETE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_event_seats();