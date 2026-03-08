import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, ParkingCircle, ClipboardCheck, Wallet, User, Settings, LogOut, Bell, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

const navItems = [
  { title: 'Overview', url: '/owner', icon: LayoutDashboard },
  { title: 'My Slots', url: '/owner/slots', icon: ParkingCircle },
  { title: 'Approvals', url: '/owner/approvals', icon: ClipboardCheck },
  { title: 'Settlements', url: '/owner/settlements', icon: Wallet },
  { title: 'Notifications', url: '/owner/notifications', icon: Bell },
  { title: 'Profile', url: '/owner/profile', icon: User },
  { title: 'Settings', url: '/owner/settings', icon: Settings },
];

function OwnerSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { unreadCount } = useRealtimeNotifications(Boolean(user));

  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent className="flex flex-col h-full">
        <div className="p-3 border-b border-border">
          <Link to="/" className="flex items-center gap-2 font-heading text-lg font-bold">
            <img src="/parklynk-logo.jpeg" alt="ParkLynk" className="h-8 w-auto shrink-0 rounded-[10px]" />
            {!collapsed && (
              <span className="rounded-full border border-border bg-card px-3 py-1 text-xs shadow-sm">
                Park<span className="text-accent">Lynk</span>
              </span>
            )}
          </Link>
        </div>
        <SidebarGroup className="flex-1">
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(item => {
                const isActive = item.url === '/owner'
                  ? location.pathname === '/owner'
                  : location.pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <Link
                      to={item.url}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md p-2 text-sm hover:bg-muted/50 relative transition-colors",
                        isActive && "bg-muted text-accent font-medium"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                      {item.title === 'Notifications' && unreadCount > 0 && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent text-accent-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="p-3 border-t border-border">
          <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors w-full">
            <LogOut className="h-4 w-4" />
            {!collapsed && 'Sign out'}
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

function OwnerMobileNav() {
  const location = useLocation();
  const mobileItems = navItems.slice(0, 5);
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex items-center justify-around h-14 md:hidden">
      {mobileItems.map(item => {
        const active = item.url === '/owner' ? location.pathname === '/owner' : location.pathname.startsWith(item.url);
        return (
          <Link key={item.title} to={item.url} className={`flex flex-col items-center gap-0.5 text-[10px] ${active ? 'text-accent' : 'text-muted-foreground'}`}>
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}

const OwnerDashboardLayout = () => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {!isMobile && <OwnerSidebar />}
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="h-12 flex items-center border-b border-border px-3 sticky top-0 z-40 bg-background/95 backdrop-blur">
            {!isMobile && <SidebarTrigger className="mr-2" />}
            <span className="flex items-center gap-2 font-heading text-sm font-semibold md:hidden">
              <img src="/parklynk-logo.jpeg" alt="ParkLynk" className="h-8 w-auto rounded-[10px]" />
              <span className="rounded-full border border-border bg-card px-3 py-1 text-xs shadow-sm">
                Park<span className="text-accent">Lynk</span>
              </span>
            </span>
          </header>
          <main className="flex-1 p-4 pb-20 md:pb-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <Outlet />
            </motion.div>
          </main>
        </div>
        {isMobile && <OwnerMobileNav />}
      </div>
    </SidebarProvider>
  );
};

export default OwnerDashboardLayout;
