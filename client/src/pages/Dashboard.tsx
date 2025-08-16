import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Trophy, Calendar, Target, TrendingUp, Leaf, Award } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalHabits: number;
  completedToday: number;
  currentStreak: number;
  totalProgress: number;
  eventsAttended: number;
  teamRank: number;
}

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalHabits: 0,
    completedToday: 0,
    currentStreak: 0,
    totalProgress: 0,
    eventsAttended: 0,
    teamRank: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    if (!user) return;
    
    try {
      // Fetch habits data
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id);

      if (habitsError) throw habitsError;

      // Fetch bookings data
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id);

      if (bookingsError) throw bookingsError;

      // Calculate stats
      const totalHabits = habitsData?.length || 0;
      const today = new Date().toISOString().split('T')[0];
      const completedToday = habitsData?.filter(h => 
        h.habit_date === today && h.status === 'completed'
      ).length || 0;
      
      // Calculate streak
      let currentStreak = 0;
      const sortedHabits = habitsData?.sort((a, b) => 
        new Date(b.habit_date).getTime() - new Date(a.habit_date).getTime()
      ) || [];
      
      let checkDate = new Date();
      for (const habit of sortedHabits) {
        const habitDate = new Date(habit.habit_date);
        if (habitDate.toDateString() === checkDate.toDateString() && habit.status === 'completed') {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      const eventsAttended = bookingsData?.length || 0;
      const totalPoints = habitsData?.reduce((sum, habit) => 
        sum + (habit.status === 'completed' ? habit.points || 0 : 0), 0
      ) || 0;

      setStats({
        totalHabits,
        completedToday,
        currentStreak,
        totalProgress: totalPoints,
        eventsAttended,
        teamRank: 0 // Will be calculated based on team data
      });

      // Set recent activities from real data
      const activities = [
        ...(habitsData?.filter(h => h.status === 'completed').slice(0, 3).map(h => ({
          id: h.id,
          type: 'habit',
          description: `Completed "${h.habit_name}"`,
          points: h.points || 0,
          time: new Date(h.habit_date).toLocaleDateString()
        })) || []),
        ...(bookingsData?.slice(0, 2).map(b => ({
          id: b.id,
          type: 'event',
          description: 'Event booking confirmed',
          points: 50,
          time: b.created_at ? new Date(b.created_at).toLocaleDateString() : 'Recently'
        })) || [])
      ];

      setRecentActivities(activities.slice(0, 4));

    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Keep default zero stats for new users
    } finally {
      setLoading(false);
    }
  };

  const totalEcoPoints = stats.totalProgress;
  const weeklyGoal = 350;
  const weeklyProgress = Math.round((totalEcoPoints / weeklyGoal) * 100);

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Loading Dashboard...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Leaf className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold">Your Sustainability Dashboard</h1>
        </div>
        <p className="text-xl text-muted-foreground">
          Welcome back, {profile?.name}! Track your eco-impact and personal progress
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Eco Points</CardTitle>
            <Award className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totalEcoPoints}</div>
            <p className="text-xs text-muted-foreground">
              {totalEcoPoints === 0 ? 'Start tracking habits to earn points!' : `+${stats.completedToday * 10} from today`}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Habits Today</CardTitle>
            <Target className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.completedToday}/{stats.totalHabits}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalHabits === 0 ? 'No habits tracked yet' : `${Math.round((stats.completedToday / Math.max(stats.totalHabits, 1)) * 100)}% completion rate`}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Calendar className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.currentStreak}</div>
            <p className="text-xs text-muted-foreground">
              {stats.currentStreak === 0 ? 'Start your streak today!' : 'days in a row'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Rank</CardTitle>
            <Trophy className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.teamRank === 0 ? '-' : `#${stats.teamRank}`}</div>
            <p className="text-xs text-muted-foreground">
              {stats.teamRank === 0 ? 'Join a team to compete!' : 'in your team'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Goal Progress */}
      <Card className="mb-8 bg-gradient-to-r from-accent/20 via-primary/5 to-secondary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span>Weekly Eco Goal</span>
              </CardTitle>
              <CardDescription>
                Your progress towards this week's sustainability target
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {weeklyProgress}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">{totalEcoPoints} / {weeklyGoal} points</span>
            </div>
            <Progress value={weeklyProgress} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {weeklyGoal - totalEcoPoints} more points needed to reach your weekly goal! 🌱
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Your latest sustainability actions and achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {activity.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  </div>
                  <Badge variant="default" className="ml-2">
                    +{activity.points}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Environmental Impact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Leaf className="w-5 h-5 text-primary" />
              <span>Your Environmental Impact</span>
            </CardTitle>
            <CardDescription>
              Positive changes you've made this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div>
                  <p className="font-medium">Plastic Bottles Saved</p>
                  <p className="text-sm text-muted-foreground">By using reusable bottles</p>
                </div>
                <div className="text-2xl font-bold text-green-600">42</div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div>
                  <p className="font-medium">CO₂ Reduced</p>
                  <p className="text-sm text-muted-foreground">Through sustainable transport</p>
                </div>
                <div className="text-2xl font-bold text-blue-600">15kg</div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <div>
                  <p className="font-medium">Plant-Based Meals</p>
                  <p className="text-sm text-muted-foreground">Eco-friendly food choices</p>
                </div>
                <div className="text-2xl font-bold text-orange-600">28</div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <div>
                  <p className="font-medium">Events Attended</p>
                  <p className="text-sm text-muted-foreground">Community sustainability events</p>
                </div>
                <div className="text-2xl font-bold text-purple-600">{stats.eventsAttended}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Dashboard;