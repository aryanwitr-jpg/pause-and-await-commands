import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Event {
  id: string;
  title: string;
  available_seats: number;
  event_date: string;
  price: number;
  location?: string;
  description?: string;
}

interface BookingDialogProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingComplete?: () => void;
}

export const BookingDialog: React.FC<BookingDialogProps> = ({
  event,
  open,
  onOpenChange,
  onBookingComplete,
}) => {
  const [ticketCount, setTicketCount] = useState(1);
  const [guestEmails, setGuestEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleAddEmail = () => {
    if (currentEmail && currentEmail.includes('@') && !guestEmails.includes(currentEmail)) {
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

  const handleTicketCountChange = (count: number) => {
    setTicketCount(count);
    // If reducing tickets, remove excess emails
    if (count > 1 && guestEmails.length > count - 1) {
      setGuestEmails(guestEmails.slice(0, count - 1));
    }
  };

  const handleBooking = async () => {
    if (!event || !user) return;

    // Validate guest emails for multiple tickets
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
      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          event_id: event.id,
          ticket_count: ticketCount,
          total_amount: (event.price || 0) * ticketCount,
          booking_status: 'confirmed',
          guest_emails: ticketCount > 1 ? guestEmails : []
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Send confirmation emails
      const allEmails = [user.email, ...guestEmails].filter(Boolean);
      
      try {
        await supabase.functions.invoke('send-booking-email', {
          body: {
            booking,
            event,
            emails: allEmails
          }
        });
        console.log('Booking confirmation emails sent');
      } catch (emailError) {
        console.error('Failed to send confirmation emails:', emailError);
        // Don't fail the booking if email fails
      }

      toast({
        title: "Success!",
        description: `Booked ${ticketCount} ticket(s) for ${event.title}. Confirmation emails sent!`,
      });

      // Reset form
      setTicketCount(1);
      setGuestEmails([]);
      setCurrentEmail('');
      onOpenChange(false);
      if (onBookingComplete) onBookingComplete();
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

  const totalAmount = (event.price || 0) * ticketCount;
  const needsGuestEmails = ticketCount > 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book Event</DialogTitle>
          <DialogDescription>
            {event.title} - {new Date(event.event_date).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tickets" className="text-right">
              Tickets
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTicketCountChange(Math.max(1, ticketCount - 1))}
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
                onChange={(e) => handleTicketCountChange(Math.min(event.available_seats, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-20 text-center"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTicketCountChange(Math.min(event.available_seats, ticketCount + 1))}
                disabled={ticketCount >= event.available_seats}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {needsGuestEmails && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium">Guest Emails ({guestEmails.length}/{ticketCount - 1} required)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter guest email"
                    value={currentEmail}
                    onChange={(e) => setCurrentEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
                  />
                  <Button 
                    onClick={handleAddEmail}
                    disabled={!currentEmail || !currentEmail.includes('@') || guestEmails.length >= ticketCount - 1}
                    variant="outline"
                    size="sm"
                  >
                    Add
                  </Button>
                </div>
                <div className="space-y-1">
                  {guestEmails.map((email, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded text-sm">
                      <span>{email}</span>
                      <Button
                        onClick={() => handleRemoveEmail(email)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          
          <Separator />
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Total</Label>
            <div className="col-span-3 font-semibold">
              ${totalAmount.toFixed(2)}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={handleBooking} 
            disabled={
              loading || 
              ticketCount > event.available_seats ||
              (needsGuestEmails && guestEmails.length !== ticketCount - 1)
            }
          >
            {loading ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};