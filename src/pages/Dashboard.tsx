import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Trophy, Calendar, Target, TrendingUp, Leaf, Award, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { dummyTeams } from '@/data/dummyData';

interface DashboardStats {
  totalHabits: number;
  completedToday: number;
  currentStreak: number;
  totalProgress: number;
  eventsAttended: number;
  teamRank: number;
}

interface ProgressData {
  date: string;
  habits: number;
  points: number;
}

interface LeaderboardEntry {
  name: string;
  points: number;
  rank: number;
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
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
      generateProgressData();
      generateLeaderboardData();
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
        currentStreak: 5, // Mock streak data
        totalProgress: totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0,
        eventsAttended,
        teamRank: 2 // Mock team rank
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateProgressData = () => {
    // Generate 7 days of mock progress data
    const data: ProgressData[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        habits: Math.floor(Math.random() * 8) + 2, // 2-10 habits
        points: Math.floor(Math.random() * 100) + 50 // 50-150 points
      });
    }
    
    setProgressData(data);
  };

  const generateLeaderboardData = () => {
    // Use team data to create individual leaderboard
    const allMembers = dummyTeams.flatMap(team => 
      team.members.map(member => ({
        name: member.name,
        points: member.points,
        rank: 0
      }))
    );
    
    // Sort by points and assign ranks
    allMembers.sort((a, b) => b.points - a.points);
    allMembers.forEach((member, index) => {
      member.rank = index + 1;
    });
    
    // Take top 5 for display
    setLeaderboard(allMembers.slice(0, 5));
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

        {/* Progress Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span>7-Day Progress</span>
            </CardTitle>
            <CardDescription>
              Your daily habits and points over the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {progressData.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{day.date}</p>
                    <p className="text-sm text-muted-foreground">{day.habits} habits completed</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{day.points}</div>
                      <div className="text-xs text-muted-foreground">points</div>
                    </div>
                    <div className="w-20">
                      <Progress value={(day.points / 150) * 100} className="h-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Leaderboard */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-primary" />
            <span>Top Performers</span>
          </CardTitle>
          <CardDescription>
            See how you compare with other sustainability champions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboard.map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    entry.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                    entry.rank === 2 ? 'bg-gray-100 text-gray-800' :
                    entry.rank === 3 ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    #{entry.rank}
                  </div>
                  <div>
                    <p className="font-medium">{entry.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.name === profile?.name ? 'You' : 'Team Member'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">{entry.points}</div>
                  <div className="text-xs text-muted-foreground">points</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default Dashboard;