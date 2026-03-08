import { motion } from 'framer-motion';
import { CreditCard, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockBookings } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

const PaymentHistoryPage = () => {
  const { user } = useAuth();
  const paidBookings = mockBookings.filter(
    b => b.userId === user?.id && ['completed', 'paid', 'active'].includes(b.status)
  );

  return (
    <div>
      <h1 className="font-heading text-xl font-bold mb-4">Payment History</h1>

      {paidBookings.length === 0 ? (
        <div className="text-center py-16">
          <CreditCard className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No payment history yet</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Booking</TableHead>
                <TableHead className="text-xs">Location</TableHead>
                <TableHead className="text-xs">Amount</TableHead>
                <TableHead className="text-xs">Method</TableHead>
                <TableHead className="text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paidBookings.map(b => (
                <TableRow key={b.id}>
                  <TableCell className="text-xs">{new Date(b.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-xs font-medium">{b.id.toUpperCase()}</TableCell>
                  <TableCell className="text-xs">{b.slotTitle}</TableCell>
                  <TableCell className="text-xs font-heading font-semibold text-accent">₹{b.totalAmount}</TableCell>
                  <TableCell className="text-xs capitalize">{b.paymentMethod || 'UPI'}</TableCell>
                  <TableCell>
                    <Badge className="text-[10px] bg-teal/10 text-teal border border-teal/20">
                      {b.status === 'completed' ? 'Paid' : b.status === 'active' ? 'Active' : 'Paid'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      )}
    </div>
  );
};

export default PaymentHistoryPage;
