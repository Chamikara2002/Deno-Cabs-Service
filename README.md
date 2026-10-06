# 🚕 Deno Cabs & Tours — Luxury Chauffeur & VIP Dispatch System

A full-stack, enterprise-grade cab booking, tour management, and live dispatch platform built for Sri Lanka's premier luxury chauffeur fleet.

---

## 🌟 Key Features

- **5-Step Interactive Booking Engine**: Vehicle type filtering, luxury fleet selection, real-time road distance and estimated fare calculations.
- **OpenStreetMap & Leaflet Integration**: 100% open-source, API-key-free map routing with live polyline drawing and click-to-pinpoint GPS accuracy.
- **Automated OTP Registration & Verification**: Real email delivery via SMTP (Nodemailer) and optional mobile SMS dispatch.
- **Customer Portal**:
  - Live ride status telemetry and chauffeur contact cards.
  - Payment and hire history.
  - User-specific profile isolation.
- **Super Admin Operations Hub**:
  - Live Dispatch Radar console with nationwide vehicle tracking.
  - Explore Booking manifest modal with dynamic driver/asset assignment.
  - Secure credential & password change workflow with email OTP verification.
- **Robust REST API & MongoDB Database**:
  - Real-time persistence for bookings, verified chauffeurs, fleet inventory, and auth.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Lucide Icons, Leaflet, Custom Glassmorphism Vanilla CSS Design System
- **Backend**: Node.js, Express.js (ES Modules), MongoDB & Mongoose
- **Email & SMS**: Nodemailer (Gmail / Custom SMTP), SMS text gateway integration
- **Geocoding & Routing**: OpenStreetMap Nominatim, OSRM Routing Engine

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local Community Server or MongoDB Atlas cloud cluster)

### 2. Clone Repository
```bash
git clone https://github.com/Chamikara2002/Deno-Cabs-Service.git
cd Deno-Cabs-Service
```

### 3. Setup Environment Variables
Copy the template files and insert your credentials:
```bash
# In the root directory:
cp .env.example .env

# In the backend directory:
cp backend/.env.example backend/.env
```

Edit `.env` or `backend/.env` with your MongoDB URI and Gmail App Password:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/deno_cabs_db
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_letter_google_app_password
```

### 4. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 5. Run the Application

**Run Backend Server:**
```bash
cd backend
npm run dev
# or: node server.js
```

**Run Frontend Dev Server:**
```bash
# In the root directory:
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔒 Security & Best Practices

- Environment secrets (`.env`), private tokens, and `node_modules` are excluded from version control via `.gitignore`.
- Password and OTP verifications are protected with timing-safe checks and secure transmission.
- Clean database seeding with verified chauffeur and fleet collections.

---

## 📄 License
All rights reserved © Deno Cabs & Tours Sri Lanka.
