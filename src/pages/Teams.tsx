import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Crown, Plus, UserPlus, Target } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Team {
  id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
  team_members?: Array<{
    user_id: string;
    joined_at: string;
    user_profile: {
      name: string;
      role: string;
    };
  }>;
  creator_profile?: {
    name: string;
  };
}

const Teams = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTeam, setNewTeam] = useState({ name: '', description: '' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTeams();
      fetchUserTeams();
    }
  }, [user]);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          creator_profile:profiles!teams_created_by_fkey(name),
          team_members:team_members(
            user_id,
            joined_at,
            user_profile:profiles(name, role)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchUserTeams = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          team:teams(
            *,
            creator_profile:profiles!teams_created_by_fkey(name),
            team_members:team_members(
              user_id,
              joined_at,
              user_profile:profiles(name, role)
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setUserTeams(data?.map(item => item.team).filter(Boolean) || []);
    } catch (error) {
      console.error('Error fetching user teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async () => {
    if (!user || !newTeam.name.trim()) return;

    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([{
          name: newTeam.name,
          description: newTeam.description,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      // Add creator as team member
      await supabase
        .from('team_members')
        .insert([{
          team_id: data.id,
          user_id: user.id
        }]);

      toast({
        title: "Success",
        description: "Team created successfully!",
      });
      
      setNewTeam({ name: '', description: '' });
      setIsDialogOpen(false);
      fetchTeams();
      fetchUserTeams();
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive",
      });
    }
  };

  const joinTeam = async (teamId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .insert([{
          team_id: teamId,
          user_id: user.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Joined team successfully!",
      });
      
      fetchTeams();
      fetchUserTeams();
    } catch (error) {
      console.error('Error joining team:', error);
      toast({
        title: "Error",
        description: "Failed to join team",
        variant: "destructive",
      });
    }
  };

  const isUserInTeam = (team: Team) => {
    return team.team_members?.some(member => member.user_id === user?.id);
  };

  const isTeamCreator = (team: Team) => {
    return team.created_by === user?.id;
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
        <p className="text-xl text-muted-foreground">Join teams and achieve goals together</p>
      </div>

      {/* My Teams Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Teams</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                  Create a team to collaborate and achieve goals together.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="team-name">Team Name</Label>
                  <Input
                    id="team-name"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Fitness Warriors"
                  />
                </div>
                <div>
                  <Label htmlFor="team-description">Description</Label>
                  <Textarea
                    id="team-description"
                    value={newTeam.description}
                    onChange={(e) => setNewTeam(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="What are your team's goals?"
                  />
                </div>
                <Button onClick={createTeam} className="w-full">
                  Create Team
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {userTeams.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
              <p className="text-muted-foreground mb-4">
                Join or create a team to start collaborating with others.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {userTeams.map((team) => (
              <Card key={team.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    {isTeamCreator(team) && (
                      <Badge variant="secondary">
                        <Crown className="w-3 h-3 mr-1" />
                        Owner
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{team.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-2" />
                      {team.team_members?.length || 0} members
                    </div>
                    
                    <div className="flex -space-x-2 overflow-hidden">
                      {team.team_members?.slice(0, 5).map((member, index) => (
                        <Avatar key={member.user_id} className="inline-block border-2 border-background">
                          <AvatarFallback className="text-xs">
                            {member.user_profile?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {(team.team_members?.length || 0) > 5 && (
                        <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-background bg-muted text-xs">
                          +{(team.team_members?.length || 0) - 5}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* All Teams Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Discover Teams</h2>
        
        {teams.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No teams available</h3>
              <p className="text-muted-foreground">
                Be the first to create a team in your community.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.filter(team => !isUserInTeam(team)).map((team) => (
              <Card key={team.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                  <CardDescription>{team.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-2" />
                      {team.team_members?.length || 0} members
                    </div>
                    
                    {team.creator_profile && (
                      <p className="text-sm text-muted-foreground">
                        Created by {team.creator_profile.name}
                      </p>
                    )}
                    
                    <div className="flex -space-x-2 overflow-hidden">
                      {team.team_members?.slice(0, 5).map((member, index) => (
                        <Avatar key={member.user_id} className="inline-block border-2 border-background">
                          <AvatarFallback className="text-xs">
                            {member.user_profile?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {(team.team_members?.length || 0) > 5 && (
                        <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-background bg-muted text-xs">
                          +{(team.team_members?.length || 0) - 5}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button 
                    onClick={() => joinTeam(team.id)}
                    className="w-full"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Join Team
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Teams;