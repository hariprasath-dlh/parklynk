

# ParkLynk — Parking Marketplace Platform

## Design System
- **Tone**: Urban & Structured — concrete/asphalt-inspired palette (charcoal, slate, warm amber accents, muted teal highlights)
- **Typography**: Space Grotesk (headings) + DM Sans (body) — geometric, urban feel
- **Layout**: Compact, data-rich with subtle polished animations
- **Color Palette**: Dark charcoal (#1C1C1E), warm concrete (#2C2C2E), amber accent (#E8A838), teal secondary (#3AAFA9), off-white text (#F5F5F5), error red (#E53935)
- **Dark/Light modes**: Both fully designed with inverted surface layers

## Architecture & Routing
- **Auth Context**: Role-based (vehicle_user, house_owner, admin) with protected routes
- **Theme Context**: Dark/Light toggle persisted to localStorage
- **Mock API layer**: Centralized service files with simulated delays, token handling, error states
- **Test credentials**: vehicle@test.com, owner@test.com, admin@test.com (all pw: 123456)

## Pages & Features

### 1. Landing Page
- Urban hero with tagline, search bar, and CTA buttons (Find Parking / List Your Space)
- How it works section, trust indicators

### 2. Auth Flow
- Signup with role selection (Vehicle User / House Owner)
- Login page with test credential hints
- **Vehicle User Signup**: Name, email, phone, password + license image upload
- **License Verification Screen**: Animated scanning effect (progress bar, pulsing scan lines), simulated OCR extraction, name comparison with confidence score, pass/fail result with animated badge. Rejection shows mismatch details and retry option
- **Mock Inbox Page**: Simulated email inbox showing verification confirmations, booking updates, etc.

### 3. Vehicle User Dashboard
- **Sidebar layout** (desktop), bottom nav (mobile)
- **Search & Discovery**: Advanced search with State → District → City filters, grid/list toggle, smart empty states, nearby recommendations
- **Slot Detail Page**: Image gallery, space count, vehicle types, time picker, vehicle number input, live price calculator with fee breakdown, booking submission
- **My Bookings**: Timeline visualization with status badges (Pending → Approved → Active → Completed), grace period indicator, animated overstay warning
- **Notification Center**: Full page with categorized notifications (booking updates, reminders, payments, overstay alerts), mark as read, delete, filtering by category
- **Mock Inbox**: Styled email previews for all simulated email notifications
- **Profile**: Avatar upload, name, gender, phone, username, license re-upload, delete account
- **Settings**: Theme toggle, notification preferences, security placeholder, account deletion

### 4. House Owner Dashboard
- **Sidebar layout** with separate navigation
- **Overview**: Earnings chart, active bookings count, pending approvals count, pending dues summary
- **My Slots**: List of created parking slots with edit/toggle availability
- **Create Slot**: Form with state/district/city, photo upload, vehicle types (multi-select), availability toggle, phone number
- **Booking Approvals**: Incoming requests with approve/reject buttons, animated state transitions, notification on new request
- **Settlements**: Pending dues display, pay settlement button (simulated), settlement history table, approval disabled warning when dues exceed threshold
- **Profile & Settings**: Same structure as vehicle user

### 5. Admin Panel (Basic)
- User management table (view/deactivate users)
- Booking overview
- Platform stats

### 6. Responsive Behavior
- **Desktop (1440px)**: Full sidebar + content
- **Tablet (1024px)**: Collapsible sidebar
- **Mobile (390px)**: Bottom tab navigation (vehicle users), collapsible hamburger (owners)

### 7. Mock Data
- 12+ parking slots across multiple cities
- 8+ bookings in various statuses
- 15+ notifications across categories
- Earnings/settlement mock history
- 5+ simulated emails in mock inbox

### 8. Animations (Subtle & Polished)
- Page fade-in transitions
- Card hover elevation shifts
- Button press scale feedback
- Status badge color transitions
- Scanning animation for license verification
- Staggered list item reveals
- Notification badge pulse

