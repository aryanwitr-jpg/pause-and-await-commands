import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Check, X, Calendar, Target } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Habit {
  id: string;
  habit_name: string;
  habit_date: string;
  status: 'pending' | 'completed' | 'missed';
  points: number;
  user_id: string;
}

export const HabitTracker: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingHabit, setAddingHabit] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchHabits();
    }
  }, [user]);

  const fetchHabits = async () => {
    if (!user) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .gte('habit_date', today)
        .order('habit_date', { ascending: true });

      if (error) throw error;
      setHabits(data || []);
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

  const addHabit = async () => {
    if (!user || !newHabitName.trim()) return;
    
    setAddingHabit(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from('habits')
        .insert([{
          user_id: user.id,
          habit_name: newHabitName.trim(),
          habit_date: today,
          status: 'pending',
          points: 10
        }]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Habit added successfully",
      });

      setNewHabitName('');
      setIsDialogOpen(false);
      fetchHabits();
    } catch (error) {
      console.error('Error adding habit:', error);
      toast({
        title: "Error",
        description: "Failed to add habit",
        variant: "destructive",
      });
    } finally {
      setAddingHabit(false);
    }
  };

  const updateHabitStatus = async (habitId: string, status: 'completed' | 'missed') => {
    try {
      const { error } = await supabase
        .from('habits')
        .update({ status })
        .eq('id', habitId);

      if (error) throw error;

      toast({
        title: "Habit Updated",
        description: `Habit marked as ${status}`,
      });

      fetchHabits();
    } catch (error) {
      console.error('Error updating habit:', error);
      toast({
        title: "Error",
        description: "Failed to update habit",
        variant: "destructive",
      });
    }
  };

  const getTodaysHabits = () => {
    const today = new Date().toISOString().split('T')[0];
    return habits.filter(habit => habit.habit_date === today);
  };

  const getCompletedToday = () => {
    return getTodaysHabits().filter(habit => habit.status === 'completed').length;
  };

  const getTotalPointsToday = () => {
    return getTodaysHabits()
      .filter(habit => habit.status === 'completed')
      .reduce((sum, habit) => sum + habit.points, 0);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading habits...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Today's Habits</p>
                <p className="text-2xl font-bold">{getTodaysHabits().length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold">{getCompletedToday()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Points Today</p>
                <p className="text-2xl font-bold">{getTotalPointsToday()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Habit */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daily Habits</CardTitle>
              <CardDescription>
                Track your daily habits and earn points for your team
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Habit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Habit</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="habit-name">Habit Name</Label>
                    <Input
                      id="habit-name"
                      placeholder="e.g., Drink 8 glasses of water"
                      value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addHabit()}
                    />
                  </div>
                  <Button onClick={addHabit} disabled={addingHabit || !newHabitName.trim()} className="w-full">
                    {addingHabit ? 'Adding...' : 'Add Habit'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {getTodaysHabits().length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No habits for today. Add your first habit to get started!
            </p>
          ) : (
            <div className="space-y-3">
              {getTodaysHabits().map((habit) => (
                <div key={habit.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <p className="font-medium">{habit.habit_name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant={
                            habit.status === 'completed' ? 'default' : 
                            habit.status === 'missed' ? 'destructive' : 'secondary'
                          }
                        >
                          {habit.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {habit.points} points
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {habit.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => updateHabitStatus(habit.id, 'completed')}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateHabitStatus(habit.id, 'missed')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};