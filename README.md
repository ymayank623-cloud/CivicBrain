<div align="center">

# 🏛️ CivicBrain — Municipal Citizen Grievance Redressal System (CGRS)
### *Pioneering Data-Driven Urban Intelligence for Smart Governance*

[![Vercel](https://img.shields.io/badge/Vercel-Deployed-success?style=for-the-badge&logo=vercel)](https://civicbrain-nigam.vercel.app)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Digital India](https://img.shields.io/badge/Digital_India-Initiative-orange?style=for-the-badge)](#)

---

**🌐 Live Demo:** [https://civicbrain-nigam.vercel.app](https://civicbrain-nigam.vercel.app)

</div>

---

## 📌 Project Overview

**CivicBrain** is an AI-powered next-generation Municipal Governance and Citizen Grievance Redressal Platform (CGRS) built under the **Digital India & Smart Cities Mission** framework. 

It eliminates the traditional delays, bureaucratic bottlenecks, and duplicate complaints in municipal corporations by merging **Geospatial AI Clustering**, **Computer Vision Verification**, **Real-Time SLA Countdown Engines**, and **Multi-Tier Role Portals** into a unified e-Governance ecosystem.

---

## 🚀 6 Key Features

### 1. 🤖 AI-Powered Spatial Clustering & Duplicate Prevention
- **Haversine Geo-Clustering:** Automatically detects complaints filed within a **50-meter radius** under the same civic category (e.g., potholes, drainage, streetlights).
- **Master Ticket Grouping:** Instead of creating redundant tickets for field officers, it links nearby complaints to a single **Master Ticket**, increasing the `impactedCount` and dynamically escalating priority (`MEDIUM ➔ HIGH ➔ CRITICAL`).

### 2. ⏱️ Real-Time Live Status Tracking with SLA Escalation
- **Visual Progress Pipeline:** 5-stage live status tracking (`Submitted ➔ Clustered/Triaged ➔ Assigned to Field Officer ➔ Work in Progress ➔ Resolved & Verified`).
- **SLA Countdown Timers:** Dedicated Service Level Agreement (SLA) timers ensure automatic escalation to Department Heads if grievances are not resolved on schedule.

### 3. 👥 Multi-Tier Role-Based Dashboards
- **Citizen Portal:** File grievances, auto-fill address from pincode, manage & edit submitted tickets, live status tracking.
- **Field Officer Portal:** Geolocation map routing, prioritized task list based on impact count, instant status updates, and resolution image uploads.
- **Department Head Dashboard:** Real-time departmental metrics, officer workload balancing, and SLA compliance monitoring.
- **Municipal Commissioner Dashboard:** City-wide heatmaps, real-time civic health score, and cross-departmental analytics.

### 4. 💬 Intelligent AI Civic Assistant & Report Bot
- **Interactive Multi-Turn Bot:** An in-portal conversational assistant allowing citizens to report issues, describe problems in natural language, attach evidence, or track tickets directly via chat.
- **Mobile-Responsive Floating Interface:** Seamlessly adapts to any screen with instant keyword suggestions (e.g., *"Report Pothole"*, *"Track my ticket"*).

### 5. 🏛️ Government-Grade Auth & Email OTP Verification
- **Official Nagar Nigam Design:** Styled with national emblems, Ministry of Housing & Urban Affairs headers, and official typography.
- **Real Gmail SMTP OTP Delivery:** Sends 6-digit cryptographic verification codes directly to the user's Gmail inbox for registration and password recovery.
- **Accessible & Cross-Device Compatible:** Supports mobile numeric inputs, case-insensitive login, and WCAG accessibility standards.

### 6. 📸 AI Vision Evidence & Verification Engine
- **Before & After Photo Proof:** Field officers upload photographic proof upon resolving issues, preventing false closures.
- **Visual Audit Trail:** Citizens can inspect evidence photos alongside officer remarks for maximum municipal transparency.

---

## 🛠️ Tech Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons |
| **Mapping & GIS** | Leaflet, React-Leaflet, OpenStreetMap, Postal Pincode API |
| **Backend & APIs** | Node.js, Express.js, Socket.IO, Nodemailer (Gmail SMTP) |
| **AI / ML Service** | Python, FastAPI, Haversine Spatial Geometry, Uvicorn |
| **State & Storage** | LocalStorage Engine + MongoDB (Mongoose ODM) |
| **Deployment** | Vercel (Production CI/CD), LocalTunnel |

---

## 📁 Project Architecture

```
CivicBrain/
├── frontend/                 # React + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/       # GovNavbar, AIChatBot, ProtectedRoute, etc.
│   │   ├── context/          # Language Context (Hindi/English)
│   │   ├── pages/            # Citizen, Officer, Dept, Commissioner Dashboards, Login, Register
│   │   └── App.tsx           # Client Routing & Layouts
│   ├── vercel.json           # SPA Rewrite & Routing Rules
│   └── package.json
├── backend/                  # Express.js Backend
│   ├── routes/               # authRoutes, otpRoutes, complaintRoutes, adminRoutes
│   ├── server.js             # Express Server, Nodemailer & Socket.IO
│   └── package.json
└── ai-service/               # Python AI Service
    ├── app.py                # AI triaging & classification
    └── requirements.txt
```

---



## 🔒 Demo Credentials (For Evaluation)

| Role | Email ID | Password | Access Level |
|---|---|---|---|
| **Master Citizen** | `ymayank623@gmail.com` | `Mayank8492` | File, track, & edit grievances |
| **Field Officer** | `officer@demo.com` | *any password* | Task resolution, before/after images |
| **Department Head** | `dept@demo.com` | *any password* | Officer auto-assignment, SLA metrics |
| **Commissioner** | `admin@demo.com` | *any password* | City-wide heatmaps & analytics |

---

## 📜 License & Acknowledgements

- Built for **Hackathon / Smart Governance Innovations**.
- Inspired by the **Digital India Initiative** & **Ministry of Housing and Urban Affairs (MoHUA)**.
