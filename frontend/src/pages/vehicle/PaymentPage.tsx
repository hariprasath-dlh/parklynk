import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, CreditCard, Loader2, QrCode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { bookingsAPI, paymentsAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Booking } from '@/types';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    const loadBooking = async () => {
      setLoading(true);
      try {
        const response = await bookingsAPI.getUserBookings();
        const currentBooking = (response.bookings || []).find((item) => item.id === bookingId) || null;
        setBooking(currentBooking);
      } catch (error) {
        toast({
          title: 'Failed to load booking',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId, toast]);

  const isPayable = useMemo(() => booking?.status === 'approved', [booking]);

  const handlePay = async () => {
    if (!booking) {
      return;
    }

    setProcessing(true);

    try {
      console.log('Form Data:', { bookingId: booking.id, method: 'upi' });
      const response = await paymentsAPI.submitPayment(booking.id, 'upi');
      console.log('API Response:', response);

      if (response.success) {
        setCompleted(true);
        setTransactionId(response.payment?.transactionId || '');
        toast({
          title: 'Payment verified',
          description: 'Your booking is now active.',
        });
      } else {
        toast({
          title: 'Payment failed',
          description: response.error || 'Payment could not be verified.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Payment failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Booking not found</p>
        <Button variant="ghost" onClick={() => navigate('/vehicle/bookings')} className="mt-4">
          Go to Bookings
        </Button>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="mx-auto max-w-md">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-xl border border-teal/30 bg-card p-8 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-teal" />
          <h2 className="mb-2 font-heading text-xl font-bold">Payment Completed</h2>
          <p className="mb-4 text-sm text-muted-foreground">The backend confirmed the payment and activated the booking.</p>
          {transactionId ? (
            <div className="mb-4 rounded-lg bg-surface p-3">
              <p className="text-xs text-muted-foreground">Transaction ID</p>
              <p className="font-heading text-sm font-semibold">{transactionId}</p>
            </div>
          ) : null}
          <Button onClick={() => navigate('/vehicle/bookings')} className="w-full press-scale">
            Back to Bookings
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <h1 className="mb-1 font-heading text-xl font-bold">Complete Payment</h1>
      <p className="mb-6 text-xs text-muted-foreground">Payment is available only after owner approval.</p>

      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h3 className="font-heading text-sm font-semibold">{booking.slotTitle}</h3>
            <p className="text-[11px] text-muted-foreground">{booking.vehicleNumber || 'Vehicle number not provided'}</p>
          </div>
          <Badge className="border border-teal/20 bg-teal/10 text-[10px] text-teal">
            {booking.status === 'approved' ? 'Approved' : booking.status}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{new Date(booking.startTime).toLocaleDateString()}</span>
          <span>
            {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
            {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">Total Amount</span>
          <span className="font-heading text-lg font-bold text-accent">Rs {booking.totalAmount}</span>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <QrCode className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="font-heading text-sm font-semibold">UPI / Razorpay Test Payment</p>
            <p className="text-[11px] text-muted-foreground">This triggers backend order creation and verification.</p>
          </div>
        </div>
      </div>

      <Button
        onClick={handlePay}
        disabled={!isPayable || processing}
        className="h-11 w-full press-scale bg-accent text-accent-foreground hover:bg-accent/90"
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" /> Pay Rs {booking.totalAmount}
          </>
        )}
      </Button>

      {!isPayable ? (
        <p className="mt-2 text-center text-xs text-muted-foreground">This booking must be approved before payment can be completed.</p>
      ) : null}
    </div>
  );
};

export default PaymentPage;
