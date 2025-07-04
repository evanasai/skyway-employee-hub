
import React, { useRef, useCallback, useState } from 'react';
import { Camera, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface PhotoCaptureProps {
  onPhotoCapture: (photoData: string, location: GeolocationPosition | null) => void;
  onCancel: () => void;
  isOpen: boolean;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onPhotoCapture, onCancel, isOpen }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [location, setLocation] = useState<GeolocationPosition | null>(null);

  const startCamera = useCallback(async () => {
    try {
      // Get location first
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position);
          console.log('Location captured:', position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Location Access Denied",
            description: "Please enable location access for accurate check-in",
            variant: "destructive"
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );

      // Start camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Error starting camera:', error);
      toast({
        title: "Camera Access Denied",
        description: "Please enable camera access to take check-in photo",
        variant: "destructive"
      });
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0);

    // Add timestamp and coordinates overlay
    const now = new Date();
    const timestamp = now.toLocaleString();
    const coords = location ? 
      `Lat: ${location.coords.latitude.toFixed(6)}, Lng: ${location.coords.longitude.toFixed(6)}` : 
      'Location: Not available';

    // Style the overlay text
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, canvas.height - 80, canvas.width - 20, 70);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(timestamp, 20, canvas.height - 50);
    ctx.fillText(coords, 20, canvas.height - 25);

    // Convert to base64
    const photoData = canvas.toDataURL('image/jpeg', 0.8);
    
    stopCamera();
    onPhotoCapture(photoData, location);
  }, [location, onPhotoCapture, stopCamera]);

  const switchCamera = useCallback(() => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, [stopCamera]);

  React.useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  React.useEffect(() => {
    if (isOpen && !isStreaming) {
      startCamera();
    }
  }, [facingMode, isOpen, isStreaming, startCamera]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black text-white shrink-0">
        <h2 className="text-lg font-semibold">Take Check-in Photo</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-white hover:bg-gray-800"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative flex items-center justify-center bg-black min-h-0">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ maxHeight: 'calc(100vh - 200px)' }}
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Location Status */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <Card className="bg-black/50 text-white border-gray-600">
            <CardContent className="p-3">
              <div className="text-sm">
                {location ? (
                  <div>
                    <div>📍 Location: {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}</div>
                    <div>🕒 {new Date().toLocaleString()}</div>
                  </div>
                ) : (
                  <div>📍 Getting location...</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 bg-black flex items-center justify-center space-x-6 shrink-0 safe-area-bottom">
        <Button
          variant="outline"
          size="lg"
          onClick={switchCamera}
          className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
        
        <Button
          size="lg"
          onClick={capturePhoto}
          disabled={!isStreaming}
          className="w-16 h-16 rounded-full bg-white hover:bg-gray-200 text-black"
        >
          <Camera className="h-6 w-6" />
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          onClick={onCancel}
          className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default PhotoCapture;
