import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Upload, Trash2, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [username, setUsername] = useState(user?.username || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateUser({ avatar: String(reader.result) });
      toast({ title: 'Profile photo selected' });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await authAPI.updateProfile();
      if (result.success) {
        updateUser({ name, phone, username, gender });
        toast({ title: 'Profile updated' });
      } else {
        toast({ title: 'Failed to update', description: result.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Failed to update', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const result = await authAPI.deleteAccount();
      if (result.success) {
        logout();
        navigate('/');
        toast({ title: 'Account deleted' });
      } else {
        toast({ title: 'Failed to delete', description: result.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Failed to delete', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="font-heading text-xl font-bold mb-4">Profile</h1>

      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-surface border border-border flex items-center justify-center">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="h-full w-full rounded-full object-cover" />
            ) : (
              <User className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <Button type="button" variant="outline" size="sm" className="text-xs press-scale" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-3 w-3 mr-1" /> Upload Photo
          </Button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><Label className="text-xs">Full Name</Label><Input value={name} onChange={e => setName(e.target.value)} className="mt-1" /></div>
          <div><Label className="text-xs">Username</Label><Input value={username} onChange={e => setUsername(e.target.value)} className="mt-1" /></div>
          <div><Label className="text-xs">Phone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} className="mt-1" /></div>
          <div>
            <Label className="text-xs">Gender</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div><Label className="text-xs">Email</Label><Input value={user?.email} disabled className="mt-1 opacity-50" /></div>

        {user?.role === 'vehicle_user' && (
          <div>
            <Label className="text-xs">Driving License</Label>
            <button
              type="button"
              className="mt-1 w-full border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-accent transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {user.verificationStatus === 'verified' ? (
                <div className="flex items-center justify-center gap-2 text-teal text-xs">
                  <ShieldCheck className="h-4 w-4" /> License verified
                </div>
              ) : (
                <>
                  <Upload className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Click to update license image</p>
                </>
              )}
            </button>
          </div>
        )}

        <Button onClick={handleSave} disabled={saving} className="press-scale">
          {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : 'Save Changes'}
        </Button>
      </div>

      <div className="mt-6 bg-card border border-destructive/20 rounded-xl p-5">
        <h3 className="font-heading text-sm font-semibold text-destructive mb-2">Danger Zone</h3>
        <p className="text-xs text-muted-foreground mb-3">Permanently delete your account and all data.</p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="press-scale">
              <Trash2 className="h-3 w-3 mr-1" /> Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Account Permanently?</AlertDialogTitle>
              <AlertDialogDescription>This will permanently delete your account, bookings, and all associated data. This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleting}>
                {deleting ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Deleting...</> : 'Yes, Delete My Account'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ProfilePage;
