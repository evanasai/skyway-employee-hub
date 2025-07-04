
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Camera, Loader2, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import PhotoCapture from './PhotoCapture';

interface CheckInButtonProps {
  isCheckedIn: boolean;
  onCheckIn: (photoData?: string, location?: GeolocationPosition | null) => void;
  onCheckOut: () => void;
}

const CheckInButton: React.FC<CheckInButtonProps> = ({ isCheckedIn, onCheckIn, onCheckOut }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);

  const handleCheckInClick = () => {
    if (isCheckedIn) {
      handleCheckOut();
    } else {
      setShowPhotoCapture(true);
    }
  };

  const handlePhotoCapture = async (photoData: string, location: GeolocationPosition | null) => {
    setShowPhotoCapture(false);
    setIsLoading(true);
    
    try {
      await onCheckIn(photoData, location);
      toast({
        title: "Checked In Successfully",
        description: "Photo and location captured successfully!",
      });
    } catch (error) {
      toast({
        title: "Check-in Failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setIsLoading(true);
    
    setTimeout(() => {
      onCheckOut();
      toast({
        title: "Checked Out Successfully",
        description: "Have a great day! Your work summary has been recorded.",
      });
      setIsLoading(false);
    }, 2000);
  };

  const handleCancelPhoto = () => {
    setShowPhotoCapture(false);
  };

  return (
    <>
      <Button
        onClick={handleCheckInClick}
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

      <PhotoCapture
        isOpen={showPhotoCapture}
        onPhotoCapture={handlePhotoCapture}
        onCancel={handleCancelPhoto}
      />
    </>
  );
};

export default CheckInButton;
