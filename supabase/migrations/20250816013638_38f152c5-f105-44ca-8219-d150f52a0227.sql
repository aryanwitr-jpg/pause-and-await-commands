-- Fix database schema to match the application needs

-- Drop existing tables and recreate with proper structure
DROP TABLE IF EXISTS habits CASCADE;
DROP TABLE IF EXISTS progress CASCADE;

-- Create habits table with proper structure
CREATE TABLE public.habits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_frequency INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create habit_progress table
CREATE TABLE public.habit_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(habit_id, user_id, date)
);

-- Create event_bookings table
CREATE TABLE public.event_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Create team_members table 
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Update teams table structure
ALTER TABLE public.teams DROP COLUMN IF EXISTS admin_id;
ALTER TABLE public.teams DROP COLUMN IF EXISTS points;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS created_by UUID NOT NULL REFERENCES auth.users(id);

-- Update events table
ALTER TABLE public.events RENAME COLUMN event_date TO date;
ALTER TABLE public.events RENAME COLUMN total_seats TO max_seats;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS time TEXT;

-- Enable RLS
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for habits
CREATE POLICY "Users can view their own habits" ON public.habits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own habits" ON public.habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits" ON public.habits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits" ON public.habits
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for habit_progress
CREATE POLICY "Users can view their own habit progress" ON public.habit_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own habit progress" ON public.habit_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for event_bookings
CREATE POLICY "Users can view their own bookings" ON public.event_bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings" ON public.event_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookings" ON public.event_bookings
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for team_members
CREATE POLICY "Users can view team members" ON public.team_members
  FOR SELECT USING (true);

CREATE POLICY "Users can join teams" ON public.team_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave teams" ON public.team_members
  FOR DELETE USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON public.habits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create views for leaderboards
CREATE OR REPLACE VIEW public.user_habit_stats AS
SELECT 
  p.id as user_id,
  p.name,
  p.role,
  COUNT(h.id) as total_habits,
  COUNT(CASE WHEN hp.date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as completed_this_week,
  CASE 
    WHEN COUNT(h.id) > 0 THEN 
      (COUNT(CASE WHEN hp.date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END)::float / COUNT(h.id)::float) * 100
    ELSE 0 
  END as completion_rate,
  0 as current_streak
FROM profiles p
LEFT JOIN habits h ON h.user_id = p.id
LEFT JOIN habit_progress hp ON hp.habit_id = h.id
WHERE p.role = 'user'
GROUP BY p.id, p.name, p.role;

CREATE OR REPLACE VIEW public.team_habit_stats AS
SELECT 
  t.id as team_id,
  t.name as team_name,
  COUNT(DISTINCT tm.user_id) as member_count,
  AVG(uhs.completion_rate) as total_completion_rate,
  AVG(uhs.total_habits) as average_habits_per_member
FROM teams t
LEFT JOIN team_members tm ON tm.team_id = t.id
LEFT JOIN user_habit_stats uhs ON uhs.user_id = tm.user_id
GROUP BY t.id, t.name;