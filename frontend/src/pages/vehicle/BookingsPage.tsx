import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Clock, CreditCard, Timer, XCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Booking, BookingStatus } from '@/types';
import { bookingsAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const statusConfig: Record<BookingStatus, { color: string; icon: React.ReactNode; label: string }> = {
  pending: { color: 'bg-amber/10 text-amber border-amber/20', icon: <Clock className="h-3 w-3" />, label: 'Pending' },
  approved: { color: 'bg-teal/10 text-teal border-teal/20', icon: <CheckCircle2 className="h-3 w-3" />, label: 'Approved' },
  rejected: { color: 'bg-destructive/10 text-destructive border-destructive/20', icon: <XCircle className="h-3 w-3" />, label: 'Rejected' },
  active: { color: 'bg-teal/10 text-teal border-teal/20', icon: <Timer className="h-3 w-3" />, label: 'Active' },
  overstayed: { color: 'bg-destructive/10 text-destructive border-destructive/20', icon: <AlertTriangle className="h-3 w-3 animate-pulse" />, label: 'Overstayed' },
  completed: { color: 'bg-muted text-muted-foreground border-border', icon: <CheckCircle2 className="h-3 w-3" />, label: 'Completed' },
  cancelled: { color: 'bg-muted text-muted-foreground border-border', icon: <XCircle className="h-3 w-3" />, label: 'Cancelled' },
  paid: { color: 'bg-teal/10 text-teal border-teal/20', icon: <CreditCard className="h-3 w-3" />, label: 'Paid' },
};

const BookingsPage = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      try {
        const response = await bookingsAPI.getUserBookings();
        setBookings(response.bookings || []);
      } catch (error) {
        toast({
          title: 'Failed to load bookings',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4 font-heading text-xl font-bold">My Bookings</h1>
      <div className="space-y-3">
        {bookings.length === 0 ? (
          <div className="py-12 text-center">
            <Clock className="mx-auto mb-2 h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No bookings yet</p>
            <Button variant="outline" size="sm" className="mt-3" asChild>
              <Link to="/vehicle">Find Parking</Link>
            </Button>
          </div>
        ) : null}

        {bookings.map((booking, index) => {
          const config = statusConfig[booking.status];

          return (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-lg border border-border bg-card p-4 hover-lift"
            >
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h3 className="font-heading text-sm font-semibold">{booking.slotTitle}</h3>
                  <p className="text-[11px] text-muted-foreground">{booking.vehicleNumber || 'Vehicle assigned on arrival'}</p>
                </div>
                <Badge className={`border text-[10px] ${config.color}`}>
                  {config.icon}
                  <span className="ml-1">{config.label}</span>
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{new Date(booking.startTime).toLocaleDateString()}</span>
                <span>
                  {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                  {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="ml-auto font-heading font-semibold text-foreground">Rs {booking.totalAmount}</span>
              </div>

              <div className="mt-3 flex gap-2">
                {booking.status === 'approved' ? (
                  <Button size="sm" asChild className="press-scale bg-accent text-xs text-accent-foreground hover:bg-accent/90">
                    <Link to={`/vehicle/payment/${booking.id}`}>
                      <CreditCard className="mr-1 h-3 w-3" /> Pay Now
                    </Link>
                  </Button>
                ) : null}
              </div>

              {booking.status === 'overstayed' ? (
                <div className="mt-2 flex items-center gap-1 rounded border border-destructive/20 bg-destructive/5 p-2 text-xs text-destructive">
                  <AlertTriangle className="h-3 w-3" /> Overstay detected. Additional charges may be added.
                </div>
              ) : null}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingsPage;
