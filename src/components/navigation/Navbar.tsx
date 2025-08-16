import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Users, Trophy, Settings, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderNavLinks = () => {
    if (!profile) return null;

    const { role } = profile;

    return (
      <div className="flex items-center space-x-6">
        <Link
          to="/events"
          className="text-sm font-medium text-foreground hover:text-primary transition-colors"
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Events
        </Link>

        {role === 'user' && (
          <>
            <Link
              to="/teams"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              <Users className="w-4 h-4 inline mr-2" />
              Teams
            </Link>
            <Link
              to="/dashboard"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
          </>
        )}

        {role === 'coach' && (
          <>
            <Link
              to="/coach/events"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              My Events
            </Link>
            <Link
              to="/coach/dashboard"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
          </>
        )}

        {role === 'admin' && (
          <>
            <Link
              to="/admin/users"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              <Users className="w-4 h-4 inline mr-2" />
              Users
            </Link>
            <Link
              to="/admin/dashboard"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Admin Dashboard
            </Link>
          </>
        )}

        <Link
          to="/leaderboard"
          className="text-sm font-medium text-foreground hover:text-primary transition-colors"
        >
          <Trophy className="w-4 h-4 inline mr-2" />
          Leaderboard
        </Link>
      </div>
    );
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">TE</span>
              </div>
              <span className="font-bold text-xl text-foreground">ImpactBoard</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {renderNavLinks()}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {profile?.name ? getInitials(profile.name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profile?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">
                        Role: {profile?.role}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate('/auth')}>Sign In</Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};