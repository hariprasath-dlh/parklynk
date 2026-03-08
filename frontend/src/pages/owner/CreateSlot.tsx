import { useRef, useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { slotsAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { VehicleType } from '@/types';
import { Upload, Loader2 } from 'lucide-react';
import LocationDetector from '@/components/LocationDetector';
import React from 'react';

const MapSelector = lazy(() => import('@/components/MapSelector'));

const vehicleOptions: { value: VehicleType; label: string }[] = [
  { value: 'car', label: 'Car' },
  { value: 'bike', label: 'Bike' },
  { value: 'suv', label: 'SUV' },
  { value: 'truck', label: 'Truck' },
];

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read selected image'));
    reader.readAsDataURL(file);
  });

const CreateSlot = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [price, setPrice] = useState('');
  const [types, setTypes] = useState<VehicleType[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [imageNames, setImageNames] = useState<string[]>([]);

  const toggleType = (t: VehicleType) =>
    setTypes((prev) =>
      prev.includes(t) ? prev.filter((v) => v !== t) : [...prev, t]
    );

  const handleLocationDetected = (result: {
    lat: number;
    lng: number;
    city?: string;
    street?: string;
  }) => {
    setMapPosition([result.lat, result.lng]);
    if (result.city) setCity(result.city);
    if (result.street) setStreet(result.street);
  };

  const handleMapClick = async (lat: number, lng: number) => {
    setMapPosition([lat, lng]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      const addr = data.address || {};
      if (addr.city || addr.town || addr.village) {
        setCity(addr.city || addr.town || addr.village);
      }
      if (addr.road || addr.suburb) {
        setStreet(addr.road || addr.suburb);
      }
    } catch {
      // ignore reverse geocoding failures
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      const dataUrls = await Promise.all(files.map(fileToDataUrl));
      setImages(dataUrls);
      setImageNames(files.map((file) => file.name));
    } catch (error) {
      toast({
        title: 'Image selection failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !city || !street || !price || !mapPosition || types.length === 0) {
      toast({ title: 'Fill all required fields', variant: 'destructive' });
      return;
    }

    const formPayload = {
      title,
      description,
      address: `${street}, ${city}`,
      city,
      latitude: mapPosition[0],
      longitude: mapPosition[1],
      pricePerHour: Number(price),
      vehicleTypes: types,
      images,
    };

    if (import.meta.env.DEV) {
      console.log('Form Data:', formPayload);
    }

    setSubmitting(true);
    try {
      const res = await slotsAPI.create(formPayload);
      if (import.meta.env.DEV) {
        console.log('API Response:', res);
      }

      if (res.success) {
        toast({
          title: 'Slot created',
          description: 'Your parking slot was saved successfully.',
        });
        navigate('/owner/slots');
      } else {
        toast({
          title: 'Failed to create slot',
          description: 'Backend did not confirm slot creation.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Failed to create slot',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="mb-4 font-heading text-xl font-bold">Create Parking Slot</h1>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div>
          <Label className="text-xs">Slot Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. My Home Parking" required className="mt-1" />
        </div>

        <div>
          <Label className="text-xs">Description</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Covered slot near gate, easy access" required className="mt-1" />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold">Location</Label>
          <LocationDetector onLocationDetected={handleLocationDetected} />
        </div>

        <Suspense
          fallback={
            <div className="flex h-[250px] items-center justify-center rounded-lg border border-border bg-muted/30">
              <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
          }
        >
          <div>
            <p className="mb-1 text-[10px] text-muted-foreground">
              Click on the map to drop a pin, or use location detection above
            </p>
            <MapSelector position={mapPosition} onPositionChange={handleMapClick} />
          </div>
        </Suspense>

        {mapPosition && (
          <div className="rounded bg-surface p-2 text-[10px] text-muted-foreground">
            Lat: {mapPosition[0].toFixed(5)}, Lng: {mapPosition[1].toFixed(5)}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">City</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Street / Landmark</Label>
            <Input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Street name" className="mt-1" />
          </div>
        </div>

        <div>
          <Label className="text-xs">Photos</Label>
          <Button
            type="button"
            variant="outline"
            className="mt-1 flex h-auto w-full flex-col gap-2 border-2 border-dashed border-border py-5 text-center"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {imageNames.length ? `${imageNames.length} image(s) selected` : 'Click to upload photos'}
            </span>
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          {imageNames.length ? (
            <p className="mt-2 text-[11px] text-muted-foreground">
              {imageNames.join(', ')}
            </p>
          ) : null}
        </div>

        <div>
          <Label className="text-xs">Price/Hour (INR)</Label>
          <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="40" required className="mt-1" />
        </div>

        <div>
          <Label className="mb-2 block text-xs">Vehicle Types Allowed</Label>
          <div className="flex gap-3">
            {vehicleOptions.map((v) => (
              <label key={v.value} className="flex cursor-pointer items-center gap-1.5 text-xs">
                <Checkbox checked={types.includes(v.value)} onCheckedChange={() => toggleType(v.value)} />
                {v.label}
              </label>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full press-scale bg-accent text-accent-foreground hover:bg-accent/90" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
            </>
          ) : (
            'Create Slot'
          )}
        </Button>
      </form>
    </div>
  );
};

export default CreateSlot;
