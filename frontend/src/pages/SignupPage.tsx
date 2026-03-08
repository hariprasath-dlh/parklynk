import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Upload, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, SignupData } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types';

const SignupPage = () => {
  const [step, setStep] = useState<'role' | 'details'>('role');
  const [role, setRole] = useState<UserRole>('vehicle_user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [licenseUploaded, setLicenseUploaded] = useState(false);
  const [licenseImage, setLicenseImage] = useState<string | undefined>(undefined);
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleLicenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setLicenseImage(String(reader.result));
      setLicenseUploaded(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: SignupData = { name, email, phone, password, role, licenseImage };
    const result = await signup(data);

    if (result.success) {
      toast({ title: 'Account created' });
      if (role === 'vehicle_user') {
        navigate('/vehicle/verify-license');
      } else {
        navigate('/owner');
      }
    } else {
      toast({ title: 'Signup failed', description: result.error, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex flex-col items-center text-center">
          <img src="/parklynk-logo.jpeg" alt="ParkLynk" className="mb-4 h-16 w-auto rounded-[10px]" />
          <span className="rounded-full border border-border bg-card px-5 py-2 font-heading text-lg font-bold shadow-sm">
            Park<span className="text-accent">Lynk</span>
          </span>
        </Link>

        <div className="bg-card border border-border rounded-xl p-6">
          {step === 'role' ? (
            <>
              <h1 className="font-heading text-xl font-bold mb-1">Join ParkLynk</h1>
              <p className="text-xs text-muted-foreground mb-6">How would you like to use ParkLynk?</p>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setRole('vehicle_user');
                    setStep('details');
                  }}
                  className="w-full rounded-lg border border-border bg-surface p-4 text-left transition-colors group hover:border-accent"
                >
                  <span className="font-heading text-sm font-semibold transition-colors group-hover:text-accent">I need parking</span>
                  <p className="mt-1 text-xs text-muted-foreground">Search and book parking spots near you</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRole('house_owner');
                    setStep('details');
                  }}
                  className="w-full rounded-lg border border-border bg-surface p-4 text-left transition-colors group hover:border-accent"
                >
                  <span className="font-heading text-sm font-semibold transition-colors group-hover:text-accent">I have a space</span>
                  <p className="mt-1 text-xs text-muted-foreground">List your parking space and earn income</p>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h1 className="font-heading text-xl font-bold mb-0.5">Create account</h1>
                  <p className="text-xs text-muted-foreground">{role === 'vehicle_user' ? 'Vehicle User' : 'House Owner'}</p>
                </div>
                <button type="button" onClick={() => setStep('role')} className="text-xs text-accent hover:underline">
                  Change
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <Label htmlFor="name" className="text-xs">Full Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="As on your license" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="signup-email" className="text-xs">Email</Label>
                  <Input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-xs">Phone</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="signup-password" className="text-xs">Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      required
                      minLength={6}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {role === 'vehicle_user' ? (
                  <div>
                    <Label className="text-xs">Driving License</Label>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`mt-1 w-full rounded-lg border-2 border-dashed p-4 text-center transition-colors ${licenseUploaded ? 'border-teal bg-teal/5' : 'border-border hover:border-accent'}`}
                    >
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLicenseChange} />
                      <Upload className={`mx-auto mb-1 h-5 w-5 ${licenseUploaded ? 'text-teal' : 'text-muted-foreground'}`} />
                      <p className="text-xs text-muted-foreground">{licenseUploaded ? 'License selected' : 'Click to upload license image'}</p>
                    </button>
                  </div>
                ) : null}

                <Button type="submit" className="w-full press-scale mt-2" disabled={isLoading || (role === 'vehicle_user' && !licenseUploaded)}>
                  {isLoading ? 'Creating...' : <><UserPlus className="mr-2 h-4 w-4" /> Create Account</>}
                </Button>
              </form>
            </>
          )}

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Already have an account? <Link to="/login" className="text-accent hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
