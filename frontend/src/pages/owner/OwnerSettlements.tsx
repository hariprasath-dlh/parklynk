import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, DollarSign, Loader2, Receipt, TrendingUp, Wallet } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { bookingsAPI, dashboardAPI, settlementsAPI } from '@/services/api';
import { Booking } from '@/types';
import { useToast } from '@/hooks/use-toast';

const DUES_THRESHOLD = 1000;

const OwnerSettlements = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pendingDues, setPendingDues] = useState(0);
  const [settlementHistory, setSettlementHistory] = useState<Array<{ amount: number; paidAt: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [payingAmount, setPayingAmount] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashboardResponse, bookingsResponse] = await Promise.all([
        dashboardAPI.getOwner(),
        bookingsAPI.getOwnerBookings(),
      ]);

      if (dashboardResponse.success) {
        setPendingDues(Number(dashboardResponse.data?.pendingDues || 0));
        setSettlementHistory(
          Array.isArray(dashboardResponse.data?.settlementHistory)
            ? dashboardResponse.data.settlementHistory
            : []
        );
      }

      setBookings(bookingsResponse.bookings || []);
    } catch (error) {
      toast({
        title: 'Failed to load settlements',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const metrics = useMemo(() => {
    const revenueBookings = bookings.filter((booking) =>
      ['approved', 'active', 'completed', 'paid', 'overstayed'].includes(booking.status)
    );

    const totalRevenue = revenueBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    const totalPlatformFees = revenueBookings.reduce((sum, booking) => sum + booking.platformFee, 0);
    const ownerEarnings = totalRevenue - totalPlatformFees;

    return {
      totalRevenue,
      totalPlatformFees,
      ownerEarnings,
    };
  }, [bookings]);

  const transactions = useMemo(
    () =>
      bookings.map((booking) => ({
        id: booking.id,
        date: booking.createdAt,
        slotTitle: booking.slotTitle,
        amount: booking.totalAmount,
        platformFee: booking.platformFee,
        ownerEarnings: booking.totalAmount - booking.platformFee,
        status: booking.status,
      })),
    [bookings]
  );

  const exceedsThreshold = pendingDues >= DUES_THRESHOLD;
  const nextPaymentAmount = pendingDues;

  const handlePay = async () => {
    if (nextPaymentAmount <= 0) {
      return;
    }

    setPayingAmount(nextPaymentAmount);
    try {
      console.log('Form Data:', { amount: nextPaymentAmount });
      const response = await settlementsAPI.pay(nextPaymentAmount);
      console.log('API Response:', response);

      if (response.success) {
        await loadData();
        toast({ title: 'Settlement paid successfully' });
      } else {
        toast({
          title: 'Settlement failed',
          description: 'The settlement could not be processed.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Settlement failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setPayingAmount(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4 font-heading text-xl font-bold">Wallet & Settlements</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <TrendingUp className="h-4 w-4 text-accent" />
          </div>
          <p className="font-heading text-2xl font-bold">Rs {metrics.totalRevenue}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Platform Commission</p>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="font-heading text-2xl font-bold text-muted-foreground">Rs {metrics.totalPlatformFees}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Your Earnings</p>
            <DollarSign className="h-4 w-4 text-teal" />
          </div>
          <p className="font-heading text-2xl font-bold text-teal">Rs {metrics.ownerEarnings}</p>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Pending Dues</p>
            <p className={`font-heading text-2xl font-bold ${exceedsThreshold ? 'text-destructive' : ''}`}>Rs {pendingDues}</p>
          </div>
          <Wallet className={`h-8 w-8 ${exceedsThreshold ? 'text-destructive' : 'text-accent'}`} />
        </div>

        {exceedsThreshold ? (
          <div className="mt-3 flex items-center gap-1 rounded border border-destructive/20 bg-destructive/5 p-2 text-xs text-destructive">
            <AlertTriangle className="h-3 w-3" /> Dues exceed Rs {DUES_THRESHOLD}. New approvals are blocked until settled.
          </div>
        ) : null}

        {pendingDues > 0 ? (
          <div className="mt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" className="press-scale" disabled={payingAmount !== null}>
                  {payingAmount !== null ? <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Processing...</> : `Pay Rs ${nextPaymentAmount}`}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Settlement Payment</AlertDialogTitle>
                  <AlertDialogDescription>
                    Pay the current pending dues of Rs {nextPaymentAmount}. The backend accepts an amount and reduces pending dues after confirmation.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handlePay}>Pay Now</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : null}
      </div>

      <h2 className="mb-3 font-heading text-sm font-bold">Transaction History</h2>
      <div className="mb-6 overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs">Slot</TableHead>
              <TableHead className="text-xs">Amount</TableHead>
              <TableHead className="text-xs">Platform Fee</TableHead>
              <TableHead className="text-xs">Earnings</TableHead>
              <TableHead className="text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-xs text-muted-foreground">
                  No transactions yet
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="text-xs">{new Date(transaction.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-xs">{transaction.slotTitle}</TableCell>
                  <TableCell className="text-xs font-heading font-semibold">Rs {transaction.amount}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">Rs {transaction.platformFee}</TableCell>
                  <TableCell className="text-xs font-heading font-semibold text-teal">Rs {transaction.ownerEarnings}</TableCell>
                  <TableCell>
                    <Badge className="border border-teal/20 bg-teal/10 text-[10px] capitalize text-teal">
                      {transaction.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <h2 className="mb-3 font-heading text-sm font-bold">Settlement History</h2>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Paid At</TableHead>
              <TableHead className="text-xs">Amount</TableHead>
              <TableHead className="text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {settlementHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-8 text-center text-xs text-muted-foreground">
                  No settlements paid yet
                </TableCell>
              </TableRow>
            ) : (
              settlementHistory.map((entry, index) => (
                <TableRow key={`${entry.paidAt}-${index}`}>
                  <TableCell className="text-xs">{new Date(entry.paidAt).toLocaleString()}</TableCell>
                  <TableCell className="text-xs font-heading font-semibold">Rs {entry.amount}</TableCell>
                  <TableCell>
                    <Badge className="border border-teal/20 bg-teal/10 text-[10px] text-teal">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Paid
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default OwnerSettlements;
