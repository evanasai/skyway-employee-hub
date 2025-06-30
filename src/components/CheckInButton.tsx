
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Camera, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CheckInButtonProps {
  isCheckedIn: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
}

const CheckInButton: React.FC<CheckInButtonProps> = ({ isCheckedIn, onCheckIn, onCheckOut }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    
    // Simulate GPS and face recognition
    setTimeout(() => {
      if (isCheckedIn) {
        onCheckOut();
        toast({
          title: "Checked Out Successfully",
          description: "Have a great day! Your work summary has been recorded.",
        });
      } else {
        onCheckIn();
        toast({
          title: "Checked In Successfully",
          description: "Location and biometric verification completed.",
        });
      }
      setIsLoading(false);
    }, 2000);
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      className={`w-full h-16 text-lg font-semibold transition-all duration-300 ${
        isCheckedIn
          ? 'bg-red-500 hover:bg-red-600 text-white'
          : 'gradient-bg hover:opacity-90 text-white'
      }`}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          {isCheckedIn ? 'Processing Check-Out...' : 'Processing Check-In...'}
        </>
      ) : (
        <>
          {isCheckedIn ? (
            <>
              <XCircle className="mr-2 h-5 w-5" />
              Check Out
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <Camera className="h-5 w-5" />
              </div>
              <span className="ml-2">Check In</span>
            </>
          )}
        </>
      )}
    </Button>
  );
};

export default CheckInButton;
