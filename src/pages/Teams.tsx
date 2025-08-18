import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Plus, Mail, Trophy, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { dummyTeams } from '@/data/dummyData';

interface Team {
  id: string;
  name: string;
  description?: string;
  admin_id?: string | null;
  points?: number | null;
  total_points?: number;
  efficiency?: number;
  created_at: string | null;
  updated_at?: string | null;
  admin_profile?: {
    name: string;
  } | null;
  member_count?: number;
  members?: Array<{
    name: string;
    points: number;
    efficiency: number;
  }>;
}

const Teams = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  useEffect(() => {
    if (user) {
      fetchTeams();
    }
  }, [user]);

  const fetchTeams = async () => {
    try {
      // Use dummy data for demo - sorted by total points
      const teamsData = [...dummyTeams].sort((a, b) => (b.total_points || 0) - (a.total_points || 0));
      setTeams(teamsData);

      // Check if user is in a team (simulate)
      if (user && Math.random() > 0.5) {
        setUserTeam(teamsData[0]); // Randomly assign to first team for demo
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Error",
        description: "Failed to load teams",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async () => {
    if (!user || !newTeamName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([{
          name: newTeamName,
          admin_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      // Update user's team_id
      await supabase
        .from('profiles')
        .update({ team_id: data.id })
        .eq('user_id', user.id);

      toast({
        title: "Success",
        description: "Team created successfully!",
      });
      
      setNewTeamName('');
      setIsCreateDialogOpen(false);
      fetchTeams();
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive",
      });
    }
  };

  const requestToJoinTeam = async (teamId: string, adminEmail: string) => {
    if (!user || !profile) return;

    try {
      // In a real app, you'd send an email here
      // For now, we'll show a toast with instructions
      toast({
        title: "Join Request",
        description: `Please email ${adminEmail} to request joining this team. Include your name: ${profile.name}`,
      });
    } catch (error) {
      console.error('Error sending join request:', error);
      toast({
        title: "Error",
        description: "Failed to send join request",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Teams</h1>
          <p className="text-muted-foreground">Loading teams...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Trophy className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold">Team Leaderboard</h1>
        </div>
        <p className="text-xl text-muted-foreground">
          Join teams and collaborate to achieve your sustainability goals together
        </p>
      </div>

      {userTeam ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              My Team: {userTeam.name}
            </CardTitle>
            <CardDescription>
              You're part of this amazing team!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Admin: Admin
                </p>
                <p className="text-sm text-muted-foreground">
                  Members: {userTeam.member_count}
                </p>
              </div>
              <div className="flex space-x-3">
                <Badge variant="default" className="text-lg px-3 py-1">
                  <Trophy className="w-4 h-4 mr-2" />
                  {userTeam.total_points || userTeam.points || 0} points
                </Badge>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {userTeam.efficiency || 75}% efficiency
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Join a Team</CardTitle>
            <CardDescription>
              You're not part of any team yet. Create one or join an existing team!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Team
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Team</DialogTitle>
                    <DialogDescription>
                      Start your own team and invite others to join.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="team-name">Team Name</Label>
                      <Input
                        id="team-name"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        placeholder="e.g., Fitness Warriors"
                      />
                    </div>
                    <Button onClick={createTeam} className="w-full">
                      Create Team
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Full Rankings Link */}
      <Card className="mb-8">
        <CardContent className="text-center py-8">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">View Full Team Rankings</h3>
          <p className="text-muted-foreground mb-4">
            See detailed team statistics, rankings, and top performers in the leaderboard.
          </p>
          <Button asChild>
            <a href="/leaderboard">View Leaderboard</a>
          </Button>
        </CardContent>
      </Card>

      {teams.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
          <p className="text-muted-foreground mb-4">
            Be the first to create a team and start building your community.
          </p>
        </div>
      )}
    </main>
  );
};

export default Teams;