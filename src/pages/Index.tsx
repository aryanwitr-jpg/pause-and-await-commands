import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Calendar, Users, Trophy, ArrowRight } from 'lucide-react';

const Index = () => {
  const { user, profile } = useAuth();

  return (
    <main className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ImpactBoard
          </h1>
          <p className="text-sm text-muted-foreground mb-4">(by Givetastic)</p>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join events, track habits, compete with teams, and achieve your goals together.
            Build stronger connections through shared experiences.
          </p>
          
          {user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/events">
                  <Calendar className="mr-2 h-5 w-5" />
                  Browse Events
                </Link>
              </Button>
              {profile?.role === 'user' && (
                <Button asChild variant="outline" size="lg">
                  <Link to="/dashboard">
                    Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/auth">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/events">
                  View Events
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What You Can Do</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg border bg-card">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-3">Event Management</h3>
              <p className="text-muted-foreground">
                Browse, book, and manage events. Coaches can create and organize events with available seats.
              </p>
              <Button asChild className="mt-4 w-full" variant="outline">
                <Link to="/events">Browse Events</Link>
              </Button>
            </div>
            <div className="text-center p-6 rounded-lg border bg-card">
              <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-3">Team Collaboration</h3>
              <p className="text-muted-foreground">
                Join teams, track habits together, and build stronger relationships through shared goals.
              </p>
              <Button asChild className="mt-4 w-full" variant="outline">
                <Link to="/teams">View Teams</Link>
              </Button>
            </div>
            <div className="text-center p-6 rounded-lg border bg-card">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-3">Habit Tracking</h3>
              <p className="text-muted-foreground">
                Track daily habits, monitor progress, and celebrate achievements with your team.
              </p>
              {user ? (
                <Button asChild className="mt-4 w-full" variant="outline">
                  <Link to="/dashboard">Track Habits</Link>
                </Button>
              ) : (
                <Button asChild className="mt-4 w-full" variant="outline">
                  <Link to="/auth">Sign in to Track</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Role-specific Features */}
      {user && (
        <section className="py-20 px-4 bg-muted/20">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">
              Welcome back, {profile?.name}!
            </h2>
            <p className="text-lg text-muted-foreground mb-8 capitalize">
              You're logged in as a <strong>{profile?.role}</strong>
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {profile?.role === 'user' && (
                <>
                  <Button asChild variant="outline" className="h-auto p-6">
                    <Link to="/events" className="flex flex-col items-center">
                      <Calendar className="w-8 h-8 mb-2" />
                      <span>Browse Events</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto p-6">
                    <Link to="/teams" className="flex flex-col items-center">
                      <Users className="w-8 h-8 mb-2" />
                      <span>My Teams</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto p-6">
                    <Link to="/dashboard" className="flex flex-col items-center">
                      <Trophy className="w-8 h-8 mb-2" />
                      <span>Dashboard</span>
                    </Link>
                  </Button>
                </>
              )}
              
              {profile?.role === 'coach' && (
                <>
                  <Button asChild variant="outline" className="h-auto p-6">
                    <Link to="/coach/events" className="flex flex-col items-center">
                      <Calendar className="w-8 h-8 mb-2" />
                      <span>Manage Events</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto p-6">
                    <Link to="/coach/dashboard" className="flex flex-col items-center">
                      <Trophy className="w-8 h-8 mb-2" />
                      <span>Coach Dashboard</span>
                    </Link>
                  </Button>
                </>
              )}
              
              {profile?.role === 'admin' && (
                <>
                  <Button asChild variant="outline" className="h-auto p-6">
                    <Link to="/admin/users" className="flex flex-col items-center">
                      <Users className="w-8 h-8 mb-2" />
                      <span>Manage Users</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto p-6">
                    <Link to="/admin/dashboard" className="flex flex-col items-center">
                      <Trophy className="w-8 h-8 mb-2" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default Index;
