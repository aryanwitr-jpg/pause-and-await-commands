import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Event {
  id: string;
  title: string;
  available_seats: number;
  event_date: string;
}

interface BookingDialogProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingComplete: () => void;
  userId: string;
}

export const BookingDialog: React.FC<BookingDialogProps> = ({
  event,
  open,
  onOpenChange,
  onBookingComplete,
  userId,
}) => {
  const [ticketCount, setTicketCount] = useState(1);
  const [guestEmails, setGuestEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAddEmail = () => {
    if (currentEmail && !guestEmails.includes(currentEmail)) {
      if (guestEmails.length < ticketCount - 1) {
        setGuestEmails([...guestEmails, currentEmail]);
        setCurrentEmail('');
      } else {
        toast({
          title: "Limit reached",
          description: "You can only add guest emails for additional tickets",
          variant: "destructive",
        });
      }
    }
  };

  const handleRemoveEmail = (email: string) => {
    setGuestEmails(guestEmails.filter(e => e !== email));
  };

  const handleBooking = async () => {
    if (!event) return;
    
    // Validate that we have enough guest emails for additional tickets
    if (ticketCount > 1 && guestEmails.length !== ticketCount - 1) {
      toast({
        title: "Guest emails required",
        description: `Please provide ${ticketCount - 1} guest email(s) for additional tickets`,
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      // Store booking in Supabase
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert([{
          user_id: userId,
          event_id: event.id,
          tickets_count: ticketCount,
          guest_emails: guestEmails,
          status: 'confirmed'
        }])
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Send email notifications (requires SendGrid API key)
      try {
        const emailData = {
          event_title: event.title,
          event_date: event.event_date,
          tickets_count: ticketCount,
          guest_emails: guestEmails
        };

        const response = await fetch('/api/send-booking-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailData),
        });

        if (response.ok) {
          toast({
            title: "Success!",
            description: `Booked ${ticketCount} ticket(s) for ${event.title}. Confirmation emails sent!`,
          });
        } else {
          toast({
            title: "Booking Confirmed",
            description: `Booked ${ticketCount} ticket(s) for ${event.title}. Email service unavailable.`,
          });
        }
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        toast({
          title: "Booking Confirmed",
          description: `Booked ${ticketCount} ticket(s) for ${event.title}. Email notifications failed.`,
        });
      }

      // Reset form
      setTicketCount(1);
      setGuestEmails([]);
      setCurrentEmail('');
      onOpenChange(false);
      onBookingComplete();
    } catch (error) {
      console.error('Error booking event:', error);
      toast({
        title: "Error",
        description: "Failed to book event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book Event</DialogTitle>
          <DialogDescription>
            Book tickets for {event.title}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="tickets">Number of Tickets</Label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                disabled={ticketCount <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                id="tickets"
                type="number"
                min="1"
                max={event.available_seats}
                value={ticketCount}
                onChange={(e) => setTicketCount(Math.min(event.available_seats, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-20 text-center"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTicketCount(Math.min(event.available_seats, ticketCount + 1))}
                disabled={ticketCount >= event.available_seats}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Available: {event.available_seats} tickets
            </p>
          </div>

          {ticketCount > 1 && (
            <div>
              <Label htmlFor="guest-email">Guest Email Addresses (Optional)</Label>
              <div className="flex space-x-2">
                <Input
                  id="guest-email"
                  type="email"
                  placeholder="Enter guest email"
                  value={currentEmail}
                  onChange={(e) => setCurrentEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
                />
                <Button onClick={handleAddEmail} size="sm">
                  Add
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Add up to {ticketCount - 1} guest email(s) for additional tickets
              </p>
              
              {guestEmails.length > 0 && (
                <div className="space-y-2 mt-2">
                  <Label>Guest Emails:</Label>
                  <div className="flex flex-wrap gap-2">
                    {guestEmails.map((email) => (
                      <Badge key={email} variant="secondary" className="flex items-center gap-1">
                        {email}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => handleRemoveEmail(email)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <Button onClick={handleBooking} disabled={loading} className="w-full">
            {loading ? 'Booking...' : `Book ${ticketCount} Ticket(s)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};