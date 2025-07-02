
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail } from 'lucide-react';

const ContactCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Need Help? Contact Us</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            className="flex items-center space-x-2"
            onClick={() => window.open('tel:+917842288660')}
          >
            <Phone className="h-4 w-4" />
            <span>+91 7842288660</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center space-x-2"
            onClick={() => window.open('https://wa.me/917842288660')}
          >
            <Phone className="h-4 w-4" />
            <span>WhatsApp</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center space-x-2"
            onClick={() => window.open('mailto:info@skywaynetworks.in')}
          >
            <Mail className="h-4 w-4" />
            <span>info@skywaynetworks.in</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactCard;
