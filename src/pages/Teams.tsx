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

interface Team {
  id: string;
  name: string;
  admin_id: string;
  points: number;
  created_at: string;
  updated_at: string;
  admin_profile?: {
    name: string;
  };
  member_count?: number;
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
    if (!user) return;

    try {
      // Fetch all teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('points', { ascending: false });

      if (teamsError) throw teamsError;

      // Get member counts for each team
      const teamsWithCounts = await Promise.all(
        (teamsData || []).map(async (team) => {
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('team_id', team.id);
          
          return { ...team, member_count: count || 0 };
        })
      );

      setTeams(teamsWithCounts);

      // Check if user is in a team
      if (profile?.team_id) {
        const userTeamData = teamsWithCounts.find(team => team.id === profile.team_id);
        setUserTeam(userTeamData || null);
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
        .eq('id', user.id);

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
        <h1 className="text-4xl font-bold mb-4">Teams</h1>
        <p className="text-xl text-muted-foreground">
          Join teams and collaborate to achieve your goals together
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
              <Badge variant="default" className="text-lg px-3 py-1">
                <Trophy className="w-4 h-4 mr-2" />
                {userTeam.points} points
              </Badge>
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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                  <CardDescription>
                    Admin: Admin
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  <Trophy className="w-3 h-3 mr-1" />
                  {team.points}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="w-4 h-4 mr-2" />
                  {team.member_count} members
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  Created {new Date(team.created_at).toLocaleDateString()}
                </div>
                
                {!userTeam && team.admin_id !== user?.id && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-4"
                    onClick={() => requestToJoinTeam(team.id, team.admin_profile?.name || 'Admin')}
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