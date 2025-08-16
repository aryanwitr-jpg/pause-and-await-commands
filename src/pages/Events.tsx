import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { EventFilters } from '@/components/events/EventFilters';
import { BookingDialog } from '@/components/events/BookingDialog';
import { Calendar, MapPin, Users, Clock, Leaf } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { dummyEvents, dummyCoaches } from '@/data/dummyData';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  total_seats: number;
  available_seats: number;
  coach_id: string;
  category?: string;
  image_url?: string;
  coach_profile?: {
    name: string;
  };
  bookings?: Array<{ user_id: string }>;
}

const Events = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [coaches, setCoaches] = useState<Array<{ id: string; name: string }>>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    coach: 'all',
    location: 'all',
    date: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // Use dummy data for demo - commenting out Supabase call
      // const { data, error } = await supabase...
      
      const eventsData = dummyEvents.map(event => ({
        ...event,
        coach_profile: { name: dummyCoaches.find(c => c.id === event.coach_id)?.name || 'Unknown' },
        bookings: [] // Empty for demo
      }));
      
      setEvents(eventsData);
      setFilteredEvents(eventsData);
      
      // Extract unique coaches, categories, and locations for filters
      const uniqueCoaches = dummyCoaches.map(coach => ({ id: coach.id, name: coach.name }));
      const uniqueCategories = [...new Set(eventsData.map(e => e.category).filter(Boolean))];
      const uniqueLocations = [...new Set(eventsData.map(e => e.location).filter(Boolean))];
      
      setCoaches(uniqueCoaches);
      setCategories(uniqueCategories);
      setLocations(uniqueLocations);
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

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const applyFilters = (currentFilters: typeof filters) => {
    let filtered = events;

    if (currentFilters.search) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
        event.description?.toLowerCase().includes(currentFilters.search.toLowerCase())
      );
    }

    if (currentFilters.category && currentFilters.category !== 'all') {
      filtered = filtered.filter(event => event.category === currentFilters.category);
    }

    if (currentFilters.coach && currentFilters.coach !== 'all') {
      filtered = filtered.filter(event => event.coach_id === currentFilters.coach);
    }

    if (currentFilters.location && currentFilters.location !== 'all') {
      filtered = filtered.filter(event => event.location === currentFilters.location);
    }

    if (currentFilters.date) {
      filtered = filtered.filter(event =>
        event.event_date.split('T')[0] === currentFilters.date
      );
    }

    setFilteredEvents(filtered);
  };

  const clearFilters = () => {
    const emptyFilters = {
      search: '',
      category: 'all',
      coach: 'all',
      location: 'all',
      date: ''
    };
    setFilters(emptyFilters);
    setFilteredEvents(events);
  };

  const handleBookEvent = (event: Event) => {
    setSelectedEvent(event);
    setBookingDialogOpen(true);
  };

  const isUserBooked = (event: Event) => {
    return event.bookings?.some(booking => booking.user_id === user?.id);
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
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Leaf className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold">Sustainability Events</h1>
        </div>
        <p className="text-xl text-muted-foreground">Join eco-friendly events and make a positive impact together</p>
      </div>

      <EventFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        coaches={coaches}
        categories={categories}
        locations={locations}
      />

      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {events.length === 0 ? "No upcoming events available." : "No events match your filters."}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="h-full flex flex-col hover:shadow-lg transition-shadow border-l-4 border-l-primary/30">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl flex items-center space-x-2">
                    <Leaf className="w-5 h-5 text-primary" />
                    <span>{event.title}</span>
                  </CardTitle>
                  <Badge variant={event.available_seats > 0 ? "default" : "secondary"} className="shrink-0">
                    {event.available_seats > 0 ? "Available" : "Full"}
                  </Badge>
                </div>
                <CardDescription className="text-base">{event.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                    {new Date(event.event_date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2 text-primary" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-2 text-primary" />
                    {event.available_seats} / {event.total_seats} seats available
                  </div>
                  {event.category && (
                    <Badge variant="outline" className="w-fit bg-accent/30">
                      {event.category}
                    </Badge>
                  )}
                  {event.coach_profile && (
                    <p className="text-sm text-muted-foreground font-medium">
                      🌱 Coach: {event.coach_profile.name}
                    </p>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                {user ? (
                  <Button 
                    onClick={() => handleBookEvent(event)}
                    disabled={event.available_seats === 0 || isUserBooked(event)}
                    className="w-full"
                  >
                    {isUserBooked(event) ? "Already Booked" : 
                     event.available_seats === 0 ? "Event Full" : "Book Event"}
                  </Button>
                ) : (
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/auth">Sign in to Book</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <BookingDialog
        event={selectedEvent}
        open={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
        onBookingComplete={fetchEvents}
        userId={user?.id || ''}
      />
    </main>
  );
};

export default Events;