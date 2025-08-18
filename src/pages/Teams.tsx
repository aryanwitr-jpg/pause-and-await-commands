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

      {/* Leaderboard */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-primary" />
            Team Rankings
          </CardTitle>
          <CardDescription>Teams ranked by sustainability points and efficiency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teams.slice(0, 5).map((team, index) => (
              <div key={team.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-600' : 'bg-primary'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold">{team.name}</h3>
                    <p className="text-sm text-muted-foreground">{team.member_count} members</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">{team.total_points || team.points || 0} pts</Badge>
                    <Badge variant="secondary">{team.efficiency || 75}%</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team, index) => (
          <Card key={team.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    {index < 3 && (
                      <Badge variant={index === 0 ? "default" : "secondary"} className="text-xs">
                        #{index + 1}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="mt-1">
                    {team.description}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <Badge variant="secondary" className="flex items-center">
                    <Trophy className="w-3 h-3 mr-1" />
                    {team.total_points || team.points || 0}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {team.efficiency || 75}% eff.
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
                
                {!userTeam && team.admin_id !== user?.id && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-4"
                    onClick={() => requestToJoinTeam(team.id, 'Team Admin')}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Request to Join
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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