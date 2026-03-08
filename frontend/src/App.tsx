import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import LicenseVerification from "./pages/LicenseVerification";
import NotFound from "./pages/NotFound";

import VehicleDashboardLayout from "./layouts/VehicleDashboardLayout";
import SearchPage from "./pages/vehicle/SearchPage";
import SlotDetailPage from "./pages/vehicle/SlotDetailPage";
import BookingsPage from "./pages/vehicle/BookingsPage";
import PaymentPage from "./pages/vehicle/PaymentPage";
import PaymentHistoryPage from "./pages/vehicle/PaymentHistoryPage";
import NotificationsPage from "./pages/vehicle/NotificationsPage";
import InboxPage from "./pages/vehicle/InboxPage";
import ProfilePage from "./pages/vehicle/ProfilePage";
import SettingsPage from "./pages/vehicle/SettingsPage";

import OwnerDashboardLayout from "./layouts/OwnerDashboardLayout";
import OwnerOverview from "./pages/owner/OwnerOverview";
import OwnerSlots from "./pages/owner/OwnerSlots";
import CreateSlot from "./pages/owner/CreateSlot";
import OwnerApprovals from "./pages/owner/OwnerApprovals";
import OwnerSettlements from "./pages/owner/OwnerSettlements";
import OwnerNotifications from "./pages/owner/OwnerNotifications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/vehicle/verify-license" element={<ProtectedRoute allowedRoles={['vehicle_user']}><LicenseVerification /></ProtectedRoute>} />

              {/* Vehicle User Dashboard */}
              <Route path="/vehicle" element={<ProtectedRoute allowedRoles={['vehicle_user']} requireVerification><VehicleDashboardLayout /></ProtectedRoute>}>
                <Route index element={<SearchPage />} />
                <Route path="slot/:id" element={<SlotDetailPage />} />
                <Route path="bookings" element={<BookingsPage />} />
                <Route path="payment/:bookingId" element={<PaymentPage />} />
                <Route path="payments" element={<PaymentHistoryPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="inbox" element={<InboxPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Owner Dashboard */}
              <Route path="/owner" element={<ProtectedRoute allowedRoles={['house_owner']}><OwnerDashboardLayout /></ProtectedRoute>}>
                <Route index element={<OwnerOverview />} />
                <Route path="slots" element={<OwnerSlots />} />
                <Route path="slots/create" element={<CreateSlot />} />
                <Route path="approvals" element={<OwnerApprovals />} />
                <Route path="settlements" element={<OwnerSettlements />} />
                <Route path="notifications" element={<OwnerNotifications />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
