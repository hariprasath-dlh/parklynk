import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Loader2, MapPin, Phone, ShieldCheck, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { bookingsAPI, slotsAPI } from '@/services/api';
import { ParkingSlot, VehicleType } from '@/types';

const SlotDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [slot, setSlot] = useState<ParkingSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType | ''>('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    const loadSlot = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const response = await slotsAPI.getById(id);
        setSlot(response.slot);
      } catch (error) {
        toast({
          title: 'Failed to load slot',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadSlot();
  }, [id, toast]);

  const { durationLabel, totalEstimate } = useMemo(() => {
    if (!slot || !startTime || !endTime) {
      return { durationLabel: '', totalEstimate: 0 };
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();

    if (Number.isNaN(diffMs) || diffMs <= 0) {
      return { durationLabel: '', totalEstimate: 0 };
    }

    const totalHours = diffMs / (1000 * 60 * 60);
    const totalDays = diffMs / (1000 * 60 * 60 * 24);

    let baseAmount = 0;
    let unitLabel = '';

    if (totalDays >= 30) {
      const months = totalDays / 30;
      baseAmount = months * slot.pricePerHour * 8 * 30;
      unitLabel = `${months.toFixed(1)} month${months >= 2 ? 's' : ''}`;
    } else if (totalHours >= 24) {
      baseAmount = totalDays * slot.pricePerHour * 8;
      unitLabel = `${totalDays.toFixed(1)} day${totalDays >= 2 ? 's' : ''}`;
    } else {
      baseAmount = totalHours * slot.pricePerHour;
      unitLabel = `${totalHours.toFixed(1)} hour${totalHours >= 2 ? 's' : ''}`;
    }

    return {
      durationLabel: unitLabel,
      totalEstimate: Math.round(baseAmount),
    };
  }, [endTime, slot, startTime]);

  const handleBook = async () => {
    if (!slot || !id) {
      toast({ title: 'Slot not found', variant: 'destructive' });
      return;
    }

    if (!vehicleNumber || !vehicleType || !startTime || !endTime) {
      toast({ title: 'Fill all fields', variant: 'destructive' });
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      toast({ title: 'End time must be after start time', variant: 'destructive' });
      return;
    }

    setBooking(true);

    try {
      console.log('Form Data:', { slotId: id, vehicleNumber, vehicleType, startTime, endTime });
      const response = await bookingsAPI.create({
        slotId: id,
        vehicleNumber,
        vehicleType,
        startTime,
        endTime,
      });
      console.log('API Response:', response);

      if (response.success) {
        toast({
          title: 'Booking submitted',
          description: 'Waiting for owner approval before payment.',
        });
        navigate('/vehicle/bookings');
      } else {
        toast({
          title: 'Booking failed',
          description: 'The booking request could not be created.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Booking failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!slot) {
    return (
      <div className="py-16 text-center">
        <MapPin className="mx-auto mb-2 h-10 w-10 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">Slot not found</p>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex h-48 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface">
            {slot.images[0] ? (
              <img src={slot.images[0]} alt={slot.title} className="h-full w-full object-cover" />
            ) : (
              <MapPin className="h-16 w-16 text-muted-foreground/20" />
            )}
          </div>

          <div>
            <div className="flex items-start justify-between">
              <h1 className="font-heading text-xl font-bold">{slot.title}</h1>
              <div className="flex items-center gap-0.5 text-accent">
                <Star className="h-4 w-4 fill-current" /> {slot.rating.toFixed(1)}
              </div>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {slot.address}, {slot.city}
            </p>

            <div className="mt-3 flex gap-2">
              {slot.vehicleTypes.map((type) => (
                <Badge key={type} variant="outline" className="text-xs capitalize">
                  {type}
                </Badge>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-xs text-muted-foreground">Available Spaces</p>
                <p className="font-heading text-lg font-bold">
                  {slot.availableSpaces}
                  <span className="text-xs font-normal text-muted-foreground">/{slot.totalSpaces}</span>
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-xs text-muted-foreground">Rate</p>
                <p className="font-heading text-lg font-bold text-accent">
                  Rs {slot.pricePerHour}
                  <span className="text-xs font-normal text-muted-foreground">/hr</span>
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-xs text-muted-foreground">Owner</p>
                <p className="font-heading text-sm font-semibold">{slot.ownerName || 'Parking Owner'}</p>
                {slot.ownerPhone ? (
                  <a href={`tel:${slot.ownerPhone}`} className="mt-0.5 flex items-center gap-1 text-[11px] text-accent">
                    <Phone className="h-3 w-3" /> {slot.ownerPhone}
                  </a>
                ) : null}
              </div>
            </div>

            {user?.verificationStatus === 'verified' ? (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-teal/20 bg-teal/5 p-3">
                <ShieldCheck className="h-4 w-4 text-teal" />
                <span className="text-xs font-medium text-teal">License verified and ready for booking</span>
              </div>
            ) : null}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 font-heading text-sm font-bold">Book this spot</h3>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Start Time</Label>
              <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">End Time</Label>
              <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="mt-1" />
            </div>

            {durationLabel ? (
              <div className="rounded-lg bg-surface p-2.5 text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    Duration: <strong className="text-foreground">{durationLabel}</strong>
                  </span>
                </div>
              </div>
            ) : null}

            <div>
              <Label className="text-xs">Vehicle Number</Label>
              <Input
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                placeholder="KA-01-AB-1234"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Vehicle Type</Label>
              <Select value={vehicleType} onValueChange={(value) => setVehicleType(value as VehicleType)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {slot.vehicleTypes.map((type) => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-5 border-t border-border pt-3">
            {totalEstimate > 0 ? (
              <div className="flex items-center justify-between font-heading font-bold">
                <span>Estimated Total</span>
                <span className="text-accent">Rs {totalEstimate}</span>
              </div>
            ) : (
              <p className="text-center text-xs text-muted-foreground">
                Select a valid time range to see the estimate
              </p>
            )}
          </div>

          <Button onClick={handleBook} disabled={booking} className="mt-4 w-full press-scale bg-accent text-accent-foreground hover:bg-accent/90">
            {booking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              'Book Now'
            )}
          </Button>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">Booking requires owner approval</p>
        </motion.div>
      </div>
    </div>
  );
};

export default SlotDetailPage;
