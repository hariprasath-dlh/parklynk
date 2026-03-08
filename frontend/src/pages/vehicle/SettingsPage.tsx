import { useState } from 'react';
import { Sun, Moon, Bell, Shield, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [notifSettings, setNotifSettings] = useState({
    bookings: true,
    reminders: true,
    payments: true,
    overstay: true,
  });

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await authAPI.deleteAccount(user!.id);
      logout();
      navigate('/');
      toast({ title: 'Account deleted' });
    } catch {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="font-heading text-xl font-bold mb-4">Settings</h1>

      <div className="space-y-4">
        {/* Theme */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <div>
                <p className="text-sm font-medium">Theme</p>
                <p className="text-xs text-muted-foreground">{theme === 'dark' ? 'Dark' : 'Light'} mode</p>
              </div>
            </div>
            <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 mb-2"><Bell className="h-4 w-4" /><p className="text-sm font-medium">Notifications</p></div>
          {Object.entries(notifSettings).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between">
              <Label className="text-xs capitalize">{key === 'overstay' ? 'Overstay warnings' : `${key.charAt(0).toUpperCase() + key.slice(1)} ${key === 'bookings' ? 'updates' : key === 'reminders' ? '' : 'alerts'}`}</Label>
              <Switch checked={val} onCheckedChange={(checked) => setNotifSettings(prev => ({ ...prev, [key]: checked }))} />
            </div>
          ))}
        </div>

        {/* Security */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><Shield className="h-4 w-4" /><p className="text-sm font-medium">Security</p></div>
          <p className="text-xs text-muted-foreground">Two-factor authentication and password management.</p>
        </div>

        {/* Delete */}
        <div className="bg-card border border-destructive/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-destructive">Delete Account</p>
              <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="press-scale">
                  <Trash2 className="h-3 w-3 mr-1" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account Permanently?</AlertDialogTitle>
                  <AlertDialogDescription>All your data including bookings, profile, and notifications will be permanently deleted.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleting}>
                    {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Yes, Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
