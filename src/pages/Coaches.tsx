import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Star } from 'lucide-react';
import { dummyCoaches } from '@/data/dummyData';
import sarahGreenImage from '@/assets/coach-sarah-green.jpg';
import marcusSilvaImage from '@/assets/coach-marcus-silva.jpg';
import elenaRodriguezImage from '@/assets/coach-elena-rodriguez.jpg';
import davidThompsonImage from '@/assets/coach-david-thompson.jpg';
import ariaPatelImage from '@/assets/coach-aria-patel.jpg';

const coachImages = {
  'coach-1': sarahGreenImage,
  'coach-2': marcusSilvaImage,
  'coach-3': elenaRodriguezImage,
  'coach-4': davidThompsonImage,
  'coach-5': ariaPatelImage,
};

const Coaches = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-foreground">
          Meet Our Expert Coaches
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Learn from passionate sustainability experts who are dedicated to helping you make a positive environmental impact.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dummyCoaches.map((coach) => (
          <Card key={coach.id} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={coachImages[coach.id as keyof typeof coachImages]} 
                    alt={coach.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-lg">
                    {coach.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">{coach.name}</CardTitle>
              <CardDescription className="flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" />
                {coach.email}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {coach.bio}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  Specialties
                </h4>
                <div className="flex flex-wrap gap-2">
                  {coach.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Coaches;