import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ToggleLeft, ToggleRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { slotsAPI } from '@/services/api';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ParkingSlot } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const OwnerSlots = () => {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadSlots = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await slotsAPI.getOwnerSlots(user.id);
      setSlots(res.slots || []);
    } catch (error) {
      toast({
        title: 'Failed to load slots',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, [user]);

  const toggleAvailability = async (id: string) => {
    const slot = slots.find((s) => s.id === id);
    if (!slot) return;
    try {
      const res = await slotsAPI.toggleAvailability(id, !slot.isAvailable);
      if (res.success) {
        setSlots((prev) =>
          prev.map((s) =>
            s.id === id ? { ...s, isAvailable: !s.isAvailable } : s
          )
        );
        toast({
          title: !slot.isAvailable ? 'Slot activated' : 'Slot deactivated',
        });
      }
    } catch (error) {
      toast({
        title: 'Failed to update',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold">My Parking Slots</h1>
        <Button
          size="sm"
          asChild
          className="press-scale bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Link to="/owner/slots/create">
            <Plus className="mr-1 h-3 w-3" /> Create Slot
          </Link>
        </Button>
      </div>
      <div className="space-y-3">
        {loading ? (
          <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            Loading slots...
          </div>
        ) : null}

        {!loading && slots.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            No slots found. Create your first slot.
          </div>
        ) : null}

        {slots.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 hover-lift"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-surface">
              <MapPin className="h-5 w-5 text-muted-foreground/40" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-heading text-sm font-semibold">{s.title}</h3>
              <p className="text-[11px] text-muted-foreground">
                {s.city} • ₹{s.pricePerHour}/hr
              </p>
            </div>
            <Badge
              variant={s.isAvailable ? 'default' : 'outline'}
              className={`shrink-0 text-[10px] ${
                s.isAvailable ? 'border-teal/20 bg-teal/10 text-teal' : ''
              }`}
            >
              {s.isAvailable ? 'Active' : 'Inactive'}
            </Badge>
            <button onClick={() => toggleAvailability(s.id)} className="text-muted-foreground hover:text-foreground">
              {s.isAvailable ? (
                <ToggleRight className="h-5 w-5 text-teal" />
              ) : (
                <ToggleLeft className="h-5 w-5" />
              )}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default OwnerSlots;
