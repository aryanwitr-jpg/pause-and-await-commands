import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock, Leaf, User } from 'lucide-react';

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
}

interface EventDetailDialogProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookEvent: (event: Event) => void;
  user: any;
}

export const EventDetailDialog: React.FC<EventDetailDialogProps> = ({
  event,
  open,
  onOpenChange,
  onBookEvent,
  user,
}) => {
  if (!event) return null;

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

  const { date, time } = formatDate(event.event_date);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-2 mb-2">
            <Leaf className="w-6 h-6 text-primary" />
            <DialogTitle className="text-2xl">{event.title}</DialogTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={event.available_seats > 0 ? "default" : "secondary"}>
              {event.available_seats > 0 ? "Available" : "Event Full"}
            </Badge>
            {event.category && (
              <Badge variant="outline" className="bg-accent/30">
                {event.category}
              </Badge>
            )}
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {event.image_url && (
            <div className="w-full h-64 overflow-hidden rounded-lg">
              <img 
                src={event.image_url} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-2 text-primary">About This Event</h3>
            <DialogDescription className="text-base leading-relaxed">
              {event.description}
            </DialogDescription>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-primary">Event Details</h4>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-3 text-primary" />
                  <div>
                    <p className="font-medium">{date}</p>
                    <p className="text-muted-foreground">{time}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 mr-3 text-primary" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 mr-3 text-primary" />
                  <span>{event.available_seats} of {event.total_seats} seats available</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-primary">Event Host</h4>
              <div className="flex items-center text-sm">
                <User className="w-4 h-4 mr-3 text-primary" />
                <div>
                  <p className="font-medium">{event.coach_profile?.name || 'Expert Coach'}</p>
                  <p className="text-muted-foreground">Sustainability Expert</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-accent/30 p-4 rounded-lg">
            <h4 className="font-semibold text-primary mb-2">What You'll Learn</h4>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>Practical sustainability techniques and methods</li>
              <li>How to implement eco-friendly practices in daily life</li>
              <li>Connect with like-minded environmental enthusiasts</li>
              <li>Gain hands-on experience with sustainable living</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button 
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
            {user ? (
              <Button 
                onClick={() => {
                  onBookEvent(event);
                  onOpenChange(false);
                }}
                disabled={event.available_seats === 0}
                className="flex-1"
              >
                {event.available_seats === 0 ? "Event Full" : "Book This Event"}
              </Button>
            ) : (
              <Button 
                onClick={() => onOpenChange(false)}
                variant="outline"
                className="flex-1"
              >
                Sign in to Book
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};