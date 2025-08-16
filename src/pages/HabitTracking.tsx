import React from 'react';
import { HabitTracker } from '@/components/habits/HabitTracker';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const HabitTracking = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Habit Tracking</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Sign in to start tracking your daily habits and earning points for your team.
          </p>
          <Button asChild size="lg">
            <Link to="/auth">Sign In to Track Habits</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Habit Tracking</h1>
        <p className="text-xl text-muted-foreground">
          Track your daily habits and contribute to your team's success
        </p>
      </div>
      
      <HabitTracker />
    </main>
  );
};

export default HabitTracking;