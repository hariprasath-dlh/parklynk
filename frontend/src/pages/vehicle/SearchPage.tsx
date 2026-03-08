import { useState, useMemo, lazy, Suspense, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Grid3X3, List, Car, Bike, Truck, Star, Map, Navigation } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { locations } from '@/data/locations';
import { useToast } from '@/hooks/use-toast';
import { slotsAPI } from '@/services/api';
import { ParkingSlot } from '@/types';
import React from 'react';

const IndiaMap = lazy(() => import('@/components/IndiaMap'));

class MapErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-[300px] items-center justify-center rounded-lg border border-border bg-muted/30">
          <p className="text-sm text-muted-foreground">Map could not load. Use the filters above to search.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const vehicleIcons: Record<string, React.ReactNode> = {
  car: <Car className="h-3 w-3" />,
  bike: <Bike className="h-3 w-3" />,
  suv: <Truck className="h-3 w-3" />,
  truck: <Truck className="h-3 w-3" />,
};

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMap, setShowMap] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const districts = useMemo(() => locations.find((l) => l.state === state)?.districts || [], [state]);
  const cities = useMemo(() => districts.find((d) => d.name === district)?.cities || [], [districts, district]);

  const loadSlots = useCallback(async () => {
    setLoading(true);
    try {
      const res = await slotsAPI.getAll({ state, district, city, query });
      setSlots(res.slots || []);
    } catch (error) {
      toast({
        title: 'Failed to load parking spots',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [city, district, query, state, toast]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  // Debounced Nominatim search
  useEffect(() => {
    if (query.length < 3) {
      setSearchSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        setSearchSuggestions(data);
        setShowSuggestions(data.length > 0);
      } catch {
        // ignore
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const handleNearMe = useCallback(() => {
    if (!navigator.geolocation) {
      toast({ title: 'Geolocation not supported', variant: 'destructive' });
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const detectedCity = addr.city || addr.town || addr.village || '';
          setQuery(detectedCity);
          setCity(detectedCity);
          setShowMap(true);
          toast({ title: 'Location detected', description: detectedCity || 'Showing nearby results' });
        } catch {
          toast({ title: 'Could not resolve location' });
        } finally {
          setDetectingLocation(false);
        }
      },
      () => {
        setDetectingLocation(false);
        toast({ title: 'Location access denied', variant: 'destructive' });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [toast]);

  const selectSuggestion = (suggestion: { display_name: string }) => {
    const parts = suggestion.display_name.split(',').map((s) => s.trim());
    setQuery(parts[0]);
    setShowSuggestions(false);
  };

  const nearby = useMemo(() => {
    if (slots.length > 0 || !city) return [];
    return [];
  }, [city, slots]);

  return (
    <div>
      <h1 className="mb-4 font-heading text-xl font-bold">Find Parking</h1>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search by city, area, landmark..."
            className="pl-9"
          />
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-lg">
              {searchSuggestions.map((s, i) => (
                <button key={i} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-muted/50" onMouseDown={() => selectSuggestion(s)}>
                  <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
                  <span className="truncate">{s.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <Select value={state} onValueChange={(v) => { setState(v); setDistrict(''); setCity(''); }}>
          <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="State" /></SelectTrigger>
          <SelectContent>{locations.map((l) => <SelectItem key={l.state} value={l.state}>{l.state}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={district} onValueChange={(v) => { setDistrict(v); setCity(''); }} disabled={!state}>
          <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="District" /></SelectTrigger>
          <SelectContent>{districts.map((d) => <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={city} onValueChange={setCity} disabled={!district}>
          <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="City" /></SelectTrigger>
          <SelectContent>{cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">{loading ? 'Loading...' : `${slots.length} spots found`}</p>
          <Button variant={showMap ? 'default' : 'ghost'} size="sm" className="h-7 text-xs" onClick={() => setShowMap(!showMap)}>
            <Map className="mr-1 h-3 w-3" /> {showMap ? 'Hide Map' : 'Show Map'}
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs press-scale" onClick={handleNearMe} disabled={detectingLocation}>
            <Navigation className="mr-1 h-3 w-3" /> {detectingLocation ? 'Detecting...' : 'Near Me'}
          </Button>
        </div>
        <div className="flex gap-1">
          <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('grid')}><Grid3X3 className="h-3.5 w-3.5" /></Button>
          <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('list')}><List className="h-3.5 w-3.5" /></Button>
        </div>
      </div>

      {showMap && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4">
          <MapErrorBoundary>
            <Suspense fallback={<div className="flex h-[300px] items-center justify-center rounded-lg border border-border bg-muted/30"><p className="text-sm text-muted-foreground">Loading map...</p></div>}>
              <IndiaMap selectedCity={city || query} />
            </Suspense>
          </MapErrorBoundary>
        </motion.div>
      )}

      {!loading && slots.length === 0 ? (
        <div className="py-16 text-center">
          <MapPin className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
          <h3 className="mb-1 font-heading font-semibold">No parking spots found</h3>
          <p className="mb-4 text-sm text-muted-foreground">Sorry, parking unavailable in this area.</p>
          {nearby.length > 0 ? null : null}
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}>
          {slots.map((slot, i) => (
            <motion.div key={slot.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
              <Link to={`/vehicle/slot/${slot.id}`} className={`block overflow-hidden rounded-lg border border-border bg-card hover-lift ${viewMode === 'list' ? 'flex' : ''}`}>
                <div className={`flex items-center justify-center bg-surface ${viewMode === 'list' ? 'h-24 w-28' : 'h-32'}`}>
                  <MapPin className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <div className="flex-1 p-3">
                  <div className="mb-1 flex items-start justify-between">
                    <h3 className="font-heading text-sm font-semibold leading-tight">{slot.title}</h3>
                    <div className="ml-2 flex shrink-0 items-center gap-0.5 text-xs text-accent">
                      <Star className="h-3 w-3 fill-current" /> {slot.rating}
                    </div>
                  </div>
                  <p className="mb-2 text-[11px] text-muted-foreground">{slot.address}, {slot.city}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {slot.vehicleTypes.map((v) => (
                        <span key={v} className="flex h-5 w-5 items-center justify-center rounded bg-surface text-muted-foreground">
                          {vehicleIcons[v]}
                        </span>
                      ))}
                    </div>
                    <div className="text-right">
                      <span className="font-heading text-sm font-bold text-accent">₹{slot.pricePerHour}</span>
                      <span className="text-[10px] text-muted-foreground">/hr</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                      Available
                    </Badge>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
