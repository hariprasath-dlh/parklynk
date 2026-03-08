import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in (via effect, not during render)
  useEffect(() => {
    if (user) {
      const path = user.role === 'vehicle_user'
        ? (user.verificationStatus !== 'verified' ? '/vehicle/verify-license' : '/vehicle')
        : '/owner';
      navigate(path, { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      toast({ title: 'Welcome back!' });
      const saved = localStorage.getItem('parklynk-user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.role === 'vehicle_user') {
          navigate(u.verificationStatus !== 'verified' ? '/vehicle/verify-license' : '/vehicle');
        } else if (u.role === 'house_owner') {
          navigate('/owner');
        }
      }
    } else {
      toast({ title: 'Login failed', description: result.error, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex flex-col items-center text-center">
          <img src="/parklynk-logo.jpeg" alt="ParkLynk" className="mb-4 h-16 w-auto rounded-[10px]" />
          <span className="rounded-full border border-border bg-card px-5 py-2 font-heading text-lg font-bold shadow-sm">
            Park<span className="text-accent">Lynk</span>
          </span>
        </Link>

        <div className="bg-card border border-border rounded-xl p-6">
          <h1 className="font-heading text-xl font-bold mb-1">Sign in</h1>
          <p className="text-xs text-muted-foreground mb-6">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="password" className="text-xs">Password</Label>
              <div className="relative mt-1">
                <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full press-scale" disabled={isLoading}>
              {isLoading ? 'Signing in...' : <><LogIn className="mr-2 h-4 w-4" /> Sign in</>}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-4">
            Don't have an account? <Link to="/signup" className="text-accent hover:underline">Sign up</Link>
          </p>
        </div>

        <div className="mt-4 bg-surface/50 border border-border rounded-lg p-3">
          <p className="text-[10px] font-heading font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Test Credentials</p>
          <div className="space-y-1 text-[11px] text-muted-foreground">
            <p><span className="text-foreground font-medium">Vehicle User:</span> vehicle@test.com / 123456</p>
            <p><span className="text-foreground font-medium">House Owner:</span> owner@test.com / 123456</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
