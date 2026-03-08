import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationResult {
  lat: number;
  lng: number;
  state?: string;
  district?: string;
  city?: string;
  street?: string;
}

interface LocationDetectorProps {
  onLocationDetected: (result: LocationResult) => void;
}

const LocationDetector = ({ onLocationDetected }: LocationDetectorProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const detect = () => {
    if (!navigator.geolocation) {
      toast({ title: 'Geolocation not supported', variant: 'destructive' });
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const addr = data.address || {};
          onLocationDetected({
            lat: latitude,
            lng: longitude,
            state: addr.state || '',
            district: addr.state_district || addr.county || '',
            city: addr.city || addr.town || addr.village || '',
            street: addr.road || addr.suburb || '',
          });
          toast({ title: 'Location detected', description: addr.city || addr.town || 'Location found' });
        } catch {
          onLocationDetected({ lat: latitude, lng: longitude });
          toast({ title: 'Location detected', description: 'Could not resolve address' });
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        toast({
          title: 'Location access denied',
          description: err.code === 1 ? 'Please allow location access in your browser' : 'Could not detect location',
          variant: 'destructive',
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={detect} disabled={loading} className="text-xs press-scale">
      {loading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <MapPin className="h-3 w-3 mr-1" />}
      {loading ? 'Detecting...' : '📍 Use My Location'}
    </Button>
  );
};

export default LocationDetector;
