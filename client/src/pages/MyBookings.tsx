import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Clock, Ticket, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Booking {
  id: string;
  event_id: string;
  tickets_count: number;
  guest_emails: string[] | null;
  status: string;
  created_at: string | null;
  event: {
    id: string;
    title: string;
    description: string | null;
    event_date: string;
    location: string | null;
    category: string | null;
    image_url?: string | null;
  };
}

const MyBookings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          event:events(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map the data to ensure proper typing
      const mappedBookings = (data || []).map((booking: any) => ({
        ...booking,
        status: booking.status || 'confirmed',
        guest_emails: booking.guest_emails || []
      }));
      
      setBookings(mappedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load your bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading your bookings...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">My Bookings</h1>
        <p className="text-xl text-muted-foreground">
          View and manage your event bookings
        </p>
      </div>

      {bookings.length === 0 ? (
        <Card className="max-w-2xl mx-auto text-center">
          <CardContent className="pt-8 pb-8">
            <Ticket className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't booked any events yet. Explore our events to get started!
            </p>
            <Button onClick={() => window.location.href = '/events'}>
              Browse Events
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 max-w-4xl mx-auto">
          {bookings.map((booking) => {
            const { date, time } = formatDate(booking.event.event_date);
            const isPastEvent = new Date(booking.event.event_date) < new Date();
            
            return (
              <Card key={booking.id} className={`transition-all hover:shadow-lg ${isPastEvent ? 'opacity-75' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 flex items-center gap-2">
                        {booking.event.title}
                        {isPastEvent && <Badge variant="secondary">Past Event</Badge>}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {time}
                        </div>
                      </div>
                      {booking.event.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {booking.event.location}
                        </div>
                      )}
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {booking.event.description && (
                      <p className="text-muted-foreground">{booking.event.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">{booking.tickets_count} ticket(s)</span>
                      </div>
                      
                      {booking.event.category && (
                        <Badge variant="outline">{booking.event.category}</Badge>
                      )}
                    </div>
                    
                    {booking.guest_emails && booking.guest_emails.length > 0 && (
                      <div className="border-t pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="w-4 h-4" />
                          <span className="font-medium text-sm">Guest Invitations Sent:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {booking.guest_emails.map((email, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {email}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="border-t pt-4 text-xs text-muted-foreground">
                      Booked on {booking.created_at ? new Date(booking.created_at).toLocaleDateString() : 'Recently'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default MyBookings;