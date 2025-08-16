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

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      if (!user) return;

      // Fetch user's habits
      const { data: habitsData } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id);

      // Fetch user's bookings  
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id);

      const totalHabits = habitsData?.length || 0;
      const completedToday = habitsData?.filter(h => 
        h.status === 'completed' && 
        new Date(h.habit_date).toDateString() === new Date().toDateString()
      ).length || 0;
      const eventsAttended = bookingsData?.length || 0;

      setStats({
        totalHabits,
        completedToday,
        currentStreak: 0, // Calculate properly later
        totalProgress: totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0,
        eventsAttended,
        teamRank: 1 // Calculate from leaderboard later
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sample recent activities for demo
  const recentActivities = [
    { id: 1, type: 'habit', description: 'Completed "Use reusable water bottle"', points: 10, time: '2 hours ago' },
    { id: 2, type: 'event', description: 'Attended "Community Solar Garden Workshop"', points: 50, time: '1 day ago' },
    { id: 3, type: 'habit', description: 'Completed "Take public transport"', points: 15, time: '1 day ago' },
    { id: 4, type: 'team', description: 'Joined team "Green Warriors"', points: 25, time: '3 days ago' },
  ];

  const totalEcoPoints = profile?.total_points || 0;
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
              +45 from yesterday
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
              {Math.round((stats.completedToday / stats.totalHabits) * 100)}% completion rate
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
              days in a row
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Rank</CardTitle>
            <Trophy className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">#{stats.teamRank}</div>
            <p className="text-xs text-muted-foreground">
              in Green Warriors team
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