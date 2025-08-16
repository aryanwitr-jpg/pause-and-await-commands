import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  max_seats: number;
  available_seats: number;
  coach_id: string;
  coach_profile?: {
    name: string;
  };
  user_bookings?: Array<{ user_id: string }>;
}

const Events = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          coach_profile:profiles!events_coach_id_fkey(name),
          user_bookings:event_bookings(user_id)
        `)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const bookEvent = async (eventId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('event_bookings')
        .insert([{ event_id: eventId, user_id: user.id }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event booked successfully!",
      });
      fetchEvents();
    } catch (error) {
      console.error('Error booking event:', error);
      toast({
        title: "Error",
        description: "Failed to book event",
        variant: "destructive",
      });
    }
  };

  const isUserBooked = (event: Event) => {
    return event.user_bookings?.some(booking => booking.user_id === user?.id);
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Events</h1>
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Upcoming Events</h1>
        <p className="text-xl text-muted-foreground">Join events and connect with your community</p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No upcoming events available.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="h-full flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  <Badge variant={event.available_seats > 0 ? "default" : "secondary"}>
                    {event.available_seats > 0 ? "Available" : "Full"}
                  </Badge>
                </div>
                <CardDescription>{event.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" />
                    {event.time}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    {event.available_seats} / {event.max_seats} seats available
                  </div>
                  {event.coach_profile && (
                    <p className="text-sm text-muted-foreground">
                      Coach: {event.coach_profile.name}
                    </p>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                {user ? (
                  <Button 
                    onClick={() => bookEvent(event.id)}
                    disabled={event.available_seats === 0 || isUserBooked(event)}
                    className="w-full"
                  >
                    {isUserBooked(event) ? "Already Booked" : 
                     event.available_seats === 0 ? "Event Full" : "Book Event"}
                  </Button>
                ) : (
                  <Button asChild className="w-full">
                    <a href="/auth">Sign in to Book</a>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
};

export default Events;