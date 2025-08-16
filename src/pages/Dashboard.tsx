import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Target, TrendingUp, Users, Plus, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Habit {
  id: string;
  user_id: string;
  habit_name: string;
  habit_date: string;
  status: 'pending' | 'completed' | 'missed';
  points: number;
  created_at: string;
}

interface DashboardStats {
  totalHabits: number;
  completedToday: number;
  currentStreak: number;
  totalProgress: number;
}

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalHabits: 0,
    completedToday: 0,
    currentStreak: 0,
    totalProgress: 0
  });
  const [loading, setLoading] = useState(true);
  const [newHabit, setNewHabit] = useState({ name: '', description: '', target_frequency: 1 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchHabits();
    }
  }, [user]);

  const fetchHabits = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setHabits(data || []);
      
      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const totalHabits = data?.length || 0;
      const completedToday = data?.filter(habit => 
        habit.habit_date === today && habit.status === 'completed'
      ).length || 0;
      
      setStats({
        totalHabits,
        completedToday,
        currentStreak: 0, // We'll calculate this properly later
        totalProgress: totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0
      });
    } catch (error) {
      console.error('Error fetching habits:', error);
      toast({
        title: "Error",
        description: "Failed to load habits",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createHabit = async () => {
    if (!user || !newHabit.name.trim()) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('habits')
        .insert([{
          user_id: user.id,
          habit_name: newHabit.name,
          habit_date: today,
          status: 'pending'
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Habit created successfully!",
      });
      
      setNewHabit({ name: '', description: '', target_frequency: 1 });
      setIsDialogOpen(false);
      fetchHabits();
    } catch (error) {
      console.error('Error creating habit:', error);
      toast({
        title: "Error",
        description: "Failed to create habit",
        variant: "destructive",
      });
    }
  };

  const markHabitComplete = async (habitId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('habits')
        .update({ 
          status: 'completed',
          habit_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', habitId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Well done!",
        description: "Habit marked as complete for today",
      });
      
      fetchHabits();
    } catch (error) {
      console.error('Error marking habit complete:', error);
      toast({
        title: "Error",
        description: "Failed to mark habit complete",
        variant: "destructive",
      });
    }
  };

  const isHabitCompletedToday = (habit: Habit) => {
    const today = new Date().toISOString().split('T')[0];
    return habit.habit_date === today && habit.status === 'completed';
  };

  const getHabitProgress = (habit: Habit) => {
    // For now, just return 0-100 based on completion status
    return habit.status === 'completed' ? 100 : 0;
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Habit Tracker Dashboard</h1>
          <p className="text-muted-foreground">Loading your progress...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Habit Tracker</h1>
        <p className="text-sm text-muted-foreground mb-4">(by Givetastic)</p>
        <p className="text-xl text-muted-foreground">Track your daily habits and build consistency</p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Habits</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHabits}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedToday}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProgress}%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentStreak} days</div>
          </CardContent>
        </Card>
      </div>

      {/* Habits Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Habits</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Habit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Habit</DialogTitle>
              <DialogDescription>
                Add a new habit to track your daily progress.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="habit-name">Habit Name</Label>
                <Input
                  id="habit-name"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Drink 8 glasses of water"
                />
              </div>
              <div>
                <Label htmlFor="habit-description">Description (Optional)</Label>
                <Input
                  id="habit-description"
                  value={newHabit.description}
                  onChange={(e) => setNewHabit(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Why is this habit important to you?"
                />
              </div>
              <Button onClick={createHabit} className="w-full">
                Create Habit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {habits.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No habits yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building better habits by creating your first one.
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Habit
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {habits.map((habit) => (
            <Card key={habit.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{habit.habit_name}</CardTitle>
                    <CardDescription>Created: {new Date(habit.created_at).toLocaleDateString()}</CardDescription>
                  </div>
                  <Badge variant={isHabitCompletedToday(habit) ? "default" : "secondary"}>
                    {isHabitCompletedToday(habit) ? "Complete" : "Pending"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Status</span>
                      <span className="capitalize">{habit.status}</span>
                    </div>
                    <Progress value={getHabitProgress(habit)} className="h-2" />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Date: {new Date(habit.habit_date).toLocaleDateString()}
                    </span>
                    <Button
                      onClick={() => markHabitComplete(habit.id)}
                      disabled={isHabitCompletedToday(habit)}
                      size="sm"
                    >
                      {isHabitCompletedToday(habit) ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Done Today
                        </>
                      ) : (
                        "Mark Complete"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
};

export default Dashboard;