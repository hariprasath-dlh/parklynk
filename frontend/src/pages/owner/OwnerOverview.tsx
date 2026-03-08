import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, ClipboardCheck, Loader2, TrendingUp, Wallet } from 'lucide-react';
import { dashboardAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const OwnerOverview = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeBookings: 0,
    totalBookings: 0,
    pendingDues: 0,
  });

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const response = await dashboardAPI.getOwner();
        if (response.success) {
          setStats({
            totalRevenue: Number(response.data?.totalRevenue || 0),
            activeBookings: Number(response.data?.activeBookings || 0),
            totalBookings: Number(response.data?.totalBookings || 0),
            pendingDues: Number(response.data?.pendingDues || 0),
          });
        }
      } catch (error) {
        toast({
          title: 'Failed to load dashboard',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const cards = [
    { label: 'Total Revenue', value: `Rs ${stats.totalRevenue}`, icon: TrendingUp, color: 'text-accent' },
    { label: 'Active Bookings', value: stats.activeBookings, icon: CalendarDays, color: 'text-teal' },
    { label: 'Total Bookings', value: stats.totalBookings, icon: ClipboardCheck, color: 'text-amber' },
    { label: 'Pending Dues', value: `Rs ${stats.pendingDues}`, icon: Wallet, color: 'text-destructive' },
  ];

  return (
    <div>
      <h1 className="mb-4 font-heading text-xl font-bold">Overview</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-lg border border-border bg-card p-4 hover-lift"
          >
            <div className="mb-2 flex items-center gap-2">
              <card.icon className={`h-4 w-4 ${card.color}`} />
              <span className="text-xs text-muted-foreground">{card.label}</span>
            </div>
            <p className="font-heading text-xl font-bold">{card.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default OwnerOverview;
