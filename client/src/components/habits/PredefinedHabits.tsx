import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Leaf } from 'lucide-react';
import { predefinedHabits } from '@/data/dummyData';

interface PredefinedHabitsProps {
  onAddHabit: (habitName: string, points: number) => void;
  userHabits: string[];
}

export const PredefinedHabits: React.FC<PredefinedHabitsProps> = ({ onAddHabit, userHabits }) => {
  const availableHabits = predefinedHabits.filter(
    habit => !userHabits.includes(habit.name)
  );

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Leaf className="w-5 h-5 text-primary" />
          <CardTitle>Suggested Eco-Habits</CardTitle>
        </div>
        <CardDescription>
          Choose from our curated list of sustainable habits to add to your routine
        </CardDescription>
      </CardHeader>
      <CardContent>
        {availableHabits.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Great job! You've added all our suggested habits. Keep up the sustainable lifestyle!
          </p>
        ) : (
          <div className="grid gap-3">
            {availableHabits.map((habit, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium">{habit.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {habit.points} pts
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{habit.description}</p>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {habit.category}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  onClick={() => onAddHabit(habit.name, habit.points)}
                  className="ml-4"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};