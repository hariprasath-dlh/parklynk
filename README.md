# 🚗 ParkLynk – Smart Parking Marketplace

**Tagline:**  
Linking Empty Spaces to Moving Lives.

ParkLynk is a full-stack smart parking platform that connects vehicle owners with nearby unused residential parking spaces. The application allows homeowners to list available parking slots while drivers can search, book, and manage parking in real time.

The goal of ParkLynk is to reduce urban parking problems by utilizing unused private parking spaces and creating a convenient peer-to-peer parking ecosystem.

---

# 🌍 Problem

In many urban cities, finding a safe parking space is difficult and time-consuming. Drivers spend valuable time and fuel searching for available parking, while many residential parking spaces remain unused.

This results in:

- Traffic congestion
- Fuel wastage
- Parking frustration
- Inefficient use of available space

---

# 💡 Solution

ParkLynk provides a platform where:

- Homeowners can list unused parking spaces
- Drivers can discover nearby parking slots
- Users can book parking spaces easily
- Both parties benefit from the shared parking economy

This creates a smart and efficient parking ecosystem.

---

# ✨ Features

## 🔐 User Authentication
- Secure signup and login system
- JWT based authentication
- Protected user routes

## 🚗 Parking Slot Management
- House owners can create parking slots
- Upload images of parking space
- Define parking type and availability

## 📍 Smart Parking Booking
- Drivers can browse available parking slots
- Book parking for specific time periods
- View booking details

## 🔔 Notification System
- Real-time notifications for booking events
- Notification panel with updates

## 🪪 Driving License Verification
- OCR-based license verification
- Uses Tesseract OCR to extract license text
- Validates license format

## 👤 User Profile Management
- Update personal information
- Upload profile images
- View account details

## 🗑 Account Management
- Permanent account deletion
- Removes associated user data

---

# 🛠 Tech Stack

## Frontend
- React
- Vite
- TypeScript
- TailwindCSS
- Shadcn UI

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

## Authentication
- JSON Web Tokens (JWT)

## OCR Verification
- Tesseract.js

## Development Tools
- Git
- GitHub

---

# 🧱 System Architecture

User Browser
│
▼
Frontend (React + Vite)
│
▼
Backend API (Node.js + Express)
│
▼
Database (MongoDB Atlas)


---
```
# 📂 Project Structure


ParkLynk
│
├── backend
│ │
│ ├── config
│ │ └── db.js
│ │
│ ├── controllers
│ │ ├── authController.js
│ │ ├── slotController.js
│ │ └── notificationController.js
│ │
│ ├── middleware
│ │ └── authMiddleware.js
│ │
│ ├── models
│ │ ├── User.js
│ │ ├── ParkingSlot.js
│ │ ├── Booking.js
│ │ └── Notification.js
│ │
│ ├── routes
│ │ ├── authRoutes.js
│ │ ├── slotRoutes.js
│ │ └── bookingRoutes.js
│ │
│ ├── utils
│ │ └── licenseVerification.js
│ │
│ ├── server.js
│ └── package.json
│
│
├── frontend
│ │
│ ├── public
│ │ ├── parklynk-logo.png
│ │ └── parklynk-circle-tab-logo.png
│ │
│ ├── src
│ │ ├── components
│ │ │ ├── Navbar.tsx
│ │ │ ├── Sidebar.tsx
│ │ │ └── NotificationPanel.tsx
│ │ │
│ │ ├── pages
│ │ │ ├── Home.tsx
│ │ │ ├── Login.tsx
│ │ │ ├── Signup.tsx
│ │ │ ├── Dashboard.tsx
│ │ │ └── Profile.tsx
│ │ │
│ │ ├── services
│ │ │ └── api.ts
│ │ │
│ │ ├── App.tsx
│ │ └── main.tsx
│ │
│ └── package.json
│
│
├── README.md
└── .gitignore

```
---

# ⚙️ Installation

Clone the repository:


git clone https://github.com/YOUR_USERNAME/ParkLynk.git


Navigate to project directory:


cd ParkLynk


---

# ▶ Backend Setup


cd backend
npm install
npm run dev


---

# ▶ Frontend Setup

Open another terminal:


cd frontend
npm install
npm run dev


The application will run at:


http://localhost:5173


---

# 🔮 Future Improvements

- Live GPS parking search
- Real-time parking availability
- Payment gateway integration
- Mobile application
- AI-based document verification
- Smart parking recommendations

---

# 👨‍💻 Author

Hariprasath

Project: **ParkLynk – Smart Parking Marketplace**

---

## 🚀 Deployment

ParkLynk is successfully deployed and accessible online.

### 🌐 Live Application
Frontend (Vercel):  
https://parklynk-git-main-23ad047-2318s-projects.vercel.app

Backend API (Render):  
https://parklynk-backend.onrender.com

### 🧱 Deployment Architecture

Frontend → Vercel  
Backend → Render  
Database → MongoDB Atlas


### ⚠️ Note

The backend is hosted on Render's free tier. The server may enter sleep mode after inactivity, so the first request may take a few seconds to respond.

### 🔄 Continuous Deployment

The frontend is automatically redeployed by Vercel whenever new changes are pushed to the `main` branch of the GitHub repository.
