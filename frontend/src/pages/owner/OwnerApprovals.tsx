import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { bookingsAPI } from '@/services/api';
import { Booking, BookingStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';

const OwnerApprovals = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingsAPI.getOwnerBookings();
      setBookings(response.bookings || []);
    } catch (error) {
      toast({
        title: 'Failed to load approvals',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    setActioningId(id);
    try {
      console.log('Form Data:', { bookingId: id, action });
      const response = await bookingsAPI.updateStatus(id, action as BookingStatus);
      console.log('API Response:', response);

      if (response.success) {
        await loadBookings();
        toast({
          title: action === 'approved' ? 'Booking approved' : 'Booking rejected',
        });
      }
    } catch (error) {
      toast({
        title: 'Action failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setActioningId(null);
    }
  };

  const pending = useMemo(() => bookings.filter((booking) => booking.status === 'pending'), [bookings]);
  const processed = useMemo(
    () => bookings.filter((booking) => booking.status === 'approved' || booking.status === 'rejected'),
    [bookings]
  );

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4 font-heading text-xl font-bold">Booking Approvals</h1>

      <h2 className="mb-3 font-heading text-sm font-semibold text-muted-foreground">Pending ({pending.length})</h2>
      <div className="mb-8 space-y-3">
        <AnimatePresence>
          {pending.map((booking) => (
            <motion.div
              key={booking.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-lg border border-accent/30 bg-card p-4 hover-lift"
            >
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h3 className="font-heading text-sm font-semibold">{booking.userName || 'Vehicle User'}</h3>
                  <p className="text-[11px] text-muted-foreground">
                    {booking.slotTitle} - {booking.vehicleNumber || 'Vehicle number pending'}
                  </p>
                </div>
                <Badge className="border border-amber/20 bg-amber/10 text-[10px] text-amber">Pending</Badge>
              </div>

              <div className="mb-3 text-xs text-muted-foreground">
                {new Date(booking.startTime).toLocaleDateString()} -{' '}
                {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} to{' '}
                {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - Rs {booking.totalAmount}
              </div>

              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" disabled={actioningId === booking.id} className="flex-1 press-scale bg-teal text-teal-foreground hover:bg-teal/90">
                      {actioningId === booking.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <><CheckCircle2 className="mr-1 h-3 w-3" /> Approve</>}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Approve Booking?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Approve this booking for {booking.slotTitle}. The vehicle user will then be able to complete payment.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleAction(booking.id, 'approved')} className="bg-teal text-teal-foreground hover:bg-teal/90">
                        Approve
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline" disabled={actioningId === booking.id} className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10 press-scale">
                      <XCircle className="mr-1 h-3 w-3" /> Reject
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reject Booking?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Reject this booking request. The user will see the booking as rejected.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleAction(booking.id, 'rejected')} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Reject
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {pending.length === 0 ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto mb-2 h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No pending approvals</p>
          </div>
        ) : null}
      </div>

      <h2 className="mb-3 font-heading text-sm font-semibold text-muted-foreground">Recent ({processed.length})</h2>
      <div className="space-y-2">
        {processed.slice(0, 5).map((booking) => (
          <div key={booking.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
            <div>
              <p className="text-sm font-medium">{booking.userName || 'Vehicle User'}</p>
              <p className="text-[11px] text-muted-foreground">{booking.slotTitle}</p>
            </div>
            <Badge
              className={`border text-[10px] ${
                booking.status === 'approved'
                  ? 'border-teal/20 bg-teal/10 text-teal'
                  : 'border-destructive/20 bg-destructive/10 text-destructive'
              }`}
            >
              {booking.status === 'approved' ? 'Approved' : 'Rejected'}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OwnerApprovals;
