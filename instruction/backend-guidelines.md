# ParkLynk Backend Development Guidelines

## Project Identity

Project Name: ParkLynk  
Tagline: “Linking Empty Spaces to Moving Lives.”  
Architecture Type: RESTful Marketplace Backend  
Pattern: MVC (Model-View-Controller)  
Stack: Node.js + Express + MongoDB + Mongoose  

This backend powers a two-sided parking marketplace platform.

---

# Core Principles

1. Security First
2. Clean Architecture
3. Separation of Concerns
4. Scalable Structure
5. Production-Level Code Only
6. No Demo-Level Shortcuts

---

# Folder Architecture Rules

The backend must strictly follow this structure:

backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── services/
│   ├── utils/
│   ├── validations/
│   ├── constants/
│   └── app.js
│
├── server.js
├── package.json
└── .env.example

---

# Architectural Rules

1. No business logic inside routes.
2. Controllers handle request/response only.
3. Services handle business logic.
4. Models define schema only.
5. Middlewares handle:
   - Authentication
   - Role authorization
   - Error handling
6. Use async/await only.
7. All routes must return JSON responses.
8. Use proper HTTP status codes.
9. No hardcoded secrets.
10. All secrets must come from environment variables.

---

# Authentication System Requirements

Use:
- bcrypt for password hashing
- JWT for authentication
- Role-based middleware

Roles:
- owner
- user
- admin

JWT must:
- Expire properly
- Be verified in middleware
- Never expose sensitive user fields

---

# Database Rules

Use MongoDB Atlas.
Use Mongoose ORM.

All schemas must:
- Have timestamps
- Validate required fields
- Avoid unnecessary nesting
- Use proper references (ref)

Use ObjectId references between:
- Users
- ParkingSlots
- Bookings
- Payments

---

# Booking Engine Rules

Must implement:

1. Overlap detection logic
2. StartTime & EndTime based booking
3. Dynamic pricing calculation
4. 10% platform commission
5. Manual approval workflow
6. 30-minute grace period
7. Overstay detection

Booking Status Values:

- Pending
- Approved
- Rejected
- Active
- Completed
- Overstayed
- Cancelled

Payment Status Values:

- Pending
- Paid
- Refunded

---

# Dynamic Pricing Rules

Each slot must support:

- baseHourly
- baseDaily
- baseMonthly
- peakMultiplier
- weekendMultiplier
- peakHours

Pricing engine must:

1. Calculate duration
2. Detect weekend
3. Detect peak hour overlap
4. Apply multipliers
5. Calculate total
6. Apply platform commission
7. Store breakdown in booking

---

# Payment Integration Rules

Use Razorpay (Test Mode).

Backend must:

1. Create Razorpay order
2. Send orderId to frontend
3. Verify payment signature server-side
4. Only confirm booking after verification

Never confirm booking before payment verification.

---

# Security Rules

1. Hash passwords with bcrypt.
2. Validate all incoming data.
3. Protect private routes.
4. Never expose:
   - Password
   - JWT secret
   - Razorpay secret
5. Use centralized error handling middleware.
6. Sanitize request body inputs.

---

# Error Handling Rules

All errors must:

- Return proper status code
- Return structured JSON:
{
  success: false,
  message: "Error description"
}

Do not expose internal stack traces in production.

---

# Code Quality Rules

- Use meaningful variable names.
- Use camelCase naming.
- Keep functions small and modular.
- Avoid deeply nested logic.
- Avoid duplicated code.
- Use reusable utility functions.

---

# Future Scalability Requirements

Backend must be structured in a way that allows:

- Future mobile app integration
- Addition of WebSocket support
- Microservices migration
- AI-based pricing engine (future)
- Advanced analytics

Avoid writing code that limits scaling.

---

# Response Format Standard

All API responses must follow:

Success Response:
{
  success: true,
  message: "Operation successful",
  data: {}
}

Error Response:
{
  success: false,
  message: "Error message"
}

---

# Final Directive

This backend is not a student demo.

It is a startup-grade marketplace engine.

All development must prioritize:

- Security
- Maintainability
- Clean structure
- Real-world standards

Never simplify architecture.
Never compromise security.
Always follow MVC discipline.

End of Backend Guidelines.