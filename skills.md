# ParkLynk — Skills & Feature Requirements

> This document defines the business features and functional requirements for ParkLynk.

---

## 1. Business Features

### 1.1 Space Owner Features

- List parking spaces with photos, location, and availability
- Set custom pricing and availability schedules
- Accept or reject booking requests
- View earnings dashboard
- Manage multiple parking spaces

### 1.2 Driver Features

- Search for nearby parking spaces via map
- Filter by price, distance, availability, and type
- Book parking spaces in advance or on-demand
- Navigate to booked parking space
- Rate and review parking spaces

### 1.3 Admin Features

- Dashboard with platform analytics
- User management (owners & drivers)
- Booking oversight and dispute resolution
- Commission tracking and reports
- Content moderation (reviews, listings)
- Platform configuration management

---

## 2. Functional Requirements

### 2.1 Authentication & Authorization

- User registration (email/phone)
- Login with JWT-based authentication
- Role-based access control (Driver, Owner, Admin)
- Password reset flow
- Profile management

### 2.2 Listing Management

- CRUD operations for parking spaces
- Image upload via Cloudinary
- Geolocation tagging (latitude/longitude)
- Availability calendar management

### 2.3 Search & Discovery

- Map-based search with Leaflet + OpenStreetMap
- Filter by price range, distance, parking type
- Sort by relevance, price, rating
- Real-time availability status

---

## 3. Booking Flow

1. Driver searches for parking near destination
2. Driver selects a parking space from results
3. Driver chooses date, time slot, and duration
4. System calculates total price (including dynamic pricing)
5. Driver confirms booking and proceeds to payment
6. Payment processed via Razorpay
7. Owner receives booking notification
8. Driver receives confirmation with parking details
9. Driver navigates to parking space
10. Booking marked as completed after duration ends

---

## 4. Commission Logic

- Platform charges a percentage commission on each booking
- Commission deducted from owner payout
- Commission rates configurable by admin
- Transparent commission display during booking
- Commission tracking in admin dashboard

---

## 5. Dynamic Pricing Logic

- Base price set by space owner
- Surge pricing during peak hours/events
- Discount pricing for off-peak hours
- Location-based pricing adjustments
- Duration-based pricing tiers (hourly, daily, monthly)
- Admin-configurable pricing rules

---

## 6. Payment Flow

- Razorpay integration (Test Mode initially)
- Secure payment processing
- Payment to platform → commission deducted → owner payout
- Refund handling for cancellations
- Payment history for all users
- Payout management for space owners

---

## 7. Trust & Safety System

- User verification (email/phone)
- Rating and review system (bidirectional)
- Report and flag mechanism
- Identity verification for space owners
- Booking history transparency
- Dispute resolution process

---

## 8. Grace Period System

- Configurable grace period after booking start time
- Late arrival tolerance window
- Early departure handling
- Overstay penalty rules
- Grace period for cancellation (full refund window)
- Automatic booking expiration after grace period

---

## 9. Notification System

- Email notifications for booking events
- In-app notifications
- Booking reminders
- Payment confirmations
- Review prompts after booking completion
