# ParkLynk — Technical Stack

> This document locks all technical stack decisions for the ParkLynk platform.  
> **Do not deviate from these choices without explicit approval.**

---

## Frontend Stack

| Technology         | Purpose                           |
| ------------------ | --------------------------------- |
| React (Vite)       | UI framework with fast dev server |
| Tailwind CSS       | Utility-first CSS framework       |
| React Router       | Client-side routing               |
| Axios              | HTTP client for API requests      |
| Leaflet + OpenStreetMap | Interactive map & geolocation |

---

## Backend Stack

| Technology    | Purpose                              |
| ------------- | ------------------------------------ |
| Node.js       | Server runtime                       |
| Express.js    | Web application framework            |
| MongoDB Atlas | Cloud-hosted NoSQL database           |
| Mongoose      | MongoDB object modeling (ODM)         |
| JWT           | Token-based authentication            |
| bcrypt        | Password hashing                      |
| Razorpay (Test Mode) | Payment gateway integration     |
| dotenv        | Environment variable management       |

---

## Image Storage

| Technology | Purpose                    |
| ---------- | -------------------------- |
| Cloudinary | Cloud-based image storage  |

---

## Hosting

| Component | Platform | Purpose                  |
| --------- | -------- | ------------------------ |
| Backend   | Render   | API server deployment    |
| Frontend  | Vercel   | Static site deployment   |

---

> **Note:** All third-party services should be configured via environment variables. No API keys or secrets should be committed to source control.
