import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Users, Target, Calendar, Mail, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TeamLeaderboard {
  id: string;
  name: string;
  points: number;
  member_count: number;
  rank: number;
  admin_name?: string;
  description?: string;
  efficiency?: number;
  created_at?: string;
  members?: Array<{
    name: string;
    points: number;
    efficiency: number;
  }>;
}

interface UserLeaderboard {
  id: string;
  name: string;
  habits_completed: number;
  current_streak: number;
  rank: number;
  team_name?: string;
}

const Leaderboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [teamLeaderboard, setTeamLeaderboard] = useState<TeamLeaderboard[]>([]);
  const [userLeaderboard, setUserLeaderboard] = useState<UserLeaderboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'teams' | 'users'>('teams');

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    try {
      // Use dummy data for teams leaderboard from dummyData
      const { dummyTeams } = await import('@/data/dummyData');
      
      // Sort teams by total points and assign ranks
      const sortedTeams = [...dummyTeams]
        .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
        .map((team, index) => ({
          id: team.id,
          name: team.name,
          points: team.total_points || 0,
          member_count: team.member_count || 0,
          rank: index + 1,
          admin_name: 'Admin',
          description: team.description,
          efficiency: team.efficiency || 75,
          created_at: team.created_at,
          members: team.members
        }));

      setTeamLeaderboard(sortedTeams);

      // Fetch user leaderboard based on habits completed
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          team:teams(name)
        `);

      if (usersError) throw usersError;

      // Calculate habit completion for each user
      const usersWithStats = await Promise.all(
        (usersData || []).map(async (user) => {
          const { data: habitsData } = await supabase
            .from('habits')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'completed');

          const habitsCompleted = habitsData?.length || 0;
          
          // Calculate current streak (simplified)
          const currentStreak = 0; // We'll implement this properly later

          return {
            id: user.id,
            name: user.name,
            habits_completed: habitsCompleted,
            current_streak: currentStreak,
            rank: 0, // Will be set after sorting
            team_name: user.team?.name
          };
        })
      );

      // Sort by habits completed and assign ranks
      const sortedUsers = usersWithStats
        .sort((a, b) => b.habits_completed - a.habits_completed)
        .map((user, index) => ({
          ...user,
          rank: index + 1
        }));

      setUserLeaderboard(sortedUsers);
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
      toast({
        title: "Error",
        description: "Failed to load leaderboards",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold">{rank}</span>;
    }
  };

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1:
        return "default";
      case 2:
        return "secondary";
      case 3:
        return "outline";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Leaderboard</h1>
          <p className="text-muted-foreground">Loading leaderboards...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Leaderboard</h1>
        <p className="text-xl text-muted-foreground">
          See how teams and users are performing
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'teams'
                ? 'bg-background text-foreground shadow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Teams
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-background text-foreground shadow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Target className="w-4 h-4 inline mr-2" />
            Users
          </button>
        </div>
      </div>

      {activeTab === 'teams' ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              Team Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teamLeaderboard.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No teams found</p>
              </div>
            ) : (
              <>
                {/* Top 5 Ranking Overview */}
                <div className="space-y-4 mb-8">
                  <h3 className="text-lg font-semibold">Top 5 Teams</h3>
                  {teamLeaderboard.slice(0, 5).map((team) => (
                    <div
                      key={team.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        team.rank <= 3 ? 'bg-muted/50' : 'bg-background'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                          team.rank === 1 ? 'bg-yellow-500' : 
                          team.rank === 2 ? 'bg-gray-400' : 
                          team.rank === 3 ? 'bg-orange-600' : 'bg-primary'
                        }`}>
                          {team.rank}
                        </div>
                        <div>
                          <h3 className="font-semibold">{team.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {team.member_count} members • {team.efficiency}% efficiency
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={getRankBadgeVariant(team.rank)} className="text-lg px-3 py-1">
                          {team.points} points
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          Rank #{team.rank}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Detailed Team Cards */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">All Teams</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teamLeaderboard.map((team) => (
                      <Card key={team.id} className="relative">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center space-x-2">
                                <CardTitle className="text-lg">{team.name}</CardTitle>
                                {team.rank <= 3 && (
                                  <Badge variant={team.rank === 1 ? "default" : "secondary"} className="text-xs">
                                    #{team.rank}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {team.description}
                              </p>
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                              <Badge variant="secondary" className="flex items-center">
                                <Trophy className="w-3 h-3 mr-1" />
                                {team.points}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {team.efficiency}% eff.
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Users className="w-4 h-4 mr-2" />
                              {team.member_count} members
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4 mr-2" />
                              Created {new Date(team.created_at || '2024-01-01').toLocaleDateString()}
                            </div>
                            
                            {team.members && team.members.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2">Top Contributors:</p>
                                <div className="space-y-1">
                                  {team.members.slice(0, 3).map((member, idx) => (
                                    <div key={idx} className="flex justify-between text-xs">
                                      <span className="text-muted-foreground">{member.name}</span>
                                      <span className="font-medium">{member.points} pts</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              User Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userLeaderboard.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userLeaderboard.slice(0, 20).map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      user.rank <= 3 ? 'bg-muted/50' : 'bg-background'
                    } ${user.id === profile?.id ? 'ring-2 ring-primary' : ''}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8">
                        {getRankIcon(user.rank)}
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {user.name}
                          {user.id === profile?.id && (
                            <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {user.team_name ? `Team: ${user.team_name}` : 'No team'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={getRankBadgeVariant(user.rank)} className="text-lg px-3 py-1">
                        {user.habits_completed} habits
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        Rank #{user.rank}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </main>
  );
};

export default Leaderboard;