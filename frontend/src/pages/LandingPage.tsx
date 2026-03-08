import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Shield, Clock, Car, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

const stats = [
  { label: 'Active Spots', value: '2,400+' },
  { label: 'Cities Covered', value: '45+' },
  { label: 'Happy Parkers', value: '18K+' },
  { label: 'Avg. Savings', value: '40%' },
];

const steps = [
  { icon: Search, title: 'Search', desc: 'Find available parking near your destination' },
  { icon: Clock, title: 'Book', desc: 'Reserve your spot with real-time pricing' },
  { icon: Car, title: 'Park', desc: 'Navigate to your spot and park hassle-free' },
  { icon: Shield, title: 'Secure', desc: 'Verified owners, insured spaces, 24/7 support' },
];

const featuredCities = ['Mumbai', 'Bangalore', 'Delhi', 'Chennai', 'Pune'];

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (!isAuthenticated || !user) return '/';
    return user.role === 'vehicle_user' ? '/vehicle' : '/owner';
  };

  const handleSearch = () => {
    if (isAuthenticated && user) {
      navigate(`/vehicle?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to={user ? getDashboardPath() : '/'} className="flex items-center gap-2 font-heading text-xl font-bold tracking-tight">
            <img src="/parklynk-logo.jpeg" alt="ParkLynk Logo" className="h-10 w-auto rounded-[10px]" />
            <span className="rounded-full border border-border bg-card px-4 py-1 text-sm shadow-sm">
              Park<span className="text-accent">Lynk</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <Button size="sm" onClick={() => navigate(getDashboardPath())} className="press-scale bg-accent text-accent-foreground hover:bg-accent/90">
                Go to Dashboard <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button size="sm" asChild className="press-scale bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link to="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-3 text-left font-mono">
                Smart Urban Parking
              </p>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-4">
                Park smarter.<br />
                <span className="text-muted-foreground">Not harder.</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl mb-8">
                Find verified parking spots in seconds. Book instantly with transparent pricing and real-time availability.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="flex flex-col sm:flex-row gap-3 mb-8">
              <div className="relative flex-1 max-w-md">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by city, area, or landmark..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-9 h-11 bg-card border-border"
                />
              </div>
              <Button onClick={handleSearch} size="lg" className="press-scale h-11 px-6 bg-accent text-accent-foreground hover:bg-accent/90">
                <Search className="mr-2 h-4 w-4" /> Find Parking
              </Button>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-wrap gap-2">
              {featuredCities.map((city) => (
                <button
                  key={city}
                  onClick={() => { setSearchQuery(city); handleSearch(); }}
                  className="text-xs px-3 py-1.5 rounded-full bg-surface text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {city}
                </button>
              ))}
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16">
            {stats.map((s) => (
              <div key={s.label} className="bg-card rounded-lg border border-border p-4 text-center hover-lift">
                <div className="font-heading text-2xl font-bold text-accent">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 sm:px-6 bg-surface/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-heading text-2xl font-bold mb-2">How ParkLynk Works</h2>
          <p className="text-muted-foreground text-sm mb-10 max-w-lg">Four simple steps to stress-free parking.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, i) => (
              <motion.div key={step.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }} className="bg-card rounded-lg border border-border p-5 hover-lift group">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                  <step.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-heading font-semibold text-sm mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for owners */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-card border border-border rounded-xl p-8 sm:p-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h2 className="font-heading text-2xl font-bold mb-2">Own a parking space?</h2>
              <p className="text-muted-foreground text-sm max-w-md">
                List your space, set your price, approve bookings, and earn passive income. Join 500+ homeowners already earning with ParkLynk.
              </p>
            </div>
            <Button size="lg" asChild className="press-scale bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
              <Link to="/signup">
                List Your Space <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-12 px-4 sm:px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-teal" /> Verified Owners</span>
            <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-accent" /> 4.8/5 Rating</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 24/7 Support</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2025 ParkLynk. All rights reserved.</p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
